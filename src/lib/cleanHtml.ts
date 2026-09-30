// Cleans rich text coming into the admin editor (pasted from the website, Word, Google Docs, WhatsApp web...).
// Keeps the formatting the editor offers (bold, italic, underline, colour, highlight, alignment, size, links, lists,
// paragraphs) and drops hidden framework styles such as "--tw-..." that made some texts ~75x bigger than their words.

const ALLOWED_TAGS = new Set([
  "B", "STRONG", "I", "EM", "U", "S", "STRIKE", "BR", "P", "DIV", "SPAN", "FONT", "A", "UL", "OL", "LI",
  "H1", "H2", "H3", "H4", "BLOCKQUOTE", "SUB", "SUP", "MARK",
]);
const ALLOWED_STYLES = new Set(["color", "background-color", "text-align", "font-weight", "font-style", "text-decoration", "text-decoration-line", "font-size"]);
const DROP_WITH_CONTENT = new Set(["SCRIPT", "STYLE", "META", "LINK", "TITLE", "IFRAME", "OBJECT", "SVG", "IMG", "VIDEO", "AUDIO"]);

const cleanStyle = (style: string): string =>
  style
    .split(";")
    .map((d) => d.trim())
    .filter((d) => {
      const prop = d.split(":")[0]?.trim().toLowerCase();
      return prop && ALLOWED_STYLES.has(prop) && !/var\(|--tw-/i.test(d);
    })
    .join("; ");

const cleanNode = (node: Node) => {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.COMMENT_NODE) { child.remove(); return; }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const el = child as HTMLElement;
    if (DROP_WITH_CONTENT.has(el.tagName)) { el.remove(); return; }
    cleanNode(el);
    if (!ALLOWED_TAGS.has(el.tagName)) {
      el.replaceWith(...Array.from(el.childNodes)); // keep the text, drop the unknown wrapper
      return;
    }
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name === "style") {
        const kept = cleanStyle(attr.value);
        if (kept) el.setAttribute("style", kept); else el.removeAttribute("style");
      } else if (el.tagName === "A" && (name === "href" || name === "target" || name === "rel")) {
        if (name === "href" && /^\s*javascript:/i.test(attr.value)) el.removeAttribute("href");
      } else if (el.tagName === "FONT" && (name === "color" || name === "size")) {
        // editor colour / size
      } else {
        el.removeAttribute(attr.name); // class, id, data-*, on*...
      }
    });
    // Unwrap empty style-less spans left behind.
    if (el.tagName === "SPAN" && !el.attributes.length) el.replaceWith(...Array.from(el.childNodes));
  });
};

export const cleanHtml = (html: string): string => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild as HTMLElement | null;
  if (!root) return "";
  cleanNode(root);
  return root.innerHTML;
};

// True when saved HTML carries the hidden framework styles worth cleaning.
export const hasPasteJunk = (html: string): boolean => /--tw-|class="|data-[a-z-]+="/i.test(html || "");
