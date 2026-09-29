// Share links for single stories/announcements.
// The id goes in the query string (before the #) because Facebook and other apps drop the "#/..." part
// of HashRouter URLs; SharedLinkRedirect in App.tsx routes such links to the Stories page, which opens the item.

export type SharedKind = "story" | "announcement";

export const SHARED_KINDS: SharedKind[] = ["story", "announcement"];

export const buildShareUrl = (kind: SharedKind, id: string): string =>
  `${window.location.origin}/?${kind}=${encodeURIComponent(id)}#/stories`;

export const getSharedId = (kind: SharedKind): string | null =>
  new URLSearchParams(window.location.search).get(kind);

// Removes ?story= / ?announcement= once the item has been shown, keeping the current page.
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
