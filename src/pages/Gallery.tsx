import Layout from "@/components/layout/Layout";
import { store } from "@/lib/store";
import { Image, Video } from "lucide-react";
import educationImg from "@/assets/programs-education.jpg";
import healthImg from "@/assets/programs-health.jpg";
import livelihoodImg from "@/assets/programs-livelihood.jpg";
import heroBg from "@/assets/hero-bg.jpg";
import aboutTeam from "@/assets/about-team.jpg";

// Fallback images for gallery items without URLs
const fallbackImages = [educationImg, healthImg, livelihoodImg, heroBg, aboutTeam];

const Gallery = () => {
  const items = store.getGallery();

  return (
    <Layout>
      <section className="bg-secondary py-20">
        <div className="container">
          <h1 className="font-heading text-4xl lg:text-5xl font-extrabold text-secondary-foreground mb-4"><span className="text-primary">Gallery</span></h1>
          <p className="text-lg text-secondary-foreground/70 max-w-2xl">Moments captured from our work in the field.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">Gallery is being updated. Check back soon!</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item, idx) => (
                <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-card cursor-pointer">
                  <img
                    src={item.url || fallbackImages[idx % fallbackImages.length]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
