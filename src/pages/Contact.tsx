import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { store } from "@/lib/store";

const WEB3FORMS_KEY = "2b77a360-efe4-4f8c-926e-a6a7a8e05895";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: form.subject.trim() || "New Contact Message from ReFAN Website",
          from_name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        store.addMessage({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || "No subject",
          message: form.message.trim(),
          date: new Date().toISOString(),
        });
        toast({ title: "Message sent!", description: "Thank you for reaching out. We'll respond within 48 hours." });
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast({ title: "Failed to send message", description: "Please try again or email us directly.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Please check your connection and try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="container pt-12 pb-8">
        <p className="text-sm text-muted-foreground mb-2">Home &gt; Contact Us</p>
        <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mb-3">Get in <span className="text-secondary">Touch</span> with <span className="text-primary">ReFAN</span></h1>
        <p className="text-lg text-muted-foreground max-w-2xl">Have questions about our initiatives in Dzaleka? We're here to help and would love to hear from you.</p>
      </section>

      <section className="container py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact info */}
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email Us", value: "refannetwork2022@gmail.com", sub: "support@refan.org" },
              { icon: Phone, label: "Call Us", value: "+265 997 561 852", sub: "Monday - Friday, 8am - 5pm CAT" },
              { icon: MapPin, label: "Our Location", value: "Dzaleka Refugee Camp, Dowa District", sub: "P.O. Box 16, Dowa, Malawi" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="p-3 rounded-full bg-primary/10 shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">{item.label}</p>
                  <p className="text-muted-foreground text-sm">{item.value}</p>
                  <p className="text-muted-foreground text-xs">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <h2 className="font-heading text-2xl font-bold mb-6">Send us a <span className="text-primary">Message</span></h2>
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 border border-border space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" required maxLength={100} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" required maxLength={255} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Subject</label>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" maxLength={200} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Message *</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none resize-none" required maxLength={2000} />
              </div>
              <Button type="submit" size="lg" disabled={submitting} className="bg-primary hover:bg-primary/90 text-white font-bold px-8 rounded-lg">
                <Send className="h-5 w-5" />
                {submitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
