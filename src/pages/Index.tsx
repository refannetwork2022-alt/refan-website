import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, Users, BookOpen, ArrowRight, Target, Globe, Shield, Baby, User, Home, Grid3X3, Quote, Megaphone, X, Share2, Facebook, Twitter, Link2 } from "lucide-react";
import { store, Announcement } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
const heroBg = "/holi.jpg";
import educationImg from "@/assets/programs-education.jpg";
import healthImg from "@/assets/programs-health.jpg";
import livelihoodImg from "@/assets/programs-livelihood.jpg";

const galleryPreview = [
  { src: "/gallery-community.jpg", alt: "Community gathering" },
  { src: "/gallery-classroom.jpg", alt: "Children in classroom" },
  { src: "/gallery-children-playing.jpg", alt: "Children playing" },
];

const impactStats = [
  { number: 2022, label: "Founded", icon: Home, suffix: "" },
  { number: 100, label: "Orphans Supported", icon: Baby, suffix: "+" },
  { number: 50, label: "Widows Empowered", icon: User, suffix: "+" },
];

const programs = [
  { title: "Education Support", desc: "Providing education support to all orphaned children in Dzaleka Refugee Camp, ensuring every child has access to learning.", icon: BookOpen, image: educationImg },
  { title: "Community Resilience", desc: "Empowering widows and orphan youths through community-based programs that build self-reliance and hope.", icon: Users, image: healthImg },
  { title: "Bereavement Support", desc: "Walking alongside grieving families with compassionate care, turning grief into resilience and growth.", icon: Heart, image: livelihoodImg },
];

const values = [
  { icon: Target, title: "Refugee-Led", desc: "Founded and run by refugees themselves — we understand the needs because we live them." },
  { icon: Globe, title: "Women-Led", desc: "Led by President Goreth from Burundi, empowering women and children at every level." },
  { icon: Shield, title: "Self-Funded", desc: "Built from the ground up with our own resources, powered by hope and community spirit." },
];

const sampleAnnouncements: Announcement[] = [
  {
    id: "sample-1",
    title: "ReFAN Launches New Education Scholarship Program for 2026",
    content: "We are thrilled to announce our new scholarship program aimed at supporting orphaned children in Dzaleka Refugee Camp. This initiative will provide full educational support including school fees, uniforms, books, and tutoring for over 50 children this year. Thanks to the generous hearts of our community, we can continue to invest in the future of these young lives. Education is not just a right — it's a pathway to dignity and self-reliance. If you'd like to support this initiative, please consider donating or spreading the word.",
    image: "/IMG-20260217-WA0046.jpg",
    donationCount: 24,
  },
  {
    id: "sample-2",
    title: "Community Resilience Workshop: Empowering Widows with New Skills",
    content: "Last month, ReFAN organized a week-long workshop focused on skill-building for widows in the camp. Over 30 women participated in sessions on tailoring, soap-making, and financial literacy. The workshop was led by experienced trainers and community leaders who understand the unique challenges faced by refugee women. Participants left with practical skills and renewed confidence. We believe that when you empower a woman, you empower an entire community. Stay tuned for our next workshop dates!",
    image: "/IMG-20260217-WA0043.jpg",
    donationCount: 18,
  },
  {
    id: "sample-3",
    title: "Bereavement Support Group Reaches 100 Families",
    content: "Our bereavement support program has now reached over 100 families in Dzaleka. Through counseling, group sessions, and community gatherings, we help families navigate grief and find strength together. This milestone reflects the deep need for emotional support in our community and the incredible resilience of those we serve. We are grateful for every volunteer and donor who makes this work possible.",
    image: "/IMG-20260217-WA0055.jpg",
    donationCount: 12,
  },
  {
    id: "sample-4",
    title: "Annual Community Gathering: Celebrating Unity and Hope",
    content: "ReFAN hosted its annual community gathering, bringing together over 200 refugees, volunteers, and supporters. The event featured cultural performances, speeches from community leaders, and a shared meal. It was a powerful reminder that even in the most challenging circumstances, community and togetherness can bring light. Thank you to everyone who attended and contributed to making this event a success.",
    image: "/IMG-20260217-WA0048.jpg",
    donationCount: 8,
  },
];

