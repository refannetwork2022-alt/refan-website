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
  /** Height of the preview on the card, as a Tailwind max-h class (when `paragraphs` isn't set). */
  maxHeightClass?: string;
  /** Show this many paragraphs on the card instead of a fixed height. */
  paragraphs?: number;
  /** Shown above / below the full text in the pop-up (photo, name...). */
  header?: ReactNode;
  footer?: ReactNode;
}

// Height (px from the top of `el`) that shows its first `count` paragraphs, or null if it has no more than that.
// Paragraphs are found on screen, not in the HTML: the admin's texts mix <br>, blank lines, <div>s and <p>s,
// so a paragraph starts wherever there is a visible gap between two lines of text.
const paragraphsHeight = (el: HTMLElement, count: number): number | null => {
  const base = el.getBoundingClientRect().top;
  const boxes: Array<{ top: number; bottom: number }> = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.height > 0) boxes.push({ top: rect.top - base, bottom: rect.bottom - base });
    }
  }
  boxes.sort((a, b) => a.top - b.top);
  const lines: Array<{ top: number; bottom: number }> = [];
  for (const box of boxes) {
    const last = lines[lines.length - 1];
    if (last && box.top < last.bottom - 2) last.bottom = Math.max(last.bottom, box.bottom);
    else lines.push({ ...box });
  }
  if (lines.length === 0) return null;
  const lineHeight = lines[0].bottom - lines[0].top;
  let paragraph = 1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].top - lines[i - 1].bottom > lineHeight * 0.8 && ++paragraph > count) {
      return Math.ceil(lines[i - 1].bottom + 4);
    }
  }
  return null;
};

// Long texts on cards (Voices, values) show their first paragraphs/lines only; "Read more" opens the whole text in a
// pop-up. Short texts show in full, without the button.
const ReadMore = ({ html, title, className = "", maxHeightClass = "max-h-72", paragraphs, header, footer }: ReadMoreProps) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [limit, setLimit] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const check = () => {
      if (paragraphs) {
        const height = paragraphsHeight(el, paragraphs);
        setLimit(height);
        setOverflows(height !== null);
      } else {
        setOverflows(el.scrollHeight > el.clientHeight + 4);
      }
    };
    check();
    document.fonts?.ready.then(check); // web fonts move the lines once they load
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [html, paragraphs]);

  return (
    <div>
      <div
        ref={boxRef}
        className={`relative overflow-hidden ${paragraphs ? "" : maxHeightClass}`}
        style={paragraphs && limit !== null ? { maxHeight: limit } : undefined}
      >
        <RichText html={html} className={className} />
        {overflows && !paragraphs && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />}
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
