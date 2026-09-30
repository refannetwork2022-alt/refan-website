import { store, type Member, type PaymentStatus } from "@/lib/store";
import { postEmail } from "@/lib/sendEmail";

export interface MemberStatusResult {
  ok: boolean;
  emailed: boolean;
  expiryDate?: string;
  regNumber?: string;
}

// Approve = payment confirmed: membership runs 3 months from today, the member gets a membership number if they
// don't have one yet (online registrations), and a welcome email (only once).
// Shared by the admin panel and sub-admins the admin has allowed to edit Members.
export const setMemberPaymentStatus = async (m: Member, status: PaymentStatus): Promise<MemberStatusResult> => {
  const extra: Record<string, unknown> = {};
  let expiryDisplay = "";
  let regNumber = m.regNumber;
  if (status === "approved" && !regNumber) {
    regNumber = await store.getNextRegNumber();
    extra.regNumber = regNumber;
  }
  if (status === "approved") {
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 3);
    extra.expiryDate = expiry.toISOString().split("T")[0];
    expiryDisplay = expiry.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  const ok = await store.updateMemberStatus(m.id, status, extra);
  if (!ok) return { ok: false, emailed: false };
  if (status !== "approved" || m.welcomeSent || !m.email) {
    return { ok: true, emailed: false, expiryDate: extra.expiryDate as string | undefined, regNumber };
  }

  const name = `${m.firstName} ${m.surname}`.trim();
  let emailed = false;
  try {
    const result = await postEmail({
      to: m.email,
      subject: "Welcome to ReFAN - your membership is confirmed",
      body: `Dear ${name},\n\nWe have received your payment and your ReFAN membership is now confirmed. Welcome to the ReFAN family!\n\nMembership Number: ${regNumber}\nMembership valid until: ${expiryDisplay}\n\nPlease keep your membership number for your records.\n\nWith gratitude,\nReFAN - Resilient Foundation Assistance Network`,
    });
    emailed = !!result.success;
  } catch {
    emailed = false;
  }
  if (emailed) await store.updateMemberStatus(m.id, "approved", { welcome_sent: true });
  return { ok: true, emailed, expiryDate: extra.expiryDate as string, regNumber };
};

// Shared status badge text/colours for the members tables.
export const memberStatusBadge = (status?: PaymentStatus) =>
  status === "approved"
    ? { label: "Member", className: "bg-green-100 text-green-700" }
    : status === "rejected"
      ? { label: "Not paid", className: "bg-red-100 text-red-700" }
      : { label: "Pending payment", className: "bg-amber-100 text-amber-700" };
