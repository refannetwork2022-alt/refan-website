import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin, MessageCircle } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";
import { store, FooterSettings } from "@/lib/store";
import { getContactIcon, toHref } from "@/lib/contactLinks";

const DEFAULTS: FooterSettings = {
  email: "refannetwork2022@gmail.com",
  phone: "+265 997 561 852",
  address: "Dzaleka Refugee Camp, Dowa District, Malawi",
  whatsapp: "265997561852",
  linkedin: "https://www.linkedin.com/in/holistic-continuity-of-care-571586315",
  description: "Resilient Foundation Assistance Network (ReFAN) is a refugee-led NGO based in Dzaleka, Malawi, dedicated to the continuity of care for the most vulnerable.",
};

const headingClass = "font-heading font-bold text-xs uppercase tracking-[0.15em] mb-4 text-primary";
const linkClass = "text-white/60 hover:text-white transition-colors";
const socialClass = "w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/70 hover:bg-primary hover:border-primary hover:text-white transition-colors";

// Lets a long email address wrap before the "@" instead of in the middle of a word.
const emailWithBreak = (email: string) => {
  const at = email.indexOf("@");
  return at > 0 ? <>{email.slice(0, at)}<wbr />{email.slice(at)}</> : email;
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
      <div className="container pt-20 pb-12">
        {/* Brand + link columns. Phones: brand centred on top, links below; desktop: brand on the left. */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4 flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* Emblem in white (one colour) so it shows on the navy background */}
            <Link to="/" aria-label="ReFAN home" className="mb-5 opacity-95 hover:opacity-100 transition-opacity">
              <img src="/ReFAN Hands Logo_ReFAN.png" alt="ReFAN" className="w-28 lg:w-32 h-auto object-contain brightness-0 invert" loading="lazy" />
            </Link>
            <div className="text-white/60 text-sm leading-relaxed max-w-sm" dangerouslySetInnerHTML={{ __html: info.description }} />
            <div className="flex gap-3 mt-6">
              <a href={info.linkedin} target="_blank" rel="noopener noreferrer" aria-label="ReFAN on LinkedIn" className={socialClass}><Linkedin className="h-4 w-4" /></a>
              <a href={`https://api.whatsapp.com/send?phone=${info.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp ReFAN" className={socialClass}><MessageCircle className="h-4 w-4" /></a>
              <a href={`mailto:${info.email.trim()}`} aria-label="Email ReFAN" className={socialClass}><Mail className="h-4 w-4" /></a>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Quick Links */}
            <div>
              <h4 className={headingClass}>Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                {[["About Us", "/about"], ["Programs", "/programs"], ["Stories", "/stories"], ["Gallery", "/gallery"], ["Blog", "/blog"]].map(([label, path]) => (
                  <li key={path}>
                    <Link to={path} className={linkClass}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Get Involved */}
            <div>
              <h4 className={headingClass}>Get Involved</h4>
              <ul className="space-y-2.5 text-sm">
                {[["Donate", "/donate"], ["Volunteer", "/get-involved"], ["Sponsor", "/get-involved"], ["Contact", "/contact"]].map(([label, path]) => (
                  <li key={label}>
                    <Link to={path} className={linkClass}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact: two columns wide so the email address fits on one line */}
            <div className="col-span-2">
              <h4 className={headingClass}>Contact</h4>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-start gap-2.5"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> <a href={`mailto:${info.email.trim()}`} className="break-words min-w-0 hover:text-white transition-colors">{emailWithBreak(info.email)}</a></li>
                <li className="flex items-start gap-2.5"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> <a href={`tel:${info.phone.replace(/[\s()-]/g, "")}`} className="hover:text-white transition-colors">{info.phone}</a></li>
                <li className="flex items-start gap-2.5"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> {info.address}</li>
                {(info.extraLinks || []).filter((l) => l.label.trim() && toHref(l.url)).map((l, i) => {
                  const Icon = getContactIcon(l.icon);
                  return (
                    <li key={i} className="flex items-start gap-2.5"><Icon className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> <a href={toHref(l.url)} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{l.label}</a></li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter band */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-8 grid gap-6 md:grid-cols-2 md:items-center">
          <div className="text-center md:text-left">
            <h4 className="font-heading font-bold text-lg text-white">Newsletter</h4>
            <p className="text-white/60 text-sm mt-1">Stay updated on our programs and impact.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>&copy; <span
            className="cursor-default select-none"
            onClick={() => {
              const now = Date.now();
              const key = '__at';
              const prev = JSON.parse(sessionStorage.getItem(key) || '[]') as number[];
              const taps = [...prev, now].filter(t => now - t < 3000);
              sessionStorage.setItem(key, JSON.stringify(taps));
              if (taps.length >= 5) {
                sessionStorage.removeItem(key);
                window.location.hash = '/admin-login';
              }
            }}
          >2026</span> ReFAN. All rights reserved.</p>
          <div className="flex gap-6">
            <a href={info.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors uppercase font-bold tracking-widest">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
