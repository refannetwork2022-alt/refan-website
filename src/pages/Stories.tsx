import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { store, type Story } from "@/lib/store";
import { Calendar, Tag } from "lucide-react";

const Stories = () => {
  const [filter, setFilter] = useState<'all' | 'story' | 'announcement'>('all');
  const stories = store.getStories();
  const filtered = filter === 'all' ? stories : stories.filter(s => s.category === filter);

  return (
    <Layout>
      <section className="bg-secondary py-20">
        <div className="container">
          <h1 className="font-heading text-4xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">Stories & <span className="text-primary">Announcements</span></h1>
          <p className="text-lg text-secondary-foreground/70 max-w-2xl">Real impact stories from the communities we serve.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="flex gap-2 mb-10">
            {(['all', 'story', 'announcement'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {f === 'all' ? 'All' : f === 'story' ? 'Stories' : 'Announcements'}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No stories yet. Check back soon!</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((story) => (
                <article key={story.id} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        story.category === 'story' ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary'
                      }`}>
                        {story.category === 'story' ? 'Story' : 'Announcement'}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-bold mb-2">{story.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{story.excerpt}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(story.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Stories;
