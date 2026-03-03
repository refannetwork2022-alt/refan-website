const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB ImgBB limit

function compressFile(file: File, maxWidth = 1600, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : resolve(file),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("Failed to load image for compression"));
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(file: File): Promise<string> {
  if (!IMGBB_API_KEY) {
    throw new Error("Image upload not configured. Missing API key.");
  }

  // Compress large files (> 2MB) or mobile camera photos
  let uploadFile: File | Blob = file;
  if (file.size > 2 * 1024 * 1024) {
    try {
      uploadFile = await compressFile(file);
    } catch {
      // If compression fails, try uploading the original
      uploadFile = file;
    }
  }

  if (uploadFile.size > MAX_SIZE) {
    throw new Error("Image is too large. Please use a smaller image (max 10MB).");
  }

  const formData = new FormData();
  formData.append("image", uploadFile);
  formData.append("key", IMGBB_API_KEY);

  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("ImgBB upload failed:", res.status, text);
    throw new Error("Image upload failed. Please try again.");
  }

  const data = await res.json();
  if (!data?.data?.display_url) {
    throw new Error("Image upload failed. Invalid response.");
  }
  return data.data.display_url;
}
