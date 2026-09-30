// Share links for single stories, announcements, programs and "Voices" testimonials.
// The id goes in the query string (before the #) because Facebook and other apps drop the "#/..." part
// of HashRouter URLs; SharedLinkRedirect in App.tsx routes such links to the right page, which opens the item.

export type SharedKind = "story" | "announcement" | "program" | "voice";

// Page that shows each kind of shared item.
export const SHARED_ROUTES: Record<SharedKind, string> = {
  story: "/stories",
  announcement: "/stories",
  program: "/programs",
  voice: "/",
};

export const SHARED_KINDS = Object.keys(SHARED_ROUTES) as SharedKind[];

// On the live site these URLs are served by api/share.ts (see vercel.json), which adds the item's own title and
// photo to the page so WhatsApp/Facebook/LinkedIn previews show it; visitors get the normal site.
// `version` (e.g. the item's photo + title) adds a short "p" code that changes when the item changes, so WhatsApp &
// co. don't keep showing an old cached preview (like the ReFAN logo) for a link they saw before.
export const buildShareUrl = (kind: SharedKind, id: string, version?: string): string => {
  const p = version ? `&p=${shortHash(version)}` : "";
  return `${window.location.origin}/?${kind}=${encodeURIComponent(id)}${p}#${SHARED_ROUTES[kind]}`;
};

const shortHash = (text: string): string => {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(36).slice(0, 6);
};

export const getSharedId = (kind: SharedKind): string | null =>
  new URLSearchParams(window.location.search).get(kind);

// Removes ?story= / ?announcement= / ?program= / ?voice= once the item has been shown, keeping the current page.
export const clearSharedId = () => {
  const params = new URLSearchParams(window.location.search);
  let changed = false;
  SHARED_KINDS.forEach((k) => { if (params.has(k)) { params.delete(k); changed = true; } });
  if (!changed) return;
  params.delete("p"); // preview code from buildShareUrl
  const query = params.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
};

export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older or in-app browsers without clipboard permission.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
};

// Opens the phone's share sheet (WhatsApp, Messenger, ...) when available; otherwise copies the link.
export const shareLink = async (title: string, url: string): Promise<"shared" | "copied" | "failed"> => {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return "shared";
    }
  }
  return (await copyText(url)) ? "copied" : "failed";
};
