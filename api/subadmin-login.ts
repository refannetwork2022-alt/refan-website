import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createCustomToken, findByField, getCaller, getDocument, hashPassword, serviceAccount, updateDocument, verifyPasswordHash } from './_lib/firebase';

// Sub-admin sign-in. Sub-admins open their access link (#/admin-access/<token>) and enter their password.
// The check happens here on the server (the database no longer lets browsers read sub-admin records), and a
// successful sign-in returns a Firebase custom token so the database rules can recognise the sub-admin.
//   POST { token, password }            -> { customToken, profile }
//   POST with "Authorization: Bearer"   -> { profile }   (already signed in, e.g. after a page refresh)

// Fields the sub-admin page needs; never the password or its hash.
const PROFILE_FIELDS = ['name', 'username', 'email', 'token', 'active', 'permissions', 'allowDelete', 'hideExistingData', 'canShareRegistrationLink', 'createdAt'];
const profileOf = (doc: Record<string, any>) =>
  Object.fromEntries(['id', ...PROFILE_FIELDS].map((k) => [k, doc[k]]).filter(([, v]) => v !== undefined));

// Slow down password guessing (per server instance).
const failures = new Map<string, { count: number; until: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!serviceAccount()) return res.status(500).json({ error: 'Sign-in is not configured on the server.' });

  // Resume: already signed in with a sub-admin token.
  if (String(req.headers.authorization || '').startsWith('Bearer ')) {
    const caller = await getCaller(req.headers.authorization);
    if (caller?.role !== 'subadmin' || !caller.subAdminId) return res.status(401).json({ error: 'Not signed in' });
    const doc = await getDocument(`sub_admins/${caller.subAdminId}`, PROFILE_FIELDS);
    if (!doc) return res.status(401).json({ error: 'Not signed in' });
    return res.status(200).json({ profile: profileOf(doc) });
  }

  const { token, password } = req.body || {};
  if (typeof token !== 'string' || !/^[\w-]{6,100}$/.test(token) || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const f = failures.get(token);
  if (f && f.until > Date.now()) return res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });

  const doc = await findByField('sub_admins', 'token', token);
  if (!doc) return res.status(404).json({ error: 'This access link is invalid or has been removed.' });
  if (doc.active === false) return res.status(403).json({ error: 'Your access has been disabled. Please contact the admin.' });

  const ok = doc.passwordHash
    ? verifyPasswordHash(password, doc.passwordHash)
    : typeof doc.password === 'string' && doc.password.length > 0 && doc.password === password;

  if (!ok) {
    const count = (f?.count || 0) + 1;
    failures.set(token, { count, until: count >= 5 ? Date.now() + 5 * 60_000 : 0 });
    return res.status(401).json({ error: 'Incorrect password' });
  }
  failures.delete(token);

  // Older sub-admins still have a readable password: replace it with a hash on their first sign-in.
  if (!doc.passwordHash) {
    await updateDocument(`sub_admins/${doc.id}`, { passwordHash: hashPassword(password) }, ['password']);
  }

  const customToken = createCustomToken(`subadmin_${doc.id}`, { subAdmin: true, subAdminId: doc.id });
  if (!customToken) return res.status(500).json({ error: 'Sign-in is not configured on the server.' });
  return res.status(200).json({ customToken, profile: profileOf(doc) });
}
