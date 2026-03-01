import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, Users, Award, Globe, Link as LinkIcon, Mail } from "lucide-react";
import aboutTeam from "@/assets/about-team.jpg";

const About = () => {
  return (
    <Layout>
      {/* Hero - rounded, centered text */}
      <section className="container py-8">
        <div
          className="relative rounded-xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-cover bg-center"
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${aboutTeam})` }}
        >
          <div className="max-w-2xl">
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Our Heart, Our Mission
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium">
              Dedicated to holistic continuity of care for orphans and widows in Dzaleka Refugee Camp since 2022.
            </p>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 rounded bg-primary/10 text-primary text-sm font-bold uppercase tracking-wider">
              Our Identity
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-extrabold leading-tight">
              A <span className="text-primary">Refugee-Led</span> Force for <span className="text-secondary">Community Wellness</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              The Resilient Foundation Assistance Network (ReFAN) is a refugee-led, women-led organization founded in 2022 inside Dzaleka Refugee Camp, Dowa District, Malawi. We provide Holistic Continuity of Care for orphaned children and widows — turning grief into resilience and growth.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div>
                <div className="text-3xl font-extrabold text-primary font-heading">2022</div>
                <div className="text-sm font-medium">Year Founded</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-primary font-heading">100+</div>
                <div className="text-sm font-medium">Lives Impacted</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] rounded-xl bg-cover bg-center shadow-elevated overflow-hidden">
              <img src={aboutTeam} alt="ReFAN team" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-lg shadow-elevated hidden lg:block border border-border">
              <p className="italic text-primary font-medium">"Restoring hope, one family at a time."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement - orange section */}
      <section className="container py-8">
        <div className="bg-primary rounded-2xl p-12 md:p-20 text-center text-white shadow-elevated">
          <Heart className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <p className="text-sm font-bold uppercase tracking-[0.2em] mb-4 opacity-80">Our Core Mission</p>
          <blockquote className="font-heading text-3xl md:text-5xl font-extrabold italic leading-tight max-w-4xl mx-auto">
            "Holistic Continuity of Care"
          </blockquote>
          <p className="mt-8 text-white/80 max-w-2xl mx-auto text-lg leading-relaxed">
            We bridge the gap between emergency relief and long-term sustainable development, ensuring that support never ends when the cameras leave.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="container py-16">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4">Our Guiding <span className="text-primary">Values</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto">The principles that drive every decision and action we take.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { icon: Heart, title: "Compassion", desc: "Deep empathy for those we serve, treating every individual with dignity and respect." },
            { icon: Award, title: "Integrity", desc: "Unwavering transparency in our operations and radical accountability." },
            { icon: Globe, title: "Sustainability", desc: "Designing solutions that endure, focusing on long-term community harmony." },
            { icon: Users, title: "Collaboration", desc: "Partnering with local leaders to foster shared ownership of progress." },
          ].map((v) => (
            <div key={v.title} className="p-8 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
              <v.icon className="h-10 w-10 text-primary mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-normal">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leadership - large photos like stitch */}
      <section className="container py-16">
        <div className="text-center mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-extrabold mb-4"><span className="text-secondary">Leadership</span> Team</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">The visionary leaders steering ReFAN toward a brighter, healthier future for all.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Goreth */}
          <div className="flex flex-col items-center text-center">
            <div className="w-64 h-64 rounded-2xl overflow-hidden mb-6 shadow-elevated border-4 border-white">
              <img src="/founder-goreth.jpg" alt="Président Lydia Igirajeza" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-heading text-2xl font-bold">Lydia Igirajeza</h3>
            <p className="text-primary font-bold mb-4 uppercase tracking-widest text-xs">Président</p>
            <p className="text-muted-foreground text-sm italic">"Our goal isn't just to provide aid, but to build resilient systems that thrive independently."</p>
            <div className="flex gap-4 mt-6">
              <a className="text-muted-foreground hover:text-primary" href="mailto:refannetwork2022@gmail.com"><Mail className="h-5 w-5" /></a>
            </div>
          </div>
          {/* Wagstan */}
          <div className="flex flex-col items-center text-center">
            <div className="w-64 h-64 rounded-2xl overflow-hidden mb-6 shadow-elevated border-4 border-white">
              <img src="/founder-wagstan.jpg" alt="Général Secretary Goreth Niyibigira" className="w-full h-full object-cover" />
            </div>
            <h3 className="font-heading text-2xl font-bold">Goreth Niyibigira</h3>
            <p className="text-primary font-bold mb-4 uppercase tracking-widest text-xs">Général Secretary</p>
            <p className="text-muted-foreground text-sm italic">"Strategic partnership is the engine that drives transformation and scale."</p>
            <div className="flex gap-4 mt-6">
              <a className="text-muted-foreground hover:text-primary" href="mailto:refannetwork2022@gmail.com"><Mail className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-8 pb-20">
        <div className="rounded-2xl overflow-hidden bg-[#23170f] text-white p-8 md:p-16 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(249,116,21,0.4) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold mb-6">Be the change you want to see.</h2>
            <p className="text-lg text-white/70 mb-10 max-w-2xl leading-relaxed">
              Join our network of donors, volunteers, and partners working together to ensure care never stops.
            </p>
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
