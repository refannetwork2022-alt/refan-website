// Cloudinary photos are stored up to 1600-2500px wide, but cards show them ~300px wide. Asking Cloudinary for a
// version sized to the place (twice the shown width, for sharp phone screens) makes pages load several times less.
// Other links (site files, ImgBB...) are returned unchanged.
const CLOUDINARY_UPLOAD = /(res\.cloudinary\.com\/[^/]+\/image\/upload\/)(?:f_auto,q_auto\/)?/;

export const sized = (url: string | undefined, width: number): string => {
  if (!url || !CLOUDINARY_UPLOAD.test(url) || /\/upload\/[^/]*\bw_\d+/.test(url)) return url || "";
  return url.replace(CLOUDINARY_UPLOAD, `$1f_auto,q_auto,w_${width},c_limit/`);
};
