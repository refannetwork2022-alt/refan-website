import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({ title: "Message sent!", description: "Thank you for reaching out. We'll respond within 48 hours." });
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 600);
  };

  return (
    <Layout>
      <section className="bg-secondary py-20">
        <div className="container">
          <h1 className="font-heading text-4xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">Contact <span className="text-primary">Us</span></h1>
          <p className="text-lg text-secondary-foreground/70 max-w-2xl">We'd love to hear from you. Reach out with questions, partnership ideas, or feedback.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact info */}
            <div className="space-y-8">
              <h2 className="font-heading text-2xl font-bold">Get in Touch</h2>
              {[
                { icon: Mail, label: "Email", value: "info@refan.org" },
                { icon: Phone, label: "Phone", value: "+234 800 000 0000" },
                { icon: MapPin, label: "Address", value: "12 Charity Lane, Victoria Island, Lagos, Nigeria" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent shrink-0">
                    <item.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-muted-foreground text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-elevated space-y-6">
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
                <Button type="submit" variant="hero" size="lg" disabled={submitting}>
                  <Send className="h-5 w-5" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
