import { ReactNode, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const isHtml = (text: string) => /<[a-z][\s\S]*>/i.test(text);

// Formatted (admin editor) or plain text. Plain text keeps its line breaks.
export const RichText = ({ html, className = "" }: { html: string; className?: string }) => (
  <div
    className={`testimonial-content break-words ${isHtml(html) ? "" : "whitespace-pre-line"} ${className}`}
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

interface ReadMoreProps {
  html: string;
  /** Pop-up title (e.g. the person's name or the value's title). */
  title: string;
  className?: string;
  /** Height of the preview on the card, as a Tailwind max-h class. */
  maxHeightClass?: string;
  /** Shown above / below the full text in the pop-up (photo, name...). */
  header?: ReactNode;
  footer?: ReactNode;
}

// Long texts on cards (Voices, values) show their first lines only; "Read more" opens the whole text in a pop-up.
// Short texts show in full, without the button.
const ReadMore = ({ html, title, className = "", maxHeightClass = "max-h-72", header, footer }: ReadMoreProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 4);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [html]);

  return (
    <div>
      <div ref={boxRef} className={`relative overflow-hidden ${maxHeightClass}`}>
        <RichText html={html} className={className} />
        {overflows && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />}
      </div>
      {overflows && (
        <button type="button" onClick={() => setOpen(true)} className="mt-3 text-sm font-bold text-primary hover:underline">
          Read more
        </button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto rounded-2xl p-0 gap-0 [&>button:last-child]:bg-white [&>button:last-child]:p-1.5 [&>button:last-child]:rounded-full [&>button:last-child]:shadow [&>button:last-child]:opacity-90">
          {header}
          <div className="p-6 sm:p-8 space-y-4">
            <DialogTitle className="font-heading text-xl font-bold pr-6">{title}</DialogTitle>
            <RichText html={html} className="text-foreground/80 leading-relaxed" />
            {footer}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReadMore;
