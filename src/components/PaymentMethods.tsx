import { useEffect, useState } from "react";
import { CreditCard, Smartphone, CheckCircle2 } from "lucide-react";
import { store, DEFAULT_DONATE_PAY_LINK, type DonateSettings } from "@/lib/store";
import { toHref } from "@/lib/contactLinks";

// A way to pay shown on the Donate, member registration and sponsor forms:
// the main online link (DzalekaPay, Page Content > Donate) plus the methods the admin added.
export interface PaymentOption {
  id: string;
  name: string;
  country?: string;
  kind: "link" | "manual";
  href?: string;
  details?: string;
  image?: string;
  // The main DzalekaPay checkout (takes ?amount= in MWK).
  main?: boolean;
}

export const MAIN_PAYMENT_ID = "main";

export function usePaymentOptions() {
  const [options, setOptions] = useState<PaymentOption[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    store.getPageSettings<DonateSettings>("donate")
      .then((d) => {
        const list: PaymentOption[] = [];
        const mainHref = toHref(d && typeof d.payLink === "string" ? d.payLink : DEFAULT_DONATE_PAY_LINK);
        if (mainHref) {
          list.push({
            id: MAIN_PAYMENT_ID,
            name: /dzaleka/i.test(mainHref) ? "DzalekaPay" : "Pay online",
            country: "Mobile money or Card (MWK)",
            kind: "link",
            href: mainHref,
            main: true,
          });
        }
        (d?.paymentMethods || []).filter((m) => m.active !== false && m.name?.trim()).forEach((m) => {
          const href = m.kind === "link" ? toHref(m.link || "") : "";
          if (m.kind === "link" && !href) return;
          list.push({ id: m.id, name: m.name.trim(), country: m.country?.trim(), kind: m.kind, href, details: m.details, image: m.image });
        });
        setOptions(list);
      })
      .catch(() => setOptions([{ id: MAIN_PAYMENT_ID, name: "DzalekaPay", country: "Mobile money or Card (MWK)", kind: "link", href: DEFAULT_DONATE_PAY_LINK, main: true }]))
      .finally(() => setLoaded(true));
  }, []);
  return { options, loaded };
}

const isHtml = (text: string) => /<[a-z][\s\S]*>/i.test(text);

// How to pay with a "manual" method (number to send money to, account name...), as the admin wrote it.
export const PaymentInstructions = ({ option, amountText }: { option: PaymentOption; amountText?: string }) => (
  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2 text-left">
    <p className="text-sm font-bold text-foreground">How to pay with {option.name}{amountText ? <> — <span className="text-primary">{amountText}</span></> : null}</p>
    {option.details ? (
      <div
        className={`text-sm text-muted-foreground break-words [&_a]:text-primary [&_a]:underline ${isHtml(option.details) ? "" : "whitespace-pre-line"}`}
        dangerouslySetInnerHTML={{ __html: option.details }}
      />
    ) : (
      <p className="text-sm text-muted-foreground">Our team will contact you with the payment details.</p>
    )}
  </div>
);

interface PickerProps {
  options: PaymentOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  reference: string;
  onReference: (value: string) => void;
  amountText?: string;
  inputClass: string;
}

// "How will you pay?" — shown only when there is more than one way to pay, so the forms look as before
// until the admin adds a method.
export const PaymentMethodPicker = ({ options, selectedId, onSelect, reference, onReference, amountText, inputClass }: PickerProps) => {
  if (options.length < 2) return null;
  const selected = options.find((o) => o.id === selectedId);
  return (
    <div className="space-y-3">
      <label className="block font-heading font-bold">How will you pay?</label>
      <div className="grid sm:grid-cols-2 gap-3">
        {options.map((o) => {
          const active = o.id === selectedId;
          const Icon = o.kind === "link" ? CreditCard : Smartphone;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelect(o.id)}
              className={`w-full min-w-0 flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-input hover:border-primary/50"}`}
            >
              {o.image ? (
                <img src={o.image} alt="" className="h-10 w-10 rounded-md object-contain bg-white shrink-0" />
              ) : (
                <span className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0"><Icon className="h-5 w-5 text-primary" /></span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground break-words">{o.name}</span>
                {o.country && <span className="block text-xs text-muted-foreground break-words">{o.country}</span>}
              </span>
              {active && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>
      {selected?.kind === "manual" && (
        <>
          <PaymentInstructions option={selected} amountText={amountText} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Transaction ID / reference (if you have already paid)</label>
            <input value={reference} onChange={(e) => onReference(e.target.value)} className={inputClass} maxLength={100} placeholder="e.g. the code in your payment SMS" />
          </div>
        </>
      )}
    </div>
  );
};

// For the admin lists: which method someone chose and the transaction ID they gave.
export const PaymentInfo = ({ method, reference, className = "text-sm text-muted-foreground" }: { method?: string; reference?: string; className?: string }) => {
  if (!method && !reference) return null;
  return (
    <p className={className}>
      {method && <>Paid with: <span className="font-medium text-foreground">{method}</span></>}
      {method && reference && " · "}
      {reference && <>Ref: <span className="font-medium text-foreground select-all">{reference}</span></>}
    </p>
  );
};
