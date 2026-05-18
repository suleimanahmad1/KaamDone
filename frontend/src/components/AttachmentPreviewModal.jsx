import { FaExpand, FaTimes } from "react-icons/fa";
import { openDataUrlInNewTab } from "../utils/fileAttachments";

export default function AttachmentPreviewModal({ preview, onClose }) {
  if (!preview) return null;

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="File preview"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close preview"
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-white/10 bg-slate-900 p-2 shadow-2xl">
        <div className="flex items-center justify-between gap-4 px-2 pb-2">
          <p className="truncate text-sm font-medium text-white">{preview.name}</p>
          <button
            type="button"
            onClick={onClose}
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
        <div className="mt-2 flex justify-center gap-2 pb-1">
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
  );
}
