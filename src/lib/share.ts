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

// Links point at /share (api/share.ts) so WhatsApp/Facebook/LinkedIn previews show the item's own title and photo;
// that page then forwards people to the item (/?kind=id#/page). On the local dev server /share doesn't exist.
export const buildShareUrl = (kind: SharedKind, id: string): string =>
  /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    ? `${window.location.origin}/?${kind}=${encodeURIComponent(id)}#${SHARED_ROUTES[kind]}`
    : `${window.location.origin}/share?${kind}=${encodeURIComponent(id)}`;

export const getSharedId = (kind: SharedKind): string | null =>
  new URLSearchParams(window.location.search).get(kind);

// Removes ?story= / ?announcement= / ?program= / ?voice= once the item has been shown, keeping the current page.
export const clearSharedId = () => {
  const params = new URLSearchParams(window.location.search);
  let changed = false;
  SHARED_KINDS.forEach((k) => { if (params.has(k)) { params.delete(k); changed = true; } });
  if (!changed) return;
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
