import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

const Footer = () => {
  return (
    <footer className="bg-[#0f1d3d] text-white -mt-16">
      <div className="container pt-4 pb-16">
        {/* Top: Description */}
        <div className="text-center mb-10">
          <p className="text-white/60 text-sm leading-relaxed max-w-lg mx-auto">
            Resilient Foundation Assistance Network (ReFAN) is a refugee-led NGO based in Dzaleka, Malawi, dedicated to the continuity of care for the most vulnerable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">
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

          {/* Centered logo emblem */}
          <div className="flex items-center justify-center overflow-visible">
            <img src="/ReFAN Hands Logo_ReFAN.png" alt="ReFAN emblem" className="w-[44rem] h-auto object-contain scale-150" />
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> refannetwork2022@gmail.com</li>
              <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> +265 997 561 852</li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> Dzaleka Refugee Camp, Dowa District, Malawi</li>
              <li className="flex items-start gap-2"><Linkedin className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> <a href="https://www.linkedin.com/in/holistic-continuity-of-care-571586315" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary">Newsletter</h4>
            <p className="text-white/60 text-sm mb-3">Stay updated on our programs and impact.</p>
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>&copy; 2026 ReFAN. All rights reserved.</p>
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
