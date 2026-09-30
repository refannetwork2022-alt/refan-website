// Server-side Firebase helpers for the Vercel functions (no extra packages).
// Uses the service account stored in the FIREBASE_SERVICE_ACCOUNT environment variable (JSON or base64 of it).
// Files in api/_lib are helpers, not public endpoints.
import crypto from 'crypto';

export const ADMIN_EMAILS = ['refannetwork2022@gmail.com'];

interface ServiceAccount { project_id: string; client_email: string; private_key: string }

let cachedAccount: ServiceAccount | null | undefined;
// Why there is no service account ('missing' | 'unreadable' | 'incomplete'), for setup messages. Never the value.
export let serviceAccountProblem = '';
export function serviceAccount(): ServiceAccount | null {
  if (cachedAccount !== undefined) return cachedAccount;
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || '').trim().replace(/^["']|["']$/g, '');
  cachedAccount = null;
  serviceAccountProblem = raw ? '' : 'missing';
  if (raw) {
    try {
      const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
      const sa = JSON.parse(json);
      if (sa.client_email && sa.private_key && sa.project_id) cachedAccount = sa;
      else serviceAccountProblem = 'incomplete';
    } catch {
      serviceAccountProblem = 'unreadable';
      console.error('FIREBASE_SERVICE_ACCOUNT is not valid JSON/base64 JSON');
    }
  }
  return cachedAccount;
}

export const projectId = () =>
  serviceAccount()?.project_id || process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '';

const b64url = (input: Buffer | string) =>
  Buffer.from(input).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');

function signJwt(payload: Record<string, unknown>, sa: ServiceAccount): string {
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const signature = crypto.createSign('RSA-SHA256').update(`${header}.${body}`).sign(sa.private_key);
  return `${header}.${body}.${b64url(signature)}`;
}

// ── OAuth access token for Firestore REST (bypasses security rules, server only) ──
let accessToken: { token: string; expires: number } | null = null;
export async function getAccessToken(): Promise<string | null> {
  const sa = serviceAccount();
  if (!sa) return null;
  if (accessToken && accessToken.expires > Date.now() + 60_000) return accessToken.token;
  const now = Math.floor(Date.now() / 1000);
  const assertion = signJwt({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }, sa);
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  if (!res.ok) {
    console.error('Service account token failed:', res.status, await res.text().catch(() => ''));
    return null;
  }
  const json = await res.json();
  accessToken = { token: json.access_token, expires: Date.now() + (json.expires_in || 3600) * 1000 };
  return accessToken.token;
}

// ── Firestore REST ──
const docsBase = () => `https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents`;

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
// Without a service account, fall back to the public web API key (only works for publicly readable data).
const keyParam = (hasToken: boolean) => {
  const key = process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '';
  return !hasToken && key ? `key=${encodeURIComponent(key)}` : '';
};

const fromValue = (v: any): any => {
  if (!v || typeof v !== 'object') return v;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('timestampValue' in v) return v.timestampValue;
  if ('nullValue' in v) return null;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromValue);
  if ('mapValue' in v) return fromFields(v.mapValue.fields || {});
  return null;
};
export const fromFields = (fields: Record<string, any>) =>
  Object.fromEntries(Object.entries(fields || {}).map(([k, v]) => [k, fromValue(v)]));

const toValue = (v: any): any => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toValue(x)])) } };
  return { stringValue: String(v) };
};

export async function getDocument(path: string, mask?: string[]): Promise<(Record<string, any> & { id: string }) | null> {
  const headers = await authHeaders();
  const params = [...(mask || []).map((f) => `mask.fieldPaths=${encodeURIComponent(f)}`), keyParam(!!headers.Authorization)].filter(Boolean).join('&');
  const res = await fetch(`${docsBase()}/${path}${params ? `?${params}` : ''}`, { headers });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.fields ? { id: String(json.name).split('/').pop() as string, ...fromFields(json.fields) } : null;
}

