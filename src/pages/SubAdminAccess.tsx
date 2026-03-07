import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { store, type SubAdmin, type TabPermission, type Story, type BlogPost, type GalleryItem, type Announcement, type Member, type NewsletterSubscriber, type ContactMessage } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, FileText, Image, Megaphone, Users, Heart,
  Plus, Trash2, LogOut, Mail, MessageSquare, UserPlus, Shield,
  Pencil, Save, Loader2, Settings, Globe, Power, Lock, ImagePlus
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import RichTextEditor from "@/components/RichTextEditor";

type Tab = 'dashboard' | 'announcements' | 'stories' | 'blogs' | 'gallery' | 'volunteers' | 'sponsors' | 'donations' | 'subscribers' | 'messages' | 'members' | 'footer' | 'hero' | 'site' | 'pages';

const TAB_META: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'members', label: 'Members', icon: UserPlus },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'stories', label: 'Stories', icon: FileText },
  { id: 'blogs', label: 'Blog Posts', icon: FileText },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'volunteers', label: 'Volunteers', icon: Users },
  { id: 'sponsors', label: 'Sponsors', icon: Heart },
  { id: 'donations', label: 'Donations', icon: Heart },
  { id: 'subscribers', label: 'Subscribers', icon: Mail },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'footer', label: 'Footer Settings', icon: Settings },
  { id: 'hero', label: 'Hero Settings', icon: ImagePlus },
  { id: 'pages', label: 'Page Content', icon: Globe },
  { id: 'site', label: 'Site Settings', icon: Power },
];