const testimonials = [
  {
    quote: "ReFAN gave my children hope when we had nothing. They provided school fees and emotional support that changed our lives forever.",
    name: "Marie K.",
    role: "Widow & Mother of 3",
  },
  {
    quote: "Thanks to the education program, I can now dream of becoming a doctor. ReFAN believes in us even when the world forgets.",
    name: "Emmanuel T.",
    role: "Orphan, Age 16",
  },
  {
    quote: "The community resilience workshops taught me skills to support my family. I went from grieving alone to leading others.",
    name: "Esperance N.",
    role: "Widow & Workshop Leader",
  },
];

// Animated counter hook
function useCountUp(target: number, inView: boolean) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, inView]);

  return count;
}

const StatCard = ({ stat, inView }: { stat: typeof impactStats[0]; inView: boolean }) => {
  const count = useCountUp(stat.number, inView);
  return (
    <div className="bg-card p-8 rounded-2xl border border-border flex flex-col items-center text-center group hover:border-primary hover:shadow-card transition-all">
      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        <stat.icon className="h-7 w-7" />
      </div>
      <p className="font-heading text-4xl font-extrabold text-primary">{count}{stat.suffix}</p>
      <p className="text-muted-foreground font-medium mt-1">{stat.label}</p>
    </div>
  );
};

