import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// Only signed-in admins (Firebase ID token) or sub-admins (access link token + password) may send email,
// so this endpoint can't be used by outsiders to send mail from the ReFAN Gmail account.

const SUPER_ADMIN_EMAIL = 'refannetwork2022@gmail.com';

const firebaseApiKey = () => process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '';
const firebaseProjectId = () => process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '';

// Mirrors checkAdminRole in src/hooks/useAuth.tsx.
async function isAdminIdToken(idToken: string): Promise<boolean> {
  const apiKey = firebaseApiKey();
  const projectId = firebaseProjectId();
  if (!apiKey) return false;

  // Google validates the ID token (signature and expiry) and returns the account it belongs to.
  const lookup = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!lookup.ok) return false;
  const user = (await lookup.json())?.users?.[0];
  if (!user?.localId) return false;

  const email = String(user.email || '').trim().toLowerCase();
  const envAdmin = String(process.env.VITE_ADMIN_EMAIL || process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (email && (email === SUPER_ADMIN_EMAIL || email.startsWith('refannetwork2022') || (envAdmin && email === envAdmin))) {
    return true;
  }

  // Admins listed in the Firestore user_roles collection, read with the caller's own credentials.
  if (!projectId) return false;
  const roles = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'user_roles' }],
        where: {
          compositeFilter: {
            op: 'AND',
            filters: [
              { fieldFilter: { field: { fieldPath: 'user_id' }, op: 'EQUAL', value: { stringValue: user.localId } } },
              { fieldFilter: { field: { fieldPath: 'role' }, op: 'EQUAL', value: { stringValue: 'admin' } } },
            ],
          },
        },
        limit: 1,
      },
    }),
  });
  if (!roles.ok) return false;
  const rows = await roles.json();
  return Array.isArray(rows) && rows.some((r: any) => r?.document);
}

// Mirrors the sub-admin sign-in in src/pages/SubAdminAccess.tsx (access-link token + password).
async function isSubAdmin(token: string, password: string): Promise<boolean> {
  const apiKey = firebaseApiKey();
  const projectId = firebaseProjectId();
  if (!projectId || !token || !password) return false;

  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery${apiKey ? `?key=${encodeURIComponent(apiKey)}` : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'sub_admins' }],
        where: { fieldFilter: { field: { fieldPath: 'token' }, op: 'EQUAL', value: { stringValue: token } } },
        limit: 1,
      },
    }),
  });
  if (!res.ok) return false;
  const rows = await res.json();
  const fields = Array.isArray(rows) ? rows.find((r: any) => r?.document)?.document?.fields : null;
  if (!fields) return false;
  const active = fields.active?.booleanValue !== false;
  return active && fields.password?.stringValue === password;
}

async function isAuthorized(req: VercelRequest): Promise<boolean> {
  try {
    const header = String(req.headers.authorization || '');
    if (header.startsWith('Bearer ')) {
      return await isAdminIdToken(header.slice(7).trim());
    }
    const { subAdminToken, subAdminPassword } = req.body || {};
    if (typeof subAdminToken === 'string' && typeof subAdminPassword === 'string') {
      return await isSubAdmin(subAdminToken, subAdminPassword);
    }
  } catch (error) {
    console.error('Email auth check failed:', error);
  }
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!(await isAuthorized(req))) {
    return res.status(401).json({ error: 'Not authorized to send email' });
  }

  const { to, subject, body, replyTo } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, body' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: `ReFAN Network <${gmailUser}>`,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      text: body,
      replyTo: replyTo || gmailUser,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
