import { Copy, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { copyText, shareLink } from "@/lib/share";

// Link to the member registration form. "/?page=register" (not "#/register") so it still works when
// apps like Facebook strip the "#..." part; SharedLinkRedirect in App.tsx opens the form.
export const registrationLink = () => `${window.location.origin}/?page=register`;

const MESSAGE = "Register as a ReFAN member here:";

// Copy / WhatsApp / Share buttons so admins can send the registration form link.
const RegistrationLinkShare = () => {
  const { toast } = useToast();
  const link = registrationLink();

  const onCopy = async () => {
    const ok = await copyText(link);
    toast(ok ? { title: "Registration link copied!" } : { title: "Could not copy the link.", variant: "destructive" });
  };

  const onShare = async () => {
    const result = await shareLink("ReFAN member registration", link);
    if (result === "copied") toast({ title: "Registration link copied!" });
    else if (result === "failed") toast({ title: "Could not share the link.", variant: "destructive" });
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-soft mb-6 space-y-2">
      <p className="text-sm font-semibold">Member registration link</p>
      <p className="text-xs text-muted-foreground">Send this link to people who want to become members. It opens the registration form.</p>
      <input readOnly value={link} onFocus={(e) => e.target.select()} className="w-full px-3 py-2 rounded-lg border border-input bg-muted/40 text-sm" />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onCopy}><Copy className="h-4 w-4" /> Copy Link</Button>
        <Button asChild variant="outline" size="sm">
          <a href={`https://wa.me/?text=${encodeURIComponent(`${MESSAGE} ${link}`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" /> Send on WhatsApp</a>
        </Button>
        <Button variant="outline" size="sm" onClick={onShare}><Share2 className="h-4 w-4" /> Share</Button>
      </div>
    </div>
  );
};

export default RegistrationLinkShare;
