const { normalizeAttachments } = require("./attachments");
const { uploadBuffer, deleteMany, downloadToDataUrl } = require("./gridfs");

function stripAttachmentPayload(task) {
  if (!task) return task;
  const doc = typeof task.toObject === "function" ? task.toObject() : { ...task };
  if (Array.isArray(doc.attachments)) {
    doc.attachments = doc.attachments.map((a) => ({
      _id: a._id,
      name: a.name,
      mimeType: a.mimeType,
      size: a.size,
      uploadedAt: a.uploadedAt,
      gridFsId: a.gridFsId,
    }));
  }
  return doc;
}

async function persistUploadedFiles(multerFiles = []) {
  const saved = [];
  for (const file of multerFiles) {
    const mimeType = file.mimetype || "application/octet-stream";
    const gridFsId = await uploadBuffer(file.buffer, file.originalname, {
      mimeType,
      size: file.size,
    });
    saved.push({
      name: file.originalname,
      mimeType,
      size: file.size,
      gridFsId: String(gridFsId),
      uploadedAt: new Date(),
    });
  }
  return saved;
}

/**
 * Merge inline base64 (new) + kept gridFs refs + new multipart uploads.
 * Removes orphaned GridFS files when attachments are dropped.
 */
async function resolveAttachmentsForSave(existingAttachments, bodyAttachments, multerFiles) {
  const existing = Array.isArray(existingAttachments) ? existingAttachments : [];
  const existingById = new Map(existing.map((a) => [String(a._id), a]));

  let normalizedInline = [];
  if (bodyAttachments !== undefined) {
    const result = normalizeAttachments(bodyAttachments);
    if (result instanceof Error) return result;
    normalizedInline = result;
  }

  const fromUpload = await persistUploadedFiles(multerFiles);

  const kept = [];
  const next = [];

  for (const item of normalizedInline) {
    if (item.gridFsId) {
      const prev = [...existingById.values()].find((e) => e.gridFsId === item.gridFsId);
      if (prev) {
        kept.push(String(prev.gridFsId));
        next.push({
          name: item.name || prev.name,
          mimeType: item.mimeType || prev.mimeType,
          size: item.size || prev.size,
          gridFsId: item.gridFsId,
          uploadedAt: prev.uploadedAt || item.uploadedAt,
        });
        continue;
      }
    }
    if (item.data && item.data.startsWith("data:")) {
      const base64 = item.data.split(",")[1] || "";
      const buffer = Buffer.from(base64, "base64");
      const gridFsId = await uploadBuffer(buffer, item.name, {
        mimeType: item.mimeType,
        size: item.size,
      });
      next.push({
        name: item.name,
        mimeType: item.mimeType,
        size: item.size,
        gridFsId: String(gridFsId),
        uploadedAt: item.uploadedAt || new Date(),
      });
    }
  }

  for (const u of fromUpload) {
    next.push(u);
    if (u.gridFsId) kept.push(u.gridFsId);
  }

  const orphanIds = existing
    .map((a) => a.gridFsId)
    .filter((id) => id && !kept.includes(String(id)));

  if (orphanIds.length) await deleteMany(orphanIds);

  if (next.length > 5) {
    const err = new Error("Maximum 5 attachments per task");
    err.statusCode = 400;
    return err;
  }

  return next;
}

async function hydrateTaskAttachments(task) {
  if (!task?.attachments?.length) return task;
  const doc = typeof task.toObject === "function" ? task.toObject() : { ...task };
  const hydrated = [];
  for (const meta of doc.attachments) {
    if (meta.gridFsId) {
      const full = await downloadToDataUrl(meta.gridFsId);
      if (full) {
        hydrated.push({
          _id: meta._id,
          name: full.name,
          mimeType: full.mimeType,
          size: full.size,
          data: full.data,
          uploadedAt: meta.uploadedAt || full.uploadedAt,
          gridFsId: meta.gridFsId,
        });
        continue;
      }
    }
    if (meta.data) {
      hydrated.push(meta);
    }
  }
  doc.attachments = hydrated;
  return doc;
}

async function deleteTaskAttachmentFiles(task) {
  const ids = (task?.attachments || []).map((a) => a.gridFsId).filter(Boolean);
  await deleteMany(ids);
}

module.exports = {
  stripAttachmentPayload,
  resolveAttachmentsForSave,
  hydrateTaskAttachments,
  deleteTaskAttachmentFiles,
};
