import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, ShieldCheck, X } from "lucide-react";
import { buildApiUrl } from "@/lib/api";

interface ResearchImagePickerProps {
  initialImageUrl?: string;
  onImageTokenChange: (imageToken: string) => void;
  onUploadingChange: (uploading: boolean) => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export default function ResearchImagePicker({ initialImageUrl = "", onImageTokenChange, onUploadingChange }: ResearchImagePickerProps) {
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
    const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase()) && !ALLOWED_IMAGE_EXTENSIONS.has(fileExtension)) {
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

      // Convert protected watermarked image to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("تعذر قراءة ملف الصورة."));
        reader.readAsDataURL(protectedImage);
      });

      const uploadUrl = buildApiUrl("/api/program-images/upload");
      const request = await fetch(uploadUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          contentType: protectedImage.type || "image/jpeg",
        }),
      });

      const responseText = await request.text();
      let upload: { imageToken?: string; error?: string } = {};
      try {
        upload = JSON.parse(responseText);
      } catch {
        throw new Error(
          request.status === 413
            ? "حجم الصورة كبير جداً."
            : "تعذر رفع الصورة من الخادم. يرجى التأكد من تسجيل الدخول وإعادة المحاولة."
        );
      }

      if (!request.ok || !upload.imageToken) {
        throw new Error(upload.error || "تعذر رفع الصورة.");
      }

      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
      previewObjectUrl.current = URL.createObjectURL(protectedImage);
      setPreviewUrl(previewObjectUrl.current);
      onImageTokenChange(upload.imageToken);
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
    onImageTokenChange("");
  };

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-right">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h3 className="font-black text-slate-800">صورة الفرصة ومعاينة المشاركة</h3>
            <ShieldCheck size={18} className="text-[#117b59]" />
          </div>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">تُدمج علامة SRMA المائية داخل الصورة، وتُعرض برابط محمي قصير العمر. تقلل الحماية النسخ والتنزيل المباشر، لكن لا يستطيع أي موقع منع لقطات الشاشة بشكل كامل.</p>
        </div>
        <label className={`shrink-0 cursor-pointer rounded-xl bg-[#117b59] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#0c6549] ${uploading ? "pointer-events-none opacity-60" : ""}`}>
          {uploading ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> جارٍ الرفع...</span> : <span className="flex items-center gap-2"><ImagePlus size={15} /> {previewUrl ? "استبدال الصورة" : "اختيار صورة"}</span>}
          <input
            data-testid="input-research-image"
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            disabled={uploading}
            onChange={(event) => {
              const fileInput = event.currentTarget;
              const [file] = Array.from(fileInput.files || []);
              if (file) {
                void uploadImage(file).finally(() => {
                  try {
                    fileInput.value = "";
                  } catch {}
                });
              }
            }}
          />
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

interface DrawableSource {
  drawable: CanvasImageSource;
  width: number;
  height: number;
  cleanup?: () => void;
}

async function loadDrawableSource(file: File): Promise<DrawableSource> {
  // Strategy 1: createImageBitmap (fastest, most robust against file lock/memory pressure)
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        drawable: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => {
          try {
            bitmap.close();
          } catch {}
        },
      };
    } catch {}
  }

  // Strategy 2: URL.createObjectURL (standard native DOM decoding)
  if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
    try {
      const objectUrl = URL.createObjectURL(file);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("object_url_decode_failed"));
        image.src = objectUrl;
      });
      return {
        drawable: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {}
        },
      };
    } catch {}
  }

  // Strategy 3: FileReader (fallback for older environments)
  return new Promise<DrawableSource>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error("تعذر قراءة ملف الصورة من جهازك. تأكد من أن الملف سليم وبصيغة JPG أو PNG أو WebP وحاول مجدداً."));
    };
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        resolve({
          drawable: image,
          width: image.naturalWidth || image.width,
          height: image.naturalHeight || image.height,
        });
      };
      image.onerror = () => {
        reject(new Error("لم يتمكن المتصفح من فك ترميز الصورة. احفظها بصيغة JPG أو PNG أو WebP ثم حاول مجدداً."));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

async function createWatermarkedImage(file: File) {
  const source = await loadDrawableSource(file);
  try {
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("تعذر تجهيز الصورة.");

    context.drawImage(source.drawable, 0, 0, width, height);
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
  } finally {
    source.cleanup?.();
  }
}