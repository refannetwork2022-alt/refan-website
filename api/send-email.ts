import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

import { findByField, getCaller, verifyPasswordHash } from './_lib/firebase';

// Only signed-in admins or sub-admins (Firebase ID token, checked in _lib/firebase.ts) may send email,
// so this endpoint can't be used by outsiders to send mail from the ReFAN Gmail account.
// Older sub-admin pages sent their access-link token + password instead; that is still accepted.
async function isAuthorized(req: VercelRequest): Promise<boolean> {
  try {
    if (String(req.headers.authorization || '').startsWith('Bearer ')) {
      return !!(await getCaller(req.headers.authorization));
    }
    const { subAdminToken, subAdminPassword } = req.body || {};
    if (typeof subAdminToken === 'string' && typeof subAdminPassword === 'string' && subAdminPassword) {
      const sa = await findByField('sub_admins', 'token', subAdminToken);
      if (!sa || sa.active === false) return false;
      return sa.passwordHash ? verifyPasswordHash(subAdminPassword, sa.passwordHash) : sa.password === subAdminPassword;
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
