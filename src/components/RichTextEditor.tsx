import { useRef, useEffect } from "react";
import { cleanHtml, hasPasteJunk } from "@/lib/cleanHtml";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, Heading2, Type, Palette, Highlighter, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2, Unlink } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  rows?: number;
}

const COLORS = [
  "#e74c3c", "#c0392b", "#e67e22", "#f39c12", "#f1c40f",
  "#2ecc71", "#27ae60", "#1abc9c", "#3498db", "#2980b9",
  "#9b59b6", "#8e44ad", "#34495e", "#e91e63", "#ff5722",
  "#795548", "#607d8b", "#000000", "#ffffff",
];

const HIGHLIGHTS = [
  "#fff59d", "#ffe082", "#ffcc80", "#ffab91", "#f8bbd0",
  "#e1bee7", "#c5cae9", "#b3e5fc", "#b2ebf2", "#c8e6c9",
  "#dcedc8", "#d7ccc8", "#cfd8dc", "transparent",
];

const RichTextEditor = ({ value, onChange, placeholder = "Write here...", rows = 4 }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const showColorRef = useRef(false);
  const colorPanelRef = useRef<HTMLDivElement>(null);
  const highlightPanelRef = useRef<HTMLDivElement>(null);
  const isUserInput = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUserInput.current) {
      // Older texts pasted from web pages carry hidden styles that make editing slow (especially on phones);
      // clean them once here. The cleaned text is saved the next time the admin saves the page.
      if (hasPasteJunk(value)) {
        const cleaned = cleanHtml(value);
        editorRef.current.innerHTML = cleaned;
        if (cleaned !== value) onChange(cleaned);
        return;
      }
      editorRef.current.innerHTML = value || "";
    }
    isUserInput.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Pasted text keeps simple formatting only (see cleanHtml).
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const html = e.clipboardData.getData("text/html");
    const text = e.clipboardData.getData("text/plain");
    if (!html && !text) return;
    e.preventDefault();
    const safe = html
      ? cleanHtml(html)
      : escapeHtml(text).replace(/\r?\n/g, "<br>");
    document.execCommand("insertHTML", false, safe);
    if (editorRef.current) {
      isUserInput.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const escapeHtml = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  // Links open in a new tab and carry inline styling so they look like links wherever the HTML is shown.
  const insertLink = () => {
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)
      ? selection.getRangeAt(0).cloneRange()
      : null;
    const input = window.prompt("Paste the link (e.g. https://example.com, an email or a phone number):");
    if (!input || !input.trim()) return;
    let url = input.trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url)) url = "mailto:" + url;
    else if (/^\+?[\d\s()-]{7,}$/.test(url)) url = "tel:" + url.replace(/[\s()-]/g, "");
    else if (!/^(https?:|mailto:|tel:)/i.test(url)) url = "https://" + url;
    if (/^javascript:/i.test(url)) return;

    editorRef.current?.focus();
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    const label = range && !range.collapsed ? range.toString() : input.trim();
    const html = `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color:#e67e22;text-decoration:underline;">${escapeHtml(label)}</a>`;
    document.execCommand("insertHTML", false, html);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  };

  // Replace selected links with their plain text so no link styling is left behind.
  const removeLink = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const start = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
    const anchors = new Set<HTMLAnchorElement>();
    const closest = start?.closest("a");
    if (closest && editor.contains(closest)) anchors.add(closest);
    editor.querySelectorAll("a").forEach((a) => { if (range.intersectsNode(a)) anchors.add(a); });
    anchors.forEach((a) => a.replaceWith(document.createTextNode(a.textContent || "")));
    editor.normalize();
    onChange(editor.innerHTML);
  };

  const exec = (command: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      isUserInput.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const toggleColorPanel = () => {
    if (colorPanelRef.current) {
      const isVisible = colorPanelRef.current.style.display !== "none";
      colorPanelRef.current.style.display = isVisible ? "none" : "flex";
    }
  };

  const applyColor = (color: string) => {
    exec("foreColor", color);
    if (colorPanelRef.current) {
      colorPanelRef.current.style.display = "none";
    }
  };

  const toggleHighlightPanel = () => {
    if (highlightPanelRef.current) {
      const isVisible = highlightPanelRef.current.style.display !== "none";
      highlightPanelRef.current.style.display = isVisible ? "none" : "flex";
    }
  };

  const applyHighlight = (color: string) => {
    exec("hiliteColor", color);
    if (highlightPanelRef.current) {
      highlightPanelRef.current.style.display = "none";
    }
  };

  const applyFontSize = (size: string) => {
    exec("fontSize", size);
  };

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-input bg-muted/30">
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 font-bold" onClick={() => exec("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => exec("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => exec("underline")} title="Underline">
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => applyFontSize("5")} title="Large text">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => applyFontSize("2")} title="Small text">
          <Type className="h-3 w-3" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <div className="relative">
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleColorPanel} title="Text color">
            <Palette className="h-4 w-4" />
          </Button>
          <div
            ref={colorPanelRef}
            style={{ display: "none" }}
            className="absolute top-full left-0 mt-1 p-2 bg-card border border-border rounded-lg shadow-lg z-50 flex flex-wrap gap-1 w-[200px]"
          >
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => applyColor(color)}
              />
            ))}
          </div>
        </div>
        <div className="relative">
          <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleHighlightPanel} title="Highlight">
            <Highlighter className="h-4 w-4" />
          </Button>
          <div
            ref={highlightPanelRef}
            style={{ display: "none" }}
            className="absolute top-full left-0 mt-1 p-2 bg-card border border-border rounded-lg shadow-lg z-50 flex flex-wrap gap-1 w-[200px]"
          >
            {HIGHLIGHTS.map((color) => (
              <button
                key={color}
                type="button"
                title={color === "transparent" ? "No highlight" : "Highlight"}
                className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => applyHighlight(color)}
              />
            ))}
          </div>
        </div>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => exec("justifyLeft")} title="Align left">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => exec("justifyCenter")} title="Align center">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => exec("justifyRight")} title="Align right">
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => exec("insertUnorderedList")} title="Bullet list">
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => exec("insertOrderedList")} title="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => e.preventDefault()} onClick={insertLink} title="Add link (select text first)">
          <Link2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onMouseDown={(e) => e.preventDefault()} onClick={removeLink} title="Remove link">
          <Unlink className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="px-4 py-2.5 text-sm outline-none focus:ring-0 overflow-auto"
        style={{ minHeight: `${rows * 1.5}rem` }}
        onInput={handleInput}
        onPaste={handlePaste}
        onBlur={handleInput}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: hsl(var(--muted-foreground));
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
