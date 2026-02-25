import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

const Footer = () => {
  return (
    <footer className="bg-[#0f1d3d] text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="ReFAN" className="h-8 w-8 rounded-md" />
              <h3 className="font-heading text-2xl font-extrabold">
                <span className="text-primary">ReFA</span><span className="text-white">N</span>
              </h3>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Resilient Foundation Assistance Network (ReFAN) is a refugee-led NGO based in Dzaleka, Malawi, dedicated to the continuity of care for the most vulnerable.
            </p>
          </div>

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

          {/* Contact + Newsletter */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> refannetwork2022@gmail.com</li>
              <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> +265 997 561 852</li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> Dzaleka Refugee Camp, Dowa District, Malawi</li>
              <li className="flex items-start gap-2"><Linkedin className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> <a href="https://www.linkedin.com/in/holistic-continuity-of-care-571586315" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a></li>
            </ul>
            <div className="mt-6">
              <h5 className="font-heading font-bold text-sm uppercase tracking-wider mb-3 text-primary">Newsletter</h5>
              <p className="text-white/60 text-sm mb-3">Stay updated on our programs and impact.</p>
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>
      {/* Centered logo emblem */}
      <div className="flex justify-center py-10">
        <div className="w-48 h-48 rounded-full bg-black flex items-center justify-center p-4 border-2 border-white/10">
          <img src="/logo.png" alt="ReFAN emblem" className="w-36 h-36 object-contain" />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2026 ReFAN. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/admin-login" className="hover:text-white/60 transition-colors">Admin</Link>
            <a href="https://www.linkedin.com/in/holistic-continuity-of-care-571586315" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors uppercase font-bold tracking-widest">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
