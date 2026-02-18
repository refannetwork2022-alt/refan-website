import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, Users, Handshake, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { store } from "@/lib/store";

const ways = [
  { icon: Heart, title: "Donate", desc: "Support our programs with a financial contribution.", link: "/donate", cta: "Donate Now" },
  { icon: Users, title: "Volunteer", desc: "Join our team on the ground or remotely.", link: "#form", cta: "Sign Up" },
  { icon: Handshake, title: "Sponsor", desc: "Partner with us to fund specific programs.", link: "#form", cta: "Become a Sponsor" },
];

const GetInvolved = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: 'volunteer' as 'volunteer' | 'sponsor', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    store.addVolunteer({ ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), message: form.message.trim(), date: new Date().toISOString() });
    setTimeout(() => {
      setSubmitting(false);
      toast({ title: "Registration submitted!", description: "Thank you for your interest. We'll be in touch soon." });
      setForm({ name: '', email: '', phone: '', type: 'volunteer', message: '' });
    }, 600);
  };

  return (
    <Layout>
      <section className="bg-secondary py-20">
        <div className="container">
          <h1 className="font-heading text-4xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">Get <span className="text-primary">Involved</span></h1>
          <p className="text-lg text-secondary-foreground/70 max-w-2xl">There are many ways to support our mission. Find the one that's right for you.</p>
        </div>
      </section>

      {/* Ways to help */}
      <section className="py-20">
        <div className="container grid md:grid-cols-3 gap-8">
          {ways.map((w) => (
            <div key={w.title} className="bg-card rounded-xl p-8 shadow-card text-center hover:shadow-elevated transition-shadow">
              <div className="mx-auto w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-4">
                <w.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">{w.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{w.desc}</p>
              {w.link.startsWith('/') ? (
                <Button asChild variant="outline" size="sm">
                  <Link to={w.link}>{w.cta} <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  {w.cta} <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Registration Form */}
      <section id="registration-form" className="py-20 bg-muted">
        <div className="container max-w-2xl">
          <h2 className="font-heading text-3xl font-extrabold text-center mb-10">Volunteer / Sponsor Registration</h2>
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 lg:p-10 shadow-elevated space-y-6">
            <div className="flex gap-4">
              {(['volunteer', 'sponsor'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-all ${
                    form.type === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {t === 'volunteer' ? '🙋 Volunteer' : '🤝 Sponsor'}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" required maxLength={100} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" required maxLength={255} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" maxLength={20} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tell us about yourself</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none resize-none" maxLength={1000} />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default GetInvolved;
