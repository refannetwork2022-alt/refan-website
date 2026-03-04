import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, Users, Award, Globe, Mail } from "lucide-react";
import aboutTeam from "@/assets/about-team.jpg";
import { store, AboutSettings } from "@/lib/store";

const DEFAULTS: AboutSettings = {
  heroTitle: "Our Heart, Our Mission",
  heroSubtitle: "Dedicated to holistic continuity of care for orphans and widows in Dzaleka Refugee Camp since 2022.",
  heroImage: "",
  whoWeAreTitle: 'A <span class="text-primary">Refugee-Led</span> Force for <span class="text-secondary">Community Wellness</span>',
  whoWeAreBody: "The Resilient Foundation Assistance Network (ReFAN) is a refugee-led, women-led organization founded in 2022 inside Dzaleka Refugee Camp, Dowa District, Malawi. We provide Holistic Continuity of Care for orphaned children and widows — turning grief into resilience and growth.",
  whoWeAreImage1: "",
  whoWeAreImage2: "/wg5r.png",
  missionQuote: "Holistic Continuity of Care",
  missionBody: "We bridge the gap between emergency relief and long-term sustainable development, ensuring that support never ends when the cameras leave.",
  ctaHeading: "Be the change you want to see.",
  ctaBody: "Join our network of donors, volunteers, and partners working together to ensure care never stops.",
  leaders: [
    { name: "Goreth Niyibigira", title: "Président", quote: "Our goal isn't just to provide aid, but to build resilient systems that thrive independently.", image: "/Goreth Niyibigira - Président.jpg", email: "refannetwork2022@gmail.com" },
    { name: "Lydia Igiraneza", title: "Général Secretary", quote: "Strategic partnership is the engine that drives transformation and scale.", image: "/Lydia Igiraneza - Général Secretary.jpg", email: "refannetwork2022@gmail.com" },
  ],
  values: [
    { title: "Compassion", description: "Deep empathy for those we serve, treating every individual with dignity and respect." },
    { title: "Integrity", description: "Unwavering transparency in our operations and radical accountability." },
    { title: "Sustainability", description: "Designing solutions that endure, focusing on long-term community harmony." },
    { title: "Collaboration", description: "Partnering with local leaders to foster shared ownership of progress." },
  ],
};

const valueIcons = [Heart, Award, Globe, Users];

const About = () => {
  const [d, setD] = useState<AboutSettings>(DEFAULTS);

  useEffect(() => {
    store.getPageSettings<AboutSettings>("about").then((data) => {
      if (data) setD({ ...DEFAULTS, ...data });
    });
  }, []);

  const heroImg = d.heroImage || aboutTeam;
  const img1 = d.whoWeAreImage1 || aboutTeam;
  const img2 = d.whoWeAreImage2 || "/wg5r.png";

  return (
    <Layout>
      <section className="container py-8">
        <div
          className="relative rounded-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${heroImg})` }}
        >
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4" dangerouslySetInnerHTML={{ __html: d.heroTitle }} />
            <p className="text-white/90 text-lg md:text-xl font-medium" dangerouslySetInnerHTML={{ __html: d.heroSubtitle }} />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 rounded bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider">Our Identity</span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold leading-tight" dangerouslySetInnerHTML={{ __html: d.whoWeAreTitle }} />
            <div className="text-lg text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: d.whoWeAreBody }} />
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div><div className="text-3xl font-extrabold text-primary font-heading">2022</div><div className="text-sm font-medium">Founded in 2022</div></div>
              <div><div className="text-3xl font-extrabold text-primary font-heading">100+</div><div className="text-sm font-medium">Lives Impacted</div></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <div className="aspect-[4/3] rounded-xl bg-cover bg-center shadow-elevated overflow-hidden">
                <img src={img1} alt="ReFAN team" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-lg shadow-elevated hidden lg:block border border-border">
                <p className="italic text-primary font-medium">"Restoring hope, one family at a time."</p>
              </div>
            </div>
            <div className="aspect-[3/2] rounded-xl overflow-hidden shadow-elevated border-4 border-primary/20">
              <img src={img2} alt="Founder & Chairman" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="container py-8">
        <div className="bg-primary rounded-2xl p-12 md:p-20 text-center text-white shadow-elevated">
          <Heart className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <p className="text-sm font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Our Core Mission</p>
          <blockquote className="font-heading text-3xl md:text-5xl font-extrabold italic leading-tight max-w-4xl mx-auto" dangerouslySetInnerHTML={{ __html: `"${d.missionQuote}"` }} />
          <div className="mt-8 text-white/80 max-w-2xl mx-auto text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: d.missionBody }} />
        </div>
      </section>

      <section className="container py-16">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">Our Guiding <span className="text-primary">Values</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto">The principles that drive every decision and action we take.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {d.values.map((v, i) => {
            const Icon = valueIcons[i % valueIcons.length];
            return (
              <div key={i} className="p-8 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
                <Icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-heading text-xl font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-normal">{v.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container py-16">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4"><span className="text-secondary">Board</span> of Directors</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">The visionary leaders steering ReFAN toward a brighter, healthier future for all.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {d.leaders.map((leader, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-64 h-64 rounded-2xl overflow-hidden mb-6 shadow-elevated border-4 border-white">
                <img src={leader.image} alt={`${leader.title} ${leader.name}`} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-heading text-2xl font-bold">{leader.name}</h3>
              <p className="text-primary font-bold mb-4 uppercase tracking-widest text-xs">{leader.title}</p>
              <p className="text-muted-foreground text-sm italic">"{leader.quote}"</p>
              <div className="flex gap-4 mt-6">
                <a className="text-muted-foreground hover:text-primary" href={`mailto:${leader.email}`}><Mail className="h-5 w-5" /></a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-8 pb-20">
        <div className="rounded-2xl overflow-hidden bg-[#23170f] text-white p-8 md:p-16 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(249,116,21,0.4) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold mb-6" dangerouslySetInnerHTML={{ __html: d.ctaHeading }} />
            <div className="text-lg text-white/70 mb-10 max-w-2xl leading-relaxed" dangerouslySetInnerHTML={{ __html: d.ctaBody }} />
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-10 py-6 rounded-lg shadow-lg">
                <Link to="/donate">Partner With Us</Link>
              </Button>
              <Button asChild size="lg" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm font-bold text-lg px-10 py-6 rounded-lg border border-white/20">
                <Link to="/programs">View Our Projects</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
