import { ReactNode, useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ChevronUp } from "lucide-react";
import { store, SiteSettings } from "@/lib/store";
import { auth } from "@/integrations/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import MaintenancePage from "@/components/MaintenancePage";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-5 z-50 bg-secondary text-white p-3 rounded-full shadow-lg hover:bg-secondary/90 transition-all"
      aria-label="Back to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
};

const Layout = ({ children }: { children: ReactNode }) => {
  const [maintenance, setMaintenance] = useState<SiteSettings | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    store.getSiteSettings().then((data) => {
      setMaintenance(data);
      setChecked(true);
    });
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });
    return () => unsub();
  }, []);

  if (!checked) return null;

  if (maintenance?.maintenanceMode && !isAdmin) {
    return <MaintenancePage message={maintenance.maintenanceMessage} />;
  }

  return (
    <div className="flex flex-col min-h-screen" onContextMenu={(e) => e.preventDefault()}>
      {maintenance?.maintenanceMode && isAdmin && (
        <div className="bg-yellow-500 text-black text-center py-2 text-sm font-bold">
          Site is in maintenance mode — only you (admin) can see it
        </div>
      )}
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Layout;
