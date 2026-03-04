import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { BookOpen, Users, Heart } from "lucide-react";
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

const Programs = () => {
  const [d, setD] = useState<ProgramsSettings>(DEFAULTS);

  useEffect(() => {
    store.getPageSettings<ProgramsSettings>("programs").then((data) => {
      if (data) setD({ ...DEFAULTS, ...data });
    });
  }, []);

  return (
    <Layout>
      <section className="container pt-12 pb-8">
        <p className="text-sm text-muted-foreground mb-2">Home &gt; Programs</p>
        <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mb-3" dangerouslySetInnerHTML={{ __html: d.pageTitle }} />
        <div className="text-lg text-muted-foreground max-w-2xl" dangerouslySetInnerHTML={{ __html: d.pageSubtitle }} />
      </section>

      <section className="container py-12">
        <div className="container space-y-16">
          {d.programs.map((prog, i) => {
            const Icon = icons[i % icons.length];
            const img = prog.image || defaultImages[i % defaultImages.length];
            return (
              <div key={i} className={`grid lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-lg bg-accent">
                      <Icon className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold">{prog.title}</h2>
                  </div>
                  <div className="text-muted-foreground leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: prog.description }} />
                  <span className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                    {prog.stats}
                  </span>
                </div>
                <div className={`rounded-xl overflow-hidden shadow-card ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <img src={img} alt={prog.title} className="w-full aspect-[4/3] object-cover" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
};

export default Programs;