const SubAdminAccess = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();

  // Auth states
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<SubAdmin | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  // Admin data states
  const [tab, setTab] = useState<Tab>('dashboard');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [saving, setSaving] = useState(false);

  // Load sub-admin profile
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    store.getSubAdminByToken(token).then((sa) => {
      if (!sa || !sa.active) {
        setProfile(null);
      } else {
        setProfile(sa);
      }
      setLoading(false);
    });
  }, [token]);

  // Load data after auth
  useEffect(() => {
    if (!authenticated || !profile) return;
    const loadData = async () => {
      const [a, s, b, g, v, d, sub, msg, mem] = await Promise.all([
        store.getAnnouncements(), store.getStories(), store.getBlogs(), store.getGallery(),
        store.getVolunteers(), store.getDonations(), store.getSubscribers(), store.getMessages(), store.getMembers(),
      ]);
      setAnnouncements(a); setStories(s); setBlogs(b); setGallery(g);
      setVolunteers(v); setDonations(d); setSubscribers(sub); setMessages(msg); setMembers(mem);
      // Set first visible tab
      const firstTab = visibleTabs[0];
      if (firstTab) setTab(firstTab.id);
    };
    loadData();
  }, [authenticated]);

  const getPerm = (t: string): TabPermission => profile?.permissions[t] || 'hidden';
  const canEditTab = (t: string) => getPerm(t) === 'edit';
  const canViewTab = (t: string) => { const p = getPerm(t); return p === 'edit' || p === 'view'; };
  const hideExisting = (t: string) => profile?.hideExistingData[t] === true;

  const visibleTabs = TAB_META.filter(t => canViewTab(t.id));

  const handleLogin = () => {
    setError('');
    if (passwordInput !== profile?.password) { setError("Incorrect password"); return; }
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPasswordInput('');
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none text-sm";

  // ── Loading / Invalid ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card rounded-2xl p-8 shadow-elevated max-w-md w-full text-center">
        <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="font-heading text-xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground text-sm mb-6">This link is invalid, expired, or has been deactivated by the admin.</p>
        <Button asChild variant="outline"><Link to="/">Go to Website</Link></Button>
      </div>
    </div>
  );

  // ── Password Login ──
  if (!authenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="bg-card rounded-2xl p-8 shadow-elevated max-w-md w-full">
        <Lock className="h-10 w-10 text-primary mx-auto mb-4" />
        <h1 className="font-heading text-xl font-bold text-center mb-1">Welcome, {profile.name}</h1>
        <p className="text-muted-foreground text-sm text-center mb-6">Enter your password to sign in</p>
        <div className="space-y-3">
          <input type="password" placeholder="Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className={inputClass + " text-center text-lg tracking-wider"} autoFocus />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <Button onClick={handleLogin} className="w-full" size="lg">Sign In</Button>
        </div>
      </div>
    </div>
  );

  // ── Dashboard ──
  const isViewOnly = !canEditTab(tab);
  const isHideExisting = hideExisting(tab);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-56 bg-sidebar border-r border-sidebar-border flex-col shrink-0">
        <div className="p-5 border-b border-sidebar-border">
          <h2 className="font-heading font-bold text-sm text-sidebar-foreground">{profile.name}</h2>
          <p className="text-xs text-sidebar-foreground/60">Sub-Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {visibleTabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === item.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-secondary-foreground/70 hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {getPerm(item.id) === 'view' && <span className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">View</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-2">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 flex overflow-x-auto px-2 py-1">
        {visibleTabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex flex-col items-center gap-0.5 py-2 px-2 rounded-md text-[10px] min-w-[52px] shrink-0 ${
              tab === item.id ? 'text-primary bg-primary/10' : 'text-secondary-foreground/60'
            }`}
          >
            <item.icon className="h-3.5 w-3.5" />
            <span className="leading-tight">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-10 pb-24 md:pb-10 overflow-auto">
        {isViewOnly && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2 mb-4 text-sm font-medium">
            View only — you cannot make changes in this section.
          </div>
        )}

        {tab === 'dashboard' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Dashboard Overview</h1>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Members', count: members.length, icon: UserPlus, t: 'members' },
                { label: 'Stories', count: stories.length, icon: Megaphone, t: 'stories' },
                { label: 'Blog Posts', count: blogs.length, icon: FileText, t: 'blogs' },
                { label: 'Gallery', count: gallery.length, icon: Image, t: 'gallery' },
                { label: 'Announcements', count: announcements.length, icon: Megaphone, t: 'announcements' },
                { label: 'Messages', count: messages.length, icon: MessageSquare, t: 'messages' },
              ].filter(s => canViewTab(s.t)).map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-6 shadow-soft cursor-pointer hover:shadow-elevated transition-all" onClick={() => setTab(s.t as Tab)}>
                  <s.icon className="h-5 w-5 text-primary mb-2" />
                  <p className="font-heading text-3xl font-bold">{s.count}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-4">Members</h1>
            <p className="text-sm text-muted-foreground mb-6">Total: {members.length}</p>
            {isHideExisting ? (
              <p className="text-muted-foreground text-center py-8">Existing member data is hidden for your account.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-left">
                    <th className="py-2 px-3 font-semibold">#</th>
                    <th className="py-2 px-3 font-semibold">Name</th>
                    <th className="py-2 px-3 font-semibold">Email</th>
                    <th className="py-2 px-3 font-semibold">Phone</th>
                  </tr></thead>
                  <tbody>
                    {members.map((m, i) => (
                      <tr key={m.id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="py-2 px-3">{i + 1}</td>
                        <td className="py-2 px-3 font-medium">{m.surname} {m.firstName}</td>
                        <td className="py-2 px-3">{m.email}</td>
                        <td className="py-2 px-3">{m.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {(tab === 'announcements' || tab === 'stories' || tab === 'blogs' || tab === 'gallery' ||
          tab === 'volunteers' || tab === 'sponsors' || tab === 'donations' || tab === 'subscribers' || tab === 'messages') && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">
              {TAB_META.find(t => t.id === tab)?.label}
            </h1>
            {isHideExisting ? (
              <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>
            ) : (
              <div className="space-y-3">
                {tab === 'announcements' && announcements.map(a => (
                  <div key={a.id} className="bg-card rounded-lg p-4 shadow-soft">
                    <h4 className="font-medium">{a.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{a.content.slice(0, 100)}...</p>
                  </div>
                ))}
                {tab === 'stories' && stories.map(s => (
                  <div key={s.id} className="bg-card rounded-lg p-4 shadow-soft">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${s.category === 'story' ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary'}`}>{s.category}</span>
                    <h4 className="font-medium">{s.title}</h4>
                    <p className="text-xs text-muted-foreground">{s.excerpt}</p>
                  </div>
                ))}
                {tab === 'blogs' && blogs.map(b => (
                  <div key={b.id} className="bg-card rounded-lg p-4 shadow-soft">
                    <h4 className="font-medium">{b.title}</h4>
                    <p className="text-xs text-muted-foreground">{b.excerpt}</p>
                  </div>
                ))}
                {tab === 'gallery' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {gallery.map(g => (
                      <div key={g.id} className="rounded-lg overflow-hidden">
                        <img src={g.url} alt={g.title} className="w-full aspect-square object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'volunteers' && volunteers.filter(v => v.type === 'volunteer').map(v => (
                  <div key={v.id} className="bg-card rounded-lg p-4 shadow-soft">
                    <h4 className="font-medium">{v.name}</h4>
                    <p className="text-xs text-muted-foreground">{v.email}</p>
                  </div>
                ))}
                {tab === 'sponsors' && volunteers.filter(v => v.type === 'sponsor').map(v => (
                  <div key={v.id} className="bg-card rounded-lg p-4 shadow-soft">
                    <h4 className="font-medium">{v.name}</h4>
                    <p className="text-xs text-muted-foreground">{v.email}</p>
                  </div>
                ))}
                {tab === 'donations' && donations.map(d => (
                  <div key={d.id} className="bg-card rounded-lg p-4 shadow-soft flex justify-between">
                    <span className="font-medium">{d.name || 'Anonymous'}</span>
                    <span className="font-bold">{d.amount}</span>
                  </div>
                ))}
                {tab === 'subscribers' && subscribers.map(s => (
                  <div key={s.id} className="bg-card rounded-lg p-3 shadow-soft text-sm">{s.email}</div>
                ))}
                {tab === 'messages' && messages.map(m => (
                  <div key={m.id} className="bg-card rounded-lg p-4 shadow-soft">
                    <div className="flex justify-between text-sm"><span className="font-medium">{m.name}</span><span className="text-muted-foreground">{m.email}</span></div>
                    <p className="text-xs font-medium mt-1">{m.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">{m.message.slice(0, 150)}</p>
                  </div>
                ))}
                {(tab === 'announcements' && announcements.length === 0) ||
                 (tab === 'stories' && stories.length === 0) ||
                 (tab === 'blogs' && blogs.length === 0) ||
                 (tab === 'gallery' && gallery.length === 0) ? (
                  <p className="text-muted-foreground text-center py-8">No data yet.</p>
                ) : null}
              </div>
            )}
          </div>
        )}

        {(tab === 'footer' || tab === 'hero' || tab === 'pages' || tab === 'site') && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">{TAB_META.find(t => t.id === tab)?.label}</h1>
            <p className="text-muted-foreground text-center py-8">
              {isViewOnly ? 'View only — settings are managed by the main admin.' : 'Settings management available from the main admin panel.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SubAdminAccess;
