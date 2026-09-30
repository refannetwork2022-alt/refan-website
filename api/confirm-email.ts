import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// "We received your form" email, sent right after someone donates or registers as a member.
// Visitors aren't signed in, so instead of accepting any text/recipient (which could be abused to send spam from
// the ReFAN Gmail), this only takes the id of a record just saved in the database, checks it exists and is new,
// and emails the address stored in that record with a fixed ReFAN message.

const COLLECTIONS = {
  donation: 'donation_submissions',
  member: 'members',
} as const;
type Kind = keyof typeof COLLECTIONS;

const MAX_AGE_MS = 15 * 60 * 1000; // only records created in the last 15 minutes
const sent = new Set<string>(); // best effort: don't send twice from the same server instance

const projectId = () => process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '';
const apiKey = () => process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '';

async function getRecord(collection: string, id: string, fields: string[]): Promise<Record<string, string> | null> {
  const mask = fields.map((f) => `mask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  const key = apiKey();
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents/${collection}/${encodeURIComponent(id)}?${mask}${key ? `&key=${encodeURIComponent(key)}` : ''}`);
  if (!res.ok) return null;
  const json = await res.json();
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries<any>(json?.fields || {})) {
    out[k] = String(v.stringValue ?? v.integerValue ?? v.doubleValue ?? '');
  }
  return out;
}

const money = (currency: string, amount: string) => `${currency || 'MWK'} ${Number(amount || 0).toLocaleString('en-US')}`;

function buildMessage(kind: Kind, r: Record<string, string>): { name: string; subject: string; body: string } {
  if (kind === 'donation') {
    const name = r.name || 'Friend';
    return {
      name,
      subject: 'Thank you for your donation to ReFAN',
      body: `Dear ${name},\n\nThank you for your donation of ${money(r.currency, r.amount)} to ReFAN. We have received your details.\n\nIf you have not completed the payment yet, you can do it anytime on our website (Donate page). Once our team confirms that your payment has arrived, you will receive a confirmation email.\n\nYour generosity supports orphans and widows in Dzaleka Refugee Camp.\n\nWith gratitude,\nReFAN - Resilient Foundation Assistance Network`,
    };
  }
  const name = `${r.firstName || ''} ${r.surname || ''}`.trim() || 'Friend';
  return {
    name,
    subject: 'We received your ReFAN membership registration',
    body: `Dear ${name},\n\nThank you for registering as a member of ReFAN. We have received your registration${Number(r.paymentAmount) > 0 ? ` and your membership payment details (${money(r.paymentCurrency, r.paymentAmount)})` : ''}.\n\nOur team will review your registration. Once it is approved, you will receive another email with your membership number.\n\nWith gratitude,\nReFAN - Resilient Foundation Assistance Network`,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, id } = req.body || {};
  if (!(type in COLLECTIONS) || typeof id !== 'string' || !/^[\w-]{10,64}$/.test(id)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  const kind = type as Kind;
  const key = `${kind}:${id}`;
  if (sent.has(key)) return res.status(200).json({ success: true, alreadySent: true });

  const fields = kind === 'donation'
    ? ['email', 'name', 'amount', 'currency', 'created_at']
    : ['email', 'firstName', 'surname', 'paymentAmount', 'paymentCurrency', 'created_at'];
  const record = await getRecord(COLLECTIONS[kind], id, fields).catch(() => null);
  if (!record) return res.status(404).json({ error: 'Not found' });

  const created = Date.parse(record.created_at || '');
  if (!created || Date.now() - created > MAX_AGE_MS) return res.status(403).json({ error: 'Too late' });
  const to = (record.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return res.status(400).json({ error: 'No valid email' });

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailAppPassword) return res.status(500).json({ error: 'Email service not configured' });

  const { subject, body } = buildMessage(kind, record);
  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: gmailUser, pass: gmailAppPassword } });
    await transporter.sendMail({ from: `ReFAN Network <${gmailUser}>`, to, subject, text: body, replyTo: gmailUser });
    sent.add(key);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('confirm-email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
