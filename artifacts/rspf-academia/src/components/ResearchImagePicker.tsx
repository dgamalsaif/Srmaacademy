import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, ShieldCheck, X } from "lucide-react";

interface ResearchImagePickerProps {
  initialImageUrl?: string;
  onImagePathChange: (imagePath: string) => void;
  onUploadingChange: (uploading: boolean) => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export default function ResearchImagePicker({ initialImageUrl = "", onImagePathChange, onUploadingChange }: ResearchImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const previewObjectUrl = useRef<string | null>(null);

  useEffect(() => () => {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
  }, []);

  const setUploadingState = (next: boolean) => {
    setUploading(next);
    onUploadingChange(next);
  };

  const uploadImage = async (file: File) => {
    setError("");
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setError("اختر صورة بصيغة JPG أو PNG أو WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("يجب ألا يتجاوز حجم الصورة 5 ميغابايت.");
      return;
    }

    setUploadingState(true);
    try {
      const protectedImage = await createWatermarkedImage(file);
      const request = await fetch("/api/program-images/request-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          size: protectedImage.size,
          contentType: protectedImage.type,
        }),
      });
      const upload = await request.json() as { uploadURL?: string; objectPath?: string; error?: string };
      if (!request.ok || !upload.uploadURL || !upload.objectPath) {
        throw new Error(upload.error || "تعذر تجهيز رفع الصورة.");
      }

      const response = await fetch(upload.uploadURL, {
        method: "PUT",
        headers: { "Content-Type": protectedImage.type },
        body: protectedImage,
      });
      if (!response.ok) throw new Error("تعذر رفع الصورة إلى التخزين.");

      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
      previewObjectUrl.current = URL.createObjectURL(protectedImage);
      setPreviewUrl(previewObjectUrl.current);
      onImagePathChange(upload.objectPath);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "تعذر رفع الصورة. حاول مرة أخرى.");
    } finally {
      setUploadingState(false);
    }
  };

  const removeImage = () => {
    if (previewObjectUrl.current) {
      URL.revokeObjectURL(previewObjectUrl.current);
      previewObjectUrl.current = null;
    }
    setPreviewUrl("");
    setError("");
    onImagePathChange("");
  };

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-right">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h3 className="font-black text-slate-800">صورة الفرصة ومعاينة المشاركة</h3>
            <ShieldCheck size={18} className="text-[#117b59]" />
          </div>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">تُدمج علامة SRMA المائية داخل الصورة، وتظهر في بطاقة الفرصة ومعاينة واتساب عند نسخ رابط المعاينة.</p>
        </div>
        <label className={`shrink-0 cursor-pointer rounded-xl bg-[#117b59] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#0c6549] ${uploading ? "pointer-events-none opacity-60" : ""}`}>
          {uploading ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> جارٍ الرفع...</span> : <span className="flex items-center gap-2"><ImagePlus size={15} /> {previewUrl ? "استبدال الصورة" : "اختيار صورة"}</span>}
          <input data-testid="input-research-image" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => {
            const [file] = Array.from(event.target.files || []);
            if (file) void uploadImage(file);
            event.currentTarget.value = "";
          }} />
        </label>
      </div>

      {error && <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

      {previewUrl && (
        <div className="srma-protected-image relative mt-4 overflow-hidden rounded-xl border border-emerald-100 bg-slate-100" onContextMenu={(event) => event.preventDefault()} onDragStart={(event) => event.preventDefault()}>
          <img src={previewUrl} alt="معاينة صورة الفرصة" draggable={false} className="h-48 w-full object-cover" />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/5 text-sm font-black tracking-[0.2em] text-white/85 drop-shadow">SRMA</span>
          <button type="button" onClick={removeImage} disabled={uploading} className="absolute left-3 top-3 rounded-lg bg-white/90 p-2 text-rose-600 shadow-sm transition hover:bg-white" aria-label="حذف صورة الفرصة">
            <X size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

async function createWatermarkedImage(file: File) {
  const source = await loadImage(file);
  const maxDimension = 1600;
  const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("تعذر تجهيز الصورة.");

  context.drawImage(source, 0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(-Math.PI / 7);
  context.fillStyle = "rgba(255, 255, 255, 0.35)";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `800 ${Math.max(18, Math.round(width * 0.04))}px Arial, sans-serif`;
  const watermark = "SRMA  •  srmaacademy.com";
  const horizontalGap = Math.max(170, Math.round(width * 0.44));
  const verticalGap = Math.max(78, Math.round(height * 0.3));
  for (let y = -height; y <= height; y += verticalGap) {
    for (let x = -width; x <= width; x += horizontalGap) {
      context.fillText(watermark, x, y);
    }
  }
  context.restore();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("تعذر إنشاء نسخة الحماية من الصورة.");
  return new File([blob], `srma-opportunity-${Date.now()}.jpg`, { type: "image/jpeg" });
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("تعذر قراءة الصورة المختارة."));
    };
    image.src = url;
  });
}