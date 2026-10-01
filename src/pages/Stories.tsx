import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { store, Story, Announcement, HomeSettings } from "@/lib/store";
import VoiceCard, { Voice, DEFAULT_VOICES, newestFirst } from "@/components/VoiceCard";
import { Calendar, X, ChevronRight, Heart } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { buildShareUrl, getSharedId, clearSharedId } from "@/lib/share";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  // YouTube
  let m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  // Vimeo
  m = url.match(/vimeo\.com\/(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  // Already an embed or direct video URL
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) return url;
  return null;
};

const STORIES_DEFAULTS = {
  pageTitle: '<span class="text-secondary">Stories</span> & <span class="text-primary">Announcements</span>',
  pageSubtitle: 'Real impact stories from the communities we serve in Dzaleka.',
};

const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

const Stories = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  // A shared testimonial that isn't on the home page (?voice=N) is shown here, under Voices.
  const [sharedVoice] = useState(() => getSharedId("voice"));
  const [filter, setFilter] = useState<'all' | 'story' | 'announcement' | 'voices'>(
    () => sharedVoice !== null || searchParams.get("tab") === "voices" ? 'voices' : 'all'
  );
  // "Voices" testimonials are edited with the home page (Admin > Page Content > Home).
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [highlightVoice, setHighlightVoice] = useState<number | null>(null);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pg, setPg] = useState(STORIES_DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([store.getStories(), store.getAnnouncements()]).then(([st, an]) => {
      setStories(st);
      setAnnouncements(an);
      // Open the story/announcement a shared link points to (?story=ID or ?announcement=ID).
      const storyId = getSharedId("story");
      const announcementId = getSharedId("announcement");
      const story = storyId ? st.find((x) => x.id === storyId) : undefined;
      const announcement = announcementId ? an.find((x) => x.id === announcementId) : undefined;
      if (story) setSelectedStory(story);
      else if (announcement) setSelectedAnnouncement(announcement);
      setLoaded(true);
    });
    store.getPageSettings<typeof STORIES_DEFAULTS>("storiespage").then((d) => { if (d) setPg({ ...STORIES_DEFAULTS, ...d }); });
    store.getPageSettings<HomeSettings>("home")
      .then((d) => setVoices(d ? d.testimonials ?? DEFAULT_VOICES : DEFAULT_VOICES))
      .catch(() => setVoices(DEFAULT_VOICES))
      .finally(() => setVoicesLoaded(true));
  }, []);

  // Scroll to the shared testimonial and highlight it for a moment.
  useEffect(() => {
    if (!voicesLoaded || sharedVoice === null) return;
    clearSharedId();
    const idx = Number(sharedVoice);
    const scroll = () => {
      const card = document.getElementById(`voice-${idx}`);
      if (card) window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 90 });
    };
    const timers = [300, 1500].map((ms) => setTimeout(scroll, ms));
    setHighlightVoice(idx);
    timers.push(setTimeout(() => setHighlightVoice(null), 6000));
    return () => timers.forEach(clearTimeout);
  }, [voicesLoaded, sharedVoice]);

  const chooseFilter = (f: typeof filter) => {
    setFilter(f);
    setSearchParams(f === 'voices' ? { tab: 'voices' } : {}, { replace: true });
  };

  const filteredStories = filter === 'all' || filter === 'story' ? stories : [];
  const filteredAnnouncements = filter === 'all' || filter === 'announcement' ? announcements : [];

  // Once the pop-up is closed, drop the id from the address so it doesn't reopen.
  useEffect(() => {
    if (loaded && !selectedStory && !selectedAnnouncement) clearSharedId();
  }, [loaded, selectedStory, selectedAnnouncement]);

  const hasContent = filter === 'voices' ? voices.length > 0 : filteredStories.length > 0 || filteredAnnouncements.length > 0;

  return (
    <Layout>
      <section className="container pt-12 pb-8">
        <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mb-3" dangerouslySetInnerHTML={{ __html: pg.pageTitle }} />
        <div className="text-lg text-muted-foreground max-w-2xl" dangerouslySetInnerHTML={{ __html: pg.pageSubtitle }} />
      </section>

      <section className="container py-8 pb-20">
        <div className="flex flex-wrap gap-2 mb-10">
          {(['all', 'story', 'announcement', 'voices'] as const).map((f) => (
            <button
              key={f}
              onClick={() => chooseFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                filter === f
                  ? f === 'story' ? 'bg-secondary text-white shadow-md' : f === 'announcement' || f === 'voices' ? 'bg-primary text-white shadow-md' : 'bg-secondary text-white shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:shadow-sm'
              }`}
            >
              {f === 'all' ? 'All' : f === 'story' ? 'Stories' : f === 'announcement' ? 'Announcements' : 'Voices'}
            </button>
          ))}
        </div>

        {filter === 'voices' && !voicesLoaded ? null : !hasContent ? (
          <p className="text-center text-muted-foreground py-20">{filter === 'voices' ? 'No testimonials yet. Check back soon!' : 'No stories yet. Check back soon!'}</p>
        ) : filter === 'voices' ? (
          <div className="grid md:grid-cols-3 gap-8">
            {newestFirst(voices).map(({ voice, index }) => (
              <VoiceCard key={index} voice={voice} index={index} highlight={highlightVoice === index} />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Announcements section - same style as homepage */}
            {filteredAnnouncements.length > 0 && (
              <div>
                {filter === 'all' && (
                  <h2 className="font-heading text-2xl font-extrabold mb-6">
                    Latest <span className="text-primary">Announcements</span>
                  </h2>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredAnnouncements.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAnnouncement(item)}
                      className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col sm:flex-row group hover:shadow-elevated transition-all cursor-pointer"
                    >
                      {item.image && (
                        <div className="w-full sm:w-48 md:w-56 shrink-0 overflow-hidden bg-muted">
                          <img src={item.image} alt={item.title} className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1 min-w-0">
                        <span className="inline-block w-fit px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">Announcement</span>
                        <h3 className="font-heading text-sm font-bold mb-1 group-hover:text-primary transition-colors leading-snug">{item.title}</h3>
                        {item.subtitle && <p className="text-xs text-primary font-medium mb-2">{item.subtitle}</p>}
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{(() => { const t = stripHtml(item.content); return t.length > 150 ? t.slice(0, 150) + '...' : t; })()}</p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                          {item.showDate !== false && item.date ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          ) : (
                            <span className="text-primary text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Read more <ChevronRight className="h-3 w-3" />
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground font-medium">Donations ({item.donationCount})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stories section */}
            {filteredStories.length > 0 && (
              <div>
                {filter === 'all' && (
                  <h2 className="font-heading text-2xl font-extrabold mb-6">
                    Impact <span className="text-secondary">Stories</span>
                  </h2>
                )}
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredStories.map((story) => (
                    <div
                      key={story.id}
                      onClick={() => setSelectedStory(story)}
                      className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col sm:flex-row group hover:shadow-elevated transition-all cursor-pointer"
                    >
                      {story.image && (
                        <div className="w-full sm:w-48 md:w-56 shrink-0 overflow-hidden bg-muted">
                          <img src={story.image} alt={story.title} className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1 min-w-0">
                        <span className="inline-block w-fit px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-2">Story</span>
                        <h3 className="font-heading text-sm font-bold mb-1 group-hover:text-primary transition-colors leading-snug">{story.title}</h3>
                        {story.subtitle && <p className="text-xs text-primary font-medium mb-2">{story.subtitle}</p>}
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1">{(() => { const t = stripHtml(story.excerpt); return t.length > 150 ? t.slice(0, 150) + '...' : t; })()}</p>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                          {story.showDate !== false && story.date ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(story.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          ) : (
                            <span className="text-secondary text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              Read more <ChevronRight className="h-3 w-3" />
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground font-medium">Donations ({story.donationCount || 0})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Story popup modal */}
      {selectedStory && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedStory(null)}>
          <div
            className="bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-2 rounded-t-2xl ${selectedStory.category === 'story' ? 'bg-secondary' : 'bg-primary'}`} />
            {selectedStory.image && (
              <div className="w-full overflow-hidden">
                <img src={selectedStory.image} alt={selectedStory.title} className="w-full max-h-96 object-contain bg-muted" />
              </div>
            )}
            {selectedStory.video && getEmbedUrl(selectedStory.video) && (
              <div className="w-full aspect-video">
                <iframe src={getEmbedUrl(selectedStory.video)!} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video" />
              </div>
            )}
            <div className="sticky top-0 bg-card border-b border-border px-8 py-6 flex items-start justify-between">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${
                  selectedStory.category === 'story' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                }`}>
                  {selectedStory.category === 'story' ? 'Story' : 'Announcement'}
                </span>
                <h2 className="font-heading text-2xl lg:text-3xl font-bold">{selectedStory.title}</h2>
                {selectedStory.showDate !== false && selectedStory.date && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(selectedStory.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
              <button onClick={() => setSelectedStory(null)} className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-8 py-6">
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-6" />
              <div className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: selectedStory.content }} />
            </div>
            <div className="px-8 pb-6 flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <Button onClick={() => setSelectedStory(null)} variant="outline" className="btn-hover">Close</Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold">
                  <Link to="/donate"><Heart className="h-4 w-4" /> Donate</Link>
                </Button>
              </div>
              <ShareButtons title={selectedStory.title} url={buildShareUrl("story", selectedStory.id, `${selectedStory.title}|${selectedStory.image || ""}`)} />
            </div>
          </div>
        </div>
      )}

      {/* Announcement popup modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedAnnouncement(null)}>
          <div
            className="bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 rounded-t-2xl bg-gradient-to-r from-primary to-secondary" />
            {selectedAnnouncement.image && (
              <div className="w-full overflow-hidden">
                <img src={selectedAnnouncement.image} alt={selectedAnnouncement.title} className="w-full max-h-96 object-contain bg-muted" />
              </div>
            )}
            {selectedAnnouncement.video && getEmbedUrl(selectedAnnouncement.video) && (
              <div className="w-full aspect-video">
                <iframe src={getEmbedUrl(selectedAnnouncement.video)!} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video" />
              </div>
            )}
            <div className="sticky top-0 bg-card border-b border-border px-8 py-6 flex items-start justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">Announcement</span>
                <h2 className="font-heading text-2xl lg:text-3xl font-bold">{selectedAnnouncement.title}</h2>
                {selectedAnnouncement.showDate !== false && selectedAnnouncement.date && (
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(selectedAnnouncement.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
              <button onClick={() => setSelectedAnnouncement(null)} className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-8 py-6">
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-6" />
              <div className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }} />
            </div>
            <div className="px-8 pb-6 flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <Button onClick={() => setSelectedAnnouncement(null)} variant="outline" className="btn-hover">Close</Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold">
                  <Link to="/donate"><Heart className="h-4 w-4" /> Donate</Link>
                </Button>
              </div>
              <ShareButtons title={selectedAnnouncement.title} url={buildShareUrl("announcement", selectedAnnouncement.id, `${selectedAnnouncement.title}|${selectedAnnouncement.image || ""}`)} />
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Stories;
