import { useState } from "react";
import {
  FaDownload,
  FaExternalLinkAlt,
  FaFilePdf,
  FaFileWord,
  FaPaperclip,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../api";
import * as taskService from "../services/taskService";
import {
  attachmentPreviewState,
  downloadAttachment,
  formatAttachmentSize,
  isImageMime,
  isPdfMime,
  isWordMime,
  openDataUrlInNewTab,
} from "../utils/fileAttachments";
import AttachmentPreviewModal from "./AttachmentPreviewModal";

export default function TaskAttachmentLink({ task, className = "" }) {
  const count = task.attachments?.length || 0;
  const [listOpen, setListOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState(null);

  if (!count) return null;

  const label = `${count} attachment${count > 1 ? "s" : ""}`;

  const openList = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setListOpen(true);
    setLoading(true);
    setFiles([]);
    try {
      const full = await taskService.getTask(task._id);
      setFiles(full.attachments || []);
      if (!full.attachments?.length) {
        toast.info("No attachments found on this task.");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setListOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const closeList = () => {
    setListOpen(false);
    setFiles([]);
  };

  const openFile = (file) => {
    if (!file?.data) {
      toast.error("Could not load file. Try again.");
      return;
    }
    const state = attachmentPreviewState(file);
    if (state) {
      setPreview(state);
      return;
    }
    const ok = openDataUrlInNewTab(file.data, file.name);
    if (!ok) toast.info("Could not open — use Download.");
  };

  const handleDownload = (file, e) => {
    e?.stopPropagation();
    if (!downloadAttachment(file)) {
      toast.error("Could not download file.");
    }
  };

  const fileIcon = (file) => {
    if (isImageMime(file.mimeType) && file.data) {
      return (
        <img src={file.data} alt="" className="h-12 w-12 rounded-lg object-cover" />
      );
    }
    if (isWordMime(file.mimeType)) {
      return (
        <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
          <FaFileWord className="text-xl" />
        </span>
      );
    }
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600">
        <FaFilePdf className="text-xl" />
      </span>
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={openList}
        className={`inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 underline-offset-2 hover:text-indigo-800 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300 ${className}`}
        title="Click to view or download attachments"
      >
        <FaPaperclip className="shrink-0" />
        {label}
      </button>

      {listOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="attachment-list-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={closeList}
            aria-label="Close"
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-600 dark:bg-slate-800">
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-600">
              <div className="min-w-0">
                <h2
                  id="attachment-list-title"
                  className="truncate text-lg font-semibold text-slate-900 dark:text-white"
                >
                  Attachments
                </h2>
                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{task.title}</p>
              </div>
              <button
                type="button"
                onClick={closeList}
                className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-5 pb-5">
              {loading ? (
                <p className="py-8 text-center text-sm text-slate-500">Loading files…</p>
              ) : files.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No files to show.</p>
              ) : (
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li
                      key={file._id || `${file.name}-${index}`}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-600 dark:bg-slate-900/50"
                    >
                      <button
                        type="button"
                        onClick={() => openFile(file)}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 text-left transition hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20"
                        title="Open to read"
                      >
                        {fileIcon(file)}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                            {file.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatAttachmentSize(file.size)}
                            {isPdfMime(file.mimeType) && " · PDF"}
                            {isWordMime(file.mimeType) && " · Word"}
                            {isImageMime(file.mimeType) && " · Image"}
                          </span>
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[10px] font-semibold text-white">
                          <FaExternalLinkAlt />
                          Open
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDownload(file, e)}
                        className="shrink-0 rounded-lg border border-slate-200 bg-white p-2.5 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                        title="Download"
                        aria-label={`Download ${file.name}`}
                      >
                        <FaDownload className="text-sm" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-center text-xs text-slate-400">Click a file to read · use download icon to save</p>
            </div>
          </div>
        </div>
      )}

      <AttachmentPreviewModal preview={preview} onClose={() => setPreview(null)} />
    </>
  );
}
