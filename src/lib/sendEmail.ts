import { auth } from "@/integrations/firebase/client";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  body: string;
  replyTo?: string;
}

// /api/send-email only accepts signed-in admins (Firebase ID token) or sub-admins (access token + password).
export const postEmail = async (
  payload: EmailPayload,
  subAdmin?: { token: string; password: string },
): Promise<{ success: boolean; error?: string }> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const body: Record<string, unknown> = { ...payload };
  if (subAdmin) {
    body.subAdminToken = subAdmin.token;
    body.subAdminPassword = subAdmin.password;
  } else if (auth.currentUser) {
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }
  const res = await fetch("/api/send-email", { method: "POST", headers, body: JSON.stringify(body) });
  try {
    return await res.json();
  } catch {
    return { success: false, error: `HTTP ${res.status}` };
  }
};
