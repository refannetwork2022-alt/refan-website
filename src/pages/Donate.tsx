import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, Shield, Send, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { store, DonateSettings, DEFAULT_DONATE_PAY_LINK } from "@/lib/store";
import { toHref } from "@/lib/contactLinks";
import { getMwkRates, toMwk } from "@/lib/exchangeRates";
import { sendConfirmationEmail } from "@/lib/sendEmail";
import { usePaymentOptions, PaymentMethodPicker, PaymentInstructions, MAIN_PAYMENT_ID, type PaymentOption } from "@/components/PaymentMethods";

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
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [ratesFailed, setRatesFailed] = useState(false);
  // Load exchange rates only once someone picks a currency other than MWK.
  useEffect(() => {
    if (currency === "MWK" || rates) return;
    getMwkRates().then((r) => { setRates(r); setRatesFailed(!r); });
  }, [currency, rates]);
  const mwkAmount = toMwk(Number(amount), currency, rates);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [redirectingName, setRedirectingName] = useState<string | null>(null);

  // Ways to pay: DzalekaPay plus any methods the admin added (picker shown only when there is a choice).
  const { options: payOptions, loaded: payLoaded } = usePaymentOptions();
  const [payMethodId, setPayMethodId] = useState(MAIN_PAYMENT_ID);
  const [payReference, setPayReference] = useState("");
  const [manualThanks, setManualThanks] = useState<{ name: string; option: PaymentOption; amountText: string } | null>(null);
  useEffect(() => {
    if (payOptions.length && !payOptions.some((o) => o.id === payMethodId)) setPayMethodId(payOptions[0].id);
  }, [payOptions, payMethodId]);
  // Until the methods have loaded, behave as before (the main link from the Donate settings).
  const selectedPay: PaymentOption | undefined = payLoaded
    ? payOptions.find((o) => o.id === payMethodId)
    : (toHref(d.payLink || "") ? { id: MAIN_PAYMENT_ID, name: "DzalekaPay", kind: "link", href: toHref(d.payLink || ""), main: true } : undefined);
  const payHref = selectedPay?.kind === "link" ? selectedPay.href || "" : "";
  const isMainPay = !!selectedPay?.main;
  const isManualPay = selectedPay?.kind === "manual";

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
    const saved = await store.addDonation({
      name: name.trim(),
      email: email.trim(),
      amount: Number(amount),
      currency,
      message: message.trim(),
      date: new Date().toISOString(),
      ...(isMainPay && currency !== "MWK" && mwkAmount ? { mwkAmount } : {}),
      ...(selectedPay ? { paymentMethod: selectedPay.name } : {}),
      ...(isManualPay && payReference.trim() ? { paymentReference: payReference.trim() } : {}),
    });
    sendConfirmationEmail("donation", saved?.id);
    if (payHref) {
      let target = payHref;
      // Only the main DzalekaPay checkout takes ?amount= (in MWK); other links open exactly as the admin entered them.
      if (isMainPay) {
        try {
          const url = new URL(payHref);
          // DzalekaPay charges in MWK only, so foreign amounts are converted first.
          if (mwkAmount) url.searchParams.set("amount", String(mwkAmount));
          target = url.toString();
        } catch { /* keep the link exactly as the admin entered it */ }
      }
      // Short thank-you before leaving the site, so the move to DzalekaPay isn't abrupt.
      setRedirectingName(name.trim());
      setTimeout(() => { window.location.href = target; }, 3000);
      return;
    }
    setSubmitting(false);
    if (isManualPay && selectedPay) {
      // Send-money methods: show how to pay; the admin confirms once the money arrives.
      setManualThanks({ name: name.trim(), option: selectedPay, amountText: `${currency} ${Number(amount).toLocaleString()}` });
      setName(""); setEmail(""); setMessage(""); setAmount(""); setPayReference("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
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
            <p className="text-muted-foreground">{isMainPay ? "Taking you to our secure payment page…" : `Taking you to ${selectedPay?.name || "the payment page"}…`}</p>
            {isMainPay && <p className="text-sm text-muted-foreground">There, choose how you want to pay: <strong className="text-foreground">Mobile money</strong> or <strong className="text-foreground">Card</strong> (Visa / Mastercard).</p>}
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
          {manualThanks && (
            <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-elevated text-center space-y-4 mb-8">
              <Heart className="h-10 w-10 text-primary mx-auto" />
              <h2 className="font-heading text-2xl font-bold">Thank you, {manualThanks.name}!</h2>
              <p className="text-muted-foreground">Your donation has been received. Please complete the payment as shown below; our team will confirm it once the money arrives.</p>
              <PaymentInstructions option={manualThanks.option} amountText={manualThanks.amountText} />
              <button type="button" onClick={() => setManualThanks(null)} className="text-sm text-muted-foreground hover:text-primary transition-colors">Close</button>
            </div>
          )}
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
              {isMainPay && currency !== "MWK" && Number(amount) > 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  {mwkAmount
                    ? <>{currency} {Number(amount).toLocaleString()} ≈ <strong className="text-foreground">MWK {mwkAmount.toLocaleString()}</strong>. You will pay in Malawi Kwacha by card or mobile money; your bank converts it to your currency.</>
                    : ratesFailed
                      ? "We could not load today's exchange rate. Please enter the amount in MWK on the payment page."
                      : "Converting to Malawi Kwacha…"}
                </p>
              )}
            </div>

            <PaymentMethodPicker
              options={payOptions}
              selectedId={payMethodId}
              onSelect={setPayMethodId}
              reference={payReference}
              onReference={setPayReference}
              amountText={Number(amount) > 0 ? `${currency} ${Number(amount).toLocaleString()}` : undefined}
              inputClass={inputClass}
            />

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
                  ? (submitting ? 'Opening payment...' : `Continue to Payment (${currency} ${amount || '0'}${isMainPay && currency !== 'MWK' && mwkAmount ? ` ≈ MWK ${mwkAmount.toLocaleString()}` : ''})`)
                  : isManualPay
                    ? (submitting ? 'Sending...' : `Send Donation (${currency} ${amount || '0'})`)
                    : (submitting ? 'Sending...' : `Send Donation Request (${currency} ${amount || '0'})`)}
              </span>
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>{payHref
                ? (isMainPay ? "You will be taken to our secure DzalekaPay checkout (Mobile money or Card, paid in MWK)." : `You will be taken to ${selectedPay?.name} to pay.`)
                : isManualPay
                  ? "After you send the money, our team checks it and confirms your donation."
                  : "Your donation request will be sent to our admin who will provide payment instructions."}</span>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Donate;
