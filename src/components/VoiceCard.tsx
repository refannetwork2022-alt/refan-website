import { Quote, User, Share2 } from "lucide-react";
import { buildShareUrl, shareLink } from "@/lib/share";
import { useToast } from "@/hooks/use-toast";

export type Voice = { quote: string; name: string; role: string; image?: string };

// The home page shows only this many (the newest); the rest are on Stories > Voices.
export const HOME_VOICES_LIMIT = 12;

// Newest first: the admin adds testimonials at the end of the list. Each keeps its place in the saved list
// (`index`), which share links (?voice=N) use, so links already sent keep pointing at the same testimonial.
export const newestFirst = (list: Voice[]) => list.map((voice, index) => ({ voice, index })).reverse();

// Saved-list positions of the testimonials shown on the home page.
export const isOnHomePage = (index: number, total: number) => index >= total - HOME_VOICES_LIMIT && index < total;

export const DEFAULT_VOICES: Voice[] = [
  { quote: "ReFAN gave my children hope when we had nothing. They provided school fees and emotional support that changed our lives forever.", name: "Marie K.", role: "Widow & Mother of 3" },
  { quote: "Thanks to the education program, I can now dream of becoming a doctor. ReFAN believes in us even when the world forgets.", name: "Emmanuel T.", role: "Orphan, Age 16" },
  { quote: "The community resilience workshops taught me skills to support my family. I went from grieving alone to leading others.", name: "Esperance N.", role: "Widow & Workshop Leader" },
];

// One "Voices" testimonial card (home page and Stories > Voices). `index` is its place in the full list,
// used for the share link (?voice=N) and the element id the shared link scrolls to.
const VoiceCard = ({ voice: t, index: i, highlight }: { voice: Voice; index: number; highlight?: boolean }) => {
  const { toast } = useToast();

  const shareVoice = async () => {
    const result = await shareLink(`${t.name} — Voices from ReFAN`, buildShareUrl("voice", String(i), `${t.name}|${t.image || ""}`));
    if (result === "copied") toast({ title: "Link copied!" });
    else if (result === "failed") toast({ title: "Could not share. Please copy the link from your browser.", variant: "destructive" });
  };

  return (
    // With a photo the card shows it on top (like the announcement cards); without one it stays as before.
    <div id={`voice-${i}`} className={`bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-card transition-all relative flex flex-col ${t.image ? "overflow-hidden" : "p-6 sm:p-8"} ${highlight ? "ring-2 ring-primary" : ""}`}>
      {!t.image && <Quote className="h-8 w-8 text-primary/20 absolute top-6 right-6" />}
      {t.image && (
        <div className="aspect-[4/3] bg-muted overflow-hidden">
          <img src={t.image} alt={t.name} className="w-full h-full object-cover object-top" />
        </div>
      )}
      <div className={`relative flex flex-col flex-1 ${t.image ? "p-6 sm:p-8" : ""}`}>
        {t.image && <Quote className="h-8 w-8 text-primary/20 absolute top-6 right-6" />}
        <div
          className={`testimonial-content text-muted-foreground leading-relaxed mb-6 pr-8 break-words ${/<[a-z][\s\S]*>/i.test(t.quote) ? "" : "whitespace-pre-line"}`}
          dangerouslySetInnerHTML={{ __html: t.quote }}
        />
        <div className="flex items-center gap-3 border-t border-border pt-4 mt-auto">
          {!t.image && (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <p className="font-bold text-sm">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.role}</p>
          </div>
          <button type="button" onClick={shareVoice} className="ml-auto p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors" title="Share this voice" aria-label={`Share ${t.name}'s voice`}>
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceCard;
