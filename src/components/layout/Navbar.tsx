import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, UserPlus } from "lucide-react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Programs", path: "/programs" },
  { label: "Stories", path: "/stories" },
  { label: "Gallery", path: "/gallery" },
  { label: "Blog", path: "/blog" },
  { label: "Get Involved", path: "/get-involved" },
  { label: "Contact", path: "/contact" },
  { label: "About", path: "/about" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ReFAN" className="h-12 w-12 rounded-md" />
          <span className="font-heading text-xl font-extrabold tracking-tight">
            <span className="text-primary">ReFA</span><span className="text-foreground">N</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-semibold transition-colors hover:text-primary ${
                location.pathname === link.path ? "text-primary" : "text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button asChild size="sm" variant="outline" className="btn-hover font-bold rounded-lg px-5">
            <Link to="/register"><UserPlus className="h-4 w-4" /> Register</Link>
          </Button>
          <Button asChild size="sm" className="btn-hover bg-primary hover:bg-primary/90 text-white font-bold rounded-lg px-6 shadow-sm">
            <Link to="/donate">Donate</Link>
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
            <Button asChild variant="outline" className="mt-2">
              <Link to="/register" onClick={() => setOpen(false)}>
                <UserPlus className="h-4 w-4" />
                Register
              </Link>
            </Button>
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
