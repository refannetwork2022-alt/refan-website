import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { store, type SubAdmin, type TabPermission, type Story, type BlogPost, type GalleryItem, type Announcement, type Member, type NewsletterSubscriber, type ContactMessage, type AdminChatMessage } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, FileText, Image, Megaphone, Users, Heart,
  Plus, Trash2, LogOut, Mail, MessageSquare, UserPlus, Shield,
  Pencil, Save, Loader2, Settings, Globe, Power, Lock, ImagePlus,
  ArrowLeft, Menu, X, Camera, Upload, Send
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import RichTextEditor from "@/components/RichTextEditor";

type Tab = 'dashboard' | 'announcements' | 'stories' | 'blogs' | 'gallery' | 'volunteers' | 'sponsors' | 'donations' | 'subscribers' | 'messages' | 'members' | 'footer' | 'hero' | 'site' | 'pages' | 'chat';

const countries = [
  "Afghanistan", "Albania", "Algeria", "Angola", "Argentina", "Australia", "Austria", "Bangladesh",
  "Belgium", "Benin", "Bolivia", "Botswana", "Brazil", "Burkina Faso", "Burundi", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Brazzaville)", "Congo (DRC)", "Costa Rica", "Cote d'Ivoire", "Cuba", "Denmark",
  "Djibouti", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
  "Eritrea", "Ethiopia", "Finland", "France", "Gabon", "Gambia", "Germany", "Ghana", "Greece",
  "Guatemala", "Guinea", "Guinea-Bissau", "Haiti", "Honduras", "India", "Indonesia", "Iran",
  "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kenya", "Kuwait",
  "Lebanon", "Lesotho", "Liberia", "Libya", "Madagascar", "Malawi", "Malaysia", "Mali",
  "Mauritania", "Mauritius", "Mexico", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nepal",
  "Netherlands", "New Zealand", "Niger", "Nigeria", "Norway", "Pakistan", "Palestine", "Panama",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda",
  "Saudi Arabia", "Senegal", "Sierra Leone", "Singapore", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Eswatini", "Sweden", "Switzerland", "Syria",
  "Tanzania", "Thailand", "Togo", "Tunisia", "Turkey", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const phoneCodes = [
  { code: "+265", country: "MW" }, { code: "+1", country: "US" }, { code: "+44", country: "GB" },
  { code: "+33", country: "FR" }, { code: "+49", country: "DE" }, { code: "+254", country: "KE" },
  { code: "+255", country: "TZ" }, { code: "+256", country: "UG" }, { code: "+250", country: "RW" },
  { code: "+257", country: "BI" }, { code: "+243", country: "CD" }, { code: "+27", country: "ZA" },
  { code: "+91", country: "IN" }, { code: "+86", country: "CN" }, { code: "+61", country: "AU" },
  { code: "+234", country: "NG" }, { code: "+251", country: "ET" }, { code: "+252", country: "SO" },
  { code: "+211", country: "SS" }, { code: "+249", country: "SD" }, { code: "+212", country: "MA" },
  { code: "+213", country: "DZ" }, { code: "+216", country: "TN" }, { code: "+218", country: "LY" },
  { code: "+20", country: "EG" }, { code: "+221", country: "SN" }, { code: "+233", country: "GH" },
  { code: "+237", country: "CM" }, { code: "+242", country: "CG" }, { code: "+260", country: "ZM" },
];

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
  { id: 'chat', label: 'Admin Chat', icon: Send },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [viewPhoto, setViewPhoto] = useState<{ url: string; name: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<AdminChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Announcement form
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', subtitle: '', content: '', image: '', video: '', donationCount: 0, date: new Date().toISOString().split('T')[0], showDate: true });

  // Story form
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [storyForm, setStoryForm] = useState({ title: '', subtitle: '', excerpt: '', content: '', image: '', video: '', category: 'story' as 'story' | 'announcement', donationCount: 0, date: new Date().toISOString().split('T')[0], showDate: true });

  // Blog form
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', image: '', author: 'ReFAN Team', tags: '' });
  const [contentBlocks, setContentBlocks] = useState<Array<{ type: 'text' | 'image' | 'video'; value?: string; url?: string; caption?: string }>>([{ type: 'text', value: '' }]);

  // Gallery form
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ title: '', url: '', type: 'photo' as 'photo' | 'video' });

  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberSaving, setMemberSaving] = useState(false);
  const emptyMemberForm = {
    surname: '', firstName: '', otherName: '', email: '', countryOfOrigin: '', countryOfResidence: '',
    unhcrId: '', phone: '', phoneCode: '+265', gender: '', maritalStatus: '',
    dobYear: '', dobMonth: '', dobDay: '', familySize: '', photo: '', document: '',
    paymentCurrency: 'MWK', paymentAmount: '', branchName: 'Dzaleka', username: '', expiryDate: '',
  };
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const photoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const currentYear = new Date().getFullYear();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleFileToBase64 = (file: File, field: 'photo' | 'document') => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large. Maximum 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setMemberForm(prev => ({ ...prev, [field]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const compressImage = (base64: string, maxWidth = 400): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64) { resolve(''); return; }
      const img = new window.Image();
      img.onload = () => {
        const canvas = window.document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = () => resolve('');
      img.src = base64;
    });
  };

  const addMember = async () => {
    if (!memberForm.surname.trim() || !memberForm.firstName.trim()) {
      toast({ title: "Surname and First Name are required", variant: "destructive" });
      return;
    }
    if (memberSaving) return;
    setMemberSaving(true);
    try {
      const dob = memberForm.dobYear ? `${memberForm.dobYear}-${(memberForm.dobMonth || '1').padStart(2, '0')}-${(memberForm.dobDay || '1').padStart(2, '0')}` : '';
      const compressedPhoto = await compressImage(memberForm.photo);
      const compressedDoc = await compressImage(memberForm.document, 600);
      const result = await store.addMember({
        surname: memberForm.surname.trim(), firstName: memberForm.firstName.trim(),
        otherName: memberForm.otherName.trim(), email: memberForm.email.trim(), countryOfOrigin: memberForm.countryOfOrigin,
        countryOfResidence: memberForm.countryOfResidence, unhcrId: memberForm.unhcrId.trim(),
        phone: memberForm.phone.trim(), phoneCode: memberForm.phoneCode,
        gender: memberForm.gender, maritalStatus: memberForm.maritalStatus,
        dateOfBirth: dob, familySize: Number(memberForm.familySize) || 0,
        photo: compressedPhoto, document: compressedDoc,
        paymentCurrency: memberForm.paymentCurrency, paymentAmount: Number(memberForm.paymentAmount) || 0,
        registrationDate: new Date().toISOString(),
        expiryDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toISOString().split('T')[0]; })(),
        branchName: memberForm.branchName.trim(), username: memberForm.username.trim(),
      });
      if (result) {
        setMembers(await store.getMembers());
        setMemberForm(emptyMemberForm);
        setShowMemberForm(false);
        toast({ title: `Member ${result.regNumber} registered successfully.` });
      }
    } catch (err) {
      toast({ title: "Error saving member.", variant: "destructive" });
    }
    setMemberSaving(false);
  };

  // ── Announcement CRUD ──
  const saveAnnouncement = async () => {
    if (!announcementForm.title.trim()) return;
    setSaving(true);
    if (editingAnnouncement) {
      await store.updateAnnouncement(editingAnnouncement, announcementForm);
      setEditingAnnouncement(null);
      toast({ title: "Announcement updated!" });
    } else {
      await store.addAnnouncement({ ...announcementForm, donationCount: announcementForm.donationCount || 0 });
      toast({ title: "Announcement added!" });
    }
    setAnnouncements(await store.getAnnouncements());
    setAnnouncementForm({ title: '', subtitle: '', content: '', image: '', video: '', donationCount: 0, date: new Date().toISOString().split('T')[0], showDate: true });
    setShowAnnouncementForm(false);
    setSaving(false);
  };

  const editAnnouncement = (a: Announcement) => {
    setAnnouncementForm({ title: a.title, subtitle: a.subtitle || '', content: a.content, image: a.image || '', video: a.video || '', donationCount: a.donationCount || 0, date: a.date || new Date().toISOString().split('T')[0], showDate: a.showDate !== false });
    setEditingAnnouncement(a.id);
    setShowAnnouncementForm(true);
  };

  // ── Story CRUD ──
  const saveStory = async () => {
    if (!storyForm.title.trim()) return;
    setSaving(true);
    if (editingStory) {
      await store.updateStory(editingStory, storyForm);
      setEditingStory(null);
      toast({ title: "Story updated!" });
    } else {
      await store.addStory({ ...storyForm, donationCount: storyForm.donationCount || 0 });
      toast({ title: "Story added!" });
    }
    setStories(await store.getStories());
    setStoryForm({ title: '', subtitle: '', excerpt: '', content: '', image: '', video: '', category: 'story', donationCount: 0, date: new Date().toISOString().split('T')[0], showDate: true });
    setShowStoryForm(false);
    setSaving(false);
  };

  const editStoryItem = (s: Story) => {
    setStoryForm({ title: s.title, subtitle: s.subtitle || '', excerpt: s.excerpt, content: s.content, image: s.image || '', video: s.video || '', category: s.category, donationCount: s.donationCount || 0, date: s.date || new Date().toISOString().split('T')[0], showDate: s.showDate !== false });
    setEditingStory(s.id);
    setShowStoryForm(true);
  };

  // ── Blog CRUD ──
  const saveBlog = async () => {
    if (!blogForm.title.trim()) return;
    setSaving(true);
    const content = contentBlocks.map(b => {
      if (b.type === 'text') return `<div>${b.value || ''}</div>`;
      if (b.type === 'image') return `<figure><img src="${b.url}" />${b.caption ? `<figcaption>${b.caption}</figcaption>` : ''}</figure>`;
      if (b.type === 'video') return `<div class="video">${b.url}${b.caption ? `<p>${b.caption}</p>` : ''}</div>`;
      return '';
    }).join('');
    if (editingBlog) {
      await store.updateBlog(editingBlog, { ...blogForm, content, tags: blogForm.tags });
      setEditingBlog(null);
      toast({ title: "Blog updated!" });
    } else {
      await store.addBlog({ ...blogForm, content, tags: blogForm.tags });
      toast({ title: "Blog added!" });
    }
    setBlogs(await store.getBlogs());
    setBlogForm({ title: '', excerpt: '', image: '', author: 'ReFAN Team', tags: '' });
    setContentBlocks([{ type: 'text', value: '' }]);
    setShowBlogForm(false);
    setSaving(false);
  };

  const editBlogItem = (b: BlogPost) => {
    setBlogForm({ title: b.title, excerpt: b.excerpt, image: b.image || '', author: b.author || 'ReFAN Team', tags: b.tags || '' });
    setContentBlocks([{ type: 'text', value: b.content || '' }]);
    setEditingBlog(b.id);
    setShowBlogForm(true);
  };

  // ── Gallery CRUD ──
  const saveGalleryItem = async () => {
    if (!galleryForm.title.trim() || !galleryForm.url.trim()) return;
    setSaving(true);
    await store.addGalleryItem({ ...galleryForm });
    setGallery(await store.getGallery());
    setGalleryForm({ title: '', url: '', type: 'photo' });
    setShowGalleryForm(false);
    toast({ title: "Gallery item added!" });
    setSaving(false);
  };

  // Load sub-admin profile
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    store.getSubAdminByToken(token).then((sa) => {
      if (!sa || sa.active === false) {
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
      store.getAdminMessages().then(setChatMessages);
      // Set first visible tab
      const firstTab = visibleTabs[0];
      if (firstTab) setTab(firstTab.id);
    };
    loadData();
  }, [authenticated]);

  const getPerm = (t: string): TabPermission => profile?.permissions[t] || 'hidden';
  const canEditTab = (t: string) => { const p = getPerm(t); return p === 'edit' || p === 'full'; };
  const canViewTab = (t: string) => { const p = getPerm(t); return p === 'edit' || p === 'view' || p === 'full'; };
  const canDeleteTab = (t: string) => {
    const p = getPerm(t);
    if (p === 'full') return true;
    return (p === 'edit' || p === 'view') && profile?.allowDelete?.[t] === true;
  };
  const hideExisting = (t: string) => profile?.hideExistingData[t] === true;

  const COMPANY_EMAIL = "refannetwork2022@gmail.com";
  const openGmail = (emails: string[], subject: string, body: string) => {
    const params = new URLSearchParams({ view: 'cm', fs: '1', to: emails.join(','), su: subject, body: body });
    window.open(`https://mail.google.com/mail/?authuser=${encodeURIComponent(COMPANY_EMAIL)}&${params.toString()}`, '_blank');
  };

  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectedVols, setSelectedVols] = useState<Set<string>>(new Set());
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());
  const [selectedMsgs, setSelectedMsgs] = useState<Set<string>>(new Set());
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const visibleTabs = TAB_META.filter(t => t.id === 'chat' || canViewTab(t.id));

  // Restore session on load
  useEffect(() => {
    if (profile && token) {
      const saved = sessionStorage.getItem(`sa_auth_${token}`);
      if (saved === 'true') setAuthenticated(true);
    }
  }, [profile, token]);

  const handleLogin = () => {
    setError('');
    if (passwordInput !== profile?.password) { setError("Incorrect password"); return; }
    setAuthenticated(true);
    if (token) sessionStorage.setItem(`sa_auth_${token}`, 'true');
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPasswordInput('');
    if (token) sessionStorage.removeItem(`sa_auth_${token}`);
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
      {/* Mobile overlay */}
      {sidebarOpen && <div className="md:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 md:z-auto inset-y-0 left-0 w-56 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 transform transition-transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-sm text-sidebar-foreground">{profile.name}</h2>
            <p className="text-xs text-sidebar-foreground/60">Sub-Admin</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-sidebar-foreground/60"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {visibleTabs.map((item) => (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false); }}
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
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-2">
            <ArrowLeft className="h-4 w-4" /> Back to Site
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-2">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-muted"><Menu className="h-5 w-5" /></button>
          <span className="font-heading font-bold text-sm">{profile.name}</span>
          <Link to="/" className="text-xs text-primary">Back to Site</Link>
        </div>
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
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div>
                <h1 className="font-heading text-2xl font-bold">Members</h1>
                {!isHideExisting && <p className="text-sm text-muted-foreground">Total: {members.length} member{members.length !== 1 ? 's' : ''}</p>}
              </div>
              {canEditTab('members') && (
                <Button variant="default" size="sm" onClick={() => setShowMemberForm(!showMemberForm)}><Plus className="h-4 w-4" /> Add Member</Button>
              )}
            </div>

            {/* Add Member Form */}
            {showMemberForm && canEditTab('members') && (
              <div className="bg-card rounded-xl p-6 shadow-soft mb-8 space-y-4">
                <h3 className="font-heading font-bold">Register New Member</h3>
                <div className="grid sm:grid-cols-3 gap-3">
                  <input placeholder="Surname *" value={memberForm.surname} onChange={e => setMemberForm({ ...memberForm, surname: e.target.value })} className={inputClass} maxLength={100} />
                  <input placeholder="First Name *" value={memberForm.firstName} onChange={e => setMemberForm({ ...memberForm, firstName: e.target.value })} className={inputClass} maxLength={100} />
                  <input placeholder="Other Name" value={memberForm.otherName} onChange={e => setMemberForm({ ...memberForm, otherName: e.target.value })} className={inputClass} maxLength={100} />
                </div>
                <input type="email" placeholder="Email Address" value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} className={inputClass} maxLength={200} />
                <div className="grid sm:grid-cols-2 gap-3">
                  <select value={memberForm.countryOfOrigin} onChange={e => setMemberForm({ ...memberForm, countryOfOrigin: e.target.value })} className={inputClass}>
                    <option value="">Country of Origin</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={memberForm.countryOfResidence} onChange={e => setMemberForm({ ...memberForm, countryOfResidence: e.target.value })} className={inputClass}>
                    <option value="">Country of Residence</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <input placeholder="UNHCR / National / Any Valid ID" value={memberForm.unhcrId} onChange={e => setMemberForm({ ...memberForm, unhcrId: e.target.value })} className={inputClass} maxLength={50} />
                <div className="flex gap-2">
                  <select value={memberForm.phoneCode} onChange={e => setMemberForm({ ...memberForm, phoneCode: e.target.value })} className="w-28 px-2 py-2.5 rounded-lg border border-input bg-background text-sm">
                    {phoneCodes.map(p => <option key={p.code} value={p.code}>{p.country} ({p.code})</option>)}
                  </select>
                  <input placeholder="Phone number" value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} className={inputClass} maxLength={15} />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <select value={memberForm.gender} onChange={e => setMemberForm({ ...memberForm, gender: e.target.value })} className={inputClass}>
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <select value={memberForm.maritalStatus} onChange={e => setMemberForm({ ...memberForm, maritalStatus: e.target.value })} className={inputClass}>
                    <option value="">Marital Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Divorced">Divorced</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <select value={memberForm.dobYear} onChange={e => setMemberForm({ ...memberForm, dobYear: e.target.value })} className={inputClass}>
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                  <select value={memberForm.dobMonth} onChange={e => setMemberForm({ ...memberForm, dobMonth: e.target.value })} className={inputClass}>
                    <option value="">Month</option>
                    {months.map((m, i) => <option key={m} value={String(i + 1)}>{m}</option>)}
                  </select>
                  <select value={memberForm.dobDay} onChange={e => setMemberForm({ ...memberForm, dobDay: e.target.value })} className={inputClass}>
                    <option value="">Day</option>
                    {days.map(d => <option key={d} value={String(d)}>{d}</option>)}
                  </select>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <input type="number" placeholder="Family Size" value={memberForm.familySize} onChange={e => setMemberForm({ ...memberForm, familySize: e.target.value })} className={inputClass} min={0} />
                  <input placeholder="Username" value={memberForm.username} onChange={e => setMemberForm({ ...memberForm, username: e.target.value })} className={inputClass} maxLength={50} />
                  <input placeholder="Branch Name" value={memberForm.branchName} onChange={e => setMemberForm({ ...memberForm, branchName: e.target.value })} className={inputClass} maxLength={100} />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-6 text-sm">
                  <div><span className="text-blue-600 font-medium">Registration Date:</span> <strong>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                  <div><span className="text-blue-600 font-medium">Expiry Date:</span> <strong>{(() => { const d = new Date(); d.setMonth(d.getMonth() + 3); return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); })()}</strong></div>
                </div>
                <div className="flex gap-4">
                  <div>
                    <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFileToBase64(e.target.files[0], 'photo')} />
                    <Button type="button" variant="outline" size="sm" onClick={() => photoRef.current?.click()}>
                      <Camera className="h-4 w-4" /> {memberForm.photo ? 'Photo uploaded' : 'Upload Photo'}
                    </Button>
                  </div>
                  <div>
                    <input ref={docRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => e.target.files?.[0] && handleFileToBase64(e.target.files[0], 'document')} />
                    <Button type="button" variant="outline" size="sm" onClick={() => docRef.current?.click()}>
                      <Upload className="h-4 w-4" /> {memberForm.document ? 'Doc uploaded' : 'Upload Document'}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={addMember} size="sm" disabled={memberSaving}><Plus className="h-4 w-4" /> {memberSaving ? 'Saving...' : 'Register Member'}</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowMemberForm(false); setMemberForm(emptyMemberForm); }}>Cancel</Button>
                </div>
              </div>
            )}

            {/* Members Table */}
            {isHideExisting ? (
              <p className="text-muted-foreground text-center py-8">Existing member data is hidden for your account.</p>
            ) : members.length === 0 ? <p className="text-muted-foreground">No members registered yet.</p> : (
              <div className="overflow-x-auto bg-card rounded-xl shadow-soft">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="py-3 px-2 w-8">
                        <input type="checkbox" checked={selectedMembers.size === members.length && members.length > 0} onChange={(e) => {
                          setSelectedMembers(e.target.checked ? new Set(members.map(m => m.id)) : new Set());
                        }} />
                      </th>
                      <th className="text-left py-3 px-3 font-medium text-xs">#</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Family Size</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Country</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Names</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Reg. Number</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Profile</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Email</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Contact</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Username</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Branch</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Reg. Date</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Exp. Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, idx) => (
                      <tr key={m.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-2"><input type="checkbox" checked={selectedMembers.has(m.id)} onChange={(e) => {
                          const next = new Set(selectedMembers);
                          e.target.checked ? next.add(m.id) : next.delete(m.id);
                          setSelectedMembers(next);
                        }} /></td>
                        <td className="py-3 px-3 text-xs text-muted-foreground">{idx + 1}</td>
                        <td className="py-3 px-3">{m.familySize}</td>
                        <td className="py-3 px-3 text-xs">{m.countryOfOrigin}</td>
                        <td className="py-3 px-3 font-medium">{m.firstName} {m.surname}</td>
                        <td className="py-3 px-3 text-primary font-bold">{m.regNumber}</td>
                        <td className="py-3 px-3">
                          {m.photo ? (
                            <img src={m.photo} alt={m.firstName} className="w-10 h-10 rounded-full object-cover border border-border cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => setViewPhoto({ url: m.photo, name: `${m.firstName} ${m.surname}` })} />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-xs">{m.email}</td>
                        <td className="py-3 px-3 text-xs">{m.phoneCode}{m.phone}</td>
                        <td className="py-3 px-3 text-xs">{m.username}</td>
                        <td className="py-3 px-3 text-xs">{m.branchName}</td>
                        <td className="py-3 px-3 text-xs">{m.registrationDate ? new Date(m.registrationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : ''}</td>
                        <td className={`py-3 px-3 text-xs ${m.expiryDate && new Date(m.expiryDate).getTime() < Date.now() ? 'text-red-600 font-bold' : ''}`}>
                          {m.expiryDate ? (() => { const dt = new Date(m.expiryDate); return isNaN(dt.getTime()) ? m.expiryDate : dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(); })() : <span className="text-amber-500">NO EXPIRY</span>}
                          {m.expiryDate && new Date(m.expiryDate).getTime() < Date.now() && !isNaN(new Date(m.expiryDate).getTime()) && <span className="block text-[10px]">EXPIRED</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {selectedMembers.size > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-soft mt-6">
                <h3 className="font-heading font-bold mb-4">Send Email to {selectedMembers.size} member{selectedMembers.size > 1 ? 's' : ''}</h3>
                <input placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" />
                <textarea placeholder="Message body..." value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" />
                <Button size="sm" onClick={() => {
                  const emails = members.filter(m => selectedMembers.has(m.id)).map(m => m.email).filter(Boolean);
                  if (emails.length === 0) { toast({ title: "No emails found", variant: "destructive" }); return; }
                  openGmail(emails, emailSubject, emailBody);
                }}><Mail className="h-4 w-4" /> Send via Email</Button>
              </div>
            )}
          </div>
        )}

        {/* ── Messages ── */}
        {tab === 'messages' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">Messages</h1>
            {!isHideExisting && <p className="text-sm text-muted-foreground mb-4">Total: {messages.length}</p>}
            {isHideExisting ? (
              <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>
            ) : messages.length === 0 ? <p className="text-muted-foreground text-center py-8">No messages yet.</p> : (
              <div className="space-y-3">
                {messages.map(m => (
                  <div key={m.id} className="bg-card rounded-lg p-4 shadow-soft">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <span className="font-medium text-sm">{m.name}</span>
                        <span className="text-muted-foreground text-xs ml-2">{m.email}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{m.date ? new Date(m.date).toLocaleString() : ''}</span>
                    </div>
                    <p className="text-sm font-medium text-primary mt-2">{m.subject}</p>
                    <p className="text-sm text-foreground mt-1 whitespace-pre-line">{m.message}</p>
                    {(canViewTab('messages') || canDeleteTab('messages')) && (
                      <div className="flex gap-2 mt-3">
                        {canViewTab('messages') && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => {
                          openGmail([m.email], `Re: ${m.subject}`, '');
                        }}><Mail className="h-3 w-3" /> Reply</Button>}
                        {canDeleteTab('messages') && <Button size="sm" variant="destructive" className="text-xs h-7" onClick={async () => {
                          if (confirm('Delete this message?')) {
                            await store.deleteMessage(m.id);
                            setMessages(await store.getMessages());
                            toast({ title: "Message deleted" });
                          }
                        }}><Trash2 className="h-3 w-3" /> Delete</Button>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Subscribers ── */}
        {tab === 'subscribers' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">Subscribers</h1>
            {!isHideExisting && <p className="text-sm text-muted-foreground mb-4">Total: {subscribers.length}</p>}
            {isHideExisting ? (
              <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>
            ) : subscribers.length === 0 ? <p className="text-muted-foreground text-center py-8">No subscribers yet.</p> : (
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <input type="checkbox" checked={selectedSubs.size === subscribers.length && subscribers.length > 0} onChange={(e) => {
                    setSelectedSubs(e.target.checked ? new Set(subscribers.map(s => s.id)) : new Set());
                  }} />
                  {selectedSubs.size > 0 && <span className="text-sm text-muted-foreground">{selectedSubs.size} selected</span>}
                </div>
                {subscribers.map(s => (
                  <div key={s.id} className="bg-card rounded-lg p-3 shadow-soft flex justify-between items-center">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input type="checkbox" checked={selectedSubs.has(s.id)} onChange={(e) => {
                        const next = new Set(selectedSubs);
                        e.target.checked ? next.add(s.id) : next.delete(s.id);
                        setSelectedSubs(next);
                      }} />
                      <div>
                        <span className="text-sm font-medium">{s.email}</span>
                        {s.date && <span className="text-xs text-muted-foreground ml-2">{new Date(s.date).toLocaleDateString()}</span>}
                      </div>
                    </label>
                    {canDeleteTab('subscribers') && (
                      <Button size="sm" variant="destructive" className="text-xs h-7" onClick={async () => {
                        if (confirm('Delete this subscriber?')) {
                          await store.deleteSubscriber(s.id);
                          setSubscribers(await store.getSubscribers());
                          const next = new Set(selectedSubs); next.delete(s.id); setSelectedSubs(next);
                          toast({ title: "Subscriber deleted" });
                        }
                      }}><Trash2 className="h-3 w-3" /></Button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {selectedSubs.size > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-soft mt-6">
                <h3 className="font-heading font-bold mb-4">Compose Email to {selectedSubs.size} subscriber{selectedSubs.size > 1 ? 's' : ''}</h3>
                <input placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" />
                <textarea placeholder="Message body..." value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" />
                <Button size="sm" onClick={() => {
                  const emails = subscribers.filter(s => selectedSubs.has(s.id)).map(s => s.email);
                  if (emails.length === 0) { toast({ title: "No emails found", variant: "destructive" }); return; }
                  openGmail(emails, emailSubject, emailBody);
                }}><Mail className="h-4 w-4" /> Send via Email</Button>
              </div>
            )}
          </div>
        )}

        {/* ── Announcements ── */}
        {tab === 'announcements' && (
          <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h1 className="font-heading text-2xl font-bold">Announcements</h1>
              {canEditTab('announcements') && (
                <Button size="sm" onClick={() => { setShowAnnouncementForm(!showAnnouncementForm); setEditingAnnouncement(null); setAnnouncementForm({ title: '', subtitle: '', content: '', image: '', video: '', donationCount: 0, date: new Date().toISOString().split('T')[0], showDate: true }); }}><Plus className="h-4 w-4" /> Add Announcement</Button>
              )}
            </div>
            {showAnnouncementForm && canEditTab('announcements') && (
              <div className="bg-card rounded-xl p-6 shadow-soft mb-8 space-y-4">
                <h3 className="font-heading font-bold">{editingAnnouncement ? 'Edit' : 'New'} Announcement</h3>
                <input placeholder="Title *" value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className={inputClass} maxLength={200} />
                <input placeholder="Subtitle / Name" value={announcementForm.subtitle} onChange={e => setAnnouncementForm({ ...announcementForm, subtitle: e.target.value })} className={inputClass} maxLength={200} />
                <RichTextEditor value={announcementForm.content} onChange={(v: string) => setAnnouncementForm({ ...announcementForm, content: v })} />
                <ImageUpload value={announcementForm.image} onChange={(v: string) => setAnnouncementForm({ ...announcementForm, image: v })} />
                <input placeholder="Video URL (YouTube, Vimeo)" value={announcementForm.video} onChange={e => setAnnouncementForm({ ...announcementForm, video: e.target.value })} className={inputClass} maxLength={500} />
                <div className="flex gap-3 items-center">
                  <input type="date" value={announcementForm.date} onChange={e => setAnnouncementForm({ ...announcementForm, date: e.target.value })} className={inputClass + " w-auto"} />
                  <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={announcementForm.showDate} onChange={e => setAnnouncementForm({ ...announcementForm, showDate: e.target.checked })} /> Show date</label>
                </div>
                <div className="flex gap-3">
                  <Button onClick={saveAnnouncement} size="sm" disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowAnnouncementForm(false); setEditingAnnouncement(null); }}>Cancel</Button>
                </div>
              </div>
            )}
            {isHideExisting ? (
              <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>
            ) : announcements.length === 0 ? <p className="text-muted-foreground text-center py-8">No announcements yet.</p> : (
              <div className="grid sm:grid-cols-2 gap-4">
                {announcements.map(a => (
                  <div key={a.id} className="bg-card rounded-lg shadow-soft overflow-hidden">
                    {a.image && <img src={a.image} alt={a.title} className="w-full max-h-48 object-contain bg-muted" />}
                    <div className="p-4">
                      <h4 className="font-medium">{a.title}</h4>
                      {a.subtitle && <p className="text-xs text-muted-foreground">{a.subtitle}</p>}
                      <div className="text-xs text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: a.content }} />
                      {a.date && a.showDate && <p className="text-xs text-muted-foreground mt-2">{new Date(a.date).toLocaleDateString()}</p>}
                      {(canEditTab('announcements') || canDeleteTab('announcements')) && (
                        <div className="flex gap-2 mt-2">
                          {canEditTab('announcements') && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => editAnnouncement(a)}><Pencil className="h-3 w-3" /> Edit</Button>}
                          {canDeleteTab('announcements') && <Button size="sm" variant="destructive" className="text-xs h-7" onClick={async () => {
                            if (confirm('Delete this announcement?')) {
                              await store.deleteAnnouncement(a.id);
                              setAnnouncements(await store.getAnnouncements());
                              toast({ title: "Announcement deleted" });
                            }
                          }}><Trash2 className="h-3 w-3" /> Delete</Button>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Stories ── */}
        {tab === 'stories' && (
          <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h1 className="font-heading text-2xl font-bold">Stories</h1>
              {canEditTab('stories') && (
                <Button size="sm" onClick={() => { setShowStoryForm(!showStoryForm); setEditingStory(null); setStoryForm({ title: '', subtitle: '', excerpt: '', content: '', image: '', video: '', category: 'story', donationCount: 0, date: new Date().toISOString().split('T')[0], showDate: true }); }}><Plus className="h-4 w-4" /> Add Story</Button>
              )}
            </div>
            {showStoryForm && canEditTab('stories') && (
              <div className="bg-card rounded-xl p-6 shadow-soft mb-8 space-y-4">
                <h3 className="font-heading font-bold">{editingStory ? 'Edit' : 'New'} Story</h3>
                <input placeholder="Title *" value={storyForm.title} onChange={e => setStoryForm({ ...storyForm, title: e.target.value })} className={inputClass} maxLength={200} />
                <input placeholder="Subtitle / Name" value={storyForm.subtitle} onChange={e => setStoryForm({ ...storyForm, subtitle: e.target.value })} className={inputClass} maxLength={200} />
                <input placeholder="Excerpt (short summary)" value={storyForm.excerpt} onChange={e => setStoryForm({ ...storyForm, excerpt: e.target.value })} className={inputClass} maxLength={300} />
                <RichTextEditor value={storyForm.content} onChange={(v: string) => setStoryForm({ ...storyForm, content: v })} />
                <ImageUpload value={storyForm.image} onChange={(v: string) => setStoryForm({ ...storyForm, image: v })} />
                <input placeholder="Video URL (YouTube, Vimeo)" value={storyForm.video} onChange={e => setStoryForm({ ...storyForm, video: e.target.value })} className={inputClass} maxLength={500} />
                <div className="flex gap-3 items-center flex-wrap">
                  <select value={storyForm.category} onChange={e => setStoryForm({ ...storyForm, category: e.target.value as 'story' | 'announcement' })} className={inputClass + " w-auto"}>
                    <option value="story">Story</option>
                    <option value="announcement">Announcement</option>
                  </select>
                  <input type="date" value={storyForm.date} onChange={e => setStoryForm({ ...storyForm, date: e.target.value })} className={inputClass + " w-auto"} />
                  <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={storyForm.showDate} onChange={e => setStoryForm({ ...storyForm, showDate: e.target.checked })} /> Show date</label>
                </div>
                <div className="flex gap-3">
                  <Button onClick={saveStory} size="sm" disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowStoryForm(false); setEditingStory(null); }}>Cancel</Button>
                </div>
              </div>
            )}
            {isHideExisting ? (
              <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>
            ) : stories.length === 0 ? <p className="text-muted-foreground text-center py-8">No stories yet.</p> : (
              <div className="space-y-3">
                {stories.map(s => (
                  <div key={s.id} className="bg-card rounded-lg shadow-soft overflow-hidden">
                    {s.image && <img src={s.image} alt={s.title} className="w-full max-h-48 object-contain bg-muted" />}
                    <div className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${s.category === 'story' ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary'}`}>{s.category}</span>
                      <h4 className="font-medium">{s.title}</h4>
                      {s.subtitle && <p className="text-xs text-muted-foreground">{s.subtitle}</p>}
                      <p className="text-sm text-muted-foreground mt-1">{s.excerpt}</p>
                      <div className="text-xs text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: s.content }} />
                      {s.date && s.showDate && <p className="text-xs text-muted-foreground mt-2">{new Date(s.date).toLocaleDateString()}</p>}
                      {(canEditTab('stories') || canDeleteTab('stories')) && (
                        <div className="flex gap-2 mt-2">
                          {canEditTab('stories') && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => editStoryItem(s)}><Pencil className="h-3 w-3" /> Edit</Button>}
                          {canDeleteTab('stories') && <Button size="sm" variant="destructive" className="text-xs h-7" onClick={async () => {
                            if (confirm('Delete this story?')) {
                              await store.deleteStory(s.id);
                              setStories(await store.getStories());
                              toast({ title: "Story deleted" });
                            }
                          }}><Trash2 className="h-3 w-3" /> Delete</Button>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Blog Posts ── */}
        {tab === 'blogs' && (
          <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h1 className="font-heading text-2xl font-bold">Blog Posts</h1>
              {canEditTab('blogs') && (
                <Button size="sm" onClick={() => { setShowBlogForm(!showBlogForm); setEditingBlog(null); setBlogForm({ title: '', excerpt: '', image: '', author: 'ReFAN Team', tags: '' }); setContentBlocks([{ type: 'text', value: '' }]); }}><Plus className="h-4 w-4" /> Add Blog</Button>
              )}
            </div>
            {showBlogForm && canEditTab('blogs') && (
              <div className="bg-card rounded-xl p-6 shadow-soft mb-8 space-y-4">
                <h3 className="font-heading font-bold">{editingBlog ? 'Edit' : 'New'} Blog Post</h3>
                <input placeholder="Title *" value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} className={inputClass} maxLength={200} />
                <input placeholder="Excerpt (short summary)" value={blogForm.excerpt} onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })} className={inputClass} maxLength={300} />
                <ImageUpload value={blogForm.image} onChange={(v: string) => setBlogForm({ ...blogForm, image: v })} />
                <input placeholder="Tags (comma separated)" value={blogForm.tags} onChange={e => setBlogForm({ ...blogForm, tags: e.target.value })} className={inputClass} maxLength={200} />
                <div className="space-y-3">
                  <p className="text-sm font-medium">Content</p>
                  {contentBlocks.map((block, i) => (
                    <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                      {block.type === 'text' && <RichTextEditor value={block.value || ''} onChange={(v: string) => { const nb = [...contentBlocks]; nb[i] = { ...nb[i], value: v }; setContentBlocks(nb); }} />}
                      {block.type === 'image' && (
                        <>
                          <ImageUpload value={block.url || ''} onChange={(v: string) => { const nb = [...contentBlocks]; nb[i] = { ...nb[i], url: v }; setContentBlocks(nb); }} />
                          <input placeholder="Caption" value={block.caption || ''} onChange={e => { const nb = [...contentBlocks]; nb[i] = { ...nb[i], caption: e.target.value }; setContentBlocks(nb); }} className={inputClass} />
                        </>
                      )}
                      {block.type === 'video' && (
                        <>
                          <input placeholder="Video URL" value={block.url || ''} onChange={e => { const nb = [...contentBlocks]; nb[i] = { ...nb[i], url: e.target.value }; setContentBlocks(nb); }} className={inputClass} />
                          <input placeholder="Caption" value={block.caption || ''} onChange={e => { const nb = [...contentBlocks]; nb[i] = { ...nb[i], caption: e.target.value }; setContentBlocks(nb); }} className={inputClass} />
                        </>
                      )}
                      <Button size="sm" variant="destructive" className="text-xs h-6" onClick={() => setContentBlocks(contentBlocks.filter((_, j) => j !== i))}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setContentBlocks([...contentBlocks, { type: 'text', value: '' }])}>+ Text</Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setContentBlocks([...contentBlocks, { type: 'image', url: '' }])}>+ Image</Button>
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setContentBlocks([...contentBlocks, { type: 'video', url: '' }])}>+ Video</Button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={saveBlog} size="sm" disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowBlogForm(false); setEditingBlog(null); }}>Cancel</Button>
                </div>
              </div>
            )}
            {isHideExisting ? (
              <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>
            ) : blogs.length === 0 ? <p className="text-muted-foreground text-center py-8">No blog posts yet.</p> : (
              <div className="space-y-3">
                {blogs.map(b => (
                  <div key={b.id} className="bg-card rounded-lg shadow-soft overflow-hidden">
                    {b.image && <img src={b.image} alt={b.title} className="w-full max-h-48 object-contain bg-muted" />}
                    <div className="p-4">
                      <h4 className="font-medium">{b.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{b.excerpt}</p>
                      {b.tags && <p className="text-xs text-primary mt-1">{b.tags}</p>}
                      {b.date && <p className="text-xs text-muted-foreground mt-1">{new Date(b.date).toLocaleDateString()}</p>}
                      {(canEditTab('blogs') || canDeleteTab('blogs')) && (
                        <div className="flex gap-2 mt-2">
                          {canEditTab('blogs') && <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => editBlogItem(b)}><Pencil className="h-3 w-3" /> Edit</Button>}
                          {canDeleteTab('blogs') && <Button size="sm" variant="destructive" className="text-xs h-7" onClick={async () => {
                            if (confirm('Delete this blog post?')) {
                              await store.deleteBlog(b.id);
                              setBlogs(await store.getBlogs());
                              toast({ title: "Blog post deleted" });
                            }
                          }}><Trash2 className="h-3 w-3" /> Delete</Button>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Gallery ── */}
        {tab === 'gallery' && (
          <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <h1 className="font-heading text-2xl font-bold">Gallery</h1>
              {canEditTab('gallery') && (
                <Button size="sm" onClick={() => { setShowGalleryForm(!showGalleryForm); setGalleryForm({ title: '', url: '', type: 'photo' }); }}><Plus className="h-4 w-4" /> Add Item</Button>
              )}
            </div>
            {showGalleryForm && canEditTab('gallery') && (
              <div className="bg-card rounded-xl p-6 shadow-soft mb-8 space-y-4">
                <h3 className="font-heading font-bold">Add Gallery Item</h3>
                <input placeholder="Title *" value={galleryForm.title} onChange={e => setGalleryForm({ ...galleryForm, title: e.target.value })} className={inputClass} maxLength={200} />
                <ImageUpload value={galleryForm.url} onChange={(v: string) => setGalleryForm({ ...galleryForm, url: v })} />
                <select value={galleryForm.type} onChange={e => setGalleryForm({ ...galleryForm, type: e.target.value as 'photo' | 'video' })} className={inputClass + " w-auto"}>
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
                <div className="flex gap-3">
                  <Button onClick={saveGalleryItem} size="sm" disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowGalleryForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {isHideExisting ? (
              <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>
            ) : gallery.length === 0 ? <p className="text-muted-foreground text-center py-8">No gallery items yet.</p> : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map(g => (
                  <div key={g.id} className="bg-card rounded-lg shadow-soft overflow-hidden">
                    <img src={g.url} alt={g.title} className="w-full h-32 object-cover" />
                    <div className="p-3">
                      <p className="text-sm font-medium">{g.title}</p>
                      <p className="text-xs text-muted-foreground">{g.type} {g.date ? '· ' + new Date(g.date).toLocaleDateString() : ''}</p>
                      {canDeleteTab('gallery') && (
                        <Button size="sm" variant="destructive" className="text-xs h-7 mt-2" onClick={async () => {
                          if (confirm('Delete this item?')) {
                            await store.deleteGalleryItem(g.id);
                            setGallery(await store.getGallery());
                            toast({ title: "Gallery item deleted" });
                          }
                        }}><Trash2 className="h-3 w-3" /> Delete</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Volunteers ── */}
        {tab === 'volunteers' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">Volunteers</h1>
            {(() => { const filtered = volunteers.filter(v => v.type === 'volunteer'); return (
              <>
                {!isHideExisting && <p className="text-sm text-muted-foreground mb-4">Total: {filtered.length}</p>}
                {isHideExisting ? (
                  <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>
                ) : filtered.length === 0 ? <p className="text-muted-foreground text-center py-8">No volunteers yet.</p> : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                      <input type="checkbox" checked={selectedVols.size === filtered.length && filtered.length > 0} onChange={(e) => {
                        setSelectedVols(e.target.checked ? new Set(filtered.map(v => v.id)) : new Set());
                      }} />
                      {selectedVols.size > 0 && <span className="text-sm text-muted-foreground">{selectedVols.size} selected</span>}
                    </div>
                    {filtered.map(v => (
                      <div key={v.id} className="bg-card rounded-lg p-4 shadow-soft">
                        <div className="flex items-start gap-3">
                          <input type="checkbox" className="mt-1" checked={selectedVols.has(v.id)} onChange={(e) => {
                            const next = new Set(selectedVols);
                            e.target.checked ? next.add(v.id) : next.delete(v.id);
                            setSelectedVols(next);
                          }} />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-sm">{v.name}</span>
                              <span className="text-xs text-muted-foreground">{v.date ? new Date(v.date).toLocaleDateString() : ''}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{v.email}{v.phone ? ' · ' + v.phone : ''}</p>
                            {v.country && <p className="text-xs text-muted-foreground">{v.country}</p>}
                            {v.message && <p className="text-sm mt-2 whitespace-pre-line">{v.message}</p>}
                            {canDeleteTab('volunteers') && (
                              <Button size="sm" variant="destructive" className="text-xs h-7 mt-2" onClick={async () => {
                                if (confirm('Delete this volunteer?')) {
                                  await store.deleteVolunteer(v.id);
                                  setVolunteers(await store.getVolunteers());
                                  toast({ title: "Volunteer deleted" });
                                }
                              }}><Trash2 className="h-3 w-3" /> Delete</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedVols.size > 0 && (
                  <div className="bg-card rounded-xl p-6 shadow-soft mt-6">
                    <h3 className="font-heading font-bold mb-4">Send Email to {selectedVols.size} volunteer{selectedVols.size > 1 ? 's' : ''}</h3>
                    <input placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" />
                    <textarea placeholder="Message body..." value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" />
                    <Button size="sm" onClick={() => {
                      const emails = filtered.filter(v => selectedVols.has(v.id)).map(v => v.email).filter(Boolean);
                      if (emails.length === 0) { toast({ title: "No emails found", variant: "destructive" }); return; }
                      openGmail(emails, emailSubject, emailBody);
                    }}><Mail className="h-4 w-4" /> Send via Email</Button>
                  </div>
                )}
              </>
            ); })()}
          </div>
        )}

        {/* ── Sponsors ── */}
        {tab === 'sponsors' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">Sponsors</h1>
            {(() => { const filtered = volunteers.filter(v => v.type === 'sponsor'); return (
              <>
                {!isHideExisting && <p className="text-sm text-muted-foreground mb-4">Total: {filtered.length}</p>}
                {isHideExisting ? (
                  <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>
                ) : filtered.length === 0 ? <p className="text-muted-foreground text-center py-8">No sponsors yet.</p> : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2">
                      <input type="checkbox" checked={selectedVols.size === filtered.length && filtered.length > 0} onChange={(e) => {
                        setSelectedVols(e.target.checked ? new Set(filtered.map(v => v.id)) : new Set());
                      }} />
                      {selectedVols.size > 0 && <span className="text-sm text-muted-foreground">{selectedVols.size} selected</span>}
                    </div>
                    {filtered.map(v => (
                      <div key={v.id} className="bg-card rounded-lg p-4 shadow-soft">
                        <div className="flex items-start gap-3">
                          <input type="checkbox" className="mt-1" checked={selectedVols.has(v.id)} onChange={(e) => {
                            const next = new Set(selectedVols);
                            e.target.checked ? next.add(v.id) : next.delete(v.id);
                            setSelectedVols(next);
                          }} />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-sm">{v.name}</span>
                              <span className="text-xs text-muted-foreground">{v.date ? new Date(v.date).toLocaleDateString() : ''}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{v.email}{v.phone ? ' · ' + v.phone : ''}</p>
                            {v.country && <p className="text-xs text-muted-foreground">{v.country}</p>}
                            {v.message && <p className="text-sm mt-2 whitespace-pre-line">{v.message}</p>}
                            {canDeleteTab('sponsors') && (
                              <Button size="sm" variant="destructive" className="text-xs h-7 mt-2" onClick={async () => {
                                if (confirm('Delete this sponsor?')) {
                                  await store.deleteVolunteer(v.id);
                                  setVolunteers(await store.getVolunteers());
                                  toast({ title: "Sponsor deleted" });
                                }
                              }}><Trash2 className="h-3 w-3" /> Delete</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedVols.size > 0 && (
                  <div className="bg-card rounded-xl p-6 shadow-soft mt-6">
                    <h3 className="font-heading font-bold mb-4">Send Email to {selectedVols.size} sponsor{selectedVols.size > 1 ? 's' : ''}</h3>
                    <input placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" />
                    <textarea placeholder="Message body..." value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" />
                    <Button size="sm" onClick={() => {
                      const emails = filtered.filter(v => selectedVols.has(v.id)).map(v => v.email).filter(Boolean);
                      if (emails.length === 0) { toast({ title: "No emails found", variant: "destructive" }); return; }
                      openGmail(emails, emailSubject, emailBody);
                    }}><Mail className="h-4 w-4" /> Send via Email</Button>
                  </div>
                )}
              </>
            ); })()}
          </div>
        )}

        {/* ── Donations ── */}
        {tab === 'donations' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-6">Donations</h1>
            {!isHideExisting && <p className="text-sm text-muted-foreground mb-4">Total: {donations.length}</p>}
            {isHideExisting ? (
              <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>
            ) : donations.length === 0 ? <p className="text-muted-foreground text-center py-8">No donations yet.</p> : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  <input type="checkbox" checked={selectedDonors.size === donations.length && donations.length > 0} onChange={(e) => {
                    setSelectedDonors(e.target.checked ? new Set(donations.map(d => d.id)) : new Set());
                  }} />
                  {selectedDonors.size > 0 && <span className="text-sm text-muted-foreground">{selectedDonors.size} selected</span>}
                </div>
                {donations.map(d => (
                  <div key={d.id} className="bg-card rounded-lg p-4 shadow-soft">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" className="mt-1" checked={selectedDonors.has(d.id)} onChange={(e) => {
                        const next = new Set(selectedDonors);
                        e.target.checked ? next.add(d.id) : next.delete(d.id);
                        setSelectedDonors(next);
                      }} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-sm">{d.name || 'Anonymous'}</span>
                          <span className="text-xs text-muted-foreground">{d.date ? new Date(d.date).toLocaleDateString() : ''}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{d.email}</p>
                        <p className="text-sm font-bold text-primary mt-1">{d.currency || 'USD'} {d.amount}</p>
                        {d.message && <p className="text-sm mt-2 whitespace-pre-line">{d.message}</p>}
                        {canDeleteTab('donations') && (
                          <Button size="sm" variant="destructive" className="text-xs h-7 mt-2" onClick={async () => {
                            if (confirm('Delete this donation?')) {
                              await store.deleteDonation(d.id);
                              setDonations(await store.getDonations());
                              toast({ title: "Donation deleted" });
                            }
                          }}><Trash2 className="h-3 w-3" /> Delete</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedDonors.size > 0 && (
              <div className="bg-card rounded-xl p-6 shadow-soft mt-6">
                <h3 className="font-heading font-bold mb-4">Send Email to {selectedDonors.size} donor{selectedDonors.size > 1 ? 's' : ''}</h3>
                <input placeholder="Subject" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" />
                <textarea placeholder="Message body..." value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm mb-3" />
                <Button size="sm" onClick={() => {
                  const emails = donations.filter(d => selectedDonors.has(d.id)).map(d => d.email).filter(Boolean);
                  if (emails.length === 0) { toast({ title: "No emails found", variant: "destructive" }); return; }
                  openGmail(emails, emailSubject, emailBody);
                }}><Mail className="h-4 w-4" /> Send via Email</Button>
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

        {tab === 'chat' && (() => {
          const sendMessage = async () => {
            const text = chatInput.trim();
            if (!text) return;
            setChatInput('');
            try {
              const sent = await store.sendAdminMessage({
                senderName: profile?.name || 'Admin',
                senderEmail: profile?.email || '',
                senderRole: 'sub_admin',
                message: text,
                timestamp: new Date().toISOString(),
              });
              if (sent) {
                setChatMessages(prev => [...prev, sent]);
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
              } else {
                setChatInput(text);
              }
            } catch {
              setChatInput(text);
            }
          };
          const refreshChat = () => { store.getAdminMessages().then(setChatMessages); };
          return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold flex items-center gap-2"><Send className="h-5 w-5" /> Admin Chat</h2>
              <Button variant="outline" size="sm" onClick={refreshChat} className="text-xs">Refresh</Button>
            </div>
            <div className="bg-card rounded-xl border border-border flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: 400 }}>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-10">No messages yet. Start the conversation!</p>
                )}
                {chatMessages.map((msg) => {
                  const isMe = msg.senderEmail === (profile?.email || '');
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-primary text-white rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                        <p className={`text-xs font-bold mb-0.5 ${isMe ? 'text-white/80' : 'opacity-80'}`}>{msg.senderName}{isMe ? ' (You)' : ''}</p>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-muted-foreground'}`}>
                          {new Date(msg.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t border-border p-3 flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 rounded-full border border-input bg-background text-sm focus:ring-2 focus:ring-ring outline-none"
                  maxLength={2000}
                />
                <Button
                  size="icon"
                  className="rounded-full shrink-0 h-10 w-10"
                  disabled={!chatInput.trim()}
                  onClick={sendMessage}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          );
        })()}
      </main>

      {/* Photo Viewer Modal */}
      {viewPhoto && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setViewPhoto(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewPhoto(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold">✕</button>
            <img src={viewPhoto.url} alt={viewPhoto.name} className="w-full rounded-xl shadow-2xl" />
            <p className="text-white text-center mt-3 font-medium">{viewPhoto.name}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdminAccess;
