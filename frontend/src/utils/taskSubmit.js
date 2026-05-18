/** Turn a data URL from the file picker into a File for multipart upload. */
export function dataUrlToFile(dataUrl, name, mimeType) {
  const [header, b64] = dataUrl.split(",");
  const mime = mimeType || header.match(/data:([^;]+)/)?.[1] || "application/octet-stream";
  const binary = atob(b64 || "");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: mime });
}

/** Build multipart body: metadata JSON + binary files (avoids huge JSON payloads). */
export function buildTaskFormData({ title, description, status, priority, dueDate, attachments }) {
  const meta = [];
  const files = [];

  for (const a of attachments || []) {
    if (a.gridFsId) {
      meta.push({
        name: a.name,
        mimeType: a.mimeType,
        size: a.size,
        gridFsId: a.gridFsId,
      });
    } else if (a.data) {
      files.push(dataUrlToFile(a.data, a.name, a.mimeType));
    }
  }

  const fd = new FormData();
  fd.append("title", title);
  fd.append("description", description ?? "");
  fd.append("status", status);
  fd.append("priority", priority);
  if (dueDate === null || dueDate === undefined) {
    fd.append("dueDate", "");
  } else {
    fd.append("dueDate", dueDate);
  }
  fd.append("attachments", JSON.stringify(meta));
  files.forEach((file) => fd.append("files", file));

  return fd;
}
