import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, MessageCircle } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";
import { store, FooterSettings } from "@/lib/store";

const DEFAULTS: FooterSettings = {
  email: "refannetwork2022@gmail.com",
  phone: "+265 997 561 852",
  address: "Dzaleka Refugee Camp, Dowa District, Malawi",
  whatsapp: "265997561852",
  linkedin: "https://www.linkedin.com/in/holistic-continuity-of-care-571586315",
  description: "Resilient Foundation Assistance Network (ReFAN) is a refugee-led NGO based in Dzaleka, Malawi, dedicated to the continuity of care for the most vulnerable.",
};

const Footer = () => {
  const [info, setInfo] = useState<FooterSettings>(DEFAULTS);

  useEffect(() => {
    store.getFooterSettings().then((data) => {
      if (data) setInfo({ ...DEFAULTS, ...data });
    });
  }, []);

  return (
    <footer className="bg-[#0f1d3d] text-white -mt-16">
      <div className="container pt-4 pb-16">
        {/* Top: Description */}
        <div className="text-center mb-10">
          <div className="text-white/60 text-sm leading-relaxed max-w-lg mx-auto" dangerouslySetInnerHTML={{ __html: info.description }} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-start">
          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[["About Us", "/about"], ["Programs", "/programs"], ["Stories", "/stories"], ["Gallery", "/gallery"], ["Blog", "/blog"]].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-white/60 hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary">Get Involved</h4>
            <ul className="space-y-2 text-sm">
              {[["Donate", "/donate"], ["Volunteer", "/get-involved"], ["Sponsor", "/get-involved"], ["Contact", "/contact"]].map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="text-white/60 hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Centered logo emblem - hidden on mobile, visible on lg+ */}
          <div className="hidden lg:flex items-center justify-center overflow-hidden">
            <img src="/ReFAN Hands Logo_ReFAN.png" alt="ReFAN emblem" className="w-64 h-auto object-contain opacity-80" />
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> <span className="break-all">{info.email}</span></li>
              <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> {info.phone}</li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> {info.address}</li>
              <li className="flex items-start gap-2"><MessageCircle className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> <a href={`https://api.whatsapp.com/send?phone=${info.whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp</a></li>
              <li className="flex items-start gap-2"><Linkedin className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> <a href={info.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary">Newsletter</h4>
            <p className="text-white/60 text-sm mb-3">Stay updated on our programs and impact.</p>
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p
            className="cursor-default select-none"
            onClick={() => {
              const now = Date.now();
              const key = '__ataps';
              const prev = JSON.parse(sessionStorage.getItem(key) || '[]') as number[];
              const taps = [...prev, now].filter(t => now - t < 3000);
              sessionStorage.setItem(key, JSON.stringify(taps));
              if (taps.length >= 5) {
                sessionStorage.removeItem(key);
                window.location.hash = '/admin-login';
              }
            }}
          >&copy; 2026 ReFAN. All rights reserved.</p>
          <div className="flex gap-6">
            <a href={info.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors uppercase font-bold tracking-widest">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
