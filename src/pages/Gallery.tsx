import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { store, GalleryItem } from "@/lib/store";
import { Image, Video, X, ChevronLeft, ChevronRight } from "lucide-react";
import educationImg from "@/assets/programs-education.jpg";
import healthImg from "@/assets/programs-health.jpg";
import livelihoodImg from "@/assets/programs-livelihood.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import aboutTeam from "@/assets/about-team.jpg";

const fallbackImages = [educationImg, healthImg, livelihoodImg, heroBg, aboutTeam];

const sampleGalleryItems: GalleryItem[] = [
  { id: "g1", title: "ReFAN Community", url: "/IMG-20260217-WA0038.jpg", type: "photo", date: "2026-02-17" },
  { id: "g2", title: "Community Outreach", url: "/IMG-20260217-WA0039.jpg", type: "photo", date: "2026-02-17" },
  { id: "g3", title: "Community Support", url: "/IMG-20260217-WA0040.jpg", type: "photo", date: "2026-02-17" },
  { id: "g4", title: "Dzaleka Activities", url: "/IMG-20260217-WA0041.jpg", type: "photo", date: "2026-02-17" },
  { id: "g5", title: "Team Meeting", url: "/IMG-20260217-WA0042.jpg", type: "photo", date: "2026-02-17" },
  { id: "g6", title: "Community Resilience Workshop", url: "/IMG-20260217-WA0043.jpg", type: "photo", date: "2026-02-17" },
  { id: "g7", title: "Youth Program", url: "/IMG-20260217-WA0044.jpg", type: "photo", date: "2026-02-17" },
  { id: "g8", title: "Field Activities", url: "/IMG-20260217-WA0045.jpg", type: "photo", date: "2026-02-17" },
  { id: "g9", title: "Education Support Program", url: "/IMG-20260217-WA0046.jpg", type: "photo", date: "2026-02-17" },
  { id: "g10", title: "Empowerment Session", url: "/IMG-20260217-WA0047.jpg", type: "photo", date: "2026-02-17" },
  { id: "g11", title: "Youth Skills Training", url: "/IMG-20260217-WA0048.jpg", type: "photo", date: "2026-02-17" },
  { id: "g12", title: "Community Celebration", url: "/IMG-20260217-WA0049.jpg", type: "photo", date: "2026-02-17" },
  { id: "g13", title: "Annual Gathering", url: "/IMG-20260217-WA0050.jpg", type: "photo", date: "2026-02-17" },
  { id: "g14", title: "ReFAN Activities", url: "/IMG-20260217-WA0051.jpg", type: "photo", date: "2026-02-17" },
  { id: "g15", title: "Widows Empowerment", url: "/IMG-20260217-WA0054.jpg", type: "photo", date: "2026-02-17" },
  { id: "g16", title: "Widows Support Program", url: "/IMG-20260217-WA0055.jpg", type: "photo", date: "2026-02-17" },
  { id: "g17", title: "Community Building", url: "/IMG-20260217-WA0056.jpg", type: "photo", date: "2026-02-17" },
  { id: "g18", title: "Team ReFAN", url: "/team-refan.jpg", type: "photo", date: "2026-02-10" },
  { id: "g19", title: "ReFAN Giving", url: "/refan_give.jpg", type: "photo", date: "2026-02-05" },
  { id: "g20", title: "Teaching Program", url: "/modam_teach.jpg", type: "photo", date: "2026-02-01" },
];

const Gallery = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    store.getGallery().then((data) => {
      setItems(data.length > 0 ? data : sampleGalleryItems);
    }).catch(() => setItems(sampleGalleryItems));
  }, []);

  const getImageUrl = (item: GalleryItem, idx: number) => item.url || fallbackImages[idx % fallbackImages.length];
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>, idx: number) => {
    e.currentTarget.src = fallbackImages[idx % fallbackImages.length];
  };

  const goNext = () => {
    if (selectedIdx !== null) setSelectedIdx((selectedIdx + 1) % items.length);
  };
  const goPrev = () => {
    if (selectedIdx !== null) setSelectedIdx((selectedIdx - 1 + items.length) % items.length);
  };

  // Keyboard navigation
  useEffect(() => {
    if (selectedIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIdx(null);
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIdx]);

  return (
    <Layout>
      <section className="container pt-12 pb-8">
        <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mb-3">
          <span className="text-primary">Life</span> in <span className="text-secondary">Dzaleka</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">Capturing moments of growth, joy, and community action.</p>
      </section>

      <section className="container py-8 pb-20">
        {items.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">Gallery is being updated. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setSelectedIdx(idx)}
                className="group relative aspect-square rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform shadow-soft cursor-pointer"
              >
                <img
                  src={getImageUrl(item, idx)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => handleImgError(e, idx)}
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-colors duration-300 flex items-end">
                  <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-1.5 text-primary-foreground text-xs mb-1">
                      {item.type === 'photo' ? <Image className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                      {item.type}
                    </div>
                    <p className="text-primary-foreground text-sm font-semibold">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fullscreen Lightbox */}
      {selectedIdx !== null && items[selectedIdx] && (
        <div
          className="fixed inset-0 z-[100] bg-black flex flex-col animate-fade-in"
          onClick={() => setSelectedIdx(null)}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-4 bg-black/50 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
            <p className="text-white font-medium text-sm">
              {items[selectedIdx].title}
              <span className="text-white/50 ml-3">{selectedIdx + 1} / {items.length}</span>
            </p>
            <button
              onClick={() => setSelectedIdx(null)}
              className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Image area - fills remaining space */}
          <div className="flex-1 flex items-center justify-center relative px-16" onClick={(e) => e.stopPropagation()}>
            {/* Prev */}
            <button
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all z-10"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>

            {/* Image */}
            <img
              key={selectedIdx}
              src={getImageUrl(items[selectedIdx], selectedIdx)}
              alt={items[selectedIdx].title}
              className="max-w-full max-h-[calc(100vh-140px)] object-contain rounded-lg animate-scale-in"
              onError={(e) => handleImgError(e, selectedIdx)}
            />

            {/* Next */}
            <button
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all z-10"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          </div>

          {/* Thumbnails strip */}
          <div className="flex items-center gap-2 px-6 py-4 bg-black/50 backdrop-blur-sm overflow-x-auto" onClick={(e) => e.stopPropagation()}>
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setSelectedIdx(idx)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                  idx === selectedIdx ? 'ring-2 ring-primary scale-110' : 'opacity-50 hover:opacity-80'
                }`}
              >
                <img src={getImageUrl(item, idx)} alt={item.title} className="w-full h-full object-cover" onError={(e) => handleImgError(e, idx)} />
              </button>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Gallery;
