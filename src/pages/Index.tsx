import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Heart, Users, BookOpen, Stethoscope, ArrowRight, Target, Globe, Shield } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import educationImg from "@/assets/programs-education.jpg";
import healthImg from "@/assets/programs-health.jpg";
import livelihoodImg from "@/assets/programs-livelihood.jpg";

const impactStats = [
  { number: "10,000+", label: "Lives Impacted" },
  { number: "25+", label: "Communities Served" },
  { number: "150+", label: "Active Volunteers" },
  { number: "5", label: "Countries" },
];

const programs = [
  { title: "Education", desc: "Empowering the next generation through quality education and scholarships.", icon: BookOpen, image: educationImg },
  { title: "Healthcare", desc: "Providing access to essential healthcare services in underserved areas.", icon: Stethoscope, image: healthImg },
  { title: "Livelihoods", desc: "Building sustainable livelihoods through skills training and microfinance.", icon: Users, image: livelihoodImg },
];

const values = [
  { icon: Target, title: "Mission-Driven", desc: "Every action we take is guided by our mission to build resilient communities." },
  { icon: Globe, title: "Community First", desc: "We put local communities at the center of every decision." },
  { icon: Shield, title: "Transparency", desc: "100% accountability in how every donation is utilized." },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Community development" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-overlay" />
        </div>
        <div className="container relative z-10 py-20">
          <div className="max-w-2xl animate-fade-up">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-sm font-semibold mb-6 backdrop-blur-sm">
              Resilient Foundation Assistance Network
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-6">
              Building Stronger <span className="text-primary">Communities</span> Together
            </h1>
            <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed max-w-lg">
              We empower vulnerable communities through sustainable development, education, healthcare, and livelihood support.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="hero" size="lg">
                <Link to="/donate"><Heart className="h-5 w-5" /> Donate Now</Link>
              </Button>
              <Button asChild variant="hero-outline" size="lg">
                <Link to="/get-involved">Get Involved <ArrowRight className="h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="bg-secondary py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl lg:text-4xl font-extrabold text-primary">{stat.number}</p>
                <p className="text-sm text-secondary-foreground/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl lg:text-4xl font-extrabold mb-4">Our Programs</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Targeted interventions that create lasting impact across communities.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {programs.map((prog) => (
              <div key={prog.title} className="group rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 bg-card">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={prog.image} alt={prog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-lg bg-accent">
                      <prog.icon className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <h3 className="font-heading text-lg font-bold">{prog.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{prog.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Button asChild variant="outline">
              <Link to="/programs">View All Programs <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl lg:text-4xl font-extrabold mb-4">Why ReFAN?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">What sets us apart in the mission to uplift communities.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="bg-card rounded-xl p-8 shadow-soft text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-4">
                  <v.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="font-heading text-3xl lg:text-4xl font-extrabold mb-4">Ready to Make a Difference?</h2>
          <p className="max-w-lg mx-auto mb-8 text-primary-foreground/80">
            Your support helps us reach more communities. Every contribution counts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="hero-outline" size="lg">
              <Link to="/donate"><Heart className="h-5 w-5" /> Donate Now</Link>
            </Button>
            <Button asChild variant="hero-outline" size="lg">
              <Link to="/get-involved">Become a Volunteer</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
