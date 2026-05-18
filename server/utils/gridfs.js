const mongoose = require("mongoose");
const { Readable } = require("stream");

const BUCKET_NAME = "taskAttachments";

function getBucket() {
  const db = mongoose.connection.db;
  if (!db) throw new Error("Database not connected");
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET_NAME });
}

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

async function uploadBuffer(buffer, filename, metadata = {}) {
  const bucket = getBucket();
  const uploadStream = bucket.openUploadStream(filename, { metadata });
  const readable = Readable.from(buffer);
  await new Promise((resolve, reject) => {
    readable.pipe(uploadStream).on("error", reject).on("finish", resolve);
  });
  return uploadStream.id;
}

async function downloadToDataUrl(fileId) {
  const bucket = getBucket();
  const _id = new mongoose.Types.ObjectId(fileId);
  const files = await bucket.find({ _id }).toArray();
  if (!files.length) return null;
  const file = files[0];
  const buffer = await streamToBuffer(bucket.openDownloadStream(_id));
  const mimeType = file.metadata?.mimeType || "application/octet-stream";
  const base64 = buffer.toString("base64");
  return {
    name: file.filename,
    mimeType,
    size: file.length,
    data: `data:${mimeType};base64,${base64}`,
    uploadedAt: file.uploadDate,
    gridFsId: String(file._id),
  };
}

async function deleteFile(fileId) {
  if (!fileId) return;
  try {
    const bucket = getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
  } catch {
    /* ignore missing */
  }
}

async function deleteMany(fileIds) {
  await Promise.all((fileIds || []).map((id) => deleteFile(id)));
}

module.exports = {
  BUCKET_NAME,
  uploadBuffer,
  downloadToDataUrl,
  deleteFile,
  deleteMany,
};
