import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { store, type Story, type BlogPost, type GalleryItem, type NewsletterSubscriber, type ContactMessage, type Announcement, type Member } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, FileText, Image, Megaphone, Users, Heart,
  Plus, Trash2, ArrowLeft, LogOut, Download, Mail, Send, MessageSquare, KeyRound,
  UserPlus, Copy, Camera, Upload, Shield
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Tab = 'dashboard' | 'announcements' | 'stories' | 'blogs' | 'gallery' | 'volunteers' | 'donations' | 'subscribers' | 'messages' | 'members';

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
];

const Admin = () => {
  const { toast } = useToast();
  const { signOut, changePassword } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [announcements, setAnnouncements] = useState(store.getAnnouncements());
  const [stories, setStories] = useState(store.getStories());
  const [blogs, setBlogs] = useState(store.getBlogs());
  const [gallery, setGallery] = useState(store.getGallery());
  const volunteers = store.getVolunteers();
  const donations = store.getDonations();
  const [subscribers, setSubscribers] = useState(store.getSubscribers());
  const [messages, setMessages] = useState(store.getMessages());
  const [members, setMembers] = useState(store.getMembers());
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showSecurityForm, setShowSecurityForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [sqForm, setSqForm] = useState({ question: store.getSecurityQuestion(), answer: '' });
  const photoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const [storyForm, setStoryForm] = useState({ title: '', excerpt: '', content: '', category: 'story' as 'story' | 'announcement' });
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', author: 'ReFAN Team', tags: '' });
  const [galleryForm, setGalleryForm] = useState({ title: '', url: '', type: 'photo' as 'photo' | 'video' });
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', image: '' });

  const emptyMemberForm = {
    surname: '', firstName: '', otherName: '', countryOfOrigin: '', countryOfResidence: '',
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

  const addAnnouncement = () => {
    if (!announcementForm.title.trim()) return;
    store.addAnnouncement({ ...announcementForm, donationCount: 0 });
    setAnnouncements(store.getAnnouncements());
    setAnnouncementForm({ title: '', content: '', image: '' });
    toast({ title: "Announcement added!" });
  };

  const deleteAnnouncement = (id: string) => {
    store.deleteAnnouncement(id);
    setAnnouncements(store.getAnnouncements());
    toast({ title: "Announcement deleted" });
  };

  const addStory = () => {
    if (!storyForm.title.trim()) return;
    store.addStory({ ...storyForm, date: new Date().toISOString() });
    setStories(store.getStories());
    setStoryForm({ title: '', excerpt: '', content: '', category: 'story' });
    toast({ title: "Story added!" });
  };

  const deleteStory = (id: string) => {
    store.deleteStory(id);
    setStories(store.getStories());
    toast({ title: "Story deleted" });
  };

  const addBlog = () => {
    if (!blogForm.title.trim()) return;
    store.addBlog({ ...blogForm, tags: blogForm.tags.split(',').map(t => t.trim()).filter(Boolean), date: new Date().toISOString() });
    setBlogs(store.getBlogs());
    setBlogForm({ title: '', excerpt: '', content: '', author: 'ReFAN Team', tags: '' });
    toast({ title: "Blog post added!" });
  };

  const deleteBlog = (id: string) => {
    store.deleteBlog(id);
    setBlogs(store.getBlogs());
    toast({ title: "Blog post deleted" });
  };

  const addGalleryItem = () => {
    if (!galleryForm.title.trim()) return;
    store.addGalleryItem({ ...galleryForm, date: new Date().toISOString() });
    setGallery(store.getGallery());
    setGalleryForm({ title: '', url: '', type: 'photo' });
    toast({ title: "Gallery item added!" });
  };

  const deleteGalleryItem = (id: string) => {
    store.deleteGalleryItem(id);
    setGallery(store.getGallery());
    toast({ title: "Gallery item deleted" });
  };

  const addMember = () => {
    if (!memberForm.surname.trim() || !memberForm.firstName.trim()) {
      toast({ title: "Surname and First Name are required", variant: "destructive" });
      return;
    }
    const dob = memberForm.dobYear ? `${memberForm.dobYear}-${(memberForm.dobMonth || '1').padStart(2, '0')}-${(memberForm.dobDay || '1').padStart(2, '0')}` : '';
    store.addMember({
      surname: memberForm.surname.trim(), firstName: memberForm.firstName.trim(),
      otherName: memberForm.otherName.trim(), countryOfOrigin: memberForm.countryOfOrigin,
      countryOfResidence: memberForm.countryOfResidence, unhcrId: memberForm.unhcrId.trim(),
      phone: memberForm.phone.trim(), phoneCode: memberForm.phoneCode,
      gender: memberForm.gender, maritalStatus: memberForm.maritalStatus,
      dateOfBirth: dob, familySize: Number(memberForm.familySize) || 0,
      photo: memberForm.photo, document: memberForm.document,
      paymentCurrency: memberForm.paymentCurrency, paymentAmount: Number(memberForm.paymentAmount) || 0,
      registrationDate: new Date().toISOString(), expiryDate: memberForm.expiryDate,
      branchName: memberForm.branchName.trim(), username: memberForm.username.trim(),
    });
    setMembers(store.getMembers());
    setMemberForm(emptyMemberForm);
    setShowMemberForm(false);
    toast({ title: "Member registered!" });
  };

  const deleteMember = (id: string) => {
    store.deleteMember(id);
    setMembers(store.getMembers());
    toast({ title: "Member removed" });
  };

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => {
        const val = String(row[h] ?? "");
        return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportMembersCSV = () => {
    const data = members.map(m => ({
      regNumber: m.regNumber, surname: m.surname, firstName: m.firstName, otherName: m.otherName,
      countryOfOrigin: m.countryOfOrigin, countryOfResidence: m.countryOfResidence, unhcrId: m.unhcrId,
      phone: `${m.phoneCode}${m.phone}`, gender: m.gender, maritalStatus: m.maritalStatus,
      dateOfBirth: m.dateOfBirth, familySize: m.familySize, branchName: m.branchName,
      username: m.username, registrationDate: m.registrationDate, expiryDate: m.expiryDate,
    }));
    exportCSV(data as unknown as Record<string, unknown>[], "members");
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
    { id: 'donations', label: 'Donations', icon: Heart },
    { id: 'subscribers', label: 'Subscribers', icon: Mail },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none text-sm";
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
          {sidebarItems.map((item) => (
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-secondary z-50 border-t border-sidebar-border">
        <div className="flex overflow-x-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs min-w-[60px] ${
                tab === item.id ? 'text-primary' : 'text-secondary-foreground/60'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-10 pb-24 md:pb-10 overflow-auto">
        {tab === 'dashboard' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Dashboard Overview</h1>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Members', count: members.length, icon: UserPlus },
                { label: 'Stories', count: stories.length, icon: Megaphone },
                { label: 'Blog Posts', count: blogs.length, icon: FileText },
                { label: 'Gallery Items', count: gallery.length, icon: Image },
                { label: 'Volunteers', count: volunteers.length, icon: Users },
                { label: 'Subscribers', count: subscribers.length, icon: Mail },
                { label: 'Messages', count: messages.length, icon: MessageSquare },
                { label: 'Donations', count: donations.length, icon: Heart },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-6 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-heading text-3xl font-bold">{s.count}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-card rounded-xl p-6 shadow-soft">
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
                <Button variant="outline" size="sm" onClick={copyRegLink}><Copy className="h-4 w-4" /> Copy Registration Link</Button>
                <Button variant="default" size="sm" onClick={() => setShowMemberForm(!showMemberForm)}><Plus className="h-4 w-4" /> Add Member</Button>
                {members.length > 0 && (
                  <Button variant="outline" size="sm" onClick={exportMembersCSV}><Download className="h-4 w-4" /> Export CSV</Button>
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
                <input placeholder="UNHCR ID" value={memberForm.unhcrId} onChange={e => setMemberForm({ ...memberForm, unhcrId: e.target.value })} className={inputClass} maxLength={50} />
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
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input type="date" value={memberForm.expiryDate} onChange={e => setMemberForm({ ...memberForm, expiryDate: e.target.value })} className={inputClass} />
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
                  <Button onClick={addMember} size="sm"><Plus className="h-4 w-4" /> Register Member</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowMemberForm(false); setMemberForm(emptyMemberForm); }}>Cancel</Button>
                </div>
              </div>
            )}

            {/* Members Table */}
            {members.length === 0 ? <p className="text-muted-foreground">No members registered yet.</p> : (
              <div className="overflow-x-auto bg-card rounded-xl shadow-soft">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-3 px-3 font-medium text-xs">Family Size</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Country</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Names</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Reg. Number</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Profile</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Contact</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Username</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Branch</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Reg. Date</th>
                      <th className="text-left py-3 px-3 font-medium text-xs">Exp. Date</th>
                      <th className="py-3 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.id} className="border-b border-border hover:bg-muted/30">
                        <td className="py-3 px-3">{m.familySize}</td>
                        <td className="py-3 px-3 text-xs">{m.countryOfOrigin}</td>
                        <td className="py-3 px-3 font-medium">{m.firstName} {m.surname}</td>
                        <td className="py-3 px-3 text-primary font-bold">{m.regNumber}</td>
                        <td className="py-3 px-3">
                          {m.photo ? (
                            <img src={m.photo} alt={m.firstName} className="w-10 h-10 rounded-full object-cover border border-border" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-xs">{m.phoneCode}{m.phone}</td>
                        <td className="py-3 px-3 text-xs">{m.username}</td>
                        <td className="py-3 px-3 text-xs">{m.branchName}</td>
                        <td className="py-3 px-3 text-xs">{m.registrationDate ? new Date(m.registrationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : ''}</td>
                        <td className="py-3 px-3 text-xs">{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : ''}</td>
                        <td className="py-3 px-3">
                          <Button variant="ghost" size="icon" onClick={() => deleteMember(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'announcements' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Manage Announcements</h1>
            <div className="bg-card rounded-xl p-6 shadow-soft mb-8">
              <h3 className="font-heading font-bold mb-4">Add New Announcement</h3>
              <div className="space-y-3">
                <input placeholder="Title" value={announcementForm.title} onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className={inputClass} maxLength={200} />
                <textarea placeholder="Content (description)" value={announcementForm.content} onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })} rows={4} className={inputClass + " resize-none"} maxLength={5000} />
                <input placeholder="Image URL (e.g. /gallery-community.jpg)" value={announcementForm.image} onChange={(e) => setAnnouncementForm({ ...announcementForm, image: e.target.value })} className={inputClass} maxLength={500} />
                <Button onClick={addAnnouncement} variant="default" size="sm"><Plus className="h-4 w-4" /> Add Announcement</Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {announcements.map((a) => (
                <div key={a.id} className="bg-card rounded-lg p-4 shadow-soft">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      {a.image && <img src={a.image} alt={a.title} className="w-full h-32 object-cover rounded-md mb-3" />}
                      <h4 className="font-medium text-sm">{a.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{a.content.slice(0, 80)}...</p>
                      <p className="text-xs text-primary font-medium mt-2">Donations: {a.donationCount}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteAnnouncement(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'stories' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Manage Stories & Announcements</h1>
            <div className="bg-card rounded-xl p-6 shadow-soft mb-8">
              <h3 className="font-heading font-bold mb-4">Add New</h3>
              <div className="space-y-3">
                <input placeholder="Title" value={storyForm.title} onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })} className={inputClass} maxLength={200} />
                <input placeholder="Excerpt" value={storyForm.excerpt} onChange={(e) => setStoryForm({ ...storyForm, excerpt: e.target.value })} className={inputClass} maxLength={300} />
                <textarea placeholder="Content" value={storyForm.content} onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })} rows={3} className={inputClass + " resize-none"} maxLength={5000} />
                <select value={storyForm.category} onChange={(e) => setStoryForm({ ...storyForm, category: e.target.value as 'story' | 'announcement' })} className={inputClass}>
                  <option value="story">Story</option>
                  <option value="announcement">Announcement</option>
                </select>
                <Button onClick={addStory} variant="default" size="sm"><Plus className="h-4 w-4" /> Add Story</Button>
              </div>
            </div>
            <div className="space-y-3">
              {stories.map((s) => (
                <div key={s.id} className="bg-card rounded-lg p-4 shadow-soft flex justify-between items-start gap-4">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-1 ${s.category === 'story' ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary'}`}>{s.category}</span>
                    <h4 className="font-medium">{s.title}</h4>
                    <p className="text-xs text-muted-foreground">{s.excerpt}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteStory(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'blogs' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Manage Blog Posts</h1>
            <div className="bg-card rounded-xl p-6 shadow-soft mb-8">
              <h3 className="font-heading font-bold mb-4">Add New Post</h3>
              <div className="space-y-3">
                <input placeholder="Title" value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} className={inputClass} maxLength={200} />
                <input placeholder="Excerpt" value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} className={inputClass} maxLength={300} />
                <textarea placeholder="Content" value={blogForm.content} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} rows={4} className={inputClass + " resize-none"} maxLength={10000} />
                <input placeholder="Tags (comma separated)" value={blogForm.tags} onChange={(e) => setBlogForm({ ...blogForm, tags: e.target.value })} className={inputClass} maxLength={200} />
                <Button onClick={addBlog} variant="default" size="sm"><Plus className="h-4 w-4" /> Add Post</Button>
              </div>
            </div>
            <div className="space-y-3">
              {blogs.map((b) => (
                <div key={b.id} className="bg-card rounded-lg p-4 shadow-soft flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-medium">{b.title}</h4>
                    <p className="text-xs text-muted-foreground">{b.excerpt}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteBlog(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
                <input placeholder="Image/Video URL" value={galleryForm.url} onChange={(e) => setGalleryForm({ ...galleryForm, url: e.target.value })} className={inputClass} maxLength={500} />
                <select value={galleryForm.type} onChange={(e) => setGalleryForm({ ...galleryForm, type: e.target.value as 'photo' | 'video' })} className={inputClass}>
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                </select>
                <Button onClick={addGalleryItem} variant="default" size="sm"><Plus className="h-4 w-4" /> Add Item</Button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((g) => (
                <div key={g.id} className="bg-card rounded-lg p-4 shadow-soft">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{g.title}</p>
                      <p className="text-xs text-muted-foreground">{g.type} • {new Date(g.date).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteGalleryItem(g.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'volunteers' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-heading text-2xl font-bold">Volunteer & Sponsor Submissions</h1>
              {volunteers.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => exportCSV(volunteers as unknown as Record<string, unknown>[], "volunteers")}>
                  <Download className="h-4 w-4" /> Export CSV
                </Button>
              )}
            </div>
            {volunteers.length === 0 ? <p className="text-muted-foreground">No submissions yet.</p> : (
              <div className="space-y-4">
                {volunteers.map((v) => (
                  <div key={v.id} className="bg-card rounded-lg p-5 shadow-soft">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mr-2 ${v.type === 'volunteer' ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary'}`}>{v.type}</span>
                        <span className="font-medium">{v.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(v.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{v.email} {v.phone && `• ${v.phone}`}</p>
                    {v.message && <p className="text-sm mt-2 text-muted-foreground whitespace-pre-line">{v.message}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Currency</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Message</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d.id} className="border-b border-border">
                        <td className="py-3 px-4">{d.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{d.email}</td>
                        <td className="py-3 px-4">{d.currency || 'USD'}</td>
                        <td className="py-3 px-4 font-bold text-primary">{d.amount}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs max-w-[200px] truncate">{d.message || '-'}</td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(d.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <div className="space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className="bg-card rounded-lg p-5 shadow-soft">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium">{m.name}</span>
                          <span className="text-sm text-muted-foreground">{m.email}</span>
                        </div>
                        <p className="text-sm font-medium text-primary mb-1">{m.subject}</p>
                        <p className="text-sm text-muted-foreground">{m.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(m.date).toLocaleString()}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => {
                        store.deleteMessage(m.id);
                        setMessages(store.getMessages());
                        toast({ title: "Message deleted" });
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
                      <Button variant="ghost" size="icon" onClick={() => {
                        store.deleteSubscriber(s.id);
                        setSubscribers(store.getSubscribers());
                        const next = new Set(selectedSubs);
                        next.delete(s.id);
                        setSelectedSubs(next);
                        toast({ title: "Subscriber removed" });
                      }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                {selectedSubs.size > 0 && (
                  <div className="bg-card rounded-xl p-6 shadow-soft">
                    <h3 className="font-heading font-bold mb-4">Compose Email to {selectedSubs.size} subscriber{selectedSubs.size > 1 ? 's' : ''}</h3>
                    <div className="space-y-3">
                      <input placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className={inputClass} maxLength={200} />
                      <textarea placeholder="Write your message here..." value={emailBody} onChange={(e) => setEmailBody(e.target.value)} rows={6} className={inputClass + " resize-none"} maxLength={5000} />
                      <Button
                        variant="default"
                        size="sm"
                        disabled={!emailSubject.trim() || !emailBody.trim()}
                        onClick={() => {
                          const selectedEmails = subscribers.filter(s => selectedSubs.has(s.id)).map(s => s.email);
                          const mailto = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(selectedEmails.join(','))}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                          window.open(mailto, '_blank');
                        }}
                      >
                        <Send className="h-4 w-4" /> Send via Gmail
                      </Button>
                      <p className="text-xs text-muted-foreground">Opens Gmail in a new tab with selected subscribers in BCC.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
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
              <Button variant="default" size="sm" onClick={() => {
                if (pwForm.newPw !== pwForm.confirm) {
                  toast({ title: "Passwords don't match", variant: "destructive" });
                  return;
                }
                const result = changePassword(pwForm.current, pwForm.newPw);
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
    </div>
  );
};

export default Admin;
