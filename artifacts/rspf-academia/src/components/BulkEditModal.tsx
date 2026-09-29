import { useState } from "react";
import { X, Layers, Check, Loader2, Sparkles } from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import { SpecialtyOption } from "@/lib/siteContentSettings";

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  selectedIds: number[];
  specialtyOptions: SpecialtyOption[];
  onSuccess: (updatedPrograms: ResearchOpportunity[]) => void;
}

export default function BulkEditModal({
  isOpen,
  onClose,
  selectedCount,
  selectedIds,
  specialtyOptions,
  onSuccess,
}: BulkEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Enabled field toggles
  const [enabledFields, setEnabledFields] = useState<{ [key: string]: boolean }>({});

  // Field values
  const [status, setStatus] = useState<string>("open");
  const [category, setCategory] = useState<string>("active");
  const [specialtyAr, setSpecialtyAr] = useState<string>("");
  const [specialtyEn, setSpecialtyEn] = useState<string>("");
  const [supervisor, setSupervisor] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [journalTarget, setJournalTarget] = useState<string>("");
  const [indexedIn, setIndexedIn] = useState<string>("");
  const [totalSeats, setTotalSeats] = useState<number | "">("");
  const [seatsLeft, setSeatsLeft] = useState<number | "">("");
  const [priceOriginalSar, setPriceOriginalSar] = useState<number | "">("");
  const [priceDiscountedSar, setPriceDiscountedSar] = useState<number | "">("");
  const [researchGroupUrl, setResearchGroupUrl] = useState<string>("");

  if (!isOpen) return null;

  const toggleField = (field: string) => {
    setEnabledFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSpecialtySelect = (specNameAr: string) => {
    const found = specialtyOptions.find((s) => s.nameAr === specNameAr);
    if (found) {
      setSpecialtyAr(found.nameAr);
      setSpecialtyEn(found.nameEn || found.nameAr);
    } else {
      setSpecialtyAr(specNameAr);
      setSpecialtyEn(specNameAr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const updates: Record<string, unknown> = {};

    if (enabledFields.status) updates.status = status;
    if (enabledFields.category) updates.category = category;
    if (enabledFields.specialty) {
      if (specialtyAr.trim()) updates.specialtyAr = specialtyAr.trim();
      if (specialtyEn.trim()) updates.specialtyEn = specialtyEn.trim();
    }
    if (enabledFields.supervisor) updates.supervisor = supervisor.trim();
    if (enabledFields.duration) updates.duration = duration.trim();
    if (enabledFields.journalTarget) updates.journalTarget = journalTarget.trim();
    if (enabledFields.indexedIn) updates.indexedIn = indexedIn.trim();
    if (enabledFields.seats) {
      if (typeof totalSeats === "number" && totalSeats > 0) updates.totalSeats = totalSeats;
      if (typeof seatsLeft === "number" && seatsLeft >= 0) updates.seatsLeft = seatsLeft;
    }
    if (enabledFields.pricing) {
      if (typeof priceOriginalSar === "number" && priceOriginalSar > 0) updates.priceOriginalSar = priceOriginalSar;
      if (typeof priceDiscountedSar === "number" && priceDiscountedSar >= 0) updates.priceDiscountedSar = priceDiscountedSar;
    }
    if (enabledFields.researchGroupUrl) updates.researchGroupUrl = researchGroupUrl.trim();

    if (Object.keys(updates).length === 0) {
      setError("يرجى تفعيل حقل واحد على الأقل وتعبئة قيمته للتعديل الجماعي.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/programs/batch-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedIds,
          updates,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "تعذر التعديل الجماعي");
      }

      onSuccess(data.programs || []);
      onClose();
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" onClick={onClose}>
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#117b59]/10 text-[#117b59] flex items-center justify-center">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">التعديل الجماعي للفرص المحددة</h2>
              <p className="text-xs text-slate-500 font-medium">
                تطبيق التغييرات على <span className="font-bold text-[#117b59]">{selectedCount}</span> فرصة بحثية محددة دفعة واحدة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full border border-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-right">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
              {error}
            </div>
          )}

          <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            ℹ️ قم بتفعيل خيار الحقل الذي ترغب في تعديله فقط. الحقول غير المفعلة ستبقى كما هي دون أي تغيير في الفرص المحددة.
          </p>

          {/* Status */}
          <div className="border border-slate-200 rounded-2xl p-4 transition-all">
            <label className="flex items-center justify-between cursor-pointer mb-2">
              <span className="text-xs font-black text-slate-800 flex items-center gap-2">
                <span>الحالة (Status)</span>
              </span>
              <input
                type="checkbox"
                checked={!!enabledFields.status}
                onChange={() => toggleField("status")}
                className="h-4 w-4 rounded text-[#117b59] focus:ring-[#117b59]"
              />
            </label>
            {enabledFields.status && (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full mt-2 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:border-[#117b59] focus:outline-none font-bold"
              >
                <option value="open">مفتوح للتسجيل</option>
                <option value="closed">مغلق</option>
                <option value="upcoming">قادم</option>
                <option value="seats_full">اكتملت المقاعد</option>
                <option value="draft">مسودة</option>
                <option value="ethics_approved">موافقة أخلاقية / PROSPERO</option>
                <option value="submitted">تم الرفع في المجلة</option>
                <option value="under_review">قيد مراجعة المجلة</option>
                <option value="accepted">مقبولة</option>
                <option value="published">تم النشر</option>
              </select>
            )}
          </div>

          {/* Category */}
          <div className="border border-slate-200 rounded-2xl p-4 transition-all">
            <label className="flex items-center justify-between cursor-pointer mb-2">
              <span className="text-xs font-black text-slate-800">نوع البرنامج (Category)</span>
              <input
                type="checkbox"
                checked={!!enabledFields.category}
                onChange={() => toggleField("category")}
                className="h-4 w-4 rounded text-[#117b59] focus:ring-[#117b59]"
              />
            </label>
            {enabledFields.category && (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-2 border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:border-[#117b59] focus:outline-none font-bold"
              >
                <option value="active">فرصة وبرنامج بحثي</option>
                <option value="completed">دراسة منجزة</option>
                <option value="training">تدريب الباحث</option>
                <option value="cme">دورة CME</option>
              </select>
            )}
          </div>

          {/* Specialty */}
          <div className="border border-slate-200 rounded-2xl p-4 transition-all">
            <label className="flex items-center justify-between cursor-pointer mb-2">
              <span className="text-xs font-black text-slate-800">التخصص (Specialty)</span>
              <input
                type="checkbox"
                checked={!!enabledFields.specialty}
                onChange={() => toggleField("specialty")}
                className="h-4 w-4 rounded text-[#117b59] focus:ring-[#117b59]"
              />
            </label>
            {enabledFields.specialty && (
              <div className="space-y-2 mt-2">
                {specialtyOptions.length > 0 && (
                  <div>
                    <label className="block text-[11px] text-slate-500 font-bold mb-1">اختر من التخصصات الحالية:</label>
                    <select
                      onChange={(e) => handleSpecialtySelect(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50"
                    >
                      <option value="">-- اختر تخصصاً --</option>
                      {specialtyOptions.map((s) => (
                        <option key={s.id} value={s.nameAr}>
                          {s.nameAr} {s.nameEn ? `(${s.nameEn})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="التخصص بالعربية"
                    value={specialtyAr}
                    onChange={(e) => setSpecialtyAr(e.target.value)}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:border-[#117b59]"
                  />
                  <input
                    type="text"
                    placeholder="Specialty (English)"
                    value={specialtyEn}
                    onChange={(e) => setSpecialtyEn(e.target.value)}
                    dir="ltr"
                    className="border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:border-[#117b59]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Supervisor & Duration */}
          <div className="border border-slate-200 rounded-2xl p-4 transition-all">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center justify-between cursor-pointer mb-2">
                  <span className="text-xs font-black text-slate-800">المشرف</span>
                  <input
                    type="checkbox"
                    checked={!!enabledFields.supervisor}
                    onChange={() => toggleField("supervisor")}
                    className="h-4 w-4 rounded text-[#117b59] focus:ring-[#117b59]"
                  />
                </label>
                {enabledFields.supervisor && (
                  <input
                    type="text"
                    placeholder="اسم المشرف"
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:border-[#117b59]"
                  />
                )}
              </div>
              <div>
                <label className="flex items-center justify-between cursor-pointer mb-2">
                  <span className="text-xs font-black text-slate-800">مدة الدراسة</span>
                  <input
                    type="checkbox"
                    checked={!!enabledFields.duration}
                    onChange={() => toggleField("duration")}
                    className="h-4 w-4 rounded text-[#117b59] focus:ring-[#117b59]"
                  />
                </label>
                {enabledFields.duration && (
                  <input
                    type="text"
                    placeholder="مثال: 3 أشهر"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:border-[#117b59]"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Journal Target */}
          <div className="border border-slate-200 rounded-2xl p-4 transition-all">
            <label className="flex items-center justify-between cursor-pointer mb-2">
              <span className="text-xs font-black text-slate-800">المجلة المستهدفة</span>
              <input
                type="checkbox"
                checked={!!enabledFields.journalTarget}
                onChange={() => toggleField("journalTarget")}
                className="h-4 w-4 rounded text-[#117b59] focus:ring-[#117b59]"
              />
            </label>
            {enabledFields.journalTarget && (
              <input
                type="text"
                placeholder="اسم المجلة المستهدفة"
                value={journalTarget}
                onChange={(e) => setJournalTarget(e.target.value)}
                className="w-full mt-2 border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:border-[#117b59]"
              />
            )}
          </div>

          {/* Seats */}
          <div className="border border-slate-200 rounded-2xl p-4 transition-all">
            <label className="flex items-center justify-between cursor-pointer mb-2">
              <span className="text-xs font-black text-slate-800">المقاعد (الإجمالية والمتبقية)</span>
              <input
                type="checkbox"
                checked={!!enabledFields.seats}
                onChange={() => toggleField("seats")}
                className="h-4 w-4 rounded text-[#117b59] focus:ring-[#117b59]"
              />
            </label>
            {enabledFields.seats && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-[11px] text-slate-500 font-bold mb-1">المقاعد الإجمالية</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="مثال: 10"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:border-[#117b59]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 font-bold mb-1">المقاعد المتبقية</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="مثال: 3"
                    value={seatsLeft}
                    onChange={(e) => setSeatsLeft(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:border-[#117b59]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="border border-slate-200 rounded-2xl p-4 transition-all">
            <label className="flex items-center justify-between cursor-pointer mb-2">
              <span className="text-xs font-black text-slate-800">الأسعار (بالريال السعودي SAR)</span>
              <input
                type="checkbox"
                checked={!!enabledFields.pricing}
                onChange={() => toggleField("pricing")}
                className="h-4 w-4 rounded text-[#117b59] focus:ring-[#117b59]"
              />
            </label>
            {enabledFields.pricing && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="block text-[11px] text-slate-500 font-bold mb-1">السعر الأصلي (SAR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="مثال: 1500"
                    value={priceOriginalSar}
                    onChange={(e) => setPriceOriginalSar(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:border-[#117b59]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 font-bold mb-1">سعر الخصم (SAR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="مثال: 1000"
                    value={priceDiscountedSar}
                    onChange={(e) => setPriceDiscountedSar(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:border-[#117b59]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Research Group URL */}
          <div className="border border-slate-200 rounded-2xl p-4 transition-all">
            <label className="flex items-center justify-between cursor-pointer mb-2">
              <span className="text-xs font-black text-slate-800">رابط مجموعة الفرصة (واتساب / تيليجرام)</span>
              <input
                type="checkbox"
                checked={!!enabledFields.researchGroupUrl}
                onChange={() => toggleField("researchGroupUrl")}
                className="h-4 w-4 rounded text-[#117b59] focus:ring-[#117b59]"
              />
            </label>
            {enabledFields.researchGroupUrl && (
              <input
                type="url"
                placeholder="https://chat.whatsapp.com/... أو https://t.me/..."
                value={researchGroupUrl}
                onChange={(e) => setResearchGroupUrl(e.target.value)}
                dir="ltr"
                className="w-full mt-2 border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 focus:border-[#117b59]"
              />
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#117b59] hover:bg-[#0c6549] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>جاري تطبيق التعديل...</span>
                </>
              ) : (
                <>
                  <Check size={16} />
                  <span>تطبيق على {selectedCount} فرصة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
