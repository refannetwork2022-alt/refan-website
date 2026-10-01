import { Button } from "@/components/ui/button";
import type { Member, PaymentStatus } from "@/lib/store";
import { memberStatusBadge } from "@/lib/memberApproval";
import { PaymentInfo } from "@/components/PaymentMethods";

interface MemberPaymentCellProps {
  member: Member;
  canChange: boolean;
  onChange: (status: PaymentStatus) => void;
}

// Payment status badge plus Approve / Reject; the decision can be changed at any time.
const MemberPaymentCell = ({ member, canChange, onChange }: MemberPaymentCellProps) => {
  const badge = memberStatusBadge(member.paymentStatus);
  const name = `${member.firstName} ${member.surname}`.trim();
  return (
    <td className="py-3 px-3">
      <span className={`inline-block whitespace-nowrap text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
      {Number(member.paymentAmount) > 0 && (
        <p className="text-[11px] text-muted-foreground mt-1 whitespace-nowrap">{member.paymentCurrency} {Number(member.paymentAmount).toLocaleString()}</p>
      )}
      <PaymentInfo method={member.paymentMethod} reference={member.paymentReference} className="text-[11px] text-muted-foreground mt-1 max-w-[180px] break-words" />
      {canChange && (
        <div className="flex gap-1 mt-1">
          {member.paymentStatus !== "approved" && (
            <Button variant="outline" size="sm" className="h-6 px-2 text-[11px] text-green-700 border-green-300 hover:bg-green-50" onClick={() => onChange("approved")}>Approve</Button>
          )}
          {member.paymentStatus !== "rejected" && (
            <Button variant="outline" size="sm" className="h-6 px-2 text-[11px] text-red-700 border-red-300 hover:bg-red-50" onClick={() => {
              if (member.paymentStatus === "approved" && !confirm(`${name} is currently an active member. Mark as payment NOT received?`)) return;
              onChange("rejected");
            }}>Reject</Button>
          )}
        </div>
      )}
    </td>
  );
};

export default MemberPaymentCell;
