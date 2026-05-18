import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { FaTimes } from "react-icons/fa";
import { getCroppedImgDataUrl } from "../utils/avatarCrop";

export default function AvatarCropModal({ imageSrc, onCancel, onApply }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setBusy(true);
    try {
      const dataUrl = await getCroppedImgDataUrl(imageSrc, croppedAreaPixels);
      onApply(dataUrl);
    } catch {
      onCancel();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">Crop profile photo</h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <FaTimes />
          </button>
        </div>

        <p className="px-4 pt-3 text-sm text-slate-600">
          Drag to move, use the slider to zoom. The circle is how your photo will appear.
        </p>

        <div className="relative mx-4 mt-3 h-72 overflow-hidden rounded-xl bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="px-4 py-3">
          <label className="text-xs font-medium text-slate-600">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.02}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="mt-1 w-full accent-indigo-600"
            />
          </label>
        </div>

        <div className="flex gap-3 border-t border-slate-100 px-4 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !croppedAreaPixels}
            onClick={handleApply}
            className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? "Saving…" : "Use this crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
