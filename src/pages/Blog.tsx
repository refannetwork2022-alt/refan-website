import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { store, BlogPost } from "@/lib/store";
import { Calendar, User, X, ChevronRight, Share2, Facebook, Twitter, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Blog = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  useEffect(() => {
    store.getBlogs().then(setPosts);
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); toast({ title: "Link copied!" }); };

  return (
    <Layout>
      <section className="container pt-12 pb-8">
        <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mb-3">
          <span className="text-primary">Blog</span> & <span className="text-secondary">News</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">Insights, updates, and perspectives on community development.</p>
      </section>

      <section className="container py-8 pb-20">
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No blog posts yet. Stay tuned!</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                onClick={() => setSelected(post)}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:border-secondary/50 hover:shadow-elevated transition-all cursor-pointer group"
              >
                <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2 group-hover:text-secondary transition-colors">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-primary" />{post.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-secondary" />{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <span className="text-secondary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      Read <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Blog popup modal - bigger than story */}
      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-card rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 rounded-t-2xl bg-gradient-to-r from-primary to-secondary" />
            <div className="sticky top-0 bg-card border-b border-border px-8 py-6 flex items-start justify-between">
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selected.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold">{tag}</span>
                  ))}
                </div>
                <h2 className="font-heading text-2xl lg:text-3xl font-bold">{selected.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-primary" />{selected.author}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-secondary" />{new Date(selected.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-8 py-6">
              <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-6" />
              <p className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap">{selected.content}</p>
            </div>
            <div className="px-8 pb-6 flex items-center justify-between border-t border-border pt-4">
              <Button onClick={() => setSelected(null)} variant="outline" className="btn-hover">Close</Button>
              <div className="flex items-center gap-1">
                <Share2 className="h-4 w-4 text-muted-foreground mr-1" />
                <button onClick={copyLink} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Copy link"><Link2 className="h-4 w-4" /></button>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors text-[#1877F2]"><Facebook className="h-4 w-4" /></a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selected.title)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors text-[#1DA1F2]"><Twitter className="h-4 w-4" /></a>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Blog;
