import { useState } from "react";
import { Button } from "@/components/ui/button";
import { store, type Story, type BlogPost, type GalleryItem } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard, FileText, Image, Megaphone, Users, Heart,
  Plus, Trash2, ArrowLeft, LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Tab = 'dashboard' | 'stories' | 'blogs' | 'gallery' | 'volunteers' | 'donations';

const Admin = () => {
  const { toast } = useToast();
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stories, setStories] = useState(store.getStories());
  const [blogs, setBlogs] = useState(store.getBlogs());
  const [gallery, setGallery] = useState(store.getGallery());
  const volunteers = store.getVolunteers();
  const donations = store.getDonations();

  // Story form
  const [storyForm, setStoryForm] = useState({ title: '', excerpt: '', content: '', category: 'story' as 'story' | 'announcement' });
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', author: 'ReFAN Team', tags: '' });
  const [galleryForm, setGalleryForm] = useState({ title: '', url: '', type: 'photo' as 'photo' | 'video' });

  const addStory = () => {
    if (!storyForm.title.trim()) return;
    const item = store.addStory({ ...storyForm, date: new Date().toISOString() });
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

  const sidebarItems: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stories', label: 'Stories', icon: Megaphone },
    { id: 'blogs', label: 'Blog Posts', icon: FileText },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'volunteers', label: 'Volunteers', icon: Users },
    { id: 'donations', label: 'Donations', icon: Heart },
  ];

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none text-sm";

  return (
    <div className="flex min-h-screen bg-muted">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground flex flex-col shrink-0 hidden md:flex">
        <div className="p-6">
          <h2 className="font-heading text-xl font-extrabold"><span className="text-primary">Re</span>FAN Admin</h2>
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
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs ${
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
                { label: 'Stories', count: stories.length, icon: Megaphone },
                { label: 'Blog Posts', count: blogs.length, icon: FileText },
                { label: 'Gallery Items', count: gallery.length, icon: Image },
                { label: 'Volunteers', count: volunteers.length, icon: Users },
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
                      <span className="font-bold text-primary">${d.amount}</span>
                    </div>
                  ))}
                </div>
              )}
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
            <h1 className="font-heading text-2xl font-bold mb-8">Volunteer & Sponsor Submissions</h1>
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
                    {v.message && <p className="text-sm mt-2 text-muted-foreground">{v.message}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'donations' && (
          <div>
            <h1 className="font-heading text-2xl font-bold mb-8">Donation Records</h1>
            {donations.length === 0 ? <p className="text-muted-foreground">No donations yet.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Name</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d) => (
                      <tr key={d.id} className="border-b border-border">
                        <td className="py-3 px-4">{d.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{d.email}</td>
                        <td className="py-3 px-4 font-bold text-primary">${d.amount}</td>
                        <td className="py-3 px-4 text-muted-foreground">{new Date(d.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
