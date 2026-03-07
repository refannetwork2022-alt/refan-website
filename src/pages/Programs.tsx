import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { BookOpen, Users, Heart, X, ChevronRight, Share2, Facebook, Twitter, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import educationImg from "@/assets/programs-education.jpg";
import healthImg from "@/assets/programs-health.jpg";
import livelihoodImg from "@/assets/programs-livelihood.jpg";
import { store, ProgramsSettings } from "@/lib/store";

const defaultImages = [educationImg, healthImg, livelihoodImg];
const icons = [BookOpen, Users, Heart];

const DEFAULTS: ProgramsSettings = {
  pageTitle: 'Our <span class="text-primary">Programs</span>',
  pageSubtitle: "Holistic Continuity of Care — refugee-led programs designed to support orphaned children and widows from grief to growth.",
  programs: [
    { title: "Education Support", description: "We provide education support to all orphaned children in Dzaleka Refugee Camp — from school fees and learning materials to mentorship and after-school programs. Every child deserves the chance to learn, grow, and dream of a brighter future regardless of their circumstances.", stats: "100+ orphans supported", image: "" },
    { title: "Community Resilience", description: "Our community resilience program empowers widows and orphan youths through peer support groups, skills training, and income-generating activities. We help them rebuild their lives with dignity, creating networks of mutual support that strengthen the entire camp community.", stats: "50+ widows empowered", image: "" },
    { title: "Bereavement Support", description: "Losing a parent or spouse in a refugee camp can be devastating. Our bereavement support program walks alongside grieving families with compassionate care, counseling, and practical assistance — turning grief into resilience and ensuring no one mourns alone.", stats: "Ongoing community care", image: "" },
  ],
};

type Program = ProgramsSettings['programs'][number];

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');

const Programs = () => {
  const { toast } = useToast();
  const [d, setD] = useState<ProgramsSettings>(DEFAULTS);
  const [selected, setSelected] = useState<(Program & { index: number }) | null>(null);

  useEffect(() => {
    store.getPageSettings<ProgramsSettings>("programs").then((data) => {
      if (data) setD({ ...DEFAULTS, ...data });
    });
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); toast({ title: "Link copied!" }); };

  return (
    <Layout>
      <section className="container pt-12 pb-8">
        <p className="text-sm text-muted-foreground mb-2">Home &gt; Programs</p>
        <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mb-3" dangerouslySetInnerHTML={{ __html: d.pageTitle }} />
        <div className="text-lg text-muted-foreground max-w-2xl" dangerouslySetInnerHTML={{ __html: d.pageSubtitle }} />
      </section>

      <section className="container py-8 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {d.programs.map((prog, i) => {
            const Icon = icons[i % icons.length];
            const img = prog.image || defaultImages[i % defaultImages.length];
            const plainDesc = stripHtml(prog.description);
            return (
              <div
                key={i}
                onClick={() => setSelected({ ...prog, index: i })}
                className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col sm:flex-row group hover:shadow-elevated transition-all cursor-pointer"
              >
                <div className="w-full h-48 sm:w-48 sm:h-auto md:w-56 shrink-0 overflow-hidden">
                  <img src={img} alt={prog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5 flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">Program</span>
                  </div>
                  <h3 className="font-heading text-sm font-bold mb-1 group-hover:text-primary transition-colors leading-snug">{prog.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                    {plainDesc.length > 150 ? plainDesc.slice(0, 150) + '...' : plainDesc}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                      {prog.stats}
                    </span>
                    <span className="text-primary text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Read more <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container pb-20">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="font-heading text-2xl md:text-3xl font-extrabold mb-3">Support Our Programs</h2>
          <p className="text-white/90 max-w-xl mx-auto mb-6">Your donation helps us continue providing education, community support, and bereavement care to orphans and widows in Dzaleka Refugee Camp.</p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-bold text-base px-8">
            <Link to="/donate"><Heart className="h-5 w-5 mr-2" /> Donate Now</Link>
          </Button>
        </div>
      </section>

      {/* Program popup modal */}
      {selected && (() => {
        const Icon = icons[selected.index % icons.length];
        const img = selected.image || defaultImages[selected.index % defaultImages.length];
        return (
          <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div
              className="bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-2 rounded-t-2xl bg-gradient-to-r from-primary to-secondary" />
              <div className="w-full h-64 md:h-80 overflow-hidden">
                <img src={img} alt={selected.title} className="w-full h-full object-cover" />
              </div>
              <div className="sticky top-0 bg-card border-b border-border px-8 py-6 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">Program</span>
                  </div>
                  <h2 className="font-heading text-2xl lg:text-3xl font-bold">{selected.title}</h2>
                  <span className="inline-block mt-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                    {selected.stats}
                  </span>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-8 py-6">
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-6" />
                <div className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: selected.description }} />
              </div>
              <div className="px-8 pb-6 flex items-center justify-between border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <Button onClick={() => setSelected(null)} variant="outline" className="btn-hover">Close</Button>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold">
                    <Link to="/donate"><Heart className="h-4 w-4" /> Donate</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="h-4 w-4 text-muted-foreground mr-1" />
                  <button onClick={copyLink} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Copy link"><Link2 className="h-4 w-4" /></button>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors text-[#1877F2]"><Facebook className="h-4 w-4" /></a>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selected.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors text-[#1DA1F2]"><Twitter className="h-4 w-4" /></a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </Layout>
  );
};

export default Programs;
