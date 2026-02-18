import Layout from "@/components/layout/Layout";
import { Target, Eye, Heart, Users, Award, Globe } from "lucide-react";
import aboutTeam from "@/assets/about-team.jpg";

const team = [
  { name: "Adaeze Okafor", role: "Executive Director" },
  { name: "Bayo Adeyemi", role: "Programs Lead" },
  { name: "Fatima Hassan", role: "Community Liaison" },
  { name: "David Nnamdi", role: "Operations Manager" },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary py-20">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl lg:text-5xl font-extrabold text-secondary-foreground mb-6">About <span className="text-primary">ReFAN</span></h1>
            <p className="text-lg text-secondary-foreground/70 leading-relaxed">
              The Resilient Foundation Assistance Network is a non-governmental organization dedicated to building stronger, self-sufficient communities across Africa.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container grid md:grid-cols-2 gap-12">
          <div className="bg-card p-10 rounded-xl shadow-card">
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-accent-foreground" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To empower marginalized communities through sustainable development programs in education, healthcare, and economic empowerment, fostering resilience and self-reliance.
            </p>
          </div>
          <div className="bg-card p-10 rounded-xl shadow-card">
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
              <Eye className="h-6 w-6 text-accent-foreground" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              A world where every community has the resources, knowledge, and infrastructure to thrive independently, free from poverty and inequality.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted">
        <div className="container">
          <h2 className="font-heading text-3xl font-extrabold text-center mb-12">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Heart, title: "Compassion", desc: "We lead with empathy in every interaction." },
              { icon: Users, title: "Community", desc: "Local ownership drives lasting change." },
              { icon: Award, title: "Excellence", desc: "We strive for quality in all we do." },
              { icon: Globe, title: "Integrity", desc: "Transparent and accountable always." },
            ].map((v) => (
              <div key={v.title} className="bg-card rounded-xl p-8 shadow-soft text-center">
                <v.icon className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-heading font-bold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl font-extrabold mb-6">Meet Our Team</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Our dedicated team brings together expertise in community development, public health, education, and nonprofit management.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {team.map((t) => (
                  <div key={t.name} className="p-4 rounded-lg bg-muted">
                    <p className="font-heading font-bold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl overflow-hidden shadow-elevated">
              <img src={aboutTeam} alt="ReFAN team" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
