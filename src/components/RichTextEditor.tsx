import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, Heading2, Type, Palette } from "lucide-react";

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

const RichTextEditor = ({ value, onChange, placeholder = "Write here...", rows = 4 }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const showColorRef = useRef(false);
  const colorPanelRef = useRef<HTMLDivElement>(null);
  const isUserInput = useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUserInput.current) {
      editorRef.current.innerHTML = value || "";
    }
    isUserInput.current = false;
  }, [value]);

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
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="px-4 py-2.5 text-sm outline-none focus:ring-0 overflow-auto"
        style={{ minHeight: `${rows * 1.5}rem` }}
        onInput={handleInput}
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
