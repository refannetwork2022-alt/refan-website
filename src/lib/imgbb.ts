
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB ImgBB limit
const MAX_WIDTH = 1600;
const UPLOAD_TIMEOUT_MS = 90_000; // slow mobile connections

const isHeic = (file: File) => /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

// Decode the photo (keeping phone camera rotation) so it can be redrawn smaller.
async function decode(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; close: () => void }> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
      return { source: bmp, width: bmp.width, height: bmp.height, close: () => bmp.close() };
    } catch {
      // fall back to <img> below
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = url;
    });
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

// Phone photos are often 4-12MB; shrink every photo to at most 1600px wide JPEG before uploading.
async function compressFile(file: File, quality = 0.8): Promise<Blob> {
  const img = await decode(file);
  try {
    const scale = Math.min(1, MAX_WIDTH / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.fillStyle = "#ffffff"; // transparent PNGs become white instead of black in JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img.source, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) throw new Error("toBlob failed");
    return blob;
  } finally {
    img.close();
  }
}

async function postToImgbb(image: Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("image", image, fileName);
  formData.append("key", IMGBB_API_KEY);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: formData, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.data?.display_url) {
    console.error("ImgBB upload failed:", res.status, data);
    const reason = data?.error?.message ? ` (${data.error.message})` : "";
    throw new Error(`Image upload failed${reason}. Please try again.`);
  }
  return data.data.display_url;
}

export async function uploadImage(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error("Image upload not configured. Missing API key.");
  }

  let uploadFile: Blob = file;
  let fileName = file.name || "photo.jpg";
  const alreadySmall = file.size <= 1024 * 1024 && /^image\/(jpeg|png|webp|gif)$/.test(file.type);
  if (!alreadySmall) {
    try {
      uploadFile = await compressFile(file);
      fileName = fileName.replace(/\.[^.]+$/, "") + ".jpg";
    } catch {
      if (isHeic(file)) {
        throw new Error("This photo is in HEIC format, which this browser can't read. Please choose a JPG or PNG photo (or send the photo to yourself on WhatsApp and pick it from there).");
      }
      uploadFile = file; // try the original as it is
    }
  }

  if (uploadFile.size > MAX_SIZE) {
    throw new Error("Image is too large. Please use a smaller image (max 10MB).");
  }

  // One automatic retry for unstable mobile connections.
  try {
    return await postToImgbb(uploadFile, fileName);
  } catch (first) {
    if (first instanceof Error && first.message.startsWith("Image upload failed (")) throw first; // ImgBB rejected it: retrying won't help
    try {
      return await postToImgbb(uploadFile, fileName);
    } catch {
      throw new Error("Image upload failed. Please check your internet connection and try again.");
    }
  }
}
