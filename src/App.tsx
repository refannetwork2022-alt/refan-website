import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import AdminRoute from "@/components/AdminRoute";
import { SHARED_KINDS, SHARED_ROUTES, getSharedId } from "@/lib/share";
import Index from "./pages/Index";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Stories from "./pages/Stories";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import Donate from "./pages/Donate";
import GetInvolved from "./pages/GetInvolved";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import SubAdminAccess from "./pages/SubAdminAccess";
import NotFound from "./pages/NotFound";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Shared links arrive as /?story=ID, /?program=N ... (apps like Facebook drop the "#/..." part),
// so send them to the page that shows that item, which then opens it.
const SharedLinkRedirect = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  // Only when the site is first opened from a shared link, so normal browsing afterwards isn't redirected.
  useEffect(() => {
    // Member registration link: /?page=register
    const params = new URLSearchParams(window.location.search);
    if (params.get("page") === "register") {
      params.delete("page");
      const query = params.toString();
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
      if (pathname !== "/register") navigate("/register", { replace: true });
      return;
    }
    const kind = SHARED_KINDS.find((k) => getSharedId(k));
    if (kind && pathname !== SHARED_ROUTES[kind]) navigate(SHARED_ROUTES[kind], { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <ScrollToTop />
          <SharedLinkRedirect />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/get-involved" element={<GetInvolved />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin-access/:token" element={<SubAdminAccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
