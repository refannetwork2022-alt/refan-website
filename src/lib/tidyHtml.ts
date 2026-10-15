// Evens out admin texts for display (Voices, values...). Texts pasted from WhatsApp, Word or the web arrive with a mix
// of <br>, <div>, <p> and blank lines, so the same story could start with an empty gap or have uneven spaces between
// paragraphs. Here each block (<div>/<p>) and each blank line starts a new paragraph, single line breaks stay,
// empty lines at the start/end and repeated blank lines go, and bold/colour/size/links are kept.
// Lists and headings stay as they are, each as its own paragraph.

const BLOCKS = new Set(["DIV", "P", "SECTION", "ARTICLE", "BLOCKQUOTE"]);
const KEEP_WHOLE = new Set(["UL", "OL", "H1", "H2", "H3", "H4", "H5", "H6", "TABLE", "IMG", "HR"]);

type Line = Node[] | Element; // inline pieces of one line, or a list/heading kept whole

const escapeText = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const tidyHtml = (input: string): string => {
  if (!input) return "";
  const isHtml = /<[a-z][\s\S]*>/i.test(input);
  // Plain text: lines and blank lines, same rules.
  const html = isHtml ? input : escapeText(input).replace(/\r?\n/g, "<br>");
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return input;

  const lines: Line[] = [];
  let current: Node[] = [];
  const endLine = () => { lines.push(current); current = []; };
  // Ends the current line only if something is on it (a block starting mid-line), so blocks don't add blank lines.
  const breakIfNeeded = () => { if (current.length) endLine(); };

  // `wrap` re-creates the inline formatting (and a block's own colour/size style) around each piece of text.
  const walk = (node: Node, wrap: (n: Node) => Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent) current.push(wrap(doc.createTextNode(child.textContent)));
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const el = child as Element;
      if (el.tagName === "BR") { endLine(); return; }
      if (KEEP_WHOLE.has(el.tagName)) {
        breakIfNeeded();
        lines.push(el.cloneNode(true) as Element);
        return;
      }
      const style = el.getAttribute("style");
      const inner = BLOCKS.has(el.tagName)
        // A block's own text style (colour, size...) is kept on its text; its spacing/alignment is not.
        ? (style ? (n: Node) => { const s = doc.createElement("span"); s.setAttribute("style", style); s.appendChild(n); return wrap(s); } : wrap)
        : (n: Node) => { const c = el.cloneNode(false); c.appendChild(n); return wrap(c); };
      if (BLOCKS.has(el.tagName)) {
        // Each block (a line typed in the editor, a pasted paragraph) is its own paragraph, as it looked before.
        breakIfNeeded();
        lines.push([]);
        walk(el, inner);
        breakIfNeeded();
        lines.push([]);
      } else {
        walk(el, inner);
      }
    });
  };
  walk(root, (n) => n);
  if (current.length) endLine();

  const isBlank = (line: Line) =>
    Array.isArray(line) && line.every((n) => !(n.textContent || "").replace(/ /g, " ").trim());

  // Group lines into paragraphs: blank lines separate them; lists/headings stand alone. Texts typed like a chat
  // (one long sentence per line, no blank lines) would otherwise be one huge paragraph, so a line break after a long
  // line also starts a new paragraph; short lines (a name and title, a poem) stay together.
  const LONG_LINE = 60;
  const out = doc.createElement("div");
  let para: HTMLParagraphElement | null = null;
  let previousLength = 0;
  for (const line of lines) {
    if (!Array.isArray(line)) {
      para = null;
      out.appendChild(line);
      continue;
    }
    if (isBlank(line)) { para = null; continue; }
    if (para && previousLength >= LONG_LINE) para = null;
    if (!para) { para = doc.createElement("p"); out.appendChild(para); }
    else para.appendChild(doc.createElement("br"));
    line.forEach((n) => para!.appendChild(n));
    previousLength = line.reduce((sum, n) => sum + (n.textContent || "").trim().length, 0);
  }
  // Leading spaces/nbsp at the start of each paragraph are left over from pasting; trim them.
  out.querySelectorAll("p").forEach((p) => {
    const first = p.firstChild;
    if (first?.nodeType === Node.TEXT_NODE) first.textContent = (first.textContent || "").replace(/^[\s ]+/, "");
  });
  return out.innerHTML;
};
