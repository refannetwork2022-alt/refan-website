import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, Users, Handshake, ArrowRight, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { store } from "@/lib/store";
import CountrySearch from "@/components/CountrySearch";

const ways = [
  { icon: Heart, title: "Donate", desc: "Help fund education, community resilience, and bereavement support for orphans and widows in Dzaleka.", link: "/donate", cta: "Donate Now" },
  { icon: Users, title: "Volunteer", desc: "Support ReFAN on the ground in Dzaleka or remotely with skills like teaching, mentoring, or advocacy.", link: "#form", cta: "Sign Up" },
  { icon: Handshake, title: "Sponsor", desc: "Partner with ReFAN to sponsor a child's education or fund a specific program in the camp.", link: "#form", cta: "Become a Sponsor" },
  { icon: UserPlus, title: "Become a Member", desc: "Register as a ReFAN member. Join our community and be part of lasting change in Dzaleka.", link: "/register", cta: "Register Now" },
];

const inputClass = "w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none";

const GetInvolved = () => {
  const { toast } = useToast();
  const phoneCodes = [
    { code: "+265", country: "MW" }, { code: "+1", country: "US" }, { code: "+44", country: "GB" },
    { code: "+254", country: "KE" }, { code: "+255", country: "TZ" }, { code: "+256", country: "UG" },
    { code: "+250", country: "RW" }, { code: "+257", country: "BI" }, { code: "+243", country: "CD" },
    { code: "+27", country: "ZA" }, { code: "+234", country: "NG" }, { code: "+33", country: "FR" },
    { code: "+49", country: "DE" }, { code: "+91", country: "IN" }, { code: "+61", country: "AU" },
  ];
  const [form, setForm] = useState({
    name: '', email: '', phoneCode: '+265', phone: '', country: '', countryOfOrigin: '', idNumber: '',
    type: 'volunteer' as 'volunteer' | 'sponsor', message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    await store.addVolunteer({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: `${form.phoneCode} ${form.phone.trim()}`,
      country: form.country,
      message: `${form.message.trim()}${form.countryOfOrigin ? `\n[Country of Origin: ${form.countryOfOrigin}]` : ''}${form.idNumber ? `\n[ID: ${form.idNumber}]` : ''}`,
      date: new Date().toISOString(),
    });
    setSubmitting(false);
    toast({ title: "Registration submitted!", description: "Thank you for your interest. We'll be in touch soon." });
    setForm({ name: '', email: '', phoneCode: '+265', phone: '', country: '', countryOfOrigin: '', idNumber: '', type: 'volunteer', message: '' });
  };

  return (
    <Layout>
      <section className="container pt-12 pb-8 text-center">
        <h1 className="font-heading text-3xl lg:text-5xl font-extrabold italic mb-3">Join the <span className="text-primary">Movement</span></h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Together, we can create lasting change. Your support empowers communities and transforms lives. Choose your path to make an impact today.</p>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Button asChild className="btn-hover bg-primary hover:bg-primary/90 text-white font-bold rounded-full px-8">
            <Link to="/about">View Our Impact</Link>
          </Button>
          <Button asChild variant="outline" className="btn-hover rounded-full px-8 font-bold">
            <Link to="/stories">Read Stories</Link>
          </Button>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {ways.map((w) => (
            <div key={w.title} className="bg-card rounded-xl p-8 border border-border text-center hover:border-primary/50 hover:shadow-card transition-all">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <w.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">{w.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{w.desc}</p>
              {w.link.startsWith('/') ? (
                <Button asChild variant="outline" size="sm" className="btn-hover">
                  <Link to={w.link}>{w.cta} <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="btn-hover" onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })}>
                  {w.cta} <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </section>

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
                  {t === 'volunteer' ? 'Volunteer' : 'Sponsor'}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required maxLength={100} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} required maxLength={255} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <div className="flex gap-2">
                  <select value={form.phoneCode} onChange={(e) => setForm({ ...form, phoneCode: e.target.value })} className="w-28 px-2 py-3 rounded-lg border border-input bg-background text-sm">
                    {phoneCodes.map(p => <option key={p.code} value={p.code}>{p.country} ({p.code})</option>)}
                  </select>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} maxLength={15} placeholder="Phone number" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {form.type === 'sponsor' ? 'Country *' : 'Country of Residence *'}
                </label>
                <CountrySearch
                  value={form.country}
                  onChange={(val) => setForm({ ...form, country: val })}
                  placeholder="Type to search country..."
                  required
                />
              </div>
            </div>

            {/* Only show Country of Origin + ID for volunteers */}
            {form.type === 'volunteer' && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Country of Origin</label>
                  <CountrySearch
                    value={form.countryOfOrigin}
                    onChange={(val) => setForm({ ...form, countryOfOrigin: val })}
                    placeholder="Type to search country..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">ID Number</label>
                  <input value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} className={inputClass} maxLength={50} placeholder="Your national or refugee ID" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">Tell us about yourself</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} className={inputClass + " resize-none"} maxLength={1000} />
            </div>
            <div className="flex justify-center">
              <Button type="submit" size="lg" className="btn-hover bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-12" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </Button>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default GetInvolved;
