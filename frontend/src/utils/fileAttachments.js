const MAX_ATTACHMENTS = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXACT = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function normalizeMime(file) {
  const t = (file.type || "").trim().toLowerCase();
  if (t && t !== "application/octet-stream") return t;
  const n = file.name.toLowerCase();
  if (n.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (n.endsWith(".doc")) return "application/msword";
  if (n.endsWith(".pdf")) return "application/pdf";
  return t;
}

function isAllowedFile(file) {
  const mime = normalizeMime(file);
  if (mime.startsWith("image/")) return true;
  if (ALLOWED_EXACT.has(mime)) return true;
  const n = file.name.toLowerCase();
  if (n.endsWith(".doc") || n.endsWith(".docx")) return true;
  return false;
}

export function readAttachmentFile(file) {
  return new Promise((resolve, reject) => {
    if (!isAllowedFile(file)) {
      reject(new Error("Allowed: images, PDF, Word (.doc, .docx)."));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error("Each file must be 10 MB or smaller."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        mimeType: normalizeMime(file),
        size: file.size,
        data: reader.result,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export function formatAttachmentSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function isImageMime(mimeType) {
  return mimeType?.startsWith("image/");
}

export function isPdfMime(mimeType) {
  return (mimeType || "").toLowerCase() === "application/pdf";
}

export function isWordMime(mimeType) {
  const m = (mimeType || "").toLowerCase();
  return (
    m === "application/msword" ||
    m === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

export function downloadAttachment(file) {
  if (!file?.data) return false;
  const link = document.createElement("a");
  link.href = file.data;
  link.download = file.name || "download";
  link.click();
  return true;
}

/** Returns preview state for modal, or null if caller should open in new tab. */
export function attachmentPreviewState(file) {
  if (!file?.data) return null;
  if (isImageMime(file.mimeType)) {
    return { type: "image", src: file.data, name: file.name };
  }
  if (isPdfMime(file.mimeType)) {
    return { type: "pdf", src: file.data, name: file.name };
  }
  return null;
}

/** Open data URL in a new tab (PDF / Word / images). */
export function openDataUrlInNewTab(dataUrl) {
  try {
    const [header, b64] = dataUrl.split(",");
    const mime = header.match(/data:([^;]+)/)?.[1] || "application/octet-stream";
    const binary = atob(b64 || "");
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) {
      URL.revokeObjectURL(url);
      return false;
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return true;
  } catch {
    return false;
  }
}

export { MAX_ATTACHMENTS, MAX_FILE_BYTES };
