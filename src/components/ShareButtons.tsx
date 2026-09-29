import { Share2, Facebook, Twitter, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { copyText, shareLink } from "@/lib/share";

interface ShareButtonsProps {
  title: string;
  url: string;
}

// Share / copy / Facebook / Twitter row used in the story and announcement pop-ups.
const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const { toast } = useToast();

  const onShare = async () => {
    const result = await shareLink(title, url);
    if (result === "copied") toast({ title: "Link copied!" });
    else if (result === "failed") toast({ title: "Could not share. Please copy the link from your browser.", variant: "destructive" });
  };

  const onCopy = async () => {
    const ok = await copyText(url);
    toast(ok ? { title: "Link copied!" } : { title: "Could not copy the link.", variant: "destructive" });
  };

  return (
    <div className="flex items-center gap-1">
      <button onClick={onShare} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground" title="Share"><Share2 className="h-4 w-4" /></button>
      <button onClick={onCopy} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Copy link"><Link2 className="h-4 w-4" /></button>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors text-[#1877F2]" title="Share on Facebook"><Facebook className="h-4 w-4" /></a>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition-colors text-[#1DA1F2]" title="Share on Twitter"><Twitter className="h-4 w-4" /></a>
    </div>
  );
};

export default ShareButtons;
