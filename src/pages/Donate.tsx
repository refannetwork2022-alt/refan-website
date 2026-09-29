import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Send, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { store, DonateSettings, DEFAULT_DONATE_PAY_LINK } from "@/lib/store";
import { toHref } from "@/lib/contactLinks";

const DONATE_DEFAULTS: DonateSettings = {
  pageTitle: 'Make a <span class="text-primary">Donation</span>',
  pageSubtitle: "Your generosity transforms the lives of orphaned children and widows in Dzaleka Refugee Camp. Every contribution goes directly to education, community resilience, and bereavement support.",
  payLink: DEFAULT_DONATE_PAY_LINK,
};

const currencies = [
  { code: "MWK", label: "MWK (Malawi Kwacha)" },
  { code: "USD", label: "USD (US Dollar)" },
  { code: "GBP", label: "GBP (British Pound)" },
  { code: "EUR", label: "EUR (Euro)" },
  { code: "KES", label: "KES (Kenyan Shilling)" },
  { code: "ZAR", label: "ZAR (South African Rand)" },
  { code: "BIF", label: "BIF (Burundian Franc)" },
  { code: "CDF", label: "CDF (Congolese Franc)" },
  { code: "RWF", label: "RWF (Rwandan Franc)" },
  { code: "TZS", label: "TZS (Tanzanian Shilling)" },
  { code: "UGX", label: "UGX (Ugandan Shilling)" },
  { code: "AUD", label: "AUD (Australian Dollar)" },
  { code: "CAD", label: "CAD (Canadian Dollar)" },
  { code: "CHF", label: "CHF (Swiss Franc)" },
  { code: "INR", label: "INR (Indian Rupee)" },
  { code: "NGN", label: "NGN (Nigerian Naira)" },
];

const inputClass = "w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none";

const Donate = () => {
  const { toast } = useToast();
  const [d, setPageD] = useState<DonateSettings>(DONATE_DEFAULTS);
  useEffect(() => {
    store.getPageSettings<DonateSettings>("donate").then((data) => {
      if (data) setPageD({ ...DONATE_DEFAULTS, ...data });
    });
  }, []);
  const [currency, setCurrency] = useState("MWK");
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirectingName, setRedirectingName] = useState<string | null>(null);

  const payHref = toHref(d.payLink || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !amount || Number(amount) <= 0) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    await store.addDonation({
      name: name.trim(),
      email: email.trim(),
      amount: Number(amount),
      currency,
      message: message.trim(),
      date: new Date().toISOString(),
    });
    if (payHref) {
      // DzalekaPay only takes MWK, so the amount is prefilled only for MWK donations.
      let target = payHref;
      try {
        const url = new URL(payHref);
        if (currency === "MWK") url.searchParams.set("amount", String(Number(amount)));
        target = url.toString();
      } catch { /* keep the link exactly as the admin entered it */ }
      // Short thank-you before leaving the site, so the move to DzalekaPay isn't abrupt.
      setRedirectingName(name.trim());
      setTimeout(() => { window.location.href = target; }, 1800);
      return;
    }
    setSubmitting(false);
    toast({
      title: "Thank you for your donation request!",
      description: "Our admin will contact you with payment instructions.",
    });
    setName(""); setEmail(""); setMessage(""); setAmount("");
  };

  return (
    <Layout>
      {redirectingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
          <div className="bg-card rounded-2xl shadow-elevated p-8 max-w-md w-full text-center space-y-3">
            <Heart className="h-10 w-10 text-primary mx-auto" />
            <h2 className="font-heading text-2xl font-bold">Thank you, {redirectingName}!</h2>
            <p className="text-muted-foreground">Taking you to our secure payment page…</p>
            <div className="h-6 w-6 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        </div>
      )}
      <section className="container pt-12 pb-8 text-center">
        <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mb-3" dangerouslySetInnerHTML={{ __html: d.pageTitle }} />
        <div className="text-lg text-muted-foreground max-w-xl mx-auto" dangerouslySetInnerHTML={{ __html: d.pageSubtitle }} />
      </section>

      <section className="container py-12">
        <div className="container max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-5 sm:p-8 lg:p-10 shadow-elevated space-y-6">
            {/* Currency + Amount */}
            <div>
              <label className="block font-heading font-bold mb-3">Select Your Currency & Amount</label>
              <div className="grid sm:grid-cols-2 gap-4">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={inputClass}
                >
                  {currencies.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputClass}
                  min={1}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required maxLength={255} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message (optional)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className={inputClass + " resize-none"} maxLength={500} placeholder="Write a message to our admin (optional)" />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-lg text-sm sm:text-base" disabled={submitting}>
              {payHref ? <CreditCard className="h-5 w-5 shrink-0" /> : <Send className="h-5 w-5 shrink-0" />}
              <span className="truncate">
                {payHref
                  ? (submitting ? 'Opening payment...' : `Continue to Payment (${currency} ${amount || '0'})`)
                  : (submitting ? 'Sending...' : `Send Donation Request (${currency} ${amount || '0'})`)}
              </span>
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>{payHref
                ? "You will be taken to our secure DzalekaPay checkout (Mobile money or Card, paid in MWK)."
                : "Your donation request will be sent to our admin who will provide payment instructions."}</span>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Donate;
