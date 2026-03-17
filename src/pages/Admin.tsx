import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { store, type Story, type BlogPost, type GalleryItem, type NewsletterSubscriber, type ContactMessage, type Announcement, type Member, type FooterSettings, type HeroSettings, type SiteSettings, type AboutSettings, type ProgramsSettings, type HomeSettings, type ContactPageSettings, type DonateSettings, type GetInvolvedSettings, type SubAdmin, type TabPermission, type AdminChatMessage } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, FileText, Image, Megaphone, Users, Heart,
  Plus, Trash2, ArrowLeft, LogOut, Download, Mail, Send, MessageSquare, KeyRound,
  UserPlus, Copy, Camera, Upload, Shield, ChevronUp, ChevronDown, Type, ImagePlus, Video, Pencil, Save, Loader2, Settings, Globe, Power, Link2
} from "lucide-react";
import { Link } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { useAuth } from "@/hooks/useAuth";
import ImageUpload from "@/components/ImageUpload";
import RichTextEditor from "@/components/RichTextEditor";

type Tab = 'dashboard' | 'announcements' | 'stories' | 'blogs' | 'gallery' | 'volunteers' | 'sponsors' | 'donations' | 'subscribers' | 'messages' | 'members' | 'footer' | 'hero' | 'site' | 'pages' | 'admins' | 'chat';

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
  { code: "+263", country: "ZW" }, { code: "+258", country: "MZ" }, { code: "+55", country: "BR" },
  { code: "+81", country: "JP" }, { code: "+82", country: "KR" }, { code: "+7", country: "RU" },
  { code: "+39", country: "IT" }, { code: "+34", country: "ES" }, { code: "+31", country: "NL" },
  { code: "+46", country: "SE" }, { code: "+47", country: "NO" }, { code: "+90", country: "TR" },
  { code: "+966", country: "SA" }, { code: "+971", country: "AE" }, { code: "+92", country: "PK" },
  { code: "+93", country: "AF" }, { code: "+964", country: "IQ" }, { code: "+962", country: "JO" },
  { code: "+961", country: "LB" }, { code: "+63", country: "PH" }, { code: "+62", country: "ID" },
  { code: "+66", country: "TH" }, { code: "+84", country: "VN" }, { code: "+60", country: "MY" },
];

