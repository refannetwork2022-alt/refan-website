import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart } from "lucide-react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Programs", path: "/programs" },
  { label: "Stories", path: "/stories" },
  { label: "Gallery", path: "/gallery" },
  { label: "Blog", path: "/blog" },
  { label: "Get Involved", path: "/get-involved" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight">
          <span className="text-gradient-primary">Re</span>
          <span className="text-secondary">FAN</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground ${
                location.pathname === link.path ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button asChild variant="default" size="sm">
            <Link to="/donate">
              <Heart className="h-4 w-4" />
              Donate
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden p-2 rounded-md hover:bg-accent"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.path ? "bg-accent text-accent-foreground font-semibold" : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild variant="default" className="mt-2">
              <Link to="/donate" onClick={() => setOpen(false)}>
                <Heart className="h-4 w-4" />
                Donate Now
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
