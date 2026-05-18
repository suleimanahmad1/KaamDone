const MAX_ATTACHMENTS = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const IMAGE_PREFIX = "image/";
const PDF_PREFIX = "application/pdf";
const WORD_MIMES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function mimeAllowed(mimeType, fileName) {
  const m = String(mimeType || "").trim().toLowerCase();
  if (m.startsWith(IMAGE_PREFIX) || m.startsWith(PDF_PREFIX)) return true;
  if (WORD_MIMES.has(m)) return true;
  const lower = String(fileName || "").toLowerCase();
  if (lower.endsWith(".doc") || lower.endsWith(".docx")) return true;
  return false;
}

function normalizeMime(mimeType, fileName) {
  const m = String(mimeType || "").trim().toLowerCase();
  if (m && m !== "application/octet-stream") return m;
  const lower = String(fileName || "").toLowerCase();
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.endsWith(".doc")) return "application/msword";
  return m;
}

function normalizeAttachments(input) {
  if (input === undefined) return undefined;
  if (input === null) return [];
  if (!Array.isArray(input)) return badRequest("attachments must be an array");

  if (input.length > MAX_ATTACHMENTS) {
    return badRequest(`Maximum ${MAX_ATTACHMENTS} attachments per task`);
  }

  const normalized = [];

  for (const item of input) {
    if (!item || typeof item !== "object") {
      return badRequest("Invalid attachment entry");
    }

    const name = String(item.name || "file").trim().slice(0, 120);
    const mimeType = normalizeMime(item.mimeType, name);
    const data = String(item.data || "");
    const gridFsId = item.gridFsId ? String(item.gridFsId).trim() : "";

    if (!name) return badRequest("Attachment name is required");
    if (!mimeAllowed(mimeType, name)) {
      return badRequest("Only images, PDF, and Word (.doc / .docx) files are allowed");
    }

    if (gridFsId && !data.startsWith("data:")) {
      const size = Number(item.size) || 0;
      if (size > MAX_FILE_BYTES) {
        return badRequest(`Each file must be 10 MB or smaller`);
      }
      normalized.push({
        name,
        mimeType,
        size,
        gridFsId,
        uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : new Date(),
      });
      continue;
    }

    if (!data.startsWith("data:")) {
      return badRequest("Invalid attachment data");
    }
    if (data.length > MAX_FILE_BYTES * 1.4) {
      return badRequest(`Each file must be 10 MB or smaller`);
    }

    const size = Number(item.size) || Math.floor(data.length * 0.75);
    if (size > MAX_FILE_BYTES) {
      return badRequest(`Each file must be 10 MB or smaller`);
    }

    normalized.push({
      name,
      mimeType,
      size,
      data,
      uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : new Date(),
    });
  }

  return normalized;
}

module.exports = { normalizeAttachments, MAX_ATTACHMENTS, MAX_FILE_BYTES };
