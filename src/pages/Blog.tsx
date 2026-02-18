import Layout from "@/components/layout/Layout";
import { store } from "@/lib/store";
import { Calendar, User, ArrowRight } from "lucide-react";

const Blog = () => {
  const posts = store.getBlogs();

  return (
    <Layout>
      <section className="bg-secondary py-20">
        <div className="container">
          <h1 className="font-heading text-4xl lg:text-5xl font-extrabold text-secondary-foreground mb-4">Blog & <span className="text-primary">News</span></h1>
          <p className="text-lg text-secondary-foreground/70 max-w-2xl">Insights, updates, and perspectives on community development.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">No blog posts yet. Stay tuned!</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow group">
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium">{tag}</span>
                      ))}
                    </div>
                    <h3 className="font-heading text-lg font-bold mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{post.author}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
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

export default Blog;
