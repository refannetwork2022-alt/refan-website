import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { store, AboutSettings } from "@/lib/store";
import { DEFAULT_OVERVIEW, DEFAULT_OVERVIEW_TITLE } from "@/lib/overview";

// About > Organisational Overview (edited in Admin > Page Content > About).
const Overview = () => {
  const [title, setTitle] = useState(DEFAULT_OVERVIEW_TITLE);
  const [body, setBody] = useState(DEFAULT_OVERVIEW);

  useEffect(() => {
    store.getPageSettings<AboutSettings>("about").then((data) => {
      if (data?.overviewTitle) setTitle(data.overviewTitle);
      if (data?.overview) setBody(data.overview);
    });
  }, []);

  return (
    <Layout>
      <section className="container max-w-3xl py-10 pb-20">
        <Link to="/about" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> About Us
        </Link>
        <h1 className="font-heading text-3xl md:text-5xl font-extrabold leading-tight mb-8">{title}</h1>
        <div className="overview-content text-foreground/80 text-lg leading-relaxed break-words" dangerouslySetInnerHTML={{ __html: body }} />
      </section>
    </Layout>
  );
};

export default Overview;
