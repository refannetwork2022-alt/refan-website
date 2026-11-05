import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import AdminRoute from "@/components/AdminRoute";
import { SHARED_KINDS, SHARED_ROUTES, getSharedId } from "@/lib/share";
import Index from "./pages/Index";
import About from "./pages/About";
import Overview from "./pages/Overview";
import Programs from "./pages/Programs";
import Stories from "./pages/Stories";
import Gallery from "./pages/Gallery";
import Blog from "./pages/Blog";
import Donate from "./pages/Donate";
import GetInvolved from "./pages/GetInvolved";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Big pages most visitors never open: downloaded only when someone goes there, so the site opens faster on phones.
// A visitor still on an older version after a new deploy would ask for files that no longer exist; then the page
// reloads once (getting the new version) instead of staying blank.
const lazyPage = <T extends React.ComponentType>(load: () => Promise<{ default: T }>) =>
  lazy(() =>
    load()
      .then((page) => { sessionStorage.removeItem("refan_reloaded_for_update"); return page; })
      .catch((error) => {
        if (!sessionStorage.getItem("refan_reloaded_for_update")) {
          sessionStorage.setItem("refan_reloaded_for_update", "1");
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }
        throw error;
      }),
  );
const Admin = lazyPage(() => import("./pages/Admin"));
const AdminLogin = lazyPage(() => import("./pages/AdminLogin"));
const Register = lazyPage(() => import("./pages/Register"));
const SubAdminAccess = lazyPage(() => import("./pages/SubAdminAccess"));

const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-9 w-9 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" aria-label="Loading" />
  </div>
);

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
          <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/about/overview" element={<Overview />} />
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
          </Suspense>
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
