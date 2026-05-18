import { useRef, useState } from "react";
import {
  FaDownload,
  FaExpand,
  FaExternalLinkAlt,
  FaFilePdf,
  FaFileWord,
  FaPaperclip,
  FaSearchPlus,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  readAttachmentFile,
  MAX_ATTACHMENTS,
  formatAttachmentSize,
  openDataUrlInNewTab,
} from "../utils/fileAttachments";

function isImage(mimeType) {
  return mimeType?.startsWith("image/");
}

function isWord(mimeType) {
  const m = (mimeType || "").toLowerCase();
  return (
    m === "application/msword" ||
    m === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

function isPdf(mimeType) {
  return (mimeType || "").toLowerCase() === "application/pdf";
}

export default function TaskAttachments({ attachments = [], onChange, disabled = false }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    if (attachments.length + files.length > MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} files per task`);
      return;
    }

    const next = [...attachments];
    for (const file of files) {
      try {
        const item = await readAttachmentFile(file);
        next.push(item);
      } catch (err) {
        toast.error(err.message || "Invalid file");
      }
    }
    onChange(next);
  };

  const removeAt = (index) => {
    onChange(attachments.filter((_, i) => i !== index));
  };

  const download = (file) => {
    const link = document.createElement("a");
    link.href = file.data;
    link.download = file.name;
    link.click();
  };

  const openFile = (file) => {
    if (!file?.data) {
      toast.error("File not ready yet. Save the task and open it again to view.");
      return;
    }
    const ok = openDataUrlInNewTab(file.data, file.name);
    if (!ok) {
      toast.info("Could not open in a new tab — try Download.");
    }
  };

  const openPreview = (file) => {
    if (!file?.data) {
      toast.error("File not ready yet. Save the task and open it again to view.");
      return;
    }
    if (isImage(file.mimeType)) {
      setPreview({ type: "image", src: file.data, name: file.name });
      return;
    }
    if (isPdf(file.mimeType)) {
      setPreview({ type: "pdf", src: file.data, name: file.name });
      return;
    }
    openFile(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          <FaPaperclip className="mr-1 inline text-slate-400" />
          Attachments
        </label>
        <span className="text-xs text-slate-400">
          {attachments.length}/{MAX_ATTACHMENTS} · up to 10 MB each · click to open
        </span>
      </div>

      {attachments.length > 0 && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-600 dark:from-slate-800 dark:to-slate-800/80"
              >
                <button
                  type="button"
                  onClick={() => openPreview(file)}
                  className="relative block aspect-square w-full cursor-pointer"
                  title={`Open ${file.name}`}
                >
                  {isImage(file.mimeType) ? (
                    <img
                      src={file.data}
                      alt={file.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : isWord(file.mimeType) ? (
                    <span className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                      <FaFileWord className="text-4xl" />
                    </span>
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                      <FaFilePdf className="text-4xl" />
                    </span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 opacity-0 transition group-hover:bg-slate-900/40 group-hover:opacity-100">
                    <FaSearchPlus className="text-2xl text-white drop-shadow" />
                  </span>
                </button>

                <div className="border-t border-slate-100 p-2 dark:border-slate-600">
                  <button
                    type="button"
                    onClick={() => openPreview(file)}
                    className="block w-full truncate text-left text-xs font-medium text-slate-800 underline-offset-2 hover:text-indigo-600 hover:underline dark:text-slate-100 dark:hover:text-indigo-400"
                    title={`Open ${file.name}`}
                  >
                    {file.name}
                  </button>
                  <p className="text-[10px] text-slate-500">{formatAttachmentSize(file.size)}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(isPdf(file.mimeType) || isWord(file.mimeType) || isImage(file.mimeType)) && (
                      <button
                        type="button"
                        onClick={() => openPreview(file)}
                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2 py-1.5 text-[10px] font-semibold text-white hover:bg-indigo-700"
                      >
                        <FaExternalLinkAlt className="text-[10px]" />
                        Open
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => download(file)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => removeAt(index)}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40"
                        title="Remove"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!disabled && attachments.length < MAX_ATTACHMENTS && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-3 w-full rounded-xl border-2 border-dashed border-slate-300 bg-white px-3 py-3 text-sm font-medium text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            + Add files (image, PDF, Word · max 10 MB)
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={handleFiles}
          />
        </>
      )}

      {preview && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="File preview"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setPreview(null)}
            aria-label="Close preview"
          />
          <div className="relative z-10 max-h-[90vh] max-w-4xl rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
            <div className="flex items-center justify-between gap-4 px-2 pb-2">
              <p className="truncate text-sm font-medium text-white">{preview.name}</p>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <FaTimes />
              </button>
            </div>
            {preview.type === "pdf" ? (
              <iframe
                title={preview.name}
                src={preview.src}
                className="h-[75vh] w-full rounded-lg bg-white"
              />
            ) : (
              <img
                src={preview.src}
                alt={preview.name}
                className="max-h-[75vh] max-w-full rounded-lg object-contain"
              />
            )}
            <div className="mt-2 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => openDataUrlInNewTab(preview.src, preview.name)}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                <FaExpand className="text-xs" />
                Open in new tab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
