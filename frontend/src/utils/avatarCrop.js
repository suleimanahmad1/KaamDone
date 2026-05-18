/** Load an image from URL or data URL for canvas drawing. */
export function loadImageForCrop(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = url;
  });
}

/**
 * Crop `pixelCrop` region from image, resize to fit maxDimension, return JPEG data URL.
 * @param {string} imageSrc
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop
 */
export async function getCroppedImgDataUrl(imageSrc, pixelCrop, maxDimension = 400) {
  const image = await loadImageForCrop(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  let { width, height } = pixelCrop;
  const scale = Math.min(maxDimension / width, maxDimension / height, 1);
  const outW = Math.max(1, Math.round(width * scale));
  const outH = Math.max(1, Math.round(height * scale));

  canvas.width = outW;
  canvas.height = outH;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outW,
    outH
  );

  let quality = 0.92;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > 520_000 && quality > 0.55) {
    quality -= 0.06;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  return dataUrl;
}
