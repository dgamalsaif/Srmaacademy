import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { apiFetch, buildApiUrl } from "@/lib/api";
import ResearchImagePicker from "@/components/ResearchImagePicker";

interface SiteShareImageSettingsProps {
  value: string;
  onChange: (value: string) => void;
  onBusyChange?: (busy: boolean) => void;
  version?: string;
}

function isValidCustomUrl(url: string) {
  if (!url) return true;
  if (/\.(mp4|webm|mov|m4v)(?:$|[?#])/i.test(url) || /[\u0000-\u0020\\]/.test(url) ||
      /^\/api\/site-share-(?:image|metadata)(?:[/?#]|$)/i.test(url)) return false;
  if (url.startsWith("/") && !url.startsWith("//") && !url.split(/[/?#]/).includes("..")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password &&
      !/^\/api\/site-share-(?:image|metadata)(?:[/?#]|$)/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

export default function SiteShareImageSettings({ value, onChange, onBusyChange, version }: SiteShareImageSettingsProps) {
  const [uploading, setUploading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { onBusyChange?.(uploading || resolving); }, [uploading, resolving, onBusyChange]);

  const isStored = value.startsWith("/objects/");
  const urlInvalid = !isValidCustomUrl(value.trim());

  const handleToken = async (token: string) => {
    if (!token) {
      onChange("");
      return;
    }
    setResolving(true);
    setError("");
    try {
      const response = await apiFetch("/api/site-share-image/resolve-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageToken: token }),
      });
      const data = (await response.json().catch(() => ({}))) as { imagePath?: string; error?: string };
      if (!response.ok || !data.imagePath) {
        throw new Error(data.error || "تعذر اعتماد صورة المشاركة المرفوعة.");
      }
      onChange(data.imagePath);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر اعتماد صورة المشاركة المرفوعة.");
    } finally {
      setResolving(false);
    }
  };

  const busy = uploading || resolving;

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-right" dir="rtl">
      <div>
        <h3 className="font-black text-slate-800">صورة المشاركة على شبكات التواصل</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          المقاس الموصى به 1200x630. قد تعرض تطبيقات المشاركة إطاراً ثابتاً حتى مع ملف GIF المتحرك، وملف MP4 لا يصلح كصورة مشاركة.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => { setError(""); onChange(""); }}
          disabled={busy || !value}
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
        >
          استخدام الشعار الحالي
        </button>
        {!value && <span className="text-xs font-bold text-slate-500">يُستخدم الشعار الحالي حالياً.</span>}
      </div>

      <label className="block text-sm font-bold text-slate-700">
        رابط صورة مخصص (HTTPS عام أو مسار داخل الموقع)
        <input
          dir="ltr"
          type="text"
          value={value}
          disabled={busy}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://example.com/share.png"
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-normal outline-none focus:border-[#117b59]"
        />
      </label>
      {urlInvalid && (
        <p role="alert" className="text-xs font-bold text-rose-700">يجب أن يبدأ الرابط بـ https:// أو بمسار داخل الموقع يبدأ بـ /</p>
      )}

      <ResearchImagePicker
        onImageTokenChange={(token) => { void handleToken(token); }}
        onUploadingChange={setUploading}
        onErrorChange={setError}
      />

      {busy && (
        <p className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Loader2 size={14} className="animate-spin" />
          {uploading ? "جارٍ رفع الصورة..." : "جارٍ اعتماد الصورة..."}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>
      )}

      {isStored ? (
        <div>
          <p className="mb-2 text-xs leading-5 text-slate-500">
            المعاينة أدناه تعرض الصورة المحفوظة. إن اخترت صورة جديدة فستظهر معاينتها في أداة الاختيار أعلاه، وتُعتمد بعد الضغط على حفظ التغييرات.
          </p>
          <img
            src={buildApiUrl(`/api/site-share-image?v=${encodeURIComponent(version || "current")}`)}
            alt="معاينة صورة المشاركة المحفوظة"
            className="aspect-[1200/630] w-full max-w-md rounded-xl border border-slate-200 object-cover"
          />
        </div>
      ) : !urlInvalid && (
        <img src={value || buildApiUrl(`/api/site-share-image?v=${encodeURIComponent(version || "current")}`)}
          alt="معاينة صورة مشاركة الموقع" className="max-h-60 w-full max-w-md rounded-xl border border-slate-200 object-contain" />
      )}
      {isStored && (
        <p className="text-xs text-slate-500">قد تتأخر المعاينة المحفوظة حتى الحفظ، وتبقى الصورة السابقة ظاهرة قبله.</p>
      )}
    </section>
  );
}
