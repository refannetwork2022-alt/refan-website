import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, Shield, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { store } from "@/lib/store";

const amounts = [10, 25, 50, 100, 250, 500];

const Donate = () => {
  const { toast } = useToast();
  const [selected, setSelected] = useState(50);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const amount = custom ? Number(custom) : selected;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || amount <= 0) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    store.addDonation({ name: name.trim(), email: email.trim(), amount, message: message.trim(), date: new Date().toISOString() });
    setTimeout(() => {
      setSubmitting(false);
      toast({ title: "Thank you for your generous donation!", description: `Your $${amount} donation has been recorded. We'll send a confirmation to ${email}.` });
      setName(""); setEmail(""); setMessage(""); setCustom("");
    }, 800);
  };

  return (
    <Layout>
      <section className="bg-gradient-primary py-20">
        <div className="container text-center">
          <Heart className="h-12 w-12 text-primary-foreground mx-auto mb-4" />
          <h1 className="font-heading text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-4">Make a Donation</h1>
          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
            Your generosity transforms lives. Every dollar goes directly to programs that empower communities.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-2xl">
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 lg:p-10 shadow-elevated space-y-8">
            {/* Amount Selection */}
            <div>
              <label className="block font-heading font-bold mb-4">Select Amount (USD)</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {amounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setSelected(a); setCustom(""); }}
                    className={`py-3 rounded-lg font-bold text-lg transition-all ${
                      selected === a && !custom ? 'bg-primary text-primary-foreground shadow-soft' : 'bg-muted text-foreground hover:bg-accent'
                    }`}
                  >
                    ${a}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Or enter custom amount"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-ring outline-none"
                min={1}
              />
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" required maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" required maxLength={255} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message (optional)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none resize-none" maxLength={500} />
              </div>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              <CreditCard className="h-5 w-5" />
              {submitting ? 'Processing...' : `Donate $${amount}`}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure & encrypted. Your data is safe with us.</span>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Donate;
