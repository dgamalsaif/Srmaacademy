import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, ShieldCheck, X } from "lucide-react";
import { buildApiUrl } from "@/lib/api";

interface ResearchImagePickerProps {
  initialImageUrl?: string;
  onImageTokenChange: (imageToken: string) => void;
  onUploadingChange: (uploading: boolean) => void;
  onErrorChange: (error: string) => void;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/x-png",
  "image/webp",
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

export default function ResearchImagePicker({
  initialImageUrl = "",
  onImageTokenChange,
  onUploadingChange,
  onErrorChange,
}: ResearchImagePickerProps) {
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const previewObjectUrl = useRef<string | null>(null);
  const acceptedPreviewUrl = useRef(initialImageUrl);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => () => {
    if (previewObjectUrl.current) {
      try {
        URL.revokeObjectURL(previewObjectUrl.current);
      } catch {}
    }
  }, []);

  const setUploadingState = (next: boolean) => {
    setUploading(next);
    onUploadingChange(next);
  };

  const setUploadError = (message: string) => {
    setError(message);
    onErrorChange(message);
  };

  const uploadImage = async (file: File) => {
    setUploadError("");
    const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const mimeType = (file.type || "").toLowerCase();

    // Validate type and extension
    if (
      mimeType &&
      !ALLOWED_IMAGE_TYPES.has(mimeType) &&
      !ALLOWED_IMAGE_EXTENSIONS.has(fileExtension)
    ) {
      setUploadError("اختر صورة بصيغة JPG أو PNG أو WebP.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError("يجب ألا يتجاوز حجم الصورة 10 ميغابايت.");
      return;
    }

    setUploadingState(true);
    let pendingPreviewUrl: string | null = null;
    try {
      // 1. Instant local preview
      // Keep the last successful preview alive until the replacement succeeds.
      pendingPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(pendingPreviewUrl);

      // 2. Direct binary streaming to backend (bypasses FileReader & canvas limits completely)
      const uploadUrl = buildApiUrl("/api/program-images/upload");
      const requestContentType = mimeType || "image/jpeg";

      const request = await fetch(uploadUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": requestContentType,
          Accept: "application/json",
        },
        body: file,
      });

      const responseText = await request.text();
      let upload: { imageToken?: string; error?: string } = {};
      try {
        upload = JSON.parse(responseText);
      } catch {
        throw new Error(
          request.status === 413
            ? "حجم الصورة كبير جداً (الحد الأقصى 10 ميغابايت)."
            : request.status === 401
            ? "انتهت صلاحية جلسة تسجيل الدخول. يرجى إعادة تسجيل الدخول أولاً."
            : "تعذر رفع الصورة من الخادم. يرجى التأكد من تسجيل الدخول وإعادة المحاولة."
        );
      }

      if (!request.ok || !upload.imageToken) {
        throw new Error(upload.error || "تعذر رفع الصورة.");
      }

      if (previewObjectUrl.current) {
        try {
          URL.revokeObjectURL(previewObjectUrl.current);
        } catch {}
      }
      previewObjectUrl.current = pendingPreviewUrl;
      acceptedPreviewUrl.current = pendingPreviewUrl;
      onImageTokenChange(upload.imageToken);
    } catch (uploadError) {
      setUploadError(uploadError instanceof Error ? uploadError.message : "تعذر رفع الصورة. حاول مرة أخرى.");
      if (pendingPreviewUrl) {
        try {
          URL.revokeObjectURL(pendingPreviewUrl);
        } catch {}
      }
      setPreviewUrl(acceptedPreviewUrl.current);
    } finally {
      setUploadingState(false);
      if (fileInputRef.current) {
        try {
          fileInputRef.current.value = "";
        } catch {}
      }
    }
  };

  const removeImage = () => {
    if (previewObjectUrl.current) {
      try {
        URL.revokeObjectURL(previewObjectUrl.current);
      } catch {}
      previewObjectUrl.current = null;
    }
    acceptedPreviewUrl.current = "";
    setPreviewUrl("");
    setUploadError("");
    onImageTokenChange("");
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch {}
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-right">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center justify-end gap-2">
            <h3 className="font-black text-slate-800">صورة الفرصة ومعاينة المشاركة</h3>
            <ShieldCheck size={18} className="text-[#117b59]" />
          </div>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
            تُعرض صورة الفرصة برابط محمي قصير العمر مع حماية من التنزيل المباشر، وتظهر في بطاقات المشاركة على شبكات التواصل.
          </p>
        </div>
        <label
          className={`shrink-0 cursor-pointer rounded-xl bg-[#117b59] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#0c6549] ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <Loader2 size={15} className="animate-spin" /> جارٍ الرفع...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ImagePlus size={15} /> {previewUrl ? "استبدال الصورة" : "اختيار صورة"}
            </span>
          )}
          <input
            ref={fileInputRef}
            data-testid="input-research-image"
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            disabled={uploading}
            onChange={(event) => {
              const fileInput = event.currentTarget;
              const [file] = Array.from(fileInput.files || []);
              if (file) {
                void uploadImage(file);
              }
            }}
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
          {error}
        </p>
      )}

      {previewUrl && (
        <div
          className="srma-protected-image relative mt-4 overflow-hidden rounded-xl border border-emerald-100 bg-slate-100"
          onContextMenu={(event) => event.preventDefault()}
          onDragStart={(event) => event.preventDefault()}
        >
          <img src={previewUrl} alt="معاينة صورة الفرصة" draggable={false} className="h-48 w-full object-cover" />
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/5 text-sm font-black tracking-[0.2em] text-white/85 drop-shadow">
            SRMA
          </span>
          <button
            type="button"
            onClick={removeImage}
            disabled={uploading}
            className="absolute left-3 top-3 rounded-lg bg-white/90 p-2 text-rose-600 shadow-sm transition hover:bg-white"
            aria-label="حذف صورة الفرصة"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
