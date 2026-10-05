import { useState } from "react";
import { X, Layers, Check, Loader2 } from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import { SpecialtyOption } from "@/lib/siteContentSettings";
import { OPPORTUNITY_DISPLAY_FIELDS } from "@/lib/opportunityVisibility";
import ResearchImagePicker from "@/components/ResearchImagePicker";
import { apiFetch } from "@/lib/api";

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  selectedIds: number[];
  totalCount?: number;
  specialtyOptions: SpecialtyOption[];
  onSuccess: (updatedPrograms: ResearchOpportunity[]) => void;
}

type Scope = "selected" | "all" | "category";
const CATEGORIES = [
  { id: "active", label: "فرصة وبرنامج بحثي" },
  { id: "completed", label: "دراسة منجزة" },
  { id: "training", label: "تدريب الباحث" },
  { id: "cme", label: "دورة CME" },
];
const STATUSES = [
  ["open", "مفتوح للتسجيل"], ["closed", "مغلق"], ["upcoming", "قادم"], ["seats_full", "اكتملت المقاعد"], ["draft", "مسودة"],
  ["ethics_approved", "موافقة أخلاقية / PROSPERO"], ["submitted", "تم الرفع في المجلة"], ["under_review", "قيد مراجعة المجلة"],
  ["accepted", "مقبولة"], ["published", "تم النشر"],
];
// Simple text fields: key -> [label, ltr, multiline]
const TEXT_FIELDS: [string, string, boolean, boolean][] = [
  ["titleEn", "عنوان الفرصة بالإنجليزية (Title)", true, false],
  ["descriptionAr", "الوصف بالعربية", false, true],
  ["descriptionEn", "Description (English)", true, true],
  ["supervisor", "المشرف", false, false],
  ["duration", "مدة الدراسة", false, false],
  ["journalTarget", "المجلة المستهدفة", true, false],
  ["journalIssn", "ISSN / eISSN", true, false],
  ["journalPubmed", "تصنيف PubMed", true, false],
  ["journalScopus", "تصنيف Scopus", true, false],
  ["journalWos", "تصنيف Web of Science", true, false],
  ["indexedIn", "قواعد البيانات (مفصولة بفاصلة)", true, false],
  ["benefits", "مزايا المشاركة (ميزة في كل سطر)", false, true],
  ["researchGroupUrl", "رابط مجموعة الفرصة (واتساب / تيليجرام)", true, false],
];
const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:border-[#117b59] focus:outline-none";

function Box({ k, title, enabled, onToggle, children }: {
  k: string; title: string; enabled: Record<string, boolean>;
  onToggle: (key: string) => void; children?: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-4">
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-xs font-black text-slate-800">{title}</span>
        <input type="checkbox" checked={!!enabled[k]} onChange={() => onToggle(k)} className="h-4 w-4 accent-[#117b59]" />
      </label>
      {enabled[k] && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

export default function BulkEditModal({ isOpen, onClose, selectedCount, selectedIds, totalCount, specialtyOptions, onSuccess }: BulkEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scope, setScope] = useState<Scope>(selectedCount > 0 ? "selected" : "all");
  const [scopeCategory, setScopeCategory] = useState("active");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [v, setV] = useState<Record<string, string>>({ status: "open", category: "active" });
  const [imageToken, setImageToken] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [confirmAll, setConfirmAll] = useState(false);

  if (!isOpen) return null;
  const on = (k: string) => !!enabled[k];
  const toggle = (k: string) => setEnabled((p) => ({ ...p, [k]: !p[k] }));
  const set = (k: string, val: string) => setV((p) => ({ ...p, [k]: val }));
  const num = (k: string) => (v[k] ?? "").trim() === "" ? null : Number(v[k]);

  const pickSpecialty = (nameAr: string) => {
    const f = specialtyOptions.find((s) => s.nameAr === nameAr);
    if (f) setV((p) => ({ ...p, specialtyAr: f.nameAr, specialtyEn: f.nameEn || f.nameAr }));
  };

  const buildUpdates = (): Record<string, unknown> | string => {
    const u: Record<string, unknown> = {};
    if (on("status")) u.status = v.status;
    if (on("category")) u.category = v.category;
    if (on("specialty")) {
      if (!v.specialtyAr?.trim() && !v.specialtyEn?.trim()) return "أدخل التخصص بالعربية أو الإنجليزية.";
      if (v.specialtyAr?.trim()) u.specialtyAr = v.specialtyAr.trim();
      if (v.specialtyEn?.trim()) u.specialtyEn = v.specialtyEn.trim();
    }
    for (const [k] of TEXT_FIELDS) {
      if (!on(k)) continue;
      const raw = v[k] ?? "";
      if (k === "indexedIn") u[k] = raw.split(/[،,]/).map((x) => x.trim()).filter(Boolean);
      else if (k === "benefits") u[k] = raw.split("\n").map((x) => x.trim()).filter(Boolean);
      else u[k] = raw.trim();
      if (k === "titleEn") u.titleAr = raw.trim();
    }
    if (on("seatsLeft")) {
      const n = num("seatsLeft");
      if (n === null || !Number.isInteger(n) || n < 0 || n > 15) return "المقاعد المتبقية يجب أن تكون عدداً صحيحاً بين 0 و15.";
      u.seatsLeft = n;
    }
    if (on("pricing")) {
      const o = num("priceOriginalSar"), d = num("priceDiscountedSar");
      if (o === null && d === null) return "أدخل سعراً واحداً على الأقل.";
      if ((o !== null && (!Number.isSafeInteger(o) || o < 0)) || (d !== null && (!Number.isSafeInteger(d) || d < 0))) return "الأسعار يجب أن تكون أعداداً صحيحة بالريال دون كسور وغير سالبة.";
      if (o !== null && d !== null && d > o) return "السعر بعد الخصم لا يمكن أن يتجاوز السعر الأصلي.";
      if (o !== null) u.priceOriginalSar = o;
      if (d !== null) u.priceDiscountedSar = d;
    }
    if (on("hiddenFields")) u.hiddenFields = OPPORTUNITY_DISPLAY_FIELDS.filter((f) => (v.hidden ?? "").split(",").includes(f.id)).map((f) => f.id);
    if (on("image")) {
      if (imageUploading) return "انتظر حتى يكتمل رفع الصورة.";
      if (imageError) return "لم تُرفع الصورة. أعد الرفع أو عطّل تعديل الصورة.";
      if (imageToken === null) return "اختر صورة جديدة أو اضغط إزالة الصورة، أو عطّل تعديل الصورة.";
      u.imageToken = imageToken;
    }
    return u;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const updates = buildUpdates();
    if (typeof updates === "string") return setError(updates);
    if (Object.keys(updates).length === 0) return setError("يرجى تفعيل حقل واحد على الأقل وتعبئة قيمته للتعديل الجماعي.");
    if (scope === "selected" && selectedIds.length === 0) return setError("لا توجد فرص محددة.");
    if (scope !== "selected" && !confirmAll) return setError("أكّد أنك تريد استبدال الحقول المحددة في جميع الفرص المستهدفة.");
    const body: Record<string, unknown> = scope === "selected" ? { ids: selectedIds, updates } : scope === "all" ? { all: true, updates } : { all: true, category: scopeCategory, updates };
    const label = scope === "category" ? `كل فرص نوع «${CATEGORIES.find((c) => c.id === scopeCategory)?.label}»` : "جميع الفرص";
    if (scope !== "selected" && !window.confirm(`سيتم استبدال ${Object.keys(updates).length} خاصية في ${label}. لا يمكن التراجع. هل تريد المتابعة؟`)) return;
    setLoading(true);
    try {
      const response = await apiFetch("/api/programs/batch-update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "تعذر التعديل الجماعي");
      onSuccess(data.programs || []);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء حفظ التعديلات");
    } finally { setLoading(false); }
  };

  const hiddenSet = (v.hidden ?? "").split(",").filter(Boolean);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={onClose}>
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#117b59]/10 text-[#117b59] flex items-center justify-center"><Layers size={20} /></div>
            <div>
              <h2 className="text-base font-black text-slate-800">التعديل الجماعي للفرص</h2>
              <p className="text-xs text-slate-500 font-medium">فعّل الحقول التي تريد تغييرها فقط، وحدّد نطاق التطبيق.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full border border-slate-200"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-6 space-y-4 text-right">
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">{error}</div>}

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2" data-testid="bulk-scope">
            <p className="text-xs font-black text-slate-800">نطاق التطبيق</p>
            {([
              ["selected", `الفرص المحددة (${selectedCount})`],
              ["all", `جميع الفرص${totalCount !== undefined ? ` (${totalCount})` : ""}`],
              ["category", "جميع فرص نوع معيّن"],
            ] as [Scope, string][]).map(([id, label]) => (
              <label key={id} className={`flex items-center gap-2 text-xs font-bold ${id === "selected" && selectedCount === 0 ? "text-slate-400" : "text-slate-700"}`}>
                <input type="radio" name="bulk-scope" disabled={id === "selected" && selectedCount === 0} checked={scope === id} onChange={() => { setScope(id); setConfirmAll(false); }} className="accent-[#117b59]" />
                {label}
              </label>
            ))}
            {scope === "category" && (
              <select value={scopeCategory} onChange={(e) => setScopeCategory(e.target.value)} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            )}
            {scope !== "selected" && (
              <label className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-[11px] font-bold leading-5 text-amber-900">
                <input type="checkbox" checked={confirmAll} onChange={(e) => setConfirmAll(e.target.checked)} className="mt-1 accent-[#117b59]" />
                أدرك أن الحقول المفعّلة ستستبدل قيمها في كل الفرص المستهدفة.
              </label>
            )}
          </div>

          <Box k="status" title="الحالة (Status)" enabled={enabled} onToggle={toggle}>
            <select value={v.status} onChange={(e) => set("status", e.target.value)} className={inputCls}>
              {STATUSES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}
            </select>
          </Box>
          <Box k="category" title="نوع البرنامج (Category)" enabled={enabled} onToggle={toggle}>
            <select value={v.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Box>
          <Box k="specialty" title="التخصص (Specialty)" enabled={enabled} onToggle={toggle}>
            {specialtyOptions.length > 0 && (
              <select onChange={(e) => pickSpecialty(e.target.value)} className={inputCls} defaultValue="">
                <option value="">-- اختر من التخصصات الحالية --</option>
                {specialtyOptions.map((s) => <option key={s.id} value={s.nameAr}>{s.nameAr} {s.nameEn ? `(${s.nameEn})` : ""}</option>)}
              </select>
            )}
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} placeholder="التخصص بالعربية" value={v.specialtyAr ?? ""} onChange={(e) => set("specialtyAr", e.target.value)} />
              <input className={inputCls} dir="ltr" placeholder="Specialty (English)" value={v.specialtyEn ?? ""} onChange={(e) => set("specialtyEn", e.target.value)} />
            </div>
          </Box>

          {TEXT_FIELDS.map(([k, label, ltr, multi]) => (
            <Box key={k} k={k} title={label} enabled={enabled} onToggle={toggle}>
              {multi
                ? <textarea rows={3} dir={ltr ? "ltr" : "rtl"} className={inputCls} value={v[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
                : <input type="text" dir={ltr ? "ltr" : "rtl"} className={inputCls} value={v[k] ?? ""} onChange={(e) => set(k, e.target.value)} />}
              {(k === "titleEn" || k === "descriptionAr" || k === "descriptionEn") && (
                <p className="text-[11px] text-amber-700 font-bold">تنبيه: سيُطبَّق نفس النص على كل الفرص المستهدفة. (العنوان العام بالإنجليزية فقط، ويُنسخ إلى الحقل العربي للتوافق.)</p>
              )}
            </Box>
          ))}

          <Box k="seatsLeft" title="المقاعد المتبقية (من 15)" enabled={enabled} onToggle={toggle}>
            <input type="number" min={0} max={15} className={inputCls} value={v.seatsLeft ?? ""} onChange={(e) => set("seatsLeft", e.target.value)} />
            <p className="text-[11px] text-slate-500">إجمالي المقاعد ثابت (15) ولا يمكن تعديله. يتحقق الخادم من التسجيلات المحجوزة.</p>
          </Box>
          <Box k="pricing" title="الأسعار (بالريال السعودي SAR)" enabled={enabled} onToggle={toggle}>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min={0} step={1} className={inputCls} placeholder="السعر قبل الخصم" value={v.priceOriginalSar ?? ""} onChange={(e) => set("priceOriginalSar", e.target.value)} />
              <input type="number" min={0} step={1} className={inputCls} placeholder="السعر بعد الخصم" value={v.priceDiscountedSar ?? ""} onChange={(e) => set("priceDiscountedSar", e.target.value)} />
            </div>
          </Box>
          <Box k="image" title="صورة الفرصة (رفع صورة جديدة أو إزالة الصورة الحالية)" enabled={enabled} onToggle={toggle}>
            <ResearchImagePicker onImageTokenChange={setImageToken} onUploadingChange={setImageUploading} onErrorChange={setImageError} />
            <p className="text-[11px] font-bold text-amber-700">ستُطبَّق الصورة على كل الفرص المستهدفة. «إزالة الصورة» تحذف صورها الحالية. عند تعطيل هذا الخيار تبقى الصور كما هي.</p>
          </Box>
          <Box k="hiddenFields" title="العناصر المخفية عن الزوار" enabled={enabled} onToggle={toggle}>
            <p className="text-[11px] text-slate-500">حدّد العناصر التي تريد إخفاءها؛ غير المحدد سيظهر.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OPPORTUNITY_DISPLAY_FIELDS.map((f) => (
                <label key={f.id} className="flex items-center justify-end gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-700">
                  <span>إخفاء {f.label}</span>
                  <input type="checkbox" className="accent-[#117b59]" checked={hiddenSet.includes(f.id)}
                    onChange={(e) => set("hidden", (e.target.checked ? [...hiddenSet, f.id] : hiddenSet.filter((x) => x !== f.id)).join(","))} />
                </label>
              ))}
            </div>
          </Box>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">إلغاء</button>
            <button type="submit" disabled={loading || imageUploading} className="flex items-center gap-2 bg-[#117b59] hover:bg-[#0c6549] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm disabled:opacity-50">
              {loading ? (<><Loader2 size={16} className="animate-spin" /><span>جاري تطبيق التعديل...</span></>) : (<><Check size={16} /><span>{scope === "selected" ? `تطبيق على ${selectedCount} فرصة` : scope === "all" ? "تطبيق على جميع الفرص" : "تطبيق على النوع المحدد"}</span></>)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
