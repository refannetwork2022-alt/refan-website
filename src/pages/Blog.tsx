import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { store, BlogPost } from "@/lib/store";
import { Calendar, User, X, ChevronRight, Share2, Facebook, Twitter, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  let m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  m = url.match(/vimeo\.com\/(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) return url;
  return null;
};

const sampleBlogPosts: BlogPost[] = [
  {
    id: "blog-1",
    title: "Why Refugee-Led Organizations Matter More Than Ever",
    excerpt: "Refugee-led organizations like ReFAN bring a unique understanding of community needs that external organizations often miss. Here's why investing in refugee leadership is key to sustainable development.",
    content: "Refugee-led organizations like ReFAN bring a unique understanding of community needs that external organizations often miss. When refugees lead the response, programs are more culturally appropriate, more sustainable, and more impactful.\n\nAt ReFAN, our team lives in Dzaleka Refugee Camp. We don't just serve the community — we are the community. This means we understand the daily realities, the barriers, and the aspirations of the people we work with.\n\nStudies have shown that refugee-led organizations are often more cost-effective and have deeper reach within communities. Yet, they receive less than 1% of global humanitarian funding. This is a gap that needs to be addressed.\n\nBy supporting ReFAN, you're not just funding programs — you're investing in a model of self-reliance and dignity that empowers refugees to lead their own development. Together, we can show the world that refugees are not just recipients of aid — they are agents of change.",
    image: "/IMG-20260217-WA0040.jpg",
    author: "Goreth N.",
    date: "2026-02-20",
    tags: ["Leadership", "Refugees", "Community"],
  },
  {
    id: "blog-2",
    title: "Education as a Lifeline: Stories from Dzaleka's Classrooms",
    excerpt: "For orphaned children in Dzaleka, education is more than learning — it's hope. Discover how ReFAN's education program is transforming young lives one classroom at a time.",
    content: "In Dzaleka Refugee Camp, education is not a given — it's a privilege that many children struggle to access. School fees, uniforms, books, and supplies are often out of reach for families who are already stretched thin.\n\nReFAN's Education Support Program was created to bridge this gap. Since 2022, we have supported over 100 orphaned children with full educational packages, including school fees, uniforms, books, and after-school tutoring.\n\nOne of our students, Emmanuel, lost both parents at age 12. When ReFAN stepped in, he was on the verge of dropping out. Today, Emmanuel is a top student in his class and dreams of becoming a doctor.\n\n'ReFAN gave me more than school fees,' Emmanuel says. 'They gave me a reason to believe in tomorrow.'\n\nEvery child deserves the chance to learn, grow, and dream. With your support, we can reach even more children like Emmanuel and ensure that no orphan in Dzaleka is left behind.",
    image: "/gallery-classroom.jpg",
    author: "Wagstan M.",
    date: "2026-02-12",
    tags: ["Education", "Children", "Impact"],
  },
  {
    id: "blog-3",
    title: "Turning Grief into Resilience: The Power of Bereavement Support",
    excerpt: "Losing a loved one is devastating. For refugees, grief is compounded by displacement and poverty. Learn how ReFAN's bereavement program helps families heal and rebuild.",
    content: "Grief is a universal experience, but for refugees in Dzaleka, it carries an extra weight. Many have lost family members to conflict, disease, or the harsh realities of displacement. Without support, grief can become a barrier to survival.\n\nReFAN's Bereavement Support Program offers counseling, group therapy, and community gatherings that help families process their loss and find strength in solidarity. Our approach is rooted in cultural sensitivity and community trust.\n\nEsperance, a widow and mother of four, joined our support group after losing her husband. 'I felt alone in my pain,' she recalls. 'But in the group, I found women who understood. We cried together, and then we started building together.'\n\nToday, Esperance leads a small savings group and mentors other widows. Her story is one of many that show how grief, when met with compassion and community, can become a foundation for resilience.\n\nIf you or someone you know is struggling with loss, know that you are not alone. ReFAN is here to walk with you.",
    image: "/IMG-20260217-WA0055.jpg",
    author: "Goreth N.",
    date: "2026-01-28",
    tags: ["Bereavement", "Resilience", "Women"],
  },
  {
    id: "blog-4",
    title: "Community Voices: What ReFAN Means to Dzaleka",
    excerpt: "We asked members of the Dzaleka community what ReFAN means to them. Their answers reveal the true impact of grassroots, refugee-led action.",
    content: "At ReFAN, we believe that the voices of the community matter most. So we asked: What does ReFAN mean to you?\n\nMarie, a widow: 'ReFAN is family. When my husband died, they were the first to come. They helped with the funeral, and then they stayed. They helped my children go back to school. That's not just charity — that's love.'\n\nJean, a youth volunteer: 'I was lost after finishing school. No job, no hope. ReFAN gave me a purpose. Now I teach younger kids and organize community events. I feel like I matter.'\n\nClaire, a community elder: 'In my 20 years in this camp, I've seen organizations come and go. But ReFAN is different. They are us. They understand. And they don't give up.'\n\nThese voices remind us why we do this work. ReFAN is not just an organization — it's a movement of hope, led by refugees, for refugees. And with your support, this movement will only grow stronger.",
    image: "/IMG-20260217-WA0049.jpg",
    author: "Wagstan M.",
    date: "2026-01-15",
    tags: ["Community", "Stories", "Impact"],
  },
  {
    id: "blog-5",
    title: "2025 in Review: A Year of Growth and Impact",
    excerpt: "From expanding our education program to launching new community workshops, 2025 was a year of milestones for ReFAN. Here's a look back at what we accomplished together.",
    content: "As we step into 2026, we want to take a moment to celebrate the incredible journey of 2025. It was a year of growth, challenges, and above all, impact.\n\nKey highlights:\n\n- Education: We expanded our scholarship program to support 120 orphaned children, up from 80 in 2024.\n- Community Resilience: We launched 4 new skills workshops for widows, reaching over 60 women with training in tailoring, soap-making, beadwork, and financial literacy.\n- Bereavement Support: Our support groups reached 100 families, providing counseling and community gatherings that helped families heal.\n- Volunteers: We welcomed 15 new community volunteers who contributed over 2,000 hours of service.\n- Partnerships: We strengthened relationships with local leaders and international supporters who believe in our mission.\n\nNone of this would have been possible without the generosity and dedication of our donors, volunteers, and community members. Every contribution, no matter how small, has made a difference.\n\nAs we look ahead to 2026, we are committed to reaching even more families, expanding our programs, and continuing to prove that refugee-led action works. Thank you for being part of this journey.",
    image: "/IMG-20260217-WA0041.jpg",
    author: "Goreth N.",
    date: "2026-01-05",
    tags: ["Annual Review", "Impact", "Growth"],
  },
  {
    id: "blog-6",
    title: "How You Can Support Refugees from Anywhere in the World",
    excerpt: "You don't have to be in Malawi to make a difference. Here are practical ways you can support ReFAN and the refugees of Dzaleka from wherever you are.",
    content: "One of the most common questions we receive is: 'How can I help from so far away?' The answer is: more than you might think.\n\nHere are practical ways you can support ReFAN and the refugees of Dzaleka:\n\n1. Donate: Even a small contribution goes a long way. Our programs are designed to maximize impact with minimal resources. Every dollar counts.\n\n2. Spread the Word: Share our stories on social media. Talk about refugee issues with your friends and family. Awareness is a powerful tool for change.\n\n3. Volunteer Remotely: If you have skills in design, writing, marketing, or technology, we'd love your help. Remote volunteers play a crucial role in amplifying our message.\n\n4. Become a Monthly Sponsor: Regular giving helps us plan ahead and sustain our programs. Even a few dollars a month can support a child's education.\n\n5. Advocate: Write to your representatives about refugee rights. Support policies that empower refugee-led organizations.\n\nDistance is not a barrier to compassion. Together, we can build a world where every refugee has the support they need to thrive.",
    image: "/gallery-community.jpg",
    author: "Wagstan M.",
    date: "2025-12-20",
    tags: ["How to Help", "Donate", "Volunteer"],
  },
];

const BLOG_DEFAULTS = {
  pageTitle: '<span class="text-primary">Blog</span> & <span class="text-secondary">News</span>',
  pageSubtitle: 'Insights, updates, and perspectives on community development.',
};

const Blog = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [pg, setPg] = useState(BLOG_DEFAULTS);

  useEffect(() => {
    store.getBlogs().then((data) => {
      setPosts(data.length > 0 ? data : sampleBlogPosts);
    }).catch(() => setPosts(sampleBlogPosts));
    store.getPageSettings<typeof BLOG_DEFAULTS>("blogpage").then((d) => { if (d) setPg({ ...BLOG_DEFAULTS, ...d }); });
  }, []);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const copyLink = () => { navigator.clipboard.writeText(shareUrl); toast({ title: "Link copied!" }); };

  return (
    <Layout>
      <section className="container pt-12 pb-8">
        <h1 className="font-heading text-3xl lg:text-5xl font-extrabold mb-3" dangerouslySetInnerHTML={{ __html: pg.pageTitle }} />
        <div className="text-lg text-muted-foreground max-w-2xl" dangerouslySetInnerHTML={{ __html: pg.pageSubtitle }} />
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
                {post.image ? (
                  <img src={post.image} alt={post.title} className="w-full aspect-video object-contain bg-muted" />
                ) : (
                  <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
                )}
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
            {selected.image ? (
              <img src={selected.image} alt={selected.title} className="w-full aspect-video object-contain bg-muted rounded-t-2xl" />
            ) : (
              <div className="h-2 rounded-t-2xl bg-gradient-to-r from-primary to-secondary" />
            )}
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
              {(() => {
                try {
                  const blocks = JSON.parse(selected.content);
                  if (Array.isArray(blocks)) {
                    return (
                      <div className="space-y-6">
                        {blocks.map((block: any, idx: number) =>
                          block.type === 'image' ? (
                            <figure key={idx} className="space-y-2">
                              <img src={block.url} alt={block.caption || ''} className="w-full rounded-xl object-cover max-h-[500px]" />
                              {block.caption && <figcaption className="text-sm text-muted-foreground text-center italic">{block.caption}</figcaption>}
                            </figure>
                          ) : block.type === 'video' && getEmbedUrl(block.url) ? (
                            <figure key={idx} className="space-y-2">
                              <div className="w-full aspect-video rounded-xl overflow-hidden">
                                <iframe src={getEmbedUrl(block.url)!} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Video" />
                              </div>
                              {block.caption && <figcaption className="text-sm text-muted-foreground text-center italic">{block.caption}</figcaption>}
                            </figure>
                          ) : (
                            <div key={idx} className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: block.value }} />
                          )
                        )}
                      </div>
                    );
                  }
                } catch {}
                return <div className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: selected.content }} />;
              })()}
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
