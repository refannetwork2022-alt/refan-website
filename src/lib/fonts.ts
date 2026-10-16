// Font choices for the home page top message (wishes). Web fonts load only when a text uses them.

export const WISH_FONTS: Array<{ label: string; value: string; google?: string }> = [
  { label: "Default", value: "" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Georgia", value: "Georgia" },
  { label: "Arial", value: "Arial" },
  { label: "Courier New", value: "Courier New" },
  { label: "Playfair Display (elegant)", value: "Playfair Display", google: "Playfair+Display:ital,wght@0,400;0,700;1,400" },
  { label: "Dancing Script (handwriting)", value: "Dancing Script", google: "Dancing+Script:wght@400;700" },
];

// Adds the Google Fonts stylesheet for any web font the given HTML uses (once per font).
export const loadFontsFor = (html: string) => {
  if (!html) return;
  WISH_FONTS.forEach((f) => {
    if (!f.google || !html.includes(f.value)) return;
    const id = `font-${f.value.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${f.google}&display=swap`;
    document.head.appendChild(link);
  });
};