const Index = () => {
  const { toast } = useToast();
  const [statsInView, setStatsInView] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); toast({ title: "Link copied!" }); };

  useEffect(() => {
    store.getAnnouncements().then((data) => {
      setAnnouncements(data.length > 0 ? data : sampleAnnouncements);
    }).catch(() => setAnnouncements(sampleAnnouncements));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsInView(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="container py-8">
        <div className="relative rounded-2xl overflow-hidden min-h-[600px] shadow-elevated">
          <div className="absolute inset-0">
            <img src="/refan_give.jpg" alt="ReFAN Community" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/60" />
          </div>
          {/* Tagline - full width horizontal across the top */}
          <div className="relative z-10 w-full text-center pt-8 lg:pt-10 px-4">
            <h2 className="font-heading text-2xl sm:text-4xl lg:text-7xl font-extrabold text-white tracking-wider uppercase">
              Holistic Continuity of Care
            </h2>
          </div>
          {/* Main content - pinned to left */}
          <div className="absolute z-10 top-28 sm:top-32 lg:top-36 left-6 lg:left-10 max-w-xl flex flex-col gap-3">
            <span className="inline-flex items-center gap-2 w-fit px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md text-primary font-bold text-xs uppercase tracking-widest border border-primary/30">
              Refugee-Led Initiative
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              From Loss to Legacy: Continuity of Care
            </h1>
            <p className="text-base text-gray-200 leading-relaxed max-w-md">
              Self-funded by refugees, powered by hope. Join us in turning grief into resilience for Dzaleka's most vulnerable.
            </p>
            <div className="flex flex-wrap gap-3 mt-1">
              <Button asChild size="lg" className="btn-hover bg-primary hover:bg-primary/90 text-white font-bold shadow-lg px-8">
                <Link to="/donate"><Heart className="h-5 w-5" /> Donate Now</Link>
              </Button>
              <Button asChild size="lg" className="btn-hover bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg px-8">
                <Link to="/get-involved">Get Involved <ArrowRight className="h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact stats with animation */}
      <section className="container py-12" ref={statsRef}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {impactStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} inView={statsInView} />
          ))}
        </div>
      </section>

      {/* Announcements */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">Latest <span className="text-primary">Announcements</span></h2>
            <p className="text-muted-foreground">Stay informed about our latest initiatives and community efforts.</p>
          </div>
          <Button asChild variant="ghost" className="text-primary font-bold btn-hover">
            <Link to="/stories">View all <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {announcements.slice(0, 4).map((item) => (
            <div key={item.id} onClick={() => setSelectedAnnouncement(item)} className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col sm:flex-row group hover:shadow-elevated transition-all cursor-pointer">
              {item.image && (
                <div className="w-full h-48 sm:w-48 sm:h-auto md:w-56 shrink-0 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1 min-w-0">
                <h3 className="font-heading text-sm font-bold mb-2 group-hover:text-primary transition-colors leading-snug">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{item.content.length > 150 ? item.content.slice(0, 150) + '...' : item.content}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4" onClick={(e) => e.stopPropagation()}>
                    <Link to="/donate"><Heart className="h-3 w-3" /> Donate</Link>
                  </Button>
                  <span className="text-xs text-muted-foreground font-medium">Donations ({item.donationCount})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <Button asChild size="lg" className="btn-hover bg-primary hover:bg-primary/90 text-white font-bold shadow-lg px-8">
            <Link to="/donate"><Heart className="h-5 w-5" /> Donate Now</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="btn-hover font-bold px-8">
            <Link to="/stories">Read More <ArrowRight className="h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Programs */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">Our <span className="text-primary">Programs</span></h2>
            <p className="text-muted-foreground">Targeted interventions that create lasting impact across communities.</p>
          </div>
          <Button asChild variant="ghost" className="text-primary font-bold btn-hover">
            <Link to="/programs">View all programs <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {programs.map((prog) => (
            <div key={prog.title} className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col group hover:shadow-elevated transition-all">
              <div className="aspect-[3/4] overflow-hidden">
                <img src={prog.image} alt={prog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <prog.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-bold group-hover:text-primary transition-colors">{prog.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{prog.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-12">
        <h2 className="font-heading text-3xl font-extrabold tracking-tight text-center mb-3">
          Voices from <span className="text-primary">Dzaleka</span>
        </h2>
        <p className="text-muted-foreground text-center mb-10">Real stories from those whose lives have been transformed.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-card transition-all relative">
              <Quote className="h-8 w-8 text-primary/20 absolute top-6 right-6" />
              <p className="text-muted-foreground leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values - blue section */}
      <section className="container py-12">
        <div className="bg-secondary rounded-3xl p-10 lg:p-20 text-white">
          <h2 className="font-heading text-3xl font-extrabold mb-12 text-center">Why <span className="text-primary">ReFA</span><span className="text-white">N</span>?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="flex flex-col gap-4 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm text-center hover:bg-white/10 transition-colors">
                <div className="mx-auto w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-lg">{v.title}</h3>
                <p className="text-sm text-white/70">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="container py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">
              <span className="text-secondary">Life</span> in Dzaleka
            </h2>
            <p className="text-muted-foreground">Capturing moments of growth, joy, and community action.</p>
          </div>
          <Button asChild variant="outline" className="font-bold border-border btn-hover">
            <Link to="/gallery">View Full Gallery <Grid3X3 className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {galleryPreview.map((img) => (
            <div
              key={img.src}
              className="aspect-[4/3] rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform shadow-soft"
            >
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-12 pb-20">
        <div className="relative rounded-[2rem] overflow-hidden p-12 lg:p-20 text-center text-white shadow-elevated">
          <div className="absolute inset-0">
            <img src="/modam_teach.jpg" alt="ReFAN Teaching" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
            <h2 className="font-heading text-3xl lg:text-5xl font-extrabold">How will you help today?</h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Every donation goes directly toward empowering children and widows in Dzaleka. We are 100% refugee-run and transparent in our mission.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Button asChild size="lg" className="btn-hover bg-primary text-white hover:bg-primary/90 font-extrabold text-lg px-10 py-6 rounded-2xl shadow-xl">
                <Link to="/donate">Partner With Us</Link>
              </Button>
              <Button asChild size="lg" className="btn-hover bg-secondary text-white hover:bg-secondary/90 font-extrabold text-lg px-10 py-6 rounded-2xl shadow-xl">
                <Link to="/get-involved">Become a Volunteer</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Announcement modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedAnnouncement(null)}>
          <div
            className="bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 rounded-t-2xl bg-gradient-to-r from-primary to-secondary" />
            {selectedAnnouncement.image && (
              <div className="w-full h-64 md:h-80 overflow-hidden">
                <img src={selectedAnnouncement.image} alt={selectedAnnouncement.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="sticky top-0 bg-card border-b border-border px-8 py-6 flex items-start justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">Announcement</span>
                <h2 className="font-heading text-2xl lg:text-3xl font-bold">{selectedAnnouncement.title}</h2>
              </div>
              <button onClick={() => setSelectedAnnouncement(null)} className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-8 py-6">
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-6" />
              <p className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.content}</p>
            </div>
            <div className="px-8 pb-6 flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-3">
                <Button onClick={() => setSelectedAnnouncement(null)} variant="outline" className="btn-hover">Close</Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold">
                  <Link to="/donate"><Heart className="h-4 w-4" /> Donate</Link>
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="h-4 w-4 text-muted-foreground mr-1" />
                <button onClick={copyLink} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Copy link"><Link2 className="h-4 w-4" /></button>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors text-[#1877F2]"><Facebook className="h-4 w-4" /></a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedAnnouncement.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors text-[#1DA1F2]"><Twitter className="h-4 w-4" /></a>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Index;
