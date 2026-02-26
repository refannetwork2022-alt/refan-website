import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail } from "lucide-react";
import { store } from "@/lib/store";

const WEB3FORMS_KEY = "2b77a360-efe4-4f8c-926e-a6a7a8e05895";

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    if (!optIn) {
      setErrorMsg("Please agree to receive updates before subscribing.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: "New Newsletter Subscriber",
          from_name: "ReFAN Newsletter",
          email: trimmed.toLowerCase(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        await store.addSubscriber(trimmed.toLowerCase());
        setStatus("success");
        setEmail("");
        setOptIn(false);
      } else {
        setErrorMsg("Subscription failed. Please try again.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-4">
        <p className="text-sm font-medium text-green-600 dark:text-green-400">Thank you for subscribing!</p>
        <p className="text-xs text-secondary-foreground/70 mt-1">You'll receive updates from ReFAN.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1 bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50"
        />
        <Button type="submit" size="sm" disabled={!optIn || status === "loading"}>
          <Mail className="h-4 w-4 mr-1" />
          {status === "loading" ? "Sending…" : "Subscribe"}
        </Button>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox
          id="newsletter-opt-in"
          checked={optIn}
          onCheckedChange={(checked) => setOptIn(checked === true)}
          className="border-secondary-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <label htmlFor="newsletter-opt-in" className="text-xs text-secondary-foreground/70 leading-tight cursor-pointer">
          I agree to receive email updates from ReFAN. You can unsubscribe at any time.
        </label>
      </div>
      {status === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
      )}
    </form>
  );
};

export default NewsletterForm;
