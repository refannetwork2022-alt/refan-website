import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl font-extrabold mb-4">
              <span className="text-primary">Re</span>FAN
            </h3>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed">
              Resilient Foundation Assistance Network — building stronger communities through sustainable development, education, and healthcare.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[["About Us", "/about"], ["Programs", "/programs"], ["Blog", "/blog"], ["Gallery", "/gallery"], ["Contact", "/contact"]].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="text-secondary-foreground/70 hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary">Get Involved</h4>
            <ul className="space-y-2 text-sm">
              {[["Donate", "/donate"], ["Volunteer", "/get-involved"], ["Sponsor", "/get-involved"], ["Stories", "/stories"]].map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="text-secondary-foreground/70 hover:text-primary transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-primary">Contact</h4>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> info@refan.org</li>
              <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> +234 800 000 0000</li>
              <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" /> Lagos, Nigeria</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-secondary-foreground/10">
        <div className="container py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary-foreground/50">
          <p>© 2026 ReFAN. All rights reserved.</p>
          <p className="flex items-center gap-1">Built with <Heart className="h-3 w-3 text-primary" /> for communities</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