const Admin = () => {
  const { toast } = useToast();
  const { user, signOut, changePassword, isSuperAdmin, subAdminProfile, canEdit, canView, canDelete, shouldHideExisting } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);
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
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [subAdminForm, setSubAdminForm] = useState({ name: '', username: '', email: '', permissions: {} as Record<string, TabPermission>, allowDelete: {} as Record<string, boolean>, hideExistingData: {} as Record<string, boolean> });
  const [editingSubAdmin, setEditingSubAdmin] = useState<string | null>(null);
  const [viewPhoto, setViewPhoto] = useState<{ url: string; name: string } | null>(null);
  const [chatMessages, setChatMessages] = useState<AdminChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatMode, setChatMode] = useState<'group' | 'direct'>('group');
  const [dmRecipient, setDmRecipient] = useState<{ email: string; name: string } | null>(null);
  const [sendDmEmail, setSendDmEmail] = useState(false);
  const [footerForm, setFooterForm] = useState<FooterSettings>({
    email: "refannetwork2022@gmail.com", phone: "+265 997 561 852",
    address: "Dzaleka Refugee Camp, Dowa District, Malawi", whatsapp: "265997561852",
    linkedin: "https://www.linkedin.com/in/holistic-continuity-of-care-571586315",
    description: "Resilient Foundation Assistance Network (ReFAN) is a refugee-led NGO based in Dzaleka, Malawi, dedicated to the continuity of care for the most vulnerable.",
  });
  const [heroForm, setHeroForm] = useState<HeroSettings>({
    heroImage: "/refan_give.jpg",
    tagline: "Holistic Continuity of Care",
    title: "From Loss to Legacy: Continuity of Care",
    subtitle: "Self-funded by refugees, powered by hope. Join us in turning grief into resilience for Dzaleka's most vulnerable.",
  });
  const [siteForm, setSiteForm] = useState<SiteSettings>({ maintenanceMode: false, maintenanceMessage: "" });
  const [aboutForm, setAboutForm] = useState<AboutSettings>({
    heroTitle: "Our Heart, Our Mission", heroSubtitle: "Dedicated to holistic continuity of care for orphans and widows in Dzaleka Refugee Camp since 2022.",
    heroImage: "", whoWeAreTitle: "A Refugee-Led Force for Community Wellness", whoWeAreBody: "", whoWeAreImage1: "", whoWeAreImage2: "/wg5r.png",
    missionQuote: "Holistic Continuity of Care", missionBody: "", ctaHeading: "Be the change you want to see.", ctaBody: "",
    valuesHeading: 'Our Guiding <span class="text-primary">Values</span>', valuesSubtitle: "The principles that drive every decision and action we take.",
    leadersHeading: '<span class="text-secondary">Board</span> of Directors', leadersSubtitle: "The visionary leaders steering ReFAN toward a brighter, healthier future for all.",
    leaders: [
      { name: "Goreth Niyibigira", title: "Président", quote: "", image: "/Goreth Niyibigira - Président.jpg", email: "refannetwork2022@gmail.com" },
      { name: "Lydia Igiraneza", title: "Général Secretary", quote: "", image: "/Lydia Igiraneza - Général Secretary.jpg", email: "refannetwork2022@gmail.com" },
    ],
    values: [{ title: "Compassion", description: "" }, { title: "Integrity", description: "" }, { title: "Sustainability", description: "" }, { title: "Collaboration", description: "" }],
  });
  const [programsForm, setProgramsForm] = useState<ProgramsSettings>({
    pageTitle: "Our Programs", pageSubtitle: "",
    programs: [{ title: "Education Support", description: "", stats: "100+ orphans supported", image: "" }, { title: "Community Resilience", description: "", stats: "50+ widows empowered", image: "" }, { title: "Bereavement Support", description: "", stats: "Ongoing community care", image: "" }],
  });
  const [homeForm, setHomeForm] = useState<HomeSettings>({
    impactStats: [{ number: 2022, label: "Founded", suffix: "" }, { number: 100, label: "Orphans Supported", suffix: "+" }, { number: 50, label: "Widows Empowered", suffix: "+" }, { number: 30, label: "Bereaved Families Supported", suffix: "+" }],
    programs: [{ title: "Education Support", desc: "", image: "" }, { title: "Community Resilience", desc: "", image: "" }, { title: "Bereavement Support", desc: "", image: "" }],
    testimonials: [{ quote: "", name: "Marie K.", role: "Widow & Mother of 3" }, { quote: "", name: "Emmanuel T.", role: "Orphan, Age 16" }, { quote: "", name: "Esperance N.", role: "Widow & Workshop Leader" }],
    values: [{ title: "Refugee-Led", desc: "" }, { title: "Women-Led", desc: "" }, { title: "Self-Funded", desc: "" }],
    ctaHeading: "How will you help today?", ctaBody: "", ctaImage: "/modam_teach.jpg",
  });
  const [contactForm2, setContactForm2] = useState<ContactPageSettings>({
    pageTitle: "", pageSubtitle: "", email: "refannetwork2022@gmail.com", emailSub: "support@refan.org",
    phone: "+265 997 561 852", phoneSub: "Monday - Friday, 8am - 5pm CAT", location: "Dzaleka Refugee Camp, Dowa District", locationSub: "P.O. Box 16, Dowa, Malawi",
  });
  const [donateForm2, setDonateForm2] = useState<DonateSettings>({ pageTitle: "", pageSubtitle: "" });
  const [giForm, setGiForm] = useState<GetInvolvedSettings>({
    pageTitle: "", pageSubtitle: "",
    ways: [{ title: "Donate", desc: "", cta: "Donate Now" }, { title: "Volunteer", desc: "", cta: "Sign Up" }, { title: "Sponsor", desc: "", cta: "Become a Sponsor" }, { title: "Become a Member", desc: "", cta: "Register Now" }],
  });
  const [pageTab, setPageTab] = useState<'about' | 'programs' | 'home' | 'contact' | 'donate' | 'getinvolved' | 'stories' | 'gallery' | 'blog'>('about');
  const [storiesPageForm, setStoriesPageForm] = useState({ pageTitle: '<span class="text-secondary">Stories</span> & <span class="text-primary">Announcements</span>', pageSubtitle: 'Real impact stories from the communities we serve in Dzaleka.' });
  const [galleryPageForm, setGalleryPageForm] = useState({ pageTitle: '<span class="text-primary">Life</span> in <span class="text-secondary">Dzaleka</span>', pageSubtitle: 'Capturing moments of growth, joy, and community action.' });
  const [blogPageForm, setBlogPageForm] = useState({ pageTitle: '<span class="text-primary">Blog</span> & <span class="text-secondary">News</span>', pageSubtitle: 'Insights, updates, and perspectives on community development.' });

  const loadData = async () => {
    const [a, s, b, g, v, d, sub, msg, mem] = await Promise.all([
      store.getAnnouncements(), store.getStories(), store.getBlogs(), store.getGallery(),
      store.getVolunteers(), store.getDonations(), store.getSubscribers(), store.getMessages(), store.getMembers(),
    ]);
    setAnnouncements(a); setStories(s); setBlogs(b); setGallery(g);
    setVolunteers(v); setDonations(d); setSubscribers(sub); setMessages(msg); setMembers(mem);
    if (isSuperAdmin) { store.getSubAdmins().then(setSubAdmins); }
    store.getAdminMessages().then(setChatMessages);
    // Auto-backfill missing expiry dates
    for (const m of mem) {
      if (!m.expiryDate || !m.expiryDate.match(/^\d{4}-\d{2}-\d{2}/)) {
        let base = m.registrationDate ? new Date(m.registrationDate) : new Date();
        if (isNaN(base.getTime())) base = new Date();
        base.setMonth(base.getMonth() + 3);
        const expiryStr = base.toISOString().split('T')[0];
        await updateDoc(doc(db, "members", m.id), { expiryDate: expiryStr });
        m.expiryDate = expiryStr;
      }
    }
    setMembers([...mem]);
    const footerData = await store.getFooterSettings();
    if (footerData) setFooterForm(prev => ({ ...prev, ...footerData }));
    const heroData = await store.getHeroSettings();
    if (heroData) setHeroForm(prev => ({ ...prev, ...heroData }));
    const siteData = await store.getSiteSettings();
    if (siteData) setSiteForm(prev => ({ ...prev, ...siteData }));
    const aboutData = await store.getPageSettings<AboutSettings>("about");
    if (aboutData) setAboutForm(prev => ({ ...prev, ...aboutData }));
    const programsData = await store.getPageSettings<ProgramsSettings>("programs");
    if (programsData) setProgramsForm(prev => ({ ...prev, ...programsData }));
    const homeData = await store.getPageSettings<HomeSettings>("home");
    if (homeData) {
      const defaultStats = [{ number: 2022, label: "Founded", suffix: "" }, { number: 100, label: "Orphans Supported", suffix: "+" }, { number: 50, label: "Widows Empowered", suffix: "+" }, { number: 30, label: "Bereaved Families Supported", suffix: "+" }];
      const savedStats = homeData.impactStats || [];
      const mergedStats = defaultStats.map((def, i) => savedStats[i] ? { ...def, ...savedStats[i], number: Number(savedStats[i].number) || def.number } : def);
      setHomeForm(prev => ({ ...prev, ...homeData, impactStats: mergedStats }));
    }
    const contactData = await store.getPageSettings<ContactPageSettings>("contact");
    if (contactData) setContactForm2(prev => ({ ...prev, ...contactData }));
    const donateData = await store.getPageSettings<DonateSettings>("donate");
    if (donateData) setDonateForm2(prev => ({ ...prev, ...donateData }));
    const giData = await store.getPageSettings<GetInvolvedSettings>("getinvolved");
    if (giData) setGiForm(prev => ({ ...prev, ...giData }));
    const storiesPage = await store.getPageSettings<{ pageTitle: string; pageSubtitle: string }>("storiespage");
    if (storiesPage) setStoriesPageForm(prev => ({ ...prev, ...storiesPage }));
    const galleryPage = await store.getPageSettings<{ pageTitle: string; pageSubtitle: string }>("gallerypage");
    if (galleryPage) setGalleryPageForm(prev => ({ ...prev, ...galleryPage }));
    const blogPage = await store.getPageSettings<{ pageTitle: string; pageSubtitle: string }>("blogpage");
    if (blogPage) setBlogPageForm(prev => ({ ...prev, ...blogPage }));
  };

  useEffect(() => {
    loadData();
    // Auto-reload data when admin switches back to this tab
    const onVisibility = () => {
      if (document.visibilityState === 'visible') loadData();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());
  const [selectedVols, setSelectedVols] = useState<Set<string>>(new Set());
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
  const [selectedMsgs, setSelectedMsgs] = useState<Set<string>>(new Set());
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showSecurityForm, setShowSecurityForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [sqForm, setSqForm] = useState({ question: store.getSecurityQuestion(), answer: '' });
  const photoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const [storyForm, setStoryForm] = useState({ title: '', subtitle: '', excerpt: '', content: '', image: '', video: '', category: 'story' as 'story' | 'announcement', donationCount: 0, date: new Date().toISOString().split('T')[0], showDate: true });
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', image: '', author: 'ReFAN Team', tags: '' });
  const [contentBlocks, setContentBlocks] = useState<Array<{ type: 'text' | 'image' | 'video'; value?: string; url?: string; caption?: string }>>([{ type: 'text', value: '' }]);
  const [galleryForm, setGalleryForm] = useState({ title: '', url: '', type: 'photo' as 'photo' | 'video' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', subtitle: '', content: '', image: '', video: '', donationCount: 0, date: new Date().toISOString().split('T')[0], showDate: true });
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [editingBlog, setEditingBlog] = useState<string | null>(null);

  const emptyMemberForm = {
    surname: '', firstName: '', otherName: '', email: '', countryOfOrigin: '', countryOfResidence: '',
    unhcrId: '', phone: '', phoneCode: '+265', gender: '', maritalStatus: '',
    dobYear: '', dobMonth: '', dobDay: '', familySize: '', photo: '', document: '',
    paymentCurrency: 'MWK', paymentAmount: '', branchName: 'Dzaleka', username: '', expiryDate: '',
  };
  const [memberForm, setMemberForm] = useState(emptyMemberForm);

  const handleFileToBase64 = (file: File, field: 'photo' | 'document') => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large. Maximum 5MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setMemberForm(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const [saving, setSaving] = useState(false);

  const addAnnouncement = async () => {
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
    setSaving(false);
  };

  const startEditAnnouncement = (a: Announcement) => {
    setAnnouncementForm({ title: a.title, subtitle: a.subtitle || '', content: a.content, image: a.image || '', video: a.video || '', donationCount: a.donationCount || 0, date: a.date ? a.date.split('T')[0] : '', showDate: (a as any).showDate !== false });
    setEditingAnnouncement(a.id);
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    await store.deleteAnnouncement(id);
    setAnnouncements(await store.getAnnouncements());
    toast({ title: "Announcement deleted" });
  };

  const addStory = async () => {
    if (!storyForm.title.trim()) return;
    setSaving(true);
    if (editingStory) {
      await store.updateStory(editingStory, storyForm);
      setEditingStory(null);
      toast({ title: "Story updated!" });
    } else {
      await store.addStory({ ...storyForm, date: storyForm.date || new Date().toISOString().split('T')[0] });
      toast({ title: "Story added!" });
    }
    setStories(await store.getStories());
    setStoryForm({ title: '', subtitle: '', excerpt: '', content: '', image: '', video: '', category: 'story', donationCount: 0, date: new Date().toISOString().split('T')[0], showDate: true });
    setSaving(false);
  };

  const startEditStory = (s: Story) => {
    setStoryForm({ title: s.title, subtitle: s.subtitle || '', excerpt: s.excerpt, content: s.content, image: s.image || '', video: s.video || '', category: s.category, donationCount: s.donationCount || 0, date: s.date ? s.date.split('T')[0] : '', showDate: s.showDate !== false });
    setEditingStory(s.id);
  };

  const deleteStory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    await store.deleteStory(id);
    setStories(await store.getStories());
    toast({ title: "Story deleted" });
  };

  const addBlog = async () => {
    if (!blogForm.title.trim()) return;
    setSaving(true);
    const content = JSON.stringify(contentBlocks.filter(b => (b.type === 'text' && b.value?.trim()) || ((b.type === 'image' || b.type === 'video') && b.url?.trim())));
    if (editingBlog) {
      await store.updateBlog(editingBlog, { ...blogForm, content, tags: blogForm.tags.split(',').map(t => t.trim()).filter(Boolean) });
      setEditingBlog(null);
      toast({ title: "Blog post updated!" });
    } else {
      await store.addBlog({ ...blogForm, content, tags: blogForm.tags.split(',').map(t => t.trim()).filter(Boolean), date: new Date().toISOString() });
      toast({ title: "Blog post added!" });
    }
    setBlogs(await store.getBlogs());
    setBlogForm({ title: '', excerpt: '', image: '', author: 'ReFAN Team', tags: '' });
    setContentBlocks([{ type: 'text', value: '' }]);
    setSaving(false);
  };

  const startEditBlog = (b: BlogPost) => {
    setBlogForm({ title: b.title, excerpt: b.excerpt, image: b.image || '', author: b.author || 'ReFAN Team', tags: (b.tags || []).join(', ') });
    try {
      const blocks = JSON.parse(b.content);
      if (Array.isArray(blocks)) setContentBlocks(blocks);
      else setContentBlocks([{ type: 'text', value: b.content }]);
    } catch { setContentBlocks([{ type: 'text', value: b.content }]); }
    setEditingBlog(b.id);
  };

  const updateBlock = (index: number, updates: Partial<typeof contentBlocks[0]>) => {
    setContentBlocks(prev => prev.map((b, i) => i === index ? { ...b, ...updates } : b));
  };
  const removeBlock = (index: number) => {
    setContentBlocks(prev => prev.filter((_, i) => i !== index));
  };
  const moveBlock = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= contentBlocks.length) return;
    setContentBlocks(prev => {
      const arr = [...prev];
      [arr[index], arr[next]] = [arr[next], arr[index]];
      return arr;
    });
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    await store.deleteBlog(id);
    setBlogs(await store.getBlogs());
    toast({ title: "Blog post deleted" });
  };

  const addGalleryItem = async () => {
    if (!galleryForm.title.trim()) return;
    await store.addGalleryItem({ ...galleryForm, date: new Date().toISOString() });
    setGallery(await store.getGallery());
    setGalleryForm({ title: '', url: '', type: 'photo' });
    toast({ title: "Gallery item added!" });
  };

  const deleteGalleryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;
    await store.deleteGalleryItem(id);
    setGallery(await store.getGallery());
    toast({ title: "Gallery item deleted" });
  };

  const [memberSaving, setMemberSaving] = useState(false);

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
      // Compress images to avoid Firestore 1MB document limit
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
        toast({ title: `Saved! Member ${result.regNumber} registered successfully.` });
      } else {
        toast({ title: "Failed to save member. Please try again.", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("addMember error:", err);
      toast({ title: "Error saving member. Please try again.", variant: "destructive" });
    } finally {
      setMemberSaving(false);
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      const success = await store.deleteMember(id);
      if (success) {
        setMembers(await store.getMembers());
        toast({ title: "Deleted! Member has been removed." });
      } else {
        toast({ title: "Failed to delete member.", variant: "destructive" });
      }
    } catch (err) {
      console.error("deleteMember error:", err);
      toast({ title: "Error deleting member.", variant: "destructive" });
    }
  };

  const removeDuplicateMembers = async () => {
    if (!confirm("This will keep the first registration for each name and remove duplicates. Continue?")) return;
    const seen = new Map<string, string>();
    const toDelete: string[] = [];
    for (const m of members) {
      const key = `${m.surname.toLowerCase()}_${m.firstName.toLowerCase()}_${m.email.toLowerCase()}`;
      if (seen.has(key)) {
        toDelete.push(m.id);
      } else {
        seen.set(key, m.id);
      }
    }
    if (toDelete.length === 0) {
      toast({ title: "No duplicates found" });
      return;
    }
    for (const id of toDelete) {
      await store.deleteMember(id);
    }
    setMembers(await store.getMembers());
    toast({ title: `Removed ${toDelete.length} duplicate(s)` });
  };

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvEsc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [
      headers.map(h => csvEsc(h)).join(','),
      ...data.map(row => headers.map(h => csvEsc(String(row[h] ?? ''))).join(','))
    ];
    const csv = '\uFEFF' + rows.join('\n');
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  };

  const exportMembersCSV = () => {
    const data = members.map((m, i) => ({
      "#": i + 1,
      "Reg Number": m.regNumber,
      "Surname": m.surname,
      "First Name": m.firstName,
      "Other Name": m.otherName,
      "Email": m.email,
      "Country of Origin": m.countryOfOrigin,
      "Country of Residence": m.countryOfResidence,
      "ID Number": m.unhcrId,
      "Phone": `${m.phoneCode} ${m.phone}`,
      "Gender": m.gender,
      "Marital Status": m.maritalStatus,
      "Date of Birth": m.dateOfBirth ? m.dateOfBirth : '',
      "Family Size": m.familySize,
      "Branch": m.branchName,
      "Username": m.username,
      "Registration Date": m.registrationDate ? m.registrationDate.split('T')[0] : '',
      "Expiry Date": m.expiryDate ? m.expiryDate.split('T')[0] : '',
    }));
    exportCSV(data as unknown as Record<string, unknown>[], "refan-members");
  };

  const COMPANY_EMAIL = "refannetwork2022@gmail.com";
  const [sendingEmail, setSendingEmail] = useState(false);
  const sendEmail = async (emails: string[], subject: string, body: string) => {
    if (sendingEmail) return;
    setSendingEmail(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: emails, subject, body }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Email sent successfully!" });
        setEmailSubject('');
        setEmailBody('');
      } else {
        toast({ title: "Failed to send email. Opening Gmail instead...", variant: "destructive" });
        openInGmail(emails, subject, body);
      }
    } catch {
      toast({ title: "Failed to send email. Opening Gmail instead...", variant: "destructive" });
      openInGmail(emails, subject, body);
    } finally {
      setSendingEmail(false);
    }
  };

  const openInGmail = (emails: string[], subject: string, body: string) => {
    const params = new URLSearchParams({ view: 'cm', fs: '1', to: emails.join(','), su: subject, body: body });
    window.open(`https://mail.google.com/mail/?authuser=${encodeURIComponent(COMPANY_EMAIL)}&${params.toString()}`, '_blank');
  };

  const copyRegLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#/register`;
    navigator.clipboard.writeText(link).then(() => {
      toast({ title: "Registration link copied!" });
    });
  };

  const sidebarItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
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
    { id: 'chat' as Tab, label: 'Admin Chat', icon: Send },
    ...(isSuperAdmin ? [{ id: 'admins' as Tab, label: 'Manage Admins', icon: Shield }] : []),
  ];

  const visibleSidebar = sidebarItems.filter(item => {
    if (isSuperAdmin) return true;
    if (item.id === 'admins') return false;
    if (item.id === 'chat') return true;
    return canView(item.id);
  });

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none text-sm";

  // Permission helpers for current tab
  const isViewOnly = !isSuperAdmin && !canEdit(tab);
  const canDeleteTab = canDelete(tab);
  const hideExisting = !isSuperAdmin && shouldHideExisting(tab);

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground flex flex-col shrink-0 hidden md:flex">
        <div className="p-6">
          <h2 className="font-heading text-xl font-extrabold"><span className="text-primary">ReFA</span><span className="text-white">N</span> Admin</h2>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {visibleSidebar.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === item.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-secondary-foreground/70 hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-1">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start text-secondary-foreground/70">
            <Link to="/"><ArrowLeft className="h-4 w-4" /> Back to Site</Link>
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-secondary-foreground/70" onClick={() => setShowPasswordForm(true)}>
            <KeyRound className="h-4 w-4" /> Change Password
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-secondary-foreground/70" onClick={() => setShowSecurityForm(true)}>
            <Shield className="h-4 w-4" /> Security Question
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-secondary-foreground/70" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary z-50 border-t border-sidebar-border safe-bottom">
        <div className="flex overflow-x-auto scrollbar-hide gap-0.5 px-1">
          {visibleSidebar.map((item) => (
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
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-10 pb-24 md:pb-10 overflow-auto">
        {!isSuperAdmin && !canEdit(tab) && canView(tab) && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2 mb-4 text-sm font-medium">
            View only — you cannot make changes to this section.
          </div>
        )}
        {tab === 'dashboard' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Dashboard Overview</h1>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Members', count: members.length, icon: UserPlus, tab: 'members' as Tab },
                { label: 'Stories', count: stories.length, icon: Megaphone, tab: 'stories' as Tab },
                { label: 'Blog Posts', count: blogs.length, icon: FileText, tab: 'blogs' as Tab },
                { label: 'Gallery Items', count: gallery.length, icon: Image, tab: 'gallery' as Tab },
                { label: 'Volunteers', count: volunteers.filter(v => v.type === 'volunteer').length, icon: Users, tab: 'volunteers' as Tab },
                { label: 'Sponsors', count: volunteers.filter(v => v.type === 'sponsor').length, icon: Heart, tab: 'sponsors' as Tab },
                { label: 'Subscribers', count: subscribers.length, icon: Mail, tab: 'subscribers' as Tab },
                { label: 'Messages', count: messages.length, icon: MessageSquare, tab: 'messages' as Tab },
                { label: 'Donations', count: donations.length, icon: Heart, tab: 'donations' as Tab },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-6 shadow-soft cursor-pointer hover:shadow-elevated hover:border-primary transition-all" onClick={() => setTab(s.tab)}>
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-heading text-3xl font-bold">{s.count}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <h3 className="font-heading font-bold mb-4">Recent Donations</h3>
                {donations.length === 0 ? <p className="text-sm text-muted-foreground">No donations yet.</p> : (
                  <div className="space-y-3">
                    {donations.slice(0, 5).map((d) => (
                      <div key={d.id} className="flex justify-between items-center text-sm border-b border-border pb-2">
                        <div><span className="font-medium">{d.name}</span> <span className="text-muted-foreground">({d.email})</span></div>
                        <span className="font-bold text-primary">{d.currency || 'USD'} {d.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-card rounded-xl p-6 shadow-soft">
                <h3 className="font-heading font-bold mb-4">Recent Sponsors</h3>
                {volunteers.filter(v => v.type === 'sponsor').length === 0 ? <p className="text-sm text-muted-foreground">No sponsors yet.</p> : (
                  <div className="space-y-3">
                    {volunteers.filter(v => v.type === 'sponsor').slice(0, 5).map((s) => (
                      <div key={s.id} className="flex justify-between items-center text-sm border-b border-border pb-2">
                        <div><span className="font-medium">{s.name}</span> <span className="text-muted-foreground">({s.email})</span></div>
                        <span className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
              <div>
                <h1 className="font-heading text-2xl font-bold">Members</h1>
                <p className="text-sm text-muted-foreground">Total: {members.length} member{members.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {!isViewOnly && <Button variant="outline" size="sm" onClick={copyRegLink}><Copy className="h-4 w-4" /> Copy Registration Link</Button>}
                {!isViewOnly && <Button variant="default" size="sm" onClick={() => setShowMemberForm(!showMemberForm)}><Plus className="h-4 w-4" /> Add Member</Button>}
                {members.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={exportMembersCSV}><Download className="h-4 w-4" /> Export CSV</Button>
                    <Button variant="outline" size="sm" onClick={async () => {
                      let fixed = 0;
                      for (const m of members) {
                        if (!m.expiryDate || !m.expiryDate.match(/^\d{4}-\d{2}-\d{2}/)) {
                          let base = m.registrationDate ? new Date(m.registrationDate) : new Date();
                          if (isNaN(base.getTime())) base = new Date();
                          base.setMonth(base.getMonth() + 3);
                          const expiryStr = base.toISOString().split('T')[0];
                          await updateDoc(doc(db, "members", m.id), { expiryDate: expiryStr });
                          fixed++;
                        }
                      }
                      if (fixed > 0) {
                        loadData();
                        toast({ title: `Fixed expiry dates for ${fixed} member${fixed > 1 ? 's' : ''}` });
                      } else {
                        toast({ title: 'All members already have valid expiry dates' });
                      }
                    }}><Settings className="h-4 w-4" /> Fix Expiry Dates</Button>
                    <Button variant="destructive" size="sm" onClick={removeDuplicateMembers}><Trash2 className="h-4 w-4" /> Remove Duplicates</Button>
                  </>
                )}
              </div>
            </div>

            {/* Add Member Form */}
            {showMemberForm && (
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
            {hideExisting ? (
              <p className="text-muted-foreground text-center py-8">Existing member data is hidden for your account.</p>
            ) : members.length === 0 ? <p className="text-muted-foreground">No members registered yet.</p> : (
              <>
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={selectedMembers.size === members.length && members.length > 0} onChange={(e) => {
                    setSelectedMembers(e.target.checked ? new Set(members.map(m => m.id)) : new Set());
                  }} className="rounded" />
                  Select All ({members.length})
                </label>
                {selectedMembers.size > 0 && <span className="text-sm text-muted-foreground">{selectedMembers.size} selected</span>}
              </div>
              <div className="overflow-x-auto bg-card rounded-xl shadow-soft">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="py-3 px-2 w-8"></th>
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
                      <th className="py-3 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m, idx) => (
                      <tr key={m.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-2"><input type="checkbox" checked={selectedMembers.has(m.id)} onChange={(e) => {
                          const next = new Set(selectedMembers);
                          if (e.target.checked) next.add(m.id); else next.delete(m.id);
                          setSelectedMembers(next);
                        }} className="rounded" /></td>
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
                        <td className="py-3 px-3 flex gap-1">
                          <Button variant="outline" size="sm" title="Renew Membership" onClick={() => {
                            const newExpiry = new Date(); newExpiry.setMonth(newExpiry.getMonth() + 3);
                            const expiryStr = newExpiry.toISOString().split('T')[0];
                            const name = `${m.firstName} ${m.surname}`;
                            const subject = `ReFAN Membership Renewal - ${name}`;
                            const body = `Dear ${name},\n\nYour ReFAN membership has been renewed.\n\nNew Expiry Date: ${newExpiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}\nReg Number: ${m.regNumber}\nTerm Fee: 2,000 MWK\n\nThank you for being a member of ReFAN.\n\nBest regards,\nReFAN Admin`;
                            if (m.email) {
                              sendEmail([m.email], subject, body);
                            }
                            updateDoc(doc(db, "members", m.id), { expiryDate: expiryStr }).then(() => {
                              loadData();
                              toast({ title: `Membership renewed for ${name} until ${newExpiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}` });
                            });
                          }}>
                            <Mail className="h-3 w-3" /> Renew
                          </Button>
                          {canDeleteTab && <Button variant="ghost" size="icon" onClick={() => deleteMember(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selectedMembers.size > 0 && (
                <div className="bg-card rounded-xl p-6 shadow-soft mt-6">
                  <h3 className="font-heading font-bold mb-4">Send Email to {selectedMembers.size} member{selectedMembers.size > 1 ? 's' : ''}</h3>
                  <div className="space-y-3">
                    <input placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className={inputClass} maxLength={200} />
                    <textarea placeholder="Write your message here..." value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={6} className={inputClass + " resize-none"} maxLength={5000} />
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" disabled={!emailSubject.trim() || !emailBody.trim() || sendingEmail} onClick={() => {
                        const emails = members.filter(m => selectedMembers.has(m.id)).map(m => m.email).filter(Boolean);
                        sendEmail(emails, emailSubject, emailBody);
                      }}>
                        <Send className="h-4 w-4" /> {sendingEmail ? 'Sending...' : 'Send Direct'}
                      </Button>
                      <Button variant="outline" size="sm" disabled={!emailSubject.trim() || !emailBody.trim()} onClick={() => {
                        const emails = members.filter(m => selectedMembers.has(m.id)).map(m => m.email).filter(Boolean);
                        openInGmail(emails, emailSubject, emailBody);
                      }}>
                        <Mail className="h-4 w-4" /> Open in Gmail
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        )}

        {tab === 'announcements' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Manage Announcements</h1>
            {!isViewOnly && <div className="bg-card rounded-xl p-6 shadow-soft mb-8">
              <h3 className="font-heading font-bold mb-4">{editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</h3>
              <div className="space-y-3">
                <input placeholder="Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className={inputClass} maxLength={200} />
                <input placeholder="Subtitle (Name of person)" value={announcementForm.subtitle} onChange={(e) => setAnnouncementForm({ ...announcementForm, subtitle: e.target.value })} className={inputClass} maxLength={200} />
                <RichTextEditor value={announcementForm.content} onChange={(v) => setAnnouncementForm({ ...announcementForm, content: v })} placeholder="Content (description)" rows={4} />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Image</label>
                  <ImageUpload label="Upload Image" onUploaded={(url) => setAnnouncementForm({ ...announcementForm, image: url })} />
                  <input placeholder="Or paste Image URL" value={announcementForm.image} onChange={(e) => setAnnouncementForm({ ...announcementForm, image: e.target.value })} className={inputClass} maxLength={500} />
                </div>
                <input placeholder="Video URL (YouTube, Vimeo, etc.)" value={announcementForm.video} onChange={(e) => setAnnouncementForm({ ...announcementForm, video: e.target.value })} className={inputClass} maxLength={500} />
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Date</label>
                    <input type="date" value={announcementForm.date} onChange={(e) => setAnnouncementForm({ ...announcementForm, date: e.target.value })} className={inputClass + " w-48"} />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer mt-5">
                    <input type="checkbox" checked={announcementForm.showDate} onChange={(e) => setAnnouncementForm({ ...announcementForm, showDate: e.target.checked })} className="rounded" />
                    Show date on website
                  </label>
                </div>
                <input type="number" placeholder="Donation Count" value={announcementForm.donationCount || ''} onChange={(e) => setAnnouncementForm({ ...announcementForm, donationCount: e.target.value === '' ? 0 : Number(e.target.value) })} className={inputClass + " w-48"} min={0} />
                <div className="flex gap-2">
                  <Button onClick={addAnnouncement} variant="default" size="sm" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingAnnouncement ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingAnnouncement ? 'Update' : 'Add Announcement'}
                  </Button>
                  {editingAnnouncement && <Button variant="ghost" size="sm" onClick={() => { setEditingAnnouncement(null); setAnnouncementForm({ title: '', subtitle: '', content: '', image: '', video: '', donationCount: 0, date: new Date().toISOString().split('T')[0], showDate: true }); }}>Cancel</Button>}
                </div>
              </div>
            </div>}
            {!hideExisting && <div className="grid sm:grid-cols-2 gap-4">
              {announcements.map((a) => (
                <div key={a.id} className="bg-card rounded-lg p-4 shadow-soft">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      {a.image && <img src={a.image} alt={a.title} className="w-full max-h-48 object-contain rounded-md mb-3" />}
                      <h4 className="font-medium text-sm">{a.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{a.content.slice(0, 80)}...</p>
                      <p className="text-xs text-primary font-medium mt-2">Donations: {a.donationCount}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => startEditAnnouncement(a)}><Pencil className="h-4 w-4 text-blue-500" /></Button>
                      {canDeleteTab && <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>}
            {hideExisting && <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>}
          </div>
        )}

        {tab === 'stories' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Manage Stories & Announcements</h1>
            {!isViewOnly && <div className="bg-card rounded-xl p-6 shadow-soft mb-8">
              <h3 className="font-heading font-bold mb-4">{editingStory ? 'Edit Story' : 'Add New'}</h3>
              <div className="space-y-3">
                <input placeholder="Title" value={storyForm.title} onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })} className={inputClass} maxLength={200} />
                <input placeholder="Subtitle (Name of person)" value={storyForm.subtitle} onChange={(e) => setStoryForm({ ...storyForm, subtitle: e.target.value })} className={inputClass} maxLength={200} />
                <input placeholder="Excerpt" value={storyForm.excerpt} onChange={(e) => setStoryForm({ ...storyForm, excerpt: e.target.value })} className={inputClass} maxLength={300} />
                <RichTextEditor value={storyForm.content} onChange={(v) => setStoryForm({ ...storyForm, content: v })} placeholder="Write content here..." rows={4} />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Image</label>
                  <ImageUpload label="Upload Image" onUploaded={(url) => setStoryForm({ ...storyForm, image: url })} />
                  <input placeholder="Or paste Image URL" value={storyForm.image} onChange={(e) => setStoryForm({ ...storyForm, image: e.target.value })} className={inputClass} maxLength={500} />
                </div>
                <input placeholder="Video URL (YouTube, Vimeo, etc.)" value={storyForm.video} onChange={(e) => setStoryForm({ ...storyForm, video: e.target.value })} className={inputClass} maxLength={500} />
                <select value={storyForm.category} onChange={(e) => setStoryForm({ ...storyForm, category: e.target.value as 'story' | 'announcement' })} className={inputClass}>
                  <option value="story">Story</option>
                  <option value="announcement">Announcement</option>
                </select>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Date</label>
                    <input type="date" value={storyForm.date} onChange={(e) => setStoryForm({ ...storyForm, date: e.target.value })} className={inputClass + " w-48"} />
                  </div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer mt-5">
                    <input type="checkbox" checked={storyForm.showDate} onChange={(e) => setStoryForm({ ...storyForm, showDate: e.target.checked })} className="rounded" />
                    Show date on website
                  </label>
                </div>
                <input type="number" placeholder="Donation Count" value={storyForm.donationCount || ''} onChange={(e) => setStoryForm({ ...storyForm, donationCount: e.target.value === '' ? 0 : Number(e.target.value) })} className={inputClass + " w-48"} min={0} />
                <div className="flex gap-2">
                  <Button onClick={addStory} variant="default" size="sm" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingStory ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingStory ? 'Update' : 'Add Story'}
                  </Button>
                  {editingStory && <Button variant="ghost" size="sm" onClick={() => { setEditingStory(null); setStoryForm({ title: '', subtitle: '', excerpt: '', content: '', image: '', video: '', category: 'story', donationCount: 0, date: new Date().toISOString().split('T')[0], showDate: true }); }}>Cancel</Button>}
                </div>
              </div>
            </div>}
            {!hideExisting ? <div className="space-y-3">
              {stories.map((s) => (
                <div key={s.id} className="bg-card rounded-lg p-4 shadow-soft flex justify-between items-start gap-4">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${s.category === 'story' ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary'}`}>{s.category}</span>
                    <h4 className="font-medium">{s.title}</h4>
                    <p className="text-xs text-muted-foreground">{s.excerpt}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEditStory(s)}><Pencil className="h-4 w-4 text-blue-500" /></Button>
                    {canDeleteTab && <Button variant="ghost" size="icon" onClick={() => deleteStory(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  </div>
                </div>
              ))}
            </div> : <p className="text-muted-foreground text-center py-8">Existing data is hidden for your account.</p>}
          </div>
        )}

        {tab === 'blogs' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Manage Blog Posts</h1>
            <div className="bg-card rounded-xl p-6 shadow-soft mb-8">
              <h3 className="font-heading font-bold mb-4">{editingBlog ? 'Edit Post' : 'Add New Post'}</h3>
              <div className="space-y-3">
                <input placeholder="Title" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} className={inputClass} maxLength={200} />
                <input placeholder="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} className={inputClass} maxLength={300} />
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Featured Image (thumbnail)</label>
                  <ImageUpload label="Upload Thumbnail" onUploaded={(url) => setBlogForm({ ...blogForm, image: url })} />
                  <input placeholder="Or paste thumbnail URL" value={blogForm.image} onChange={(e) => setBlogForm({ ...blogForm, image: e.target.value })} className={inputClass} maxLength={500} />
                </div>
                <input placeholder="Tags (comma separated)" value={blogForm.tags} onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })} className={inputClass} maxLength={200} />

                {/* Content Blocks */}
                <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
                  <label className="text-sm font-bold text-foreground">Content Blocks</label>
                  {contentBlocks.map((block, idx) => (
                    <div key={idx} className="bg-card rounded-lg border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          {block.type === 'text' ? <><Type className="h-3 w-3" /> Text Block {idx + 1}</> : block.type === 'image' ? <><ImagePlus className="h-3 w-3" /> Image Block {idx + 1}</> : <><Video className="h-3 w-3" /> Video Block {idx + 1}</>}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(idx, -1)} disabled={idx === 0}><ChevronUp className="h-3 w-3" /></Button>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveBlock(idx, 1)} disabled={idx === contentBlocks.length - 1}><ChevronDown className="h-3 w-3" /></Button>
                          {contentBlocks.length > 1 && <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeBlock(idx)}><Trash2 className="h-3 w-3" /></Button>}
                        </div>
                      </div>
                      {block.type === 'text' ? (
                        <RichTextEditor value={block.value || ''} onChange={(v) => updateBlock(idx, { value: v })} placeholder="Write your content here..." rows={3} />
                      ) : block.type === 'image' ? (
                        <div className="space-y-2">
                          <ImageUpload label="Upload Image" onUploaded={(url) => updateBlock(idx, { url })} />
                          <input placeholder="Or paste image URL" value={block.url || ''} onChange={(e) => updateBlock(idx, { url: e.target.value })} className={inputClass} maxLength={500} />
                          {block.url && <img src={block.url} alt="Preview" className="w-full max-h-48 object-contain rounded-md" />}
                          <input placeholder="Caption (optional)" value={block.caption || ''} onChange={(e) => updateBlock(idx, { caption: e.target.value })} className={inputClass} maxLength={200} />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input placeholder="Paste video URL (YouTube, Vimeo, etc.)" value={block.url || ''} onChange={(e) => updateBlock(idx, { url: e.target.value })} className={inputClass} maxLength={500} />
                          {block.url && <p className="text-xs text-green-600 font-medium">Video URL added</p>}
                          <input placeholder="Caption (optional)" value={block.caption || ''} onChange={(e) => updateBlock(idx, { caption: e.target.value })} className={inputClass} maxLength={200} />
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setContentBlocks(prev => [...prev, { type: 'text', value: '' }])}><Type className="h-4 w-4" /> Add Text</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setContentBlocks(prev => [...prev, { type: 'image', url: '', caption: '' }])}><ImagePlus className="h-4 w-4" /> Add Image</Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setContentBlocks(prev => [...prev, { type: 'video', url: '', caption: '' }])}><Video className="h-4 w-4" /> Add Video</Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addBlog} variant="default" size="sm" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingBlog ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingBlog ? 'Update Post' : 'Add Post'}
                  </Button>
                  {editingBlog && <Button variant="ghost" size="sm" onClick={() => { setEditingBlog(null); setBlogForm({ title: '', excerpt: '', image: '', author: 'ReFAN Team', tags: '' }); setContentBlocks([{ type: 'text', value: '' }]); }}>Cancel</Button>}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {blogs.map((b) => (
                <div key={b.id} className="bg-card rounded-lg p-4 shadow-soft flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-medium">{b.title}</h4>
                    <p className="text-xs text-muted-foreground">{b.excerpt}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => startEditBlog(b)}><Pencil className="h-4 w-4 text-blue-500" /></Button>
                    {canDeleteTab && <Button variant="ghost" size="icon" onClick={() => deleteBlog(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'gallery' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Manage Gallery</h1>
            <div className="bg-card rounded-xl p-6 shadow-soft mb-8">
              <h3 className="font-heading font-bold mb-4">Add Item</h3>
              <div className="space-y-3">
                <input placeholder="Title" value={galleryForm.title} onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })} className={inputClass} maxLength={200} />
                <ImageUpload label="Upload Photo" onUploaded={(url) => setGalleryForm({ ...galleryForm, url })} />
                <input placeholder="Or paste Image/Video URL" value={galleryForm.url} onChange={(e) => setGalleryForm({ ...galleryForm, url: e.target.value })} className={inputClass} maxLength={500} />
                <select value={galleryForm.type} onChange={(e) => setGalleryForm({ ...galleryForm, type: e.target.value as 'photo' | 'video' })} className={inputClass}>
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
                <Button onClick={addGalleryItem} variant="default" size="sm"><Plus className="h-4 w-4" /> Add Item</Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((g) => (
                <div key={g.id} className="bg-card rounded-lg shadow-soft overflow-hidden">
                  {g.url && <img src={g.url} alt={g.title} className="w-full h-32 object-cover" />}
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{g.title}</p>
                        <p className="text-xs text-muted-foreground">{g.type} • {new Date(g.date).toLocaleDateString()}</p>
                      </div>
                      {canDeleteTab && <Button variant="destructive" size="sm" className="h-7 w-7 p-0" onClick={() => deleteGalleryItem(g.id)}><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(tab === 'volunteers' || tab === 'sponsors') && (() => {
          const filterType = tab === 'sponsors' ? 'sponsor' : 'volunteer';
          const filtered = volunteers.filter(v => v.type === filterType);
          const title = tab === 'sponsors' ? 'Sponsors' : 'Volunteers';
          return (
          <div>
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
              <div>
                <h1 className="font-heading text-2xl font-bold">{title}</h1>
                <p className="text-sm text-muted-foreground">Total: {filtered.length}</p>
              </div>
              {filtered.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => exportCSV(filtered as unknown as Record<string, unknown>[], title.toLowerCase())}>
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              )}
            </div>
            {filtered.length === 0 ? <p className="text-muted-foreground">No {title.toLowerCase()} yet.</p> : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={selectedVols.size === filtered.length && filtered.length > 0} onChange={(e) => {
                      setSelectedVols(e.target.checked ? new Set(filtered.map(v => v.id)) : new Set());
                    }} className="rounded" />
                    Select All ({filtered.length})
                  </label>
                  {selectedVols.size > 0 && <span className="text-sm text-muted-foreground">{selectedVols.size} selected</span>}
                </div>
                <div className="space-y-4 mb-8">
                  {filtered.map((v) => (
                    <div key={v.id} className="bg-card rounded-lg p-5 shadow-soft">
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={selectedVols.has(v.id)} onChange={(e) => {
                          const next = new Set(selectedVols);
                          if (e.target.checked) next.add(v.id); else next.delete(v.id);
                          setSelectedVols(next);
                        }} className="rounded mt-1" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">{v.name}</span>
                            <span className="text-xs text-muted-foreground">{new Date(v.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{v.email} {v.phone && `• ${v.phone}`}</p>
                          {v.country && <p className="text-sm text-muted-foreground">Country: {v.country}</p>}
                          {v.message && <p className="text-sm mt-2 text-muted-foreground whitespace-pre-line">{v.message}</p>}
                        </div>
                        {canDeleteTab && <Button variant="destructive" size="sm" className="shrink-0" onClick={async () => {
                          if (!confirm(`Delete ${v.name}?`)) return;
                          await store.deleteVolunteer(v.id);
                          setVolunteers(await store.getVolunteers());
                          toast({ title: "Deleted" });
                        }}><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedVols.size > 0 && (
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <h3 className="font-heading font-bold mb-4">Send Email to {selectedVols.size} {title.toLowerCase()}</h3>
                    <div className="space-y-3">
                      <input placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className={inputClass} maxLength={200} />
                      <textarea placeholder="Write your message here..." value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={6} className={inputClass + " resize-none"} maxLength={5000} />
                      <div className="flex gap-2">
                        <Button variant="default" size="sm" disabled={!emailSubject.trim() || !emailBody.trim() || sendingEmail} onClick={() => {
                          const emails = filtered.filter(v => selectedVols.has(v.id)).map(v => v.email).filter(Boolean);
                          sendEmail(emails, emailSubject, emailBody);
                        }}>
                          <Send className="h-4 w-4" /> {sendingEmail ? 'Sending...' : 'Send Direct'}
                        </Button>
                        <Button variant="outline" size="sm" disabled={!emailSubject.trim() || !emailBody.trim()} onClick={() => {
                          const emails = filtered.filter(v => selectedVols.has(v.id)).map(v => v.email).filter(Boolean);
                          openInGmail(emails, emailSubject, emailBody);
                        }}>
                          <Mail className="h-4 w-4" /> Open in Gmail
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          );
        })()}

        {tab === 'donations' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-heading text-2xl font-bold">Donation Requests</h1>
              {donations.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => exportCSV(donations as unknown as Record<string, unknown>[], "donations")}>
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              )}
            </div>
            {donations.length === 0 ? <p className="text-muted-foreground">No donations yet.</p> : (
              <>
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={selectedDonors.size === donations.length && donations.length > 0} onChange={(e) => {
                    setSelectedDonors(e.target.checked ? new Set(donations.map(d => d.id)) : new Set());
                  }} className="rounded" />
                  Select All ({donations.length})
                </label>
                {selectedDonors.size > 0 && <span className="text-sm text-muted-foreground">{selectedDonors.size} selected</span>}
              </div>
              <div className="space-y-4 mb-8">
                {donations.map((d) => (
                  <div key={d.id} className="bg-card rounded-lg p-5 shadow-soft">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selectedDonors.has(d.id)} onChange={(e) => {
                        const next = new Set(selectedDonors);
                        if (e.target.checked) next.add(d.id); else next.delete(d.id);
                        setSelectedDonors(next);
                      }} className="rounded mt-1" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">{d.name}</span>
                          <span className="text-xs text-muted-foreground">{new Date(d.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{d.email}</p>
                        <p className="text-sm mt-1"><span className="font-medium">{d.currency || 'USD'}</span> <span className="font-bold text-primary">{d.amount}</span></p>
                        {d.message && <p className="text-sm mt-2 text-muted-foreground whitespace-pre-line">{d.message}</p>}
                      </div>
                      {canDeleteTab && <Button variant="destructive" size="sm" className="shrink-0" onClick={async () => {
                        if (!confirm(`Delete donation from ${d.name}?`)) return;
                        await store.deleteDonation(d.id);
                        setDonations(await store.getDonations());
                        toast({ title: "Donation deleted" });
                      }}><Trash2 className="h-4 w-4" /></Button>}
                    </div>
                  </div>
                ))}
              </div>
              {selectedDonors.size > 0 && (
                <div className="bg-card rounded-xl p-6 shadow-soft mt-6">
                  <h3 className="font-heading font-bold mb-4">Send Email to {selectedDonors.size} donor{selectedDonors.size > 1 ? 's' : ''}</h3>
                  <div className="space-y-3">
                    <input placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className={inputClass} maxLength={200} />
                    <textarea placeholder="Write your message here..." value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={6} className={inputClass + " resize-none"} maxLength={5000} />
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" disabled={!emailSubject.trim() || !emailBody.trim() || sendingEmail} onClick={() => {
                        const emails = donations.filter(d => selectedDonors.has(d.id)).map(d => d.email).filter(Boolean);
                        sendEmail(emails, emailSubject, emailBody);
                      }}>
                        <Send className="h-4 w-4" /> {sendingEmail ? 'Sending...' : 'Send Direct'}
                      </Button>
                      <Button variant="outline" size="sm" disabled={!emailSubject.trim() || !emailBody.trim()} onClick={() => {
                        const emails = donations.filter(d => selectedDonors.has(d.id)).map(d => d.email).filter(Boolean);
                        openInGmail(emails, emailSubject, emailBody);
                      }}>
                        <Mail className="h-4 w-4" /> Open in Gmail
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        )}

        {tab === 'messages' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-heading text-2xl font-bold">Contact Messages</h1>
              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => exportCSV(messages as unknown as Record<string, unknown>[], "contact_messages")}>
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              )}
            </div>
            {messages.length === 0 ? <p className="text-muted-foreground">No messages yet.</p> : (
              <>
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={selectedMsgs.size === messages.length && messages.length > 0} onChange={(e) => {
                    setSelectedMsgs(e.target.checked ? new Set(messages.map(m => m.id)) : new Set());
                  }} className="rounded" />
                  Select All ({messages.length})
                </label>
                {selectedMsgs.size > 0 && <span className="text-sm text-muted-foreground">{selectedMsgs.size} selected</span>}
              </div>
              <div className="space-y-4 mb-8">
                {messages.map((m) => (
                  <div key={m.id} className="bg-card rounded-lg p-5 shadow-soft">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selectedMsgs.has(m.id)} onChange={(e) => {
                        const next = new Set(selectedMsgs);
                        if (e.target.checked) next.add(m.id); else next.delete(m.id);
                        setSelectedMsgs(next);
                      }} className="rounded mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-sm text-muted-foreground">{m.email}</span>
                        </div>
                        <p className="text-sm font-medium text-primary mb-1">{m.subject}</p>
                        <p className="text-sm text-muted-foreground">{m.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(m.date).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Open in Gmail" onClick={() => {
                          openInGmail([m.email], `Re: ${m.subject}`, '');
                        }}><Mail className="h-4 w-4 text-blue-500" /></Button>
                        {canDeleteTab && <Button variant="ghost" size="icon" onClick={async () => {
                          if (!confirm("Are you sure you want to delete this message?")) return;
                          await store.deleteMessage(m.id);
                          setMessages(await store.getMessages());
                          const next = new Set(selectedMsgs); next.delete(m.id); setSelectedMsgs(next);
                          toast({ title: "Message deleted" });
                        }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedMsgs.size > 0 && (
                <div className="bg-card rounded-xl p-6 shadow-soft">
                  <h3 className="font-heading font-bold mb-4">Reply to {selectedMsgs.size} message{selectedMsgs.size > 1 ? 's' : ''}</h3>
                  <div className="space-y-3">
                    <input placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className={inputClass} maxLength={200} />
                    <textarea placeholder="Write your reply..." value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={6} className={inputClass + " resize-none"} maxLength={5000} />
                    <div className="flex gap-2">
                      <Button variant="default" size="sm" disabled={!emailSubject.trim() || !emailBody.trim() || sendingEmail} onClick={() => {
                        const emails = messages.filter(m => selectedMsgs.has(m.id)).map(m => m.email).filter(Boolean);
                        sendEmail(emails, emailSubject, emailBody);
                      }}>
                        <Send className="h-4 w-4" /> {sendingEmail ? 'Sending...' : 'Send Direct'}
                      </Button>
                      <Button variant="outline" size="sm" disabled={!emailSubject.trim() || !emailBody.trim()} onClick={() => {
                        const emails = messages.filter(m => selectedMsgs.has(m.id)).map(m => m.email).filter(Boolean);
                        openInGmail(emails, emailSubject, emailBody);
                      }}>
                        <Mail className="h-4 w-4" /> Open in Gmail
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              </>
            )}
          </div>
        )}

        {tab === 'subscribers' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-heading text-2xl font-bold">Newsletter Subscribers</h1>
              <div className="flex gap-2">
                {subscribers.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => exportCSV(subscribers as unknown as Record<string, unknown>[], "subscribers")}>
                    <Download className="h-4 w-4" /> Export CSV
                  </Button>
                )}
              </div>
            </div>

            {subscribers.length === 0 ? <p className="text-muted-foreground">No subscribers yet.</p> : (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSubs.size === subscribers.length && subscribers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubs(new Set(subscribers.map(s => s.id)));
                        } else {
                          setSelectedSubs(new Set());
                        }
                      }}
                      className="rounded"
                    />
                    Select All ({subscribers.length})
                  </label>
                  {selectedSubs.size > 0 && (
                    <span className="text-sm text-muted-foreground">{selectedSubs.size} selected</span>
                  )}
                </div>

                <div className="space-y-2 mb-8">
                  {subscribers.map((s) => (
                    <div key={s.id} className="bg-card rounded-lg p-4 shadow-soft flex items-center justify-between gap-4">
                      <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={selectedSubs.has(s.id)}
                          onChange={(e) => {
                            const next = new Set(selectedSubs);
                            if (e.target.checked) next.add(s.id);
                            else next.delete(s.id);
                            setSelectedSubs(next);
                          }}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">{s.email}</span>
                        <span className="text-xs text-muted-foreground">{new Date(s.date).toLocaleDateString()}</span>
                      </label>
                      {canDeleteTab && <Button variant="ghost" size="icon" onClick={async () => {
                        if (!confirm("Are you sure you want to remove this subscriber?")) return;
                        await store.deleteSubscriber(s.id);
                        setSubscribers(await store.getSubscribers());
                        const next = new Set(selectedSubs);
                        next.delete(s.id);
                        setSelectedSubs(next);
                        toast({ title: "Subscriber removed" });
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>}
                    </div>
                  ))}
                </div>

                {selectedSubs.size > 0 && (
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <h3 className="font-heading font-bold mb-4">Compose Email to {selectedSubs.size} subscriber{selectedSubs.size > 1 ? 's' : ''}</h3>
                    <div className="space-y-3">
                      <input placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className={inputClass} maxLength={200} />
                      <textarea placeholder="Write your message here..." value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={6} className={inputClass + " resize-none"} maxLength={5000} />
                      <div className="flex gap-2">
                        <Button variant="default" size="sm" disabled={!emailSubject.trim() || !emailBody.trim() || sendingEmail} onClick={() => {
                          const selectedEmails = subscribers.filter(s => selectedSubs.has(s.id)).map(s => s.email);
                          sendEmail(selectedEmails, emailSubject, emailBody);
                        }}>
                          <Send className="h-4 w-4" /> {sendingEmail ? 'Sending...' : 'Send Direct'}
                        </Button>
                        <Button variant="outline" size="sm" disabled={!emailSubject.trim() || !emailBody.trim()} onClick={() => {
                          const selectedEmails = subscribers.filter(s => selectedSubs.has(s.id)).map(s => s.email);
                          openInGmail(selectedEmails, emailSubject, emailBody);
                        }}>
                          <Mail className="h-4 w-4" /> Open in Gmail
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab === 'footer' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Footer Settings</h1>
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <p className="text-sm text-muted-foreground mb-6">Edit the contact information and description shown in the website footer.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Description</label>
                  <RichTextEditor value={footerForm.description} onChange={(v) => setFooterForm({ ...footerForm, description: v })} placeholder="Footer description..." rows={3} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Email</label>
                  <input value={footerForm.email} onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })} className={inputClass} maxLength={100} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                  <input value={footerForm.phone} onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })} className={inputClass} maxLength={50} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Address</label>
                  <input value={footerForm.address} onChange={(e) => setFooterForm({ ...footerForm, address: e.target.value })} className={inputClass} maxLength={200} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">WhatsApp Number (no + or spaces, e.g. 265997561852)</label>
                  <input value={footerForm.whatsapp} onChange={(e) => setFooterForm({ ...footerForm, whatsapp: e.target.value })} className={inputClass} maxLength={20} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">LinkedIn URL</label>
                  <input value={footerForm.linkedin} onChange={(e) => setFooterForm({ ...footerForm, linkedin: e.target.value })} className={inputClass} maxLength={300} />
                </div>
                <Button variant="default" size="sm" disabled={saving} onClick={async () => {
                  setSaving(true);
                  const ok = await store.saveFooterSettings(footerForm);
                  setSaving(false);
                  toast({ title: ok ? "Footer settings saved!" : "Failed to save" });
                }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Footer Settings
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === 'hero' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Hero Settings</h1>
            <div className="bg-card rounded-xl p-6 shadow-soft">
              <p className="text-sm text-muted-foreground mb-6">Change the hero image and text on the home page.</p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Hero Image</label>
                  {heroForm.heroImage && (
                    <img src={heroForm.heroImage} alt="Hero preview" className="w-full max-h-48 object-contain rounded-lg border border-border mb-2 bg-muted" />
                  )}
                  <ImageUpload label="Upload Hero Image" onUploaded={(url) => setHeroForm({ ...heroForm, heroImage: url })} />
                  <p className="text-xs text-muted-foreground mt-1">Or enter a URL manually:</p>
                  <input value={heroForm.heroImage} onChange={(e) => setHeroForm({ ...heroForm, heroImage: e.target.value })} className={inputClass} placeholder="/refan_give.jpg or https://..." maxLength={500} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Tagline (large text at top)</label>
                  <RichTextEditor value={heroForm.tagline} onChange={(v) => setHeroForm({ ...heroForm, tagline: v })} placeholder="Tagline..." rows={2} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Title</label>
                  <RichTextEditor value={heroForm.title} onChange={(v) => setHeroForm({ ...heroForm, title: v })} placeholder="Title..." rows={2} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Subtitle</label>
                  <RichTextEditor value={heroForm.subtitle} onChange={(v) => setHeroForm({ ...heroForm, subtitle: v })} placeholder="Subtitle..." rows={3} />
                </div>
                <Button variant="default" size="sm" disabled={saving} onClick={async () => {
                  setSaving(true);
                  const ok = await store.saveHeroSettings(heroForm);
                  setSaving(false);
                  toast({ title: ok ? "Hero settings saved!" : "Failed to save" });
                }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Hero Settings
                </Button>
              </div>
            </div>
          </div>
        )}

        {tab === 'site' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Site Settings</h1>
            <div className="bg-card rounded-xl p-6 shadow-soft space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div>
                  <h3 className="font-bold text-sm">Maintenance Mode</h3>
                  <p className="text-xs text-muted-foreground">When enabled, visitors see a maintenance page. Only you (admin) can access the site.</p>
                </div>
                <button
                  onClick={() => setSiteForm({ ...siteForm, maintenanceMode: !siteForm.maintenanceMode })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${siteForm.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${siteForm.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              {siteForm.maintenanceMode && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Maintenance Message (shown to visitors)</label>
                  <RichTextEditor value={siteForm.maintenanceMessage} onChange={(v) => setSiteForm({ ...siteForm, maintenanceMessage: v })} placeholder="We are currently updating our website..." rows={3} />
                </div>
              )}
              <Button variant="default" size="sm" disabled={saving} onClick={async () => {
                setSaving(true);
                const ok = await store.saveSiteSettings(siteForm);
                setSaving(false);
                toast({ title: ok ? "Site settings saved!" : "Failed to save" });
              }}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Site Settings
              </Button>
            </div>
          </div>
        )}

        {tab === 'pages' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-4">Edit Page Content</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              {([['home', 'Home Page'], ['programs', 'Programs'], ['stories', 'Stories'], ['gallery', 'Gallery'], ['blog', 'Blog'], ['getinvolved', 'Get Involved'], ['about', 'About'], ['contact', 'Contact'], ['donate', 'Donate']] as const).map(([k, l]) => (
                <button key={k} onClick={() => setPageTab(k)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pageTab === k ? 'bg-primary text-white' : 'bg-card border border-border hover:bg-accent'}`}>{l}</button>
              ))}
            </div>

            {pageTab === 'about' && (
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="font-bold">About Page</h3>
                <div><label className="text-xs font-semibold text-muted-foreground">Hero Title</label>
                  <RichTextEditor value={aboutForm.heroTitle} onChange={(v) => setAboutForm({ ...aboutForm, heroTitle: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Hero Subtitle</label>
                  <RichTextEditor value={aboutForm.heroSubtitle} onChange={(v) => setAboutForm({ ...aboutForm, heroSubtitle: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Hero Background Image</label>
                  <ImageUpload label="Upload" onUploaded={(url) => setAboutForm({ ...aboutForm, heroImage: url })} />
                  <input value={aboutForm.heroImage} onChange={(e) => setAboutForm({ ...aboutForm, heroImage: e.target.value })} className={inputClass} placeholder="URL or leave empty for default" /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Who We Are Title</label>
                  <RichTextEditor value={aboutForm.whoWeAreTitle} onChange={(v) => setAboutForm({ ...aboutForm, whoWeAreTitle: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Who We Are Body</label>
                  <RichTextEditor value={aboutForm.whoWeAreBody} onChange={(v) => setAboutForm({ ...aboutForm, whoWeAreBody: v })} rows={4} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Team Photo</label>
                  <ImageUpload label="Upload" onUploaded={(url) => setAboutForm({ ...aboutForm, whoWeAreImage1: url })} />
                  <input value={aboutForm.whoWeAreImage1} onChange={(e) => setAboutForm({ ...aboutForm, whoWeAreImage1: e.target.value })} className={inputClass} placeholder="URL or leave empty for default" /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Founder Photo</label>
                  <ImageUpload label="Upload" onUploaded={(url) => setAboutForm({ ...aboutForm, whoWeAreImage2: url })} />
                  <input value={aboutForm.whoWeAreImage2} onChange={(e) => setAboutForm({ ...aboutForm, whoWeAreImage2: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Mission Quote</label>
                  <input value={aboutForm.missionQuote} onChange={(e) => setAboutForm({ ...aboutForm, missionQuote: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Mission Body</label>
                  <RichTextEditor value={aboutForm.missionBody} onChange={(v) => setAboutForm({ ...aboutForm, missionBody: v })} rows={3} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">CTA Heading</label>
                  <RichTextEditor value={aboutForm.ctaHeading} onChange={(v) => setAboutForm({ ...aboutForm, ctaHeading: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">CTA Body</label>
                  <RichTextEditor value={aboutForm.ctaBody} onChange={(v) => setAboutForm({ ...aboutForm, ctaBody: v })} rows={3} /></div>
                <h4 className="font-bold text-sm mt-4">Leaders / Board Section</h4>
                <div><label className="text-xs font-semibold text-muted-foreground">Section Heading</label>
                  <RichTextEditor value={aboutForm.leadersHeading} onChange={(v) => setAboutForm({ ...aboutForm, leadersHeading: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Section Subtitle</label>
                  <RichTextEditor value={aboutForm.leadersSubtitle} onChange={(v) => setAboutForm({ ...aboutForm, leadersSubtitle: v })} rows={2} /></div>
                {aboutForm.leaders.map((l, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Name" value={l.name} onChange={(e) => { const arr = [...aboutForm.leaders]; arr[i] = { ...l, name: e.target.value }; setAboutForm({ ...aboutForm, leaders: arr }); }} className={inputClass} />
                      <input placeholder="Title" value={l.title} onChange={(e) => { const arr = [...aboutForm.leaders]; arr[i] = { ...l, title: e.target.value }; setAboutForm({ ...aboutForm, leaders: arr }); }} className={inputClass} />
                    </div>
                    <input placeholder="Quote" value={l.quote} onChange={(e) => { const arr = [...aboutForm.leaders]; arr[i] = { ...l, quote: e.target.value }; setAboutForm({ ...aboutForm, leaders: arr }); }} className={inputClass} />
                    <input placeholder="Email" value={l.email} onChange={(e) => { const arr = [...aboutForm.leaders]; arr[i] = { ...l, email: e.target.value }; setAboutForm({ ...aboutForm, leaders: arr }); }} className={inputClass} />
                    <ImageUpload label="Photo" onUploaded={(url) => { const arr = [...aboutForm.leaders]; arr[i] = { ...l, image: url }; setAboutForm({ ...aboutForm, leaders: arr }); }} />
                    <input placeholder="Photo URL" value={l.image} onChange={(e) => { const arr = [...aboutForm.leaders]; arr[i] = { ...l, image: e.target.value }; setAboutForm({ ...aboutForm, leaders: arr }); }} className={inputClass} />
                    {aboutForm.leaders.length > 1 && <Button variant="destructive" size="sm" onClick={() => setAboutForm({ ...aboutForm, leaders: aboutForm.leaders.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3" /> Remove</Button>}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setAboutForm({ ...aboutForm, leaders: [...aboutForm.leaders, { name: "", title: "", quote: "", image: "", email: "" }] })}><Plus className="h-3 w-3" /> Add Leader</Button>
                <h4 className="font-bold text-sm mt-4">Values Section</h4>
                <div><label className="text-xs font-semibold text-muted-foreground">Section Heading</label>
                  <RichTextEditor value={aboutForm.valuesHeading} onChange={(v) => setAboutForm({ ...aboutForm, valuesHeading: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Section Subtitle</label>
                  <RichTextEditor value={aboutForm.valuesSubtitle} onChange={(v) => setAboutForm({ ...aboutForm, valuesSubtitle: v })} rows={2} /></div>
                {aboutForm.values.map((v, i) => (
                  <div key={i} className="flex gap-2">
                    <input placeholder="Title" value={v.title} onChange={(e) => { const arr = [...aboutForm.values]; arr[i] = { ...v, title: e.target.value }; setAboutForm({ ...aboutForm, values: arr }); }} className={inputClass} />
                    <input placeholder="Description" value={v.description} onChange={(e) => { const arr = [...aboutForm.values]; arr[i] = { ...v, description: e.target.value }; setAboutForm({ ...aboutForm, values: arr }); }} className={inputClass} />
                    {aboutForm.values.length > 1 && <Button variant="destructive" size="sm" onClick={() => setAboutForm({ ...aboutForm, values: aboutForm.values.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3" /></Button>}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setAboutForm({ ...aboutForm, values: [...aboutForm.values, { title: "", description: "" }] })}><Plus className="h-3 w-3" /> Add Value</Button>
                <Button variant="default" size="sm" disabled={saving} onClick={async () => { setSaving(true); const ok = await store.savePageSettings("about", aboutForm); setSaving(false); toast({ title: ok ? "About page saved!" : "Failed" }); }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save About Page
                </Button>
              </div>
            )}

            {pageTab === 'programs' && (
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="font-bold">Programs Page</h3>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Title</label>
                  <RichTextEditor value={programsForm.pageTitle} onChange={(v) => setProgramsForm({ ...programsForm, pageTitle: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Subtitle</label>
                  <RichTextEditor value={programsForm.pageSubtitle} onChange={(v) => setProgramsForm({ ...programsForm, pageSubtitle: v })} rows={2} /></div>
                <h4 className="font-bold text-sm">Programs</h4>
                {programsForm.programs.map((p, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-2">
                    <input placeholder="Title" value={p.title} onChange={(e) => { const arr = [...programsForm.programs]; arr[i] = { ...p, title: e.target.value }; setProgramsForm({ ...programsForm, programs: arr }); }} className={inputClass} />
                    <RichTextEditor value={p.description} onChange={(v) => { const arr = [...programsForm.programs]; arr[i] = { ...p, description: v }; setProgramsForm({ ...programsForm, programs: arr }); }} placeholder="Description" rows={3} />
                    <input placeholder="Stats (e.g. 100+ orphans supported)" value={p.stats} onChange={(e) => { const arr = [...programsForm.programs]; arr[i] = { ...p, stats: e.target.value }; setProgramsForm({ ...programsForm, programs: arr }); }} className={inputClass} />
                    <ImageUpload label="Image" onUploaded={(url) => { const arr = [...programsForm.programs]; arr[i] = { ...p, image: url }; setProgramsForm({ ...programsForm, programs: arr }); }} />
                    {p.image && <img src={p.image} alt="" className="w-full max-h-32 object-contain rounded bg-muted" />}
                    {programsForm.programs.length > 1 && <Button variant="destructive" size="sm" onClick={() => setProgramsForm({ ...programsForm, programs: programsForm.programs.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3" /> Remove</Button>}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setProgramsForm({ ...programsForm, programs: [...programsForm.programs, { title: "", description: "", stats: "", image: "" }] })}><Plus className="h-3 w-3" /> Add Program</Button>
                <Button variant="default" size="sm" disabled={saving} onClick={async () => { setSaving(true); const ok = await store.savePageSettings("programs", programsForm); setSaving(false); toast({ title: ok ? "Programs page saved!" : "Failed" }); }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Programs Page
                </Button>
              </div>
            )}

            {pageTab === 'home' && (
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="font-bold">Home Page Content</h3>
                <h4 className="font-bold text-sm">Impact Stats</h4>
                {homeForm.impactStats.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="number" placeholder="Number" value={s.number} onChange={(e) => { const arr = [...homeForm.impactStats]; arr[i] = { ...s, number: Number(e.target.value) }; setHomeForm({ ...homeForm, impactStats: arr }); }} className={inputClass + " w-24"} />
                    <input placeholder="Label" value={s.label} onChange={(e) => { const arr = [...homeForm.impactStats]; arr[i] = { ...s, label: e.target.value }; setHomeForm({ ...homeForm, impactStats: arr }); }} className={inputClass} />
                    <input placeholder="Suffix (+)" value={s.suffix} onChange={(e) => { const arr = [...homeForm.impactStats]; arr[i] = { ...s, suffix: e.target.value }; setHomeForm({ ...homeForm, impactStats: arr }); }} className={inputClass + " w-16"} />
                  </div>
                ))}
                <h4 className="font-bold text-sm">Home Programs</h4>
                {homeForm.programs.map((p, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                    <input placeholder="Title" value={p.title} onChange={(e) => { const arr = [...homeForm.programs]; arr[i] = { ...p, title: e.target.value }; setHomeForm({ ...homeForm, programs: arr }); }} className={inputClass} />
                    <RichTextEditor value={p.desc} onChange={(v) => { const arr = [...homeForm.programs]; arr[i] = { ...p, desc: v }; setHomeForm({ ...homeForm, programs: arr }); }} placeholder="Short description" rows={2} />
                    <ImageUpload label="Image" onUploaded={(url) => { const arr = [...homeForm.programs]; arr[i] = { ...p, image: url }; setHomeForm({ ...homeForm, programs: arr }); }} />
                  </div>
                ))}
                <h4 className="font-bold text-sm">Testimonials</h4>
                {homeForm.testimonials.map((t, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                    <textarea placeholder="Quote" value={t.quote} onChange={(e) => { const arr = [...homeForm.testimonials]; arr[i] = { ...t, quote: e.target.value }; setHomeForm({ ...homeForm, testimonials: arr }); }} className={inputClass + " resize-none"} rows={2} />
                    <div className="flex gap-2">
                      <input placeholder="Name" value={t.name} onChange={(e) => { const arr = [...homeForm.testimonials]; arr[i] = { ...t, name: e.target.value }; setHomeForm({ ...homeForm, testimonials: arr }); }} className={inputClass} />
                      <input placeholder="Role" value={t.role} onChange={(e) => { const arr = [...homeForm.testimonials]; arr[i] = { ...t, role: e.target.value }; setHomeForm({ ...homeForm, testimonials: arr }); }} className={inputClass} />
                    </div>
                    {homeForm.testimonials.length > 1 && <Button variant="destructive" size="sm" onClick={() => setHomeForm({ ...homeForm, testimonials: homeForm.testimonials.filter((_, j) => j !== i) })}><Trash2 className="h-3 w-3" /> Remove</Button>}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setHomeForm({ ...homeForm, testimonials: [...homeForm.testimonials, { quote: "", name: "", role: "" }] })}><Plus className="h-3 w-3" /> Add Testimonial</Button>
                <h4 className="font-bold text-sm">Why ReFAN Values</h4>
                {homeForm.values.map((v, i) => (
                  <div key={i} className="flex gap-2">
                    <input placeholder="Title" value={v.title} onChange={(e) => { const arr = [...homeForm.values]; arr[i] = { ...v, title: e.target.value }; setHomeForm({ ...homeForm, values: arr }); }} className={inputClass} />
                    <input placeholder="Description" value={v.desc} onChange={(e) => { const arr = [...homeForm.values]; arr[i] = { ...v, desc: e.target.value }; setHomeForm({ ...homeForm, values: arr }); }} className={inputClass} />
                  </div>
                ))}
                <h4 className="font-bold text-sm">CTA Section</h4>
                <div><label className="text-xs font-semibold text-muted-foreground">CTA Heading</label>
                  <RichTextEditor value={homeForm.ctaHeading} onChange={(v) => setHomeForm({ ...homeForm, ctaHeading: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">CTA Body</label>
                  <RichTextEditor value={homeForm.ctaBody} onChange={(v) => setHomeForm({ ...homeForm, ctaBody: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">CTA Background Image</label>
                  <ImageUpload label="Upload" onUploaded={(url) => setHomeForm({ ...homeForm, ctaImage: url })} />
                  <input value={homeForm.ctaImage} onChange={(e) => setHomeForm({ ...homeForm, ctaImage: e.target.value })} className={inputClass} /></div>
                <Button variant="default" size="sm" disabled={saving} onClick={async () => { setSaving(true); const ok = await store.savePageSettings("home", homeForm); setSaving(false); toast({ title: ok ? "Home page saved!" : "Failed" }); }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Home Page
                </Button>
              </div>
            )}

            {pageTab === 'contact' && (
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="font-bold">Contact Page</h3>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Title</label>
                  <RichTextEditor value={contactForm2.pageTitle} onChange={(v) => setContactForm2({ ...contactForm2, pageTitle: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Subtitle</label>
                  <RichTextEditor value={contactForm2.pageSubtitle} onChange={(v) => setContactForm2({ ...contactForm2, pageSubtitle: v })} rows={2} /></div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="text-xs font-semibold text-muted-foreground">Email</label><input value={contactForm2.email} onChange={(e) => setContactForm2({ ...contactForm2, email: e.target.value })} className={inputClass} /></div>
                  <div><label className="text-xs font-semibold text-muted-foreground">Email Sub-text</label><input value={contactForm2.emailSub} onChange={(e) => setContactForm2({ ...contactForm2, emailSub: e.target.value })} className={inputClass} /></div>
                  <div><label className="text-xs font-semibold text-muted-foreground">Phone</label><input value={contactForm2.phone} onChange={(e) => setContactForm2({ ...contactForm2, phone: e.target.value })} className={inputClass} /></div>
                  <div><label className="text-xs font-semibold text-muted-foreground">Phone Sub-text</label><input value={contactForm2.phoneSub} onChange={(e) => setContactForm2({ ...contactForm2, phoneSub: e.target.value })} className={inputClass} /></div>
                  <div><label className="text-xs font-semibold text-muted-foreground">Location</label><input value={contactForm2.location} onChange={(e) => setContactForm2({ ...contactForm2, location: e.target.value })} className={inputClass} /></div>
                  <div><label className="text-xs font-semibold text-muted-foreground">Location Sub-text</label><input value={contactForm2.locationSub} onChange={(e) => setContactForm2({ ...contactForm2, locationSub: e.target.value })} className={inputClass} /></div>
                </div>
                <Button variant="default" size="sm" disabled={saving} onClick={async () => { setSaving(true); const ok = await store.savePageSettings("contact", contactForm2); setSaving(false); toast({ title: ok ? "Contact page saved!" : "Failed" }); }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Contact Page
                </Button>
              </div>
            )}

            {pageTab === 'donate' && (
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="font-bold">Donate Page</h3>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Title</label>
                  <RichTextEditor value={donateForm2.pageTitle} onChange={(v) => setDonateForm2({ ...donateForm2, pageTitle: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Subtitle</label>
                  <RichTextEditor value={donateForm2.pageSubtitle} onChange={(v) => setDonateForm2({ ...donateForm2, pageSubtitle: v })} rows={3} /></div>
                <Button variant="default" size="sm" disabled={saving} onClick={async () => { setSaving(true); const ok = await store.savePageSettings("donate", donateForm2); setSaving(false); toast({ title: ok ? "Donate page saved!" : "Failed" }); }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Donate Page
                </Button>
              </div>
            )}

            {pageTab === 'getinvolved' && (
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="font-bold">Get Involved Page</h3>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Title</label>
                  <RichTextEditor value={giForm.pageTitle} onChange={(v) => setGiForm({ ...giForm, pageTitle: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Subtitle</label>
                  <RichTextEditor value={giForm.pageSubtitle} onChange={(v) => setGiForm({ ...giForm, pageSubtitle: v })} rows={2} /></div>
                <h4 className="font-bold text-sm">Ways to Get Involved</h4>
                {giForm.ways.map((w, i) => (
                  <div key={i} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="flex gap-2">
                      <input placeholder="Title" value={w.title} onChange={(e) => { const arr = [...giForm.ways]; arr[i] = { ...w, title: e.target.value }; setGiForm({ ...giForm, ways: arr }); }} className={inputClass} />
                      <input placeholder="CTA button" value={w.cta} onChange={(e) => { const arr = [...giForm.ways]; arr[i] = { ...w, cta: e.target.value }; setGiForm({ ...giForm, ways: arr }); }} className={inputClass + " w-40"} />
                    </div>
                    <textarea placeholder="Description" value={w.desc} onChange={(e) => { const arr = [...giForm.ways]; arr[i] = { ...w, desc: e.target.value }; setGiForm({ ...giForm, ways: arr }); }} className={inputClass + " resize-none"} rows={2} />
                  </div>
                ))}
                <Button variant="default" size="sm" disabled={saving} onClick={async () => { setSaving(true); const ok = await store.savePageSettings("getinvolved", giForm); setSaving(false); toast({ title: ok ? "Get Involved page saved!" : "Failed" }); }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Get Involved Page
                </Button>
              </div>
            )}
            {pageTab === 'stories' && (
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="font-bold">Stories & Announcements Page</h3>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Title</label>
                  <RichTextEditor value={storiesPageForm.pageTitle} onChange={(v) => setStoriesPageForm({ ...storiesPageForm, pageTitle: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Subtitle</label>
                  <RichTextEditor value={storiesPageForm.pageSubtitle} onChange={(v) => setStoriesPageForm({ ...storiesPageForm, pageSubtitle: v })} rows={2} /></div>
                <Button variant="default" size="sm" disabled={saving} onClick={async () => { setSaving(true); const ok = await store.savePageSettings("storiespage", storiesPageForm); setSaving(false); toast({ title: ok ? "Stories page saved!" : "Failed" }); }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Stories Page
                </Button>
              </div>
            )}
            {pageTab === 'gallery' && (
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="font-bold">Gallery Page</h3>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Title</label>
                  <RichTextEditor value={galleryPageForm.pageTitle} onChange={(v) => setGalleryPageForm({ ...galleryPageForm, pageTitle: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Subtitle</label>
                  <RichTextEditor value={galleryPageForm.pageSubtitle} onChange={(v) => setGalleryPageForm({ ...galleryPageForm, pageSubtitle: v })} rows={2} /></div>
                <Button variant="default" size="sm" disabled={saving} onClick={async () => { setSaving(true); const ok = await store.savePageSettings("gallerypage", galleryPageForm); setSaving(false); toast({ title: ok ? "Gallery page saved!" : "Failed" }); }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Gallery Page
                </Button>
              </div>
            )}
            {pageTab === 'blog' && (
              <div className="bg-card rounded-xl p-6 shadow-soft space-y-4">
                <h3 className="font-bold">Blog & News Page</h3>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Title</label>
                  <RichTextEditor value={blogPageForm.pageTitle} onChange={(v) => setBlogPageForm({ ...blogPageForm, pageTitle: v })} rows={2} /></div>
                <div><label className="text-xs font-semibold text-muted-foreground">Page Subtitle</label>
                  <RichTextEditor value={blogPageForm.pageSubtitle} onChange={(v) => setBlogPageForm({ ...blogPageForm, pageSubtitle: v })} rows={2} /></div>
                <Button variant="default" size="sm" disabled={saving} onClick={async () => { setSaving(true); const ok = await store.savePageSettings("blogpage", blogPageForm); setSaving(false); toast({ title: ok ? "Blog page saved!" : "Failed" }); }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Blog Page
                </Button>
              </div>
            )}
          </div>
        )}
        {tab === 'admins' && isSuperAdmin && (() => {
          const ALL_TABS: { id: string; label: string }[] = [
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'members', label: 'Members' },
            { id: 'announcements', label: 'Announcements' },
            { id: 'stories', label: 'Stories' },
            { id: 'blogs', label: 'Blog Posts' },
            { id: 'gallery', label: 'Gallery' },
            { id: 'volunteers', label: 'Volunteers' },
            { id: 'sponsors', label: 'Sponsors' },
            { id: 'donations', label: 'Donations' },
            { id: 'subscribers', label: 'Subscribers' },
            { id: 'messages', label: 'Messages' },
            { id: 'footer', label: 'Footer Settings' },
            { id: 'hero', label: 'Hero Settings' },
            { id: 'pages', label: 'Page Content' },
            { id: 'site', label: 'Site Settings' },
          ];

          const generateToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
          const generatePassword = () => {
            const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
            let pw = '';
            for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
            return pw;
          };

          const resetForm = () => {
            setSubAdminForm({ name: '', username: '', email: '', permissions: {}, allowDelete: {}, hideExistingData: {} });
            setEditingSubAdmin(null);
          };

          const saveSubAdmin = async () => {
            if (!subAdminForm.name.trim() || !subAdminForm.username.trim() || !subAdminForm.email.trim()) {
              toast({ title: "Name, username, and email are required", variant: "destructive" });
              return;
            }
            setSaving(true);
            if (editingSubAdmin) {
              await store.updateSubAdmin(editingSubAdmin, {
                name: subAdminForm.name,
                username: subAdminForm.username,
                email: subAdminForm.email.toLowerCase(),
                permissions: subAdminForm.permissions,
                allowDelete: subAdminForm.allowDelete,
                hideExistingData: subAdminForm.hideExistingData,
              });
              toast({ title: "Sub-admin updated!" });
            } else {
              const token = generateToken();
              const password = generatePassword();
              const result = await store.addSubAdmin({
                name: subAdminForm.name,
                username: subAdminForm.username,
                email: subAdminForm.email.toLowerCase(),
                token,
                password,
                active: true,
                permissions: subAdminForm.permissions,
                allowDelete: subAdminForm.allowDelete,
                hideExistingData: subAdminForm.hideExistingData,
                createdAt: new Date().toISOString(),
              });
              if (result) {
                toast({ title: `Sub-admin created! Password: ${password}` });
              }
            }
            setSubAdmins(await store.getSubAdmins());
            resetForm();
            setSaving(false);
          };

          const copyLink = (sa: SubAdmin) => {
            const link = `${window.location.origin}${window.location.pathname}#/admin-access/${sa.token}`;
            navigator.clipboard.writeText(link);
            toast({ title: "Link copied!" });
          };

          const copyPassword = (pw: string) => {
            navigator.clipboard.writeText(pw);
            toast({ title: "Password copied!" });
          };

          const generateCredentials = async (sa: SubAdmin) => {
            const token = generateToken();
            const password = generatePassword();
            await store.updateSubAdmin(sa.id, { token, password });
            setSubAdmins(await store.getSubAdmins());
            toast({ title: `Generated! Password: ${password}` });
          };

          const toggleActive = async (sa: SubAdmin) => {
            const isActive = sa.active !== false;
            await store.updateSubAdmin(sa.id, { active: !isActive });
            setSubAdmins(await store.getSubAdmins());
            toast({ title: isActive ? "Access disabled" : "Access enabled" });
          };

          const startEdit = (sa: SubAdmin) => {
            setSubAdminForm({ name: sa.name, username: sa.username || '', email: sa.email || '', permissions: { ...sa.permissions }, allowDelete: { ...(sa.allowDelete || {}) }, hideExistingData: { ...sa.hideExistingData } });
            setEditingSubAdmin(sa.id);
          };

          const deleteSA = async (id: string) => {
            if (!confirm("Delete this sub-admin?")) return;
            await store.deleteSubAdmin(id);
            setSubAdmins(await store.getSubAdmins());
            toast({ title: "Sub-admin deleted" });
          };

          const setPerm = (tabId: string, perm: TabPermission) => {
            setSubAdminForm(prev => ({ ...prev, permissions: { ...prev.permissions, [tabId]: perm } }));
          };

          const toggleDelete = (tabId: string) => {
            setSubAdminForm(prev => ({ ...prev, allowDelete: { ...prev.allowDelete, [tabId]: !prev.allowDelete[tabId] } }));
          };

          const toggleHide = (tabId: string) => {
            setSubAdminForm(prev => ({ ...prev, hideExistingData: { ...prev.hideExistingData, [tabId]: !prev.hideExistingData[tabId] } }));
          };

          return (
            <div>
              <h1 className="font-heading text-2xl font-bold mb-8">Manage Sub-Admins</h1>
              <div className="bg-card rounded-xl p-6 shadow-soft mb-8">
                <h3 className="font-heading font-bold mb-4">{editingSubAdmin ? 'Edit Sub-Admin' : 'Add New Sub-Admin'}</h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-3">
                    <input placeholder="Full Name" value={subAdminForm.name} onChange={(e) => setSubAdminForm({ ...subAdminForm, name: e.target.value })} className={inputClass} />
                    <input placeholder="Username" value={subAdminForm.username} onChange={(e) => setSubAdminForm({ ...subAdminForm, username: e.target.value })} className={inputClass} />
                    <input placeholder="Email" type="email" value={subAdminForm.email} onChange={(e) => setSubAdminForm({ ...subAdminForm, email: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold mb-3">Tab Permissions</h4>
                    <div className="border border-border rounded-lg overflow-hidden">
                      <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-0 text-xs font-semibold bg-muted px-3 py-2">
                        <span>Section</span>
                        <span className="w-16 text-center">Hidden</span>
                        <span className="w-16 text-center">View</span>
                        <span className="w-16 text-center">Edit</span>
                        <span className="w-16 text-center">Full</span>
                        <span className="w-16 text-center">Delete</span>
                        <span className="w-20 text-center">Hide Data</span>
                      </div>
                      {ALL_TABS.map((t) => {
                        const perm = subAdminForm.permissions[t.id] || 'hidden';
                        const allowDel = subAdminForm.allowDelete[t.id] || false;
                        const hideData = subAdminForm.hideExistingData[t.id] || false;
                        return (
                          <div key={t.id} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-0 px-3 py-2 border-t border-border items-center text-sm">
                            <span className="font-medium">{t.label}</span>
                            {(['hidden', 'view', 'edit', 'full'] as TabPermission[]).map(p => (
                              <label key={p} className="w-16 flex justify-center cursor-pointer">
                                <input type="radio" name={`perm-${t.id}`} checked={perm === p} onChange={() => setPerm(t.id, p)} className="accent-primary" />
                              </label>
                            ))}
                            <label className="w-16 flex justify-center cursor-pointer">
                              <input type="checkbox" checked={perm === 'full' || allowDel} onChange={() => toggleDelete(t.id)} disabled={perm === 'hidden' || perm === 'full'} className="accent-destructive" />
                            </label>
                            <label className="w-20 flex justify-center cursor-pointer">
                              <input type="checkbox" checked={hideData} onChange={() => toggleHide(t.id)} disabled={perm === 'hidden'} className="accent-primary" />
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <strong>Hidden</strong> = tab not visible. <strong>View</strong> = can see data only. <strong>Edit</strong> = can add & edit. <strong>Full</strong> = can add, edit & delete. <strong>Delete</strong> = allow delete (separate from Full). <strong>Hide Data</strong> = cannot see existing records.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveSubAdmin} variant="default" size="sm" disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingSubAdmin ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      {editingSubAdmin ? 'Update' : 'Add Sub-Admin'}
                    </Button>
                    {editingSubAdmin && <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>}
                  </div>
                </div>
              </div>

              {subAdmins.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No sub-admins yet. Add one above.</p>
              ) : (
                <div className="space-y-3">
                  {subAdmins.map((sa) => {
                    const permCount = Object.values(sa.permissions).filter(p => p !== 'hidden').length;
                    const isActive = sa.active !== false;
                    return (
                      <div key={sa.id} className={`bg-card rounded-lg p-4 shadow-soft ${!isActive ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm">{sa.name}</p>
                              {!isActive && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">Disabled</span>}
                            </div>
                            <p className="text-xs text-muted-foreground">@{sa.username || '—'} · {sa.email || '—'}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Access to {permCount} section{permCount !== 1 ? 's' : ''}: {
                                Object.entries(sa.permissions)
                                  .filter(([, p]) => p !== 'hidden')
                                  .map(([k, p]) => `${k} (${p})`)
                                  .join(', ') || 'none'
                              }
                            </p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button size="sm" variant="ghost" onClick={() => copyLink(sa)} title="Copy link & password"><Link2 className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => toggleActive(sa)} title={isActive ? 'Disable access' : 'Enable access'}>
                              <Power className={`h-3.5 w-3.5 ${isActive ? 'text-green-600' : 'text-red-500'}`} />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => startEdit(sa)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteSA(sa.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          {sa.token && sa.password ? (() => {
                            const link = `${window.location.origin}${window.location.pathname}#/admin-access/${sa.token}`;
                            const msg = `Hi ${sa.name},\n\nYou have been given access to the ReFAN admin dashboard.\n\nLink: ${link}\nPassword: ${sa.password}\n\nClick the link and enter your password to sign in.`;
                            return (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground">Password:</span>
                                  <code className="bg-muted px-2 py-0.5 rounded text-foreground text-xs">{sa.password}</code>
                                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => copyPassword(sa.password)}><Copy className="h-3 w-3" /> Copy</Button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-muted-foreground">Link:</span>
                                  <span className="text-xs text-muted-foreground break-all flex-1">{link}</span>
                                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs shrink-0" onClick={() => copyLink(sa)}><Copy className="h-3 w-3" /> Copy</Button>
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { navigator.clipboard.writeText(msg); toast({ title: "Message copied!" }); }}><Copy className="h-3 w-3" /> Copy Message</Button>
                                  <a href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline" className="text-xs h-7 text-green-600 border-green-200 hover:bg-green-50"><Send className="h-3 w-3" /> WhatsApp</Button>
                                  </a>
                                  <Button size="sm" variant="outline" className="text-xs h-7" disabled={sendingEmail} onClick={() => sendEmail([sa.email], 'Your ReFAN Admin Access', msg)}>
                                    <Mail className="h-3 w-3" /> {sendingEmail ? 'Sending...' : 'Send via Email'}
                                  </Button>
                                </div>
                              </div>
                            );
                          })() : (
                            <Button size="sm" variant="outline" onClick={() => generateCredentials(sa)}>Generate Link & Password</Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {tab === 'chat' && (() => {
          const myEmail = user?.email || '';
          const senderName = isSuperAdmin ? 'Super Admin' : (subAdminProfile?.name || myEmail || 'Admin');

          // Get list of admins for DM selection
          const adminList = [
            ...(isSuperAdmin ? [] : [{ name: 'Super Admin', email: COMPANY_EMAIL }]),
            ...subAdmins.filter(sa => sa.email !== myEmail).map(sa => ({ name: sa.name, email: sa.email })),
          ];

          const sendMessage = async () => {
            const text = chatInput.trim();
            if (!text) return;
            if (chatMode === 'direct' && !dmRecipient) {
              toast({ title: "Please select a recipient", variant: "destructive" });
              return;
            }
            setChatInput('');
            try {
              const msgData: Omit<AdminChatMessage, 'id'> = {
                senderName,
                senderEmail: myEmail,
                senderRole: isSuperAdmin ? 'super_admin' : 'sub_admin',
                message: text,
                timestamp: new Date().toISOString(),
                ...(chatMode === 'direct' && dmRecipient ? { recipientEmail: dmRecipient.email, recipientName: dmRecipient.name } : {}),
              };
              const sent = await store.sendAdminMessage(msgData);
              if (sent) {
                setChatMessages(prev => [...prev, sent]);
                setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                // Also send email notification for DMs if option is checked
                if (chatMode === 'direct' && dmRecipient && sendDmEmail) {
                  sendEmail([dmRecipient.email], `Message from ${senderName}`, text);
                }
              } else {
                toast({ title: "Failed to send message. Try again.", variant: "destructive" });
                setChatInput(text);
              }
            } catch {
              toast({ title: "Failed to send message. Try again.", variant: "destructive" });
              setChatInput(text);
            }
          };

          const refreshChat = () => { store.getAdminMessages().then(setChatMessages); };

          // Filter messages based on chat mode
          const visibleMessages = chatMessages.filter(msg => {
            if (chatMode === 'group') {
              return !msg.recipientEmail; // only show group messages
            }
            // Direct messages: show only messages between me and selected recipient
            if (!dmRecipient) return false;
            return (
              (msg.senderEmail === myEmail && msg.recipientEmail === dmRecipient.email) ||
              (msg.senderEmail === dmRecipient.email && msg.recipientEmail === myEmail)
            );
          });

          return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold flex items-center gap-2"><Send className="h-5 w-5" /> Admin Chat</h2>
              <Button variant="outline" size="sm" onClick={refreshChat} className="text-xs"><Loader2 className="h-3 w-3 mr-1" /> Refresh</Button>
            </div>

            {/* Chat mode tabs */}
            <div className="flex gap-2">
              <Button variant={chatMode === 'group' ? 'default' : 'outline'} size="sm" onClick={() => { setChatMode('group'); setDmRecipient(null); }}>
                <Users className="h-4 w-4" /> Group Chat
              </Button>
              <Button variant={chatMode === 'direct' ? 'default' : 'outline'} size="sm" onClick={() => setChatMode('direct')}>
                <Mail className="h-4 w-4" /> Direct Message
              </Button>
            </div>

            {/* DM recipient selector */}
            {chatMode === 'direct' && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {adminList.length === 0 && <p className="text-sm text-muted-foreground">No other admins available</p>}
                  {adminList.map(a => (
                    <Button key={a.email} size="sm" variant={dmRecipient?.email === a.email ? 'default' : 'outline'}
                      onClick={() => setDmRecipient(dmRecipient?.email === a.email ? null : a)}
                      className="text-xs">
                      {a.name}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" checked={sendDmEmail} onChange={e => setSendDmEmail(e.target.checked)} />
                    Also send via email
                  </label>
                  {dmRecipient && (
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => openInGmail([dmRecipient.email], `Message from ${senderName}`, '')}>
                      <Mail className="h-3 w-3" /> Open in Gmail
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="bg-card rounded-xl border border-border flex flex-col" style={{ height: 'calc(100vh - 340px)', minHeight: 350 }}>
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {visibleMessages.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-10">
                    {chatMode === 'direct' && !dmRecipient ? 'Select an admin to start a conversation' : 'No messages yet. Start the conversation!'}
                  </p>
                )}
                {visibleMessages.map((msg) => {
                  const isMe = msg.senderEmail === myEmail;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {isMe && isSuperAdmin && (
                        <button onClick={async () => { await store.deleteAdminMessage(msg.id); setChatMessages(prev => prev.filter(m => m.id !== msg.id)); }} className="mr-1 text-destructive/50 hover:text-destructive self-center" title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-primary text-white rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                        <p className={`text-xs font-bold mb-0.5 ${isMe ? 'text-white/80' : 'opacity-80'}`}>
                          {msg.senderName}{isMe ? ' (You)' : ''}
                          {msg.recipientEmail && <span className="font-normal"> → {msg.recipientName || msg.recipientEmail}</span>}
                        </p>
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
              {/* Input area */}
              <div className="border-t border-border p-3 flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={chatMode === 'direct' ? `Message ${dmRecipient?.name || 'select admin...'}` : 'Type a message...'}
                  className="flex-1 px-4 py-2.5 rounded-full border border-input bg-background text-sm focus:ring-2 focus:ring-ring outline-none"
                  maxLength={2000}
                  disabled={chatMode === 'direct' && !dmRecipient}
                />
                <Button
                  size="icon"
                  className="rounded-full shrink-0 h-10 w-10"
                  disabled={!chatInput.trim() || (chatMode === 'direct' && !dmRecipient)}
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

      {/* Change Password Modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 shadow-elevated w-full max-w-md space-y-4">
            <h2 className="font-heading text-xl font-bold">Change Password</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Password</label>
              <input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <input type="password" value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
              <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className={inputClass} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="default" size="sm" onClick={async () => {
                if (pwForm.newPw !== pwForm.confirm) {
                  toast({ title: "Passwords don't match", variant: "destructive" });
                  return;
                }
                const result = await changePassword(pwForm.current, pwForm.newPw);
                if (result.error) {
                  toast({ title: result.error, variant: "destructive" });
                } else {
                  toast({ title: "Password changed successfully!" });
                  setPwForm({ current: '', newPw: '', confirm: '' });
                  setShowPasswordForm(false);
                }
              }}>
                Save Password
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowPasswordForm(false); setPwForm({ current: '', newPw: '', confirm: '' }); }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Security Question Modal */}
      {showSecurityForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-8 shadow-elevated w-full max-w-md space-y-4">
            <h2 className="font-heading text-xl font-bold">Set Security Question</h2>
            <p className="text-sm text-muted-foreground">This will be used to recover your password if you forget it.</p>
            {store.hasSecurityQuestion() && (
              <p className="text-xs text-primary">Current question: "{store.getSecurityQuestion()}"</p>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Security Question</label>
              <input value={sqForm.question} onChange={(e) => setSqForm({ ...sqForm, question: e.target.value })} className={inputClass} placeholder="e.g., What is your mother's name?" maxLength={200} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Answer</label>
              <input value={sqForm.answer} onChange={(e) => setSqForm({ ...sqForm, answer: e.target.value })} className={inputClass} placeholder="Your answer" maxLength={100} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="default" size="sm" onClick={() => {
                if (!sqForm.question.trim() || !sqForm.answer.trim()) {
                  toast({ title: "Please fill both fields", variant: "destructive" });
                  return;
                }
                store.setSecurityQuestion(sqForm.question.trim(), sqForm.answer.trim());
                toast({ title: "Security question saved!" });
                setSqForm({ question: '', answer: '' });
                setShowSecurityForm(false);
              }}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setShowSecurityForm(false); setSqForm({ question: store.getSecurityQuestion(), answer: '' }); }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
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

export default Admin;
