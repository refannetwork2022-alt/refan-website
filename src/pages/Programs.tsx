import Layout from "@/components/layout/Layout";
import { BookOpen, Stethoscope, Users, Droplets, Leaf, Home } from "lucide-react";
import educationImg from "@/assets/programs-education.jpg";
import healthImg from "@/assets/programs-health.jpg";
import livelihoodImg from "@/assets/programs-livelihood.jpg";

const programs = [
  {
    title: "Education & Scholarships",
    desc: "We provide scholarships, build classrooms, supply learning materials, and train teachers to ensure quality education reaches every child.",
    icon: BookOpen,
    image: educationImg,
    stats: "5,000+ students supported",
  },
  {
    title: "Healthcare & Wellness",
    desc: "Mobile clinics, health camps, maternal care programs, and vaccination drives bring essential healthcare to remote communities.",
    icon: Stethoscope,
    image: healthImg,
    stats: "20+ health outreaches",
  },
  {
    title: "Livelihood & Empowerment",
    desc: "Skills training, microfinance support, and women's cooperatives help families build sustainable incomes and break the cycle of poverty.",
    icon: Users,
    image: livelihoodImg,
    stats: "1,200+ families empowered",
  },
  {
    title: "Clean Water & Sanitation",
    desc: "Borehole drilling, water treatment, and hygiene education programs to provide safe drinking water to underserved communities.",
    icon: Droplets,
    image: educationImg,
    stats: "15 boreholes completed",
  },
  {
    title: "Environmental Sustainability",
    desc: "Tree planting drives, waste management training, and renewable energy projects for greener communities.",
    icon: Leaf,
    image: livelihoodImg,
    stats: "10,000+ trees planted",
  },
  {
    title: "Shelter & Infrastructure",
    desc: "Building homes, community centers, and essential infrastructure for displaced families and vulnerable populations.",
    icon: Home,
    image: healthImg,
    stats: "50+ structures built",
  },
];

const Programs = () => {
  return (
    <Layout>
      <section className="bg-secondary py-20">
        <div className="container">
          <h1 className="font-heading text-4xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">Our <span className="text-primary">Programs</span></h1>
          <p className="text-lg text-secondary-foreground/70 max-w-2xl">
            Comprehensive, community-led programs designed to address the most pressing needs and build lasting resilience.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container space-y-16">
          {programs.map((prog, i) => (
            <div key={prog.title} className={`grid lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-lg bg-accent">
                    <prog.icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h2 className="font-heading text-2xl font-bold">{prog.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">{prog.desc}</p>
                <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                  {prog.stats}
                </span>
              </div>
              <div className={`rounded-xl overflow-hidden shadow-card ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <img src={prog.image} alt={prog.title} className="w-full aspect-[4/3] object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Programs;