export async function findByField(collection: string, field: string, value: string): Promise<(Record<string, any> & { id: string }) | null> {
  const headers = await authHeaders();
  const key = keyParam(!!headers.Authorization);
  const res = await fetch(`${docsBase()}:runQuery${key ? `?${key}` : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } },
        limit: 1,
      },
    }),
  });
  if (!res.ok) return null;
  const rows = await res.json();
  const doc = Array.isArray(rows) ? rows.find((r: any) => r?.document)?.document : null;
  return doc ? { id: String(doc.name).split('/').pop() as string, ...fromFields(doc.fields) } : null;
}

// Sets the given fields; fields listed in `remove` are deleted. Needs the service account.
export async function updateDocument(path: string, set: Record<string, any>, remove: string[] = []): Promise<boolean> {
  const headers = await authHeaders();
  if (!headers.Authorization) return false;
  const mask = [...Object.keys(set), ...remove].map((f) => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  const res = await fetch(`${docsBase()}/${path}?${mask}&currentDocument.exists=true`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(set).map(([k, v]) => [k, toValue(v)])) }),
  });
  if (!res.ok) console.error('updateDocument failed:', res.status, await res.text().catch(() => ''));
  return res.ok;
}

// ── Firebase Auth: custom tokens (sub-admin sign-in) and ID token checks ──
export function createCustomToken(uid: string, claims: Record<string, unknown>): string | null {
  const sa = serviceAccount();
  if (!sa) return null;
  const now = Math.floor(Date.now() / 1000);
  return signJwt({
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit',
    iat: now,
    exp: now + 3600,
    uid,
    claims,
  }, sa);
}

let certs: { keys: Record<string, string>; expires: number } | null = null;
async function googleCerts(): Promise<Record<string, string>> {
  if (certs && certs.expires > Date.now()) return certs.keys;
  const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  const keys = await res.json();
  const maxAge = Number((res.headers.get('cache-control') || '').match(/max-age=(\d+)/)?.[1] || 3600);
  certs = { keys, expires: Date.now() + maxAge * 1000 };
  return keys;
}

// Verifies a Firebase ID token (signature, project, expiry) and returns its claims, or null.
export async function verifyIdToken(idToken: string): Promise<Record<string, any> | null> {
  try {
    const [h, p, s] = idToken.split('.');
    if (!h || !p || !s) return null;
    const header = JSON.parse(Buffer.from(h, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
    if (header.alg !== 'RS256') return null;
    const cert = (await googleCerts())[header.kid];
    if (!cert) return null;
    const ok = crypto.createVerify('RSA-SHA256').update(`${h}.${p}`).verify(crypto.createPublicKey(cert), Buffer.from(s, 'base64url'));
    const pid = projectId();
    const now = Math.floor(Date.now() / 1000);
    if (!ok || payload.aud !== pid || payload.iss !== `https://securetoken.google.com/${pid}` || !payload.sub || payload.exp < now || payload.iat > now + 300) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Sub-admin passwords: PBKDF2-SHA256 (same format as src/lib/passwordHash.ts) ──
export function verifyPasswordHash(password: string, stored: string): boolean {
  const [scheme, iter, salt, hash] = String(stored || '').split('$');
  if (scheme !== 'pbkdf2' || !iter || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = crypto.pbkdf2Sync(password, Buffer.from(salt, 'base64'), Number(iter), expected.length, 'sha256');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const iter = 100000;
  const hash = crypto.pbkdf2Sync(password, salt, iter, 32, 'sha256');
  return `pbkdf2$${iter}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

// Who is calling? { role: 'admin' } | { role: 'subadmin', subAdminId } | null
export async function getCaller(authorization: string | undefined): Promise<{ role: 'admin' | 'subadmin'; subAdminId?: string } | null> {
  const header = String(authorization || '');
  if (!header.startsWith('Bearer ')) return null;
  const claims = await verifyIdToken(header.slice(7).trim());
  if (!claims) return null;
  if (claims.email && ADMIN_EMAILS.includes(String(claims.email).toLowerCase())) return { role: 'admin' };
  if (claims.subAdmin === true && claims.subAdminId) {
    const sa = await getDocument(`sub_admins/${claims.subAdminId}`, ['active']);
    if (sa && sa.active !== false) return { role: 'subadmin', subAdminId: String(claims.subAdminId) };
  }
  return null;
}
