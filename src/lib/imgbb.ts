// Photo uploads for the admin panels: Cloudinary first, ImgBB as the backup.
// Existing ImgBB photos keep their links; only new uploads go to Cloudinary.
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "";

// Not secrets: the cloud name appears in every Cloudinary photo link, and the "unsigned" preset only allows
// uploading into the refan folder (set up in Cloudinary > Settings > Upload > Upload presets).
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "ykbnggde";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "refan_website";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB (ImgBB and Cloudinary free plan limit)
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

class ImgbbError extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message);
  }
}

const toBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

// image: the file itself, or a base64 string (ImgBB accepts both; base64 is the fallback when file uploads keep failing).
async function postToImgbb(image: Blob | string, fileName: string): Promise<string> {
  const formData = new FormData();
  if (typeof image === "string") formData.append("image", image);
  else formData.append("image", image, fileName);
  formData.append("key", IMGBB_API_KEY);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: formData, signal: controller.signal });
  } catch {
    throw new ImgbbError("Image upload failed. Please check your internet connection and try again.", true);
  } finally {
    clearTimeout(timer);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.data?.display_url) {
    console.error("ImgBB upload failed:", res.status, data);
    const msg = String(data?.error?.message || "");
    // ImgBB's own temporary problems ("Internal upload error", 5xx, rate limits) are worth retrying.
    const retryable = res.status >= 500 || res.status === 429 || /internal|timeout|try again/i.test(msg);
    throw new ImgbbError(`Image upload failed${msg ? ` (${msg})` : ""}. Please try again.`, retryable);
  }
  return data.data.display_url;
}

async function postToCloudinary(image: Blob, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", image, fileName);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData, signal: controller.signal });
    const data = await res.json().catch(() => null);
    const url: string | undefined = data?.secure_url;
    if (!res.ok || !url) {
      console.error("Cloudinary upload failed:", res.status, data);
      throw new Error("Cloudinary upload failed");
    }
    // f_auto,q_auto: Cloudinary sends each browser the lightest good-looking version (faster on phones).
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
  } finally {
    clearTimeout(timer);
  }
}

export async function uploadImage(file: File): Promise<string> {

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

  // 1) Cloudinary (retried once for flaky connections).
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
    for (let i = 0; i < 2; i++) {
      try {
        return await postToCloudinary(uploadFile, fileName);
      } catch {
        if (i === 0) await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }

  // 2) Backup: ImgBB, with retries for temporary errors; the last try sends the photo as base64.
  if (!IMGBB_API_KEY) {
    throw new Error("Image upload failed. Please check your internet connection and try again.");
  }
  const attempts: Array<() => Promise<string>> = [
    () => postToImgbb(uploadFile, fileName),
    () => postToImgbb(uploadFile, fileName),
    async () => postToImgbb(await toBase64(uploadFile), fileName),
  ];
  let lastError: unknown;
  for (let i = 0; i < attempts.length; i++) {
    try {
      return await attempts[i]();
    } catch (e) {
      lastError = e;
      if (e instanceof ImgbbError && !e.retryable) throw e;
      if (i < attempts.length - 1) await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Image upload failed. Please try again.");
}
