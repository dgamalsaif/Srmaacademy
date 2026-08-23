import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Plus, Pencil, Trash2, Eye, X, ChevronRight, LogOut, Search, Users, BookOpen, TrendingUp, AlertCircle, UserPlus, GraduationCap, Award, Landmark, LayoutDashboard, CreditCard, Settings, ClipboardList, CheckCircle, FlaskConical, Stethoscope, User, Clock, Copy, Check, Edit } from "lucide-react";
import { ResearchOpportunity, SPECIALTY_COLORS } from "@/lib/researchData";
import RegistrationModal from "@/components/RegistrationModal";
import CoordinatorPortalSettingsPanel from "@/components/CoordinatorPortalSettingsPanel";
import { CoordinatorPortalSettings, DEFAULT_COORDINATOR_PORTAL_SETTINGS } from "@/lib/coordinatorPortalSettings";
import ContentControlPanel from "@/components/ContentControlPanel";
import { DEFAULT_SITE_CONTENT_SETTINGS, OpportunityFieldId, SiteContentSettings } from "@/lib/siteContentSettings";

const EMPTY_FORM: Omit<ResearchOpportunity, "id" | "createdAt"> = {
  category: "active",
  specialty: "",
  specialtyAr: "",
  specialtyEn: "",
  specialtyColor: "bg-gray-100 text-gray-700",
  title: "",
  titleAr: "",
  titleEn: "",
  description: "",
  descriptionAr: "",
  descriptionEn: "",
  seatsLeft: 12,
  totalSeats: 12,
  status: "open",
  journalTarget: "",
  journalIssn: "",
  journalPubmed: "",
  journalScopus: "",
  journalWos: "",
  indexedIn: [],
  benefits: ["", "", ""],
  duration: "",
  supervisor: "",
};

type FormData = Omit<ResearchOpportunity, "id" | "createdAt">;

function ResearchFormModal({ initial, onSave, onClose, isEdit, requiredFields, settings }: { initial: FormData; onSave: (data: FormData) => void; onClose: () => void; isEdit: boolean; requiredFields: OpportunityFieldId[]; settings: SiteContentSettings; }) {
  const [form, setForm] = useState<FormData>({ ...initial, benefits: [...(initial.benefits || ["", "", ""])] });
  const [indexedStr, setIndexedStr] = useState((initial.indexedIn || []).join("، "));
  const [benefitsArr, setBenefitsArr] = useState<string[]>(initial.benefits?.length ? [...initial.benefits] : ["", "", ""]);
  const [formError, setFormError] = useState("");
  const isCompletedResearch = form.category === "completed";
  const completedStatus = ["seats_full", "submitted", "accepted", "published"].includes(form.status) ? form.status : "seats_full";
  const isRequired = (field: OpportunityFieldId) => requiredFields.includes(field);
  const applySpecialty = (value: string, language: "ar" | "en") => {
    const selected = settings.specialtyOptions.find((option) => language === "ar" ? option.nameAr === value : option.nameEn === value);
    setForm(selected ? { ...form, specialtyAr: selected.nameAr, specialtyEn: selected.nameEn, specialty: selected.nameEn || selected.nameAr } : { ...form, [language === "ar" ? "specialtyAr" : "specialtyEn"]: value, specialty: language === "en" ? value : form.specialty });
  };
  const applyJournal = (value: string) => {
    const selected = settings.journalOptions.find((journal) => journal.nameAr === value || journal.nameEn === value);
    if (!selected) {
      setForm({ ...form, journalTarget: value });
      return;
    }
    const indexed = [["PubMed", selected.pubmed], ["Scopus", selected.scopus], ["WOS", selected.wos]]
      .filter(([, classification]) => classification)
      .map(([name]) => name);
    setForm({ ...form, journalTarget: selected.nameEn || selected.nameAr, journalIssn: selected.issn, journalPubmed: selected.pubmed, journalScopus: selected.scopus, journalWos: selected.wos, indexedIn: indexed });
    setIndexedStr(indexed.join("، "));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const indexedIn = indexedStr.split(/[،,]/).map((s) => s.trim()).filter(Boolean);
    const benefits = benefitsArr.filter(Boolean);
    const specialty = form.specialtyEn || form.specialty;
    const title = form.titleEn || form.title;
    const description = form.descriptionAr || form.description;
    const specialtyColor = SPECIALTY_COLORS[specialty] || SPECIALTY_COLORS["Other"];
    const nextForm = {
      ...form,
      title,
      specialty,
      description,
      titleAr: form.titleAr || title,
      titleEn: form.titleEn || title,
      specialtyAr: form.specialtyAr || specialty,
      specialtyEn: specialty,
      descriptionAr: form.descriptionAr || description,
      descriptionEn: form.descriptionEn || "",
      indexedIn,
      benefits,
      specialtyColor,
      status: isCompletedResearch ? completedStatus as ResearchOpportunity["status"] : form.status,
    };
    const missingRequiredField = requiredFields.some((field) => {
      const value = nextForm[field];
      return Array.isArray(value) ? value.length === 0 : typeof value === "string" ? value.trim().length === 0 : value === null || value === undefined;
    });
    if (missingRequiredField) {
      setFormError("يرجى تعبئة الحقول التي تم تحديدها كحقول إلزامية.");
      return;
    }
    setFormError("");
    onSave(nextForm);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-100" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-5 rounded-t-3xl flex items-center justify-between z-10">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full transition-colors"><X size={20} /></button>
          <h2 className="text-lg font-black text-slate-800">{isEdit ? (isCompletedResearch ? "تعديل دراسة في الفهرس" : "تعديل الفرصة البحثية") : (isCompletedResearch ? "إضافة دراسة إلى الفهرس" : "إضافة فرصة بحثية جديدة")}</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">عنوان البرنامج (بالعربية){isRequired("titleAr") && " *"}</label>
              <input required={isRequired("titleAr")} type="text" value={form.titleAr || ""} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} placeholder="عنوان البرنامج بالعربية (اختياري)" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] text-right bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">عنوان البرنامج (بالإنجليزية){isRequired("titleEn") && " *"}</label>
              <input required={isRequired("titleEn")} type="text" value={form.titleEn || form.title} onChange={(e) => setForm({ ...form, titleEn: e.target.value, title: e.target.value })} placeholder="Program title (optional)" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] bg-slate-50" dir="ltr" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-right">نوع البرنامج</label>
            <select value={form.category || "active"} onChange={(e) => {
              const category = e.target.value as NonNullable<ResearchOpportunity["category"]>;
              setForm({ ...form, category, status: category === "completed" ? "seats_full" : form.status, seatsLeft: category === "completed" ? 0 : form.seatsLeft, totalSeats: category === "completed" ? Math.max(form.totalSeats, 1) : form.totalSeats });
            }} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] bg-slate-50 text-right appearance-none">
              <option value="active">فرصة وبرنامج بحثي</option>
              <option value="completed">دراسة منجزة</option>
              <option value="training">تدريب الباحث</option>
              <option value="cme">دورة CME</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">التخصص (بالعربية){isRequired("specialtyAr") && " *"}</label>
              <input required={isRequired("specialtyAr")} list="specialties-ar" value={form.specialtyAr || ""} onChange={(e) => applySpecialty(e.target.value, "ar")} placeholder="اكتب أو اختر تخصصاً" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] text-right bg-slate-50" />
              <datalist id="specialties-ar">{settings.specialtyOptions.filter((option) => option.nameAr).map((option) => <option key={option.id} value={option.nameAr} />)}</datalist>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">التخصص (بالإنجليزية){isRequired("specialtyEn") && " *"}</label>
              <input required={isRequired("specialtyEn")} list="specialties-en" value={form.specialtyEn || form.specialty} onChange={(e) => applySpecialty(e.target.value, "en")} placeholder="Type or choose a specialty" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] bg-slate-50" dir="ltr" />
              <datalist id="specialties-en">{[...new Set([...settings.specialtyOptions.map((option) => option.nameEn), ...Object.keys(SPECIALTY_COLORS)])].filter(Boolean).map((name) => <option key={name} value={name} />)}</datalist>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">الحالة{isRequired("status") && " *"}</label>
              {isCompletedResearch ? (
                <select required={isRequired("status")} value={completedStatus} onChange={(e) => setForm({ ...form, status: e.target.value as ResearchOpportunity["status"], seatsLeft: e.target.value === "seats_full" ? 0 : form.seatsLeft })} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] bg-slate-50 text-right appearance-none">
                  <option value="seats_full">اكتملت المقاعد</option>
                  <option value="submitted">تم الرفع في المجلة</option>
                  <option value="accepted">مقبولة</option>
                  <option value="published">تم النشر</option>
                </select>
              ) : (
                <select required={isRequired("status")} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ResearchOpportunity["status"] })} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] bg-slate-50 text-right appearance-none">
                  <option value="open">مفتوح</option>
                  <option value="closed">مغلق</option>
                  <option value="upcoming">قادم</option>
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">المقاعد الإجمالية{isRequired("totalSeats") && " *"}</label>
              <input required={isRequired("totalSeats")} type="number" min={0} value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: parseInt(e.target.value) || 0 })} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] text-center bg-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">المقاعد المتبقية{isRequired("seatsLeft") && " *"}</label>
              <input required={isRequired("seatsLeft")} type="number" min={0} value={form.seatsLeft} onChange={(e) => setForm({ ...form, seatsLeft: parseInt(e.target.value) || 0 })} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] text-center bg-slate-50" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-right">وصف الدراسة (بالعربية){isRequired("descriptionAr") && " *"}</label>
            <textarea required={isRequired("descriptionAr")} rows={4} value={form.descriptionAr || form.description} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value, description: e.target.value })} placeholder="وصف شامل للدراسة البحثية (اختياري)..." className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] text-right resize-none bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-right">Description (English){isRequired("descriptionEn") && " *"}</label>
            <textarea required={isRequired("descriptionEn")} rows={3} value={form.descriptionEn || ""} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] resize-none bg-slate-50" dir="ltr" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">{isCompletedResearch ? "المجلة المستهدفة أو التي رُفع إليها البحث" : "المجلة المستهدفة"}{isRequired("journalTarget") && " *"}</label>
              <input required={isRequired("journalTarget")} list="journal-options" type="text" value={form.journalTarget} onChange={(e) => applyJournal(e.target.value)} placeholder="Type or choose a journal" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] bg-slate-50" dir="ltr" />
              <datalist id="journal-options">{settings.journalOptions.flatMap((journal) => [journal.nameAr, journal.nameEn].filter(Boolean).map((name) => <option key={`${journal.id}-${name}`} value={name} />))}</datalist>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">مدة الدراسة{isRequired("duration") && " *"}</label>
              <input required={isRequired("duration")} type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="8 أشهر (اختياري)" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] text-right bg-slate-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">ISSN / eISSN{isRequired("journalIssn") && " *"}</label>
              <input required={isRequired("journalIssn")} type="text" value={form.journalIssn || ""} onChange={(e) => setForm({ ...form, journalIssn: e.target.value })} placeholder="1234-5678" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] bg-slate-50" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">تصنيف PubMed{isRequired("journalPubmed") && " *"}</label>
              <input required={isRequired("journalPubmed")} type="text" value={form.journalPubmed || ""} onChange={(e) => setForm({ ...form, journalPubmed: e.target.value })} placeholder="Indexed / PMC / Q1" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] bg-slate-50" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">تصنيف Scopus{isRequired("journalScopus") && " *"}</label>
              <input required={isRequired("journalScopus")} type="text" value={form.journalScopus || ""} onChange={(e) => setForm({ ...form, journalScopus: e.target.value })} placeholder="Q1 / Q2 / Indexed" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] bg-slate-50" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-right">تصنيف Web of Science{isRequired("journalWos") && " *"}</label>
              <input required={isRequired("journalWos")} type="text" value={form.journalWos || ""} onChange={(e) => setForm({ ...form, journalWos: e.target.value })} placeholder="Q1 / ESCI / SCIE" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] bg-slate-50" dir="ltr" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-right">المشرف{isRequired("supervisor") && " *"}</label>
            <input required={isRequired("supervisor")} type="text" value={form.supervisor} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} placeholder="د. الاسم — التخصص" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] text-right bg-slate-50" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-right">قواعد البيانات (مفصولة بفاصلة){isRequired("indexedIn") && " *"}</label>
            <input required={isRequired("indexedIn")} type="text" value={indexedStr} onChange={(e) => setIndexedStr(e.target.value)} placeholder="PubMed, Scopus, WoS" className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] bg-slate-50" dir="ltr" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 text-right">مزايا المشاركة{isRequired("benefits") && " *"}</label>
            <div className="space-y-2">
              {benefitsArr.map((b, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <button type="button" onClick={() => setBenefitsArr((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-xl flex-shrink-0 transition-colors">
                    <X size={16} />
                  </button>
                  <input required={isRequired("benefits") && i === 0} type="text" value={b} onChange={(e) => setBenefitsArr((prev) => prev.map((x, idx) => idx === i ? e.target.value : x))} placeholder={`الميزة ${i + 1}`} className="flex-1 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#117b59]/20 focus:border-[#117b59] text-right bg-slate-50" />
                </div>
              ))}
              <button type="button" onClick={() => setBenefitsArr((prev) => [...prev, ""])} className="text-sm text-[#117b59] font-bold hover:bg-[#117b59]/5 px-4 py-2 rounded-xl transition-colors flex items-center gap-1 mt-2 border border-transparent hover:border-[#117b59]/20">
                <Plus size={16} /> إضافة ميزة
              </button>
            </div>
          </div>

          {formError && <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-bold text-red-600">{formError}</p>}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl hover:bg-slate-50 transition-colors text-sm shadow-sm">
              إلغاء
            </button>
            <button type="submit" className="flex-1 bg-[#117b59] text-white font-bold py-3.5 rounded-2xl hover:bg-[#0c6549] transition-colors text-sm shadow-sm">
               {isEdit ? "حفظ التعديلات" : (isCompletedResearch ? "إضافة الدراسة" : "إضافة الفرصة")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ research, onConfirm, onClose }: { research: ResearchOpportunity; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-right border border-slate-100" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h3 className="text-xl font-black text-slate-800 text-center mb-2">حذف الفرصة البحثية</h3>
        <p className="text-slate-500 text-sm text-center mb-6">هل أنت متأكد من حذف هذه الفرصة؟ لا يمكن التراجع عن هذا الإجراء.</p>
        <p className="text-xs text-slate-700 font-bold bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 line-clamp-2 text-center">{research.titleAr || research.title}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-2xl hover:bg-slate-50 transition-colors text-sm shadow-sm">
            إلغاء
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition-colors text-sm shadow-sm">
            حذف نهائياً
          </button>
        </div>
      </div>
    </div>
  );
}

interface PaymentRecord {
  id: number;
  studentName: string;
  programTitle: string;
  amount: number;
  currency: string;
  status: "due" | "partial" | "paid";
  dueDate: string;
  notes: string;
}

function PaymentFormModal({ onClose, onSave }: { onClose: () => void; onSave: (data: Omit<PaymentRecord, "id">) => void }) {
  const [form, setForm] = useState<Omit<PaymentRecord, "id">>({
    studentName: "", programTitle: "", amount: 0, currency: "SAR", status: "due", dueDate: "", notes: "",
  });
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="relative w-full max-w-lg space-y-5 rounded-3xl bg-white p-7 shadow-2xl border border-slate-100" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-50 p-2 rounded-full transition-colors"><X size={20} /></button>
          <h2 className="text-lg font-black text-slate-800">إضافة مستحق مالي</h2>
        </div>
        {[
          { key: "studentName", label: "اسم الطالب", placeholder: "د. الاسم الكامل", type: "text" },
          { key: "programTitle", label: "البرنامج أو الفرصة", placeholder: "اسم البرنامج", type: "text" },
          { key: "amount", label: "المبلغ بالريال", placeholder: "0", type: "number" },
          { key: "dueDate", label: "تاريخ الاستحقاق", placeholder: "", type: "date" },
        ].map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="mb-2 block text-right text-sm font-bold text-slate-700">{label}</label>
            <input required={key !== "dueDate"} type={type} placeholder={placeholder} value={form[key as keyof typeof form] as string | number} onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-right text-sm outline-none focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/20 bg-slate-50" />
          </div>
        ))}
        <div>
          <label className="mb-2 block text-right text-sm font-bold text-slate-700">حالة السداد</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PaymentRecord["status"] })} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-right text-sm outline-none focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/20 bg-slate-50 appearance-none">
            <option value="due">مستحق</option>
            <option value="partial">مسدد جزئياً</option>
            <option value="paid">مسدد بالكامل</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-right text-sm font-bold text-slate-700">ملاحظات</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-right text-sm outline-none focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/20 bg-slate-50" />
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">إلغاء</button>
          <button type="submit" className="flex-1 rounded-2xl bg-[#117b59] py-3.5 text-sm font-bold text-white hover:bg-[#0c6549] transition-colors shadow-sm">حفظ المستحق</button>
        </div>
      </form>
    </div>
  );
}

function SettingsPanel({ role, accountName, onNameUpdated }: { role: "owner" | "coordinator" | null; accountName: string; onNameUpdated: (name: string) => void }) {
  const [fullName, setFullName] = useState(accountName);
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [nameMessage, setNameMessage] = useState("");
  const [codeMessage, setCodeMessage] = useState("");

  useEffect(() => setFullName(accountName), [accountName]);

  const changeName = async (event: React.FormEvent) => {
    event.preventDefault();
    setNameMessage("");
    const response = await fetch("/api/coordinator/change-name", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName }),
    });
    const result = await response.json() as { fullName?: string; error?: string };
    if (response.ok && result.fullName) {
      setFullName(result.fullName);
      onNameUpdated(result.fullName);
      setNameMessage("تم تحديث الاسم بنجاح.");
    } else {
      setNameMessage(result.error || "تعذر تحديث الاسم.");
    }
  };

  const changeCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setCodeMessage("");
    if (newCode !== confirmCode) {
      setCodeMessage("تأكيد رمز الوصول لا يطابق الرمز الجديد.");
      return;
    }
    const response = await fetch("/api/coordinator/change-access-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentCode, newCode }),
    });
    const result = await response.json() as { error?: string };
    setCodeMessage(response.ok ? "تم تغيير رمز الدخول بنجاح." : result.error || "تعذر تغيير الرمز.");
    if (response.ok) { setCurrentCode(""); setNewCode(""); setConfirmCode(""); }
  };
  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-[#e6f5ef] text-[#117b59]">
            <Settings size={23} />
          </div>
          <div>
            <h2 className="text-right text-xl font-black text-slate-800">إعدادات الحساب</h2>
            <p className="mt-1 text-right text-sm font-medium text-slate-500">
              {role === "owner" ? "إدارة طلبات المنسقين والبرامج متاحة لك فقط." : "حدّث بياناتك الشخصية ورمز الوصول بأمان."}
            </p>
          </div>
        </div>
      </div>

      {role === "coordinator" && (
        <>
          <form onSubmit={changeName} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Pencil size={19} /></div>
              <div><h3 className="font-black text-slate-800">تعديل الاسم</h3><p className="mt-1 text-xs font-medium text-slate-500">استخدم الاسم الذي تريد ظهوره في لوحة المالك.</p></div>
            </div>
            <label className="mb-2 block text-right text-sm font-bold text-slate-700">الاسم الجديد</label>
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15" />
            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-right text-xs leading-5 text-amber-800"><span className="font-black">ملاحظة مهمة:</span> سيظهر الاسم الجديد في جميع التسجيلات السابقة واللاحقة المرتبطة بحسابك.</div>
            {nameMessage && <p className={`mt-3 text-right text-sm font-bold ${nameMessage.includes("بنجاح") ? "text-[#117b59]" : "text-red-600"}`}>{nameMessage}</p>}
            <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#117b59] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0c6549]"><Pencil size={16} /> تحديث الاسم</button>
          </form>

          <form onSubmit={changeCode} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f5ef] text-[#117b59]"><Settings size={19} /></div>
              <div><h3 className="font-black text-slate-800">تغيير رمز الوصول</h3><p className="mt-1 text-xs font-medium text-slate-500">رمز الوصول الحالي: محمي ولا يظهر في اللوحة.</p></div>
            </div>
            <div className="space-y-4">
              <div><label className="mb-2 block text-right text-sm font-bold text-slate-700">رمز الوصول الحالي</label><input value={currentCode} onChange={(e) => setCurrentCode(e.target.value)} required type="password" placeholder="أدخل رمز الوصول الحالي" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15" /></div>
              <div><label className="mb-2 block text-right text-sm font-bold text-slate-700">رمز الوصول الجديد</label><input value={newCode} onChange={(e) => setNewCode(e.target.value)} required minLength={8} type="password" placeholder="8 أحرف أو أرقام على الأقل" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15" /></div>
              <div><label className="mb-2 block text-right text-sm font-bold text-slate-700">تأكيد رمز الوصول الجديد</label><input value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} required minLength={8} type="password" placeholder="أعد كتابة الرمز الجديد" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-sm outline-none focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/15" /></div>
            </div>
            {codeMessage && <p className={`mt-3 text-right text-sm font-bold ${codeMessage.includes("بنجاح") ? "text-[#117b59]" : "text-red-600"}`}>{codeMessage}</p>}
            <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#117b59] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0c6549]"><Settings size={16} /> تغيير رمز الوصول</button>
          </form>
        </>
      )}
    </section>
  );
}

const STATUS_MAP: Record<string, { label: string, className: string }> = {
  open: { label: "مفتوح للتسجيل", className: "bg-[#e6f5ef] text-[#117b59]" },
  closed: { label: "مغلق", className: "bg-red-50 text-red-600" },
  draft: { label: "مسودة", className: "bg-slate-100 text-slate-600" },
  upcoming: { label: "قادم", className: "bg-amber-50 text-amber-600" },
  seats_full: { label: "اكتملت المقاعد", className: "bg-teal-50 text-teal-700" },
  submitted: { label: "تم الرفع في المجلة", className: "bg-sky-50 text-sky-700" },
  accepted: { label: "مقبولة", className: "bg-violet-50 text-violet-700" },
  published: { label: "تم النشر", className: "bg-[#e6f5ef] text-[#117b59]" },
};

function ProgramCard({ research, onRegister, onEdit, onDelete, canManage }: any) {
  const [copied, setCopied] = useState(false);
  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/research/${research.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isFull = research.seatsLeft === 0;
  const isCompletedResearch = research.category === "completed";
  const statusColor = isCompletedResearch && STATUS_MAP[research.status] ? STATUS_MAP[research.status].className
    : research.status === 'open' && !isFull ? 'bg-[#e6f5ef] text-[#117b59]'
    : research.status === 'closed' || isFull ? 'bg-red-50 text-red-600'
    : 'bg-amber-50 text-amber-600';

  const statusLabel = isCompletedResearch ? STATUS_MAP[research.status]?.label || 'دراسة منجزة'
    : research.status === 'open' && !isFull ? 'مفتوح للتسجيل'
    : isFull ? 'اكتملت المقاعد'
    : STATUS_MAP[research.status]?.label || research.status;

  return (
    <div className="bg-white rounded-[1.25rem] border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col relative group">
      {canManage && (
        <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10 bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => onEdit(research)}
            title="تعديل الفرصة"
            aria-label="تعديل الفرصة"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-[#117b59] hover:bg-[#e6f5ef] transition-colors"
          >
            <Edit size={15} />
            تعديل
          </button>
          <button
            type="button"
            onClick={() => onDelete(research)}
            title="حذف الفرصة"
            aria-label="حذف الفرصة"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
            حذف
          </button>
        </div>
      )}

      <div className="flex justify-between items-start mb-4 gap-4">
        <h3 className="font-bold text-slate-800 text-sm leading-6 line-clamp-2 flex-1" dir="rtl">{research.titleAr || research.title}</h3>
        <span className={`px-2.5 py-1 rounded-md text-[11px] font-black whitespace-nowrap shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <p className="mb-4 line-clamp-3 text-xs leading-6 text-slate-500">{research.descriptionAr || research.description}</p>

      <div className="grid grid-cols-2 gap-y-3 px-1">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Stethoscope size={14} className="text-slate-400" />
          <span className="truncate">{research.specialtyAr || research.specialty}</span>
        </div>
        {research.supervisor && (
          <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
            <User size={14} className="text-slate-400" />
            <span className="truncate">{research.supervisor}</span>
          </div>
        )}
        {isCompletedResearch ? (
          <>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Users size={14} className="text-slate-400" />
              المقاعد: <span className="font-bold">{research.totalSeats}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Clock size={14} className="text-slate-400" />
              المتبقي: <span className="font-bold">{research.seatsLeft}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Award size={14} className="text-slate-400" />
              <span className="truncate">{research.journalTarget || "المجلة المستهدفة"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <CheckCircle size={14} className="text-slate-400" />
              <span className="truncate">{research.indexedIn?.join("، ") || "موثق"}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Users size={14} className="text-slate-400" />
              المقاعد: <span className="font-bold">{research.totalSeats}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Clock size={14} className="text-slate-400" />
              المتبقي: <span className="font-bold">{research.seatsLeft}</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-3">
        {isCompletedResearch ? (
          <Link href={`/research/${research.id}`} className="flex-1 bg-[#117b59] hover:bg-[#0c6549] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Eye size={16} />
             عرض التفاصيل
          </Link>
        ) : (
          <button
            onClick={() => onRegister(research)}
            disabled={isFull || research.status !== 'open'}
            className="flex-1 bg-[#117b59] hover:bg-[#0c6549] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={16} />
            تسجيل طالب
          </button>
        )}
        <button
          onClick={copyLink}
          className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {copied ? <Check size={16} className="text-[#117b59]" /> : <Copy size={16} className="text-slate-400" />}
          {copied ? 'تم النسخ' : 'نسخ رابط'}
        </button>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [location, setLocation] = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [role, setRole] = useState<"owner" | "coordinator" | null>(null);
  const [accountName, setAccountName] = useState("");
  const [research, setResearch] = useState<ResearchOpportunity[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ResearchOpportunity["status"]>("all");
  const [categoryFilter, setCategoryFilter] = useState<NonNullable<ResearchOpportunity["category"]>>("active");
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [view, setView] = useState<"programs" | "payments" | "settings" | "portal-settings" | "content-settings">("programs");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<NonNullable<ResearchOpportunity["category"]>>("active");
  const [editItem, setEditItem] = useState<ResearchOpportunity | null>(null);
  const [deleteItem, setDeleteItem] = useState<ResearchOpportunity | null>(null);
  const [studentResearch, setStudentResearch] = useState<ResearchOpportunity | null>(null);
  const [portalSettings, setPortalSettings] = useState<CoordinatorPortalSettings>(DEFAULT_COORDINATOR_PORTAL_SETTINGS);
  const [portalSettingsSaving, setPortalSettingsSaving] = useState(false);
  const [portalSettingsMessage, setPortalSettingsMessage] = useState("");
  const [contentSettings, setContentSettings] = useState<SiteContentSettings>(DEFAULT_SITE_CONTENT_SETTINGS);
  const [contentSettingsSaving, setContentSettingsSaving] = useState(false);
  const [contentSettingsMessage, setContentSettingsMessage] = useState("");
  const ownerWorkspace = location === "/admin";

  useEffect(() => {
    fetch("/api/coordinator/session")
      .then((response) => response.json() as Promise<{ authenticated?: boolean; role?: "owner" | "coordinator"; coordinatorName?: string | null }>)
      .then((result) => {
        if (result.authenticated && result.role) {
          if (ownerWorkspace && result.role !== "owner") {
            setAuthorized(false);
            setLocation("/coordinator/dashboard");
            return;
          }
          setAuthorized(true);
          setRole(result.role);
          setAccountName(result.coordinatorName || "");
        }
        else { setAuthorized(false); setLocation(ownerWorkspace ? "/owner-admin" : "/coordinator"); }
      })
      .catch(() => { setAuthorized(false); setLocation(ownerWorkspace ? "/owner-admin" : "/coordinator"); });
  }, [ownerWorkspace, setLocation]);

  useEffect(() => {
    if (!role) return;
    const loadPrograms = async () => {
      setLoadingPrograms(true);
      try {
        let response = await fetch("/api/programs");
        let data = await response.json() as ResearchOpportunity[];
        setResearch(Array.isArray(data) ? data : []);
      } finally {
        setLoadingPrograms(false);
      }
    };
    void loadPrograms();
  }, [role]);

  useEffect(() => {
    if (role !== "owner") return;
    fetch("/api/site-content-settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((settings: SiteContentSettings) => setContentSettings(settings))
      .catch(() => setContentSettingsMessage("تعذر تحميل إعدادات المحتوى حالياً."));
  }, [role]);

  useEffect(() => {
    if (role !== "owner") return;
    fetch("/api/coordinator-portal-settings")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((settings: CoordinatorPortalSettings) => setPortalSettings(settings))
      .catch(() => setPortalSettingsMessage("تعذر تحميل إعدادات البوابة حالياً."));
  }, [role]);

  useEffect(() => {
    if (!role) return;
    fetch("/api/payments")
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .catch(() => setPayments([]));
  }, [role]);

  const toPayload = (form: FormData) => ({
    category: form.category || "active",
    titleAr: form.titleAr || form.title,
    titleEn: form.titleEn || form.title,
    specialtyAr: form.specialtyAr || form.specialty,
    specialtyEn: form.specialtyEn || form.specialty,
    descriptionAr: form.descriptionAr || form.description,
    descriptionEn: form.descriptionEn || "",
    seatsLeft: form.seatsLeft,
    totalSeats: form.totalSeats,
    status: form.status === "draft" ? "upcoming" : form.status,
    journalTarget: form.journalTarget,
    journalIssn: form.journalIssn || "",
    journalPubmed: form.journalPubmed || "",
    journalScopus: form.journalScopus || "",
    journalWos: form.journalWos || "",
    indexedIn: form.indexedIn,
    benefits: form.benefits,
    duration: form.duration,
    supervisor: form.supervisor,
  });

  const handleAdd = async (form: FormData) => {
    const response = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(form)),
    });
    const saved = await response.json() as ResearchOpportunity;
    if (!response.ok) return;
    setResearch((items) => [saved, ...items]);
    setFormOpen(false);
  };

  const handleEdit = async (form: FormData) => {
    if (!editItem) return;
    const response = await fetch(`/api/programs/${editItem.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(form)),
    });
    const saved = await response.json() as ResearchOpportunity;
    if (response.ok) setResearch((items) => items.map((item) => item.id === saved.id ? saved : item));
    setEditItem(null);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const response = await fetch(`/api/programs/${deleteItem.id}`, { method: "DELETE" });
    if (response.ok) {
      setResearch((items) => items.filter((item) => item.id !== deleteItem.id));
      setDeleteItem(null);
    }
  };

  const handlePaymentAdd = async (payment: Omit<PaymentRecord, "id">) => {
    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });
    const saved = await response.json() as PaymentRecord;
    if (response.ok) {
      setPayments((records) => [saved, ...records]);
      setPaymentFormOpen(false);
    }
  };

  const markPaymentPaid = async (payment: PaymentRecord) => {
    const response = await fetch(`/api/payments/${payment.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid" }),
    });
    const saved = await response.json() as PaymentRecord;
    if (response.ok) setPayments((records) => records.map((record) => record.id === saved.id ? saved : record));
  };

  const handleLogout = async () => {
    await fetch("/api/coordinator/logout", { method: "POST" });
    setLocation("/coordinator");
  };

  const savePortalSettings = async () => {
    setPortalSettingsSaving(true);
    setPortalSettingsMessage("");
    try {
      const response = await fetch("/api/coordinator-portal-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portalSettings),
      });
      const result = await response.json() as CoordinatorPortalSettings | { error?: string };
      if (!response.ok) {
        setPortalSettingsMessage("error" in result && result.error ? result.error : "تعذر حفظ الإعدادات.");
        return;
      }
      setPortalSettings(result as CoordinatorPortalSettings);
      setPortalSettingsMessage("تم الحفظ بنجاح. تظهر التغييرات مباشرة في بوابة المنسق.");
    } catch {
      setPortalSettingsMessage("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setPortalSettingsSaving(false);
    }
  };

  const saveContentSettings = async () => {
    setContentSettingsSaving(true);
    setContentSettingsMessage("");
    try {
      const response = await fetch("/api/site-content-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentSettings),
      });
      const result = await response.json() as SiteContentSettings | { error?: string };
      if (!response.ok) {
        setContentSettingsMessage("error" in result && result.error ? result.error : "تعذر حفظ إعدادات المحتوى.");
        return;
      }
      setContentSettings(result as SiteContentSettings);
      setContentSettingsMessage("تم الحفظ بنجاح. ستظهر التغييرات في صفحات المنصة عند إعادة فتحها.");
    } catch {
      setContentSettingsMessage("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setContentSettingsSaving(false);
    }
  };

  const openNewResearch = (category: NonNullable<ResearchOpportunity["category"]>) => {
    setNewCategory(category);
    setFormOpen(true);
  };

  const filtered = research.filter((r) => {
    const matchSearch = !search || [r.title, r.titleAr, r.titleEn, r.specialty, r.specialtyAr, r.specialtyEn]
      .filter(Boolean).some((value) => value!.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchCategory = (r.category || "active") === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const groupedResearch = useMemo(() => {
    const groups: Record<string, ResearchOpportunity[]> = {};
    filtered.forEach(r => {
      const spec = r.specialtyAr || r.specialty || 'تخصصات أخرى';
      if (!groups[spec]) groups[spec] = [];
      groups[spec].push(r);
    });
    return groups;
  }, [filtered]);

  const stats = {
    total: research.length,
    open: research.filter((r) => r.status === "open" && (r.category || "active") === "active").length,
    totalParticipants: research.reduce((sum, r) => sum + (r.totalSeats - r.seatsLeft), 0),
    completed: research.filter((r) => (r.category || "active") === "completed").length,
    training: research.filter((r) => (r.category || "active") === "training").length,
    active: research.filter((r) => (r.category || "active") === "active").length,
    cme: research.filter((r) => (r.category || "active") === "cme").length,
  };

  if (authorized !== true) return null;
  const canManage = role === "owner";

  return (
    <div className="min-h-screen bg-[#f8fafc] text-right" dir="rtl">
      {/* TOP BAR */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
           <div className="text-right">
             <h1 className="text-2xl font-black text-slate-800">لوحة تحكم المنسق</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">أهلاً بك، {accountName || (role === "owner" ? "المدير العام" : "منسق البرامج")}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 shadow-sm">
             <span className="text-slate-500 text-sm font-medium ml-2">الصلاحية:</span>
             <span className="text-slate-800 text-sm font-bold">{role === "owner" ? "مالك النظام" : "منسق"}</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
            خروج <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* STATS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
           <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
             <div>
               <p className="text-slate-500 text-sm font-bold mb-2">البرامج والدورات</p>
               <p className="text-3xl font-black text-slate-800">{stats.training + stats.cme}</p>
             </div>
             <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
               <Award size={28} />
             </div>
           </div>
           <div className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
             <div>
               <p className="text-slate-500 text-sm font-bold mb-2">الفرص البحثية المتاحة</p>
               <p className="text-3xl font-black text-slate-800">{stats.open}</p>
             </div>
             <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
               <FlaskConical size={28} />
             </div>
           </div>
            <button type="button" onClick={() => { setView("programs"); setCategoryFilter("completed"); }} className="bg-white rounded-3xl border border-slate-200 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow text-right">
              <div>
                <p className="text-slate-500 text-sm font-bold mb-2">الدراسات المنجزة</p>
                <p className="text-3xl font-black text-slate-800">{stats.completed}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <CheckCircle size={28} />
              </div>
            </button>
           <div className="bg-[#117b59] rounded-3xl border border-[#0c6549] p-6 flex items-center justify-between shadow-md text-white hover:shadow-lg transition-shadow">
             <div>
               <p className="text-emerald-50 text-sm font-bold mb-2">إجمالي الطلاب المسجلين</p>
               <p className="text-3xl font-black">{stats.totalParticipants}</p>
             </div>
             <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white">
               <Users size={28} />
             </div>
           </div>
        </div>

        {/* NAVIGATION PILLS */}
        <div className="flex flex-wrap items-center gap-3 mb-8 pb-2">
          <button onClick={() => setView('programs')} className={`flex items-center gap-2 px-6 py-3 border rounded-2xl text-sm font-bold transition-all shadow-sm ${view === 'programs' ? 'bg-[#117b59] text-white border-[#117b59]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}>
            <Landmark size={18} className={view === 'programs' ? 'text-emerald-100' : 'text-slate-400'} />
            إدارة البرامج
          </button>
           {canManage && <Link href="/admin/submissions" className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
             <Users size={18} className="text-slate-400" />
             الطلاب المسجلون
           </Link>}
          <button onClick={() => setView('payments')} className={`flex items-center gap-2 px-6 py-3 border rounded-2xl text-sm font-bold transition-all shadow-sm ${view === 'payments' ? 'bg-[#117b59] text-white border-[#117b59]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}>
            <CreditCard size={18} className={view === 'payments' ? 'text-emerald-100' : 'text-slate-400'} />
            المستحقات
          </button>
          <button onClick={() => setView('settings')} className={`flex items-center gap-2 px-6 py-3 border rounded-2xl text-sm font-bold transition-all shadow-sm ${view === 'settings' ? 'bg-[#117b59] text-white border-[#117b59]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}>
            <Settings size={18} className={view === 'settings' ? 'text-emerald-100' : 'text-slate-400'} />
            الإعدادات
          </button>
          {canManage && (
            <button onClick={() => setView('portal-settings')} data-testid="button-portal-settings" className={`flex items-center gap-2 px-6 py-3 border rounded-2xl text-sm font-bold transition-all shadow-sm ${view === 'portal-settings' ? 'bg-[#117b59] text-white border-[#117b59]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}>
              <LayoutDashboard size={18} className={view === 'portal-settings' ? 'text-emerald-100' : 'text-slate-400'} />
              بوابة المنسق
            </button>
          )}
          {canManage && (
            <button onClick={() => setView('content-settings')} data-testid="button-content-settings" className={`flex items-center gap-2 px-6 py-3 border rounded-2xl text-sm font-bold transition-all shadow-sm ${view === 'content-settings' ? 'bg-[#117b59] text-white border-[#117b59]' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'}`}>
              <Edit size={18} className={view === 'content-settings' ? 'text-emerald-100' : 'text-slate-400'} />
              المحتوى والمظهر
            </button>
          )}
        </div>

        {/* CONTENT AREA */}
        <div className="mt-4">

          {/* PROGRAMS VIEW */}
          {view === "programs" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  {[
                    { id: 'active', label: 'الفرص البحثية', icon: FlaskConical },
                    { id: 'completed', label: 'الدراسات المنجزة', icon: CheckCircle },
                    { id: 'training', label: 'تدريب باحث', icon: BookOpen },
                    { id: 'cme', label: 'CME دورات', icon: Award }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id as any)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                        categoryFilter === cat.id
                          ? 'bg-[#117b59] text-white border-[#117b59] shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <cat.icon size={16} />
                      {cat.label}
                    </button>
                  ))}
                </div>
                {canManage && (
                   <button onClick={() => openNewResearch(categoryFilter)} className="flex items-center gap-2 bg-[#117b59] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#0c6549] transition-colors shadow-sm whitespace-nowrap w-full md:w-auto justify-center">
                    <Plus size={18} />
                     {categoryFilter === "completed" ? "إضافة بحث منجز" : "إضافة فرصة"}
                  </button>
                )}
              </div>

              {categoryFilter === "completed" && (
                <section className="mb-7 rounded-[2rem] border-2 border-emerald-100 bg-gradient-to-l from-[#f8fffc] to-[#ecfbf4] p-6 text-right shadow-sm sm:p-8">
                  <div className="flex flex-col items-start justify-between gap-5 sm:flex-row">
                    <div>
                      <p className="text-sm font-black text-[#117b59]">فهرس مراحل الدراسات البحثية</p>
                      <h2 className="mt-1 text-2xl font-black text-slate-800">الدراسات المنجزة</h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">يعرض هذا الفهرس الدراسات التي اكتملت مقاعدها أو وصلت إلى مراحل الرفع والقبول والنشر في المجلات العلمية.</p>
                    </div>
                    <div className="rounded-2xl bg-white px-5 py-3 text-center shadow-sm ring-1 ring-emerald-100">
                      <p className="text-3xl font-black text-[#117b59]">{stats.completed}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">دراسة في الفهرس</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {["اكتملت المقاعد", "تم الرفع في المجلة", "مقبولة", "تم النشر"].map((stage) => (
                      <span key={stage} className="rounded-full border border-emerald-200 bg-white/90 px-4 py-2 text-sm font-black text-[#117b59]">{stage}</span>
                    ))}
                  </div>
                </section>
              )}

              <div className="relative mb-10">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="ابحث بالعنوان أو التخصص أو الكلمات المفتاحية..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 pr-12 pl-4 outline-none focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/20 transition-all text-sm font-bold shadow-sm"
                />
              </div>

              {Object.keys(groupedResearch).length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm mt-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">لا توجد فرص في هذه الفئة</h3>
                  <p className="text-slate-500 text-sm font-medium">حاول تغيير خيارات البحث أو التصفية</p>
                </div>
              ) : (
                Object.entries(groupedResearch).map(([specialty, items]) => (
                  <div key={specialty} className="mb-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-px bg-slate-200 flex-1"></div>
                      <span className="bg-slate-50 text-slate-600 px-5 py-1.5 rounded-full text-[11px] font-bold border border-slate-200 shadow-sm">
                        {specialty}
                      </span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                      {items.map(r => (
                        <ProgramCard
                          key={r.id}
                          research={r}
                          onRegister={setStudentResearch}
                          onEdit={setEditItem}
                          onDelete={setDeleteItem}
                          canManage={canManage}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PAYMENTS VIEW */}
          {view === "payments" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-800">المستحقات والتسديدات</h2>
                {canManage && <button onClick={() => setPaymentFormOpen(true)} className="flex items-center gap-2 bg-[#117b59] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#0c6549] transition-colors shadow-sm">
                  <Plus size={16} /> إضافة مستحق
                </button>}
              </div>

              {payments.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm mt-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="text-slate-300" size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">لا توجد سجلات مالية</h3>
                  <p className="text-slate-500 text-sm font-medium">قم بإضافة مستحقات لتتبعها هنا.</p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500">الطالب</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500">البرنامج</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500">المبلغ</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500">الحالة</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500">ملاحظات</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-800">{p.studentName}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-600">{p.programTitle}</td>
                            <td className="px-6 py-4 text-sm font-bold text-[#117b59]">{p.amount} {p.currency}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-md text-xs font-bold ${p.status === 'paid' ? 'bg-[#e6f5ef] text-[#117b59]' : p.status === 'partial' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                {p.status === 'paid' ? 'مسدد' : p.status === 'partial' ? 'جزئي' : 'مستحق'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">{p.notes || "—"}</td>
                            <td className="px-6 py-4">
                              {canManage && p.status !== "paid" && (
                                <button onClick={() => markPaymentPaid(p)} className="text-[#117b59] hover:bg-[#e6f5ef] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                  تحديد كمسدد
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS VIEW */}
          {view === "settings" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SettingsPanel role={role} accountName={accountName} onNameUpdated={setAccountName} />
            </div>
          )}
          {view === "portal-settings" && canManage && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CoordinatorPortalSettingsPanel
                settings={portalSettings}
                onChange={setPortalSettings}
                onSave={() => void savePortalSettings()}
                saving={portalSettingsSaving}
                message={portalSettingsMessage}
              />
            </div>
          )}
          {view === "content-settings" && canManage && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ContentControlPanel settings={contentSettings} onChange={setContentSettings} onSave={() => void saveContentSettings()} saving={contentSettingsSaving} message={contentSettingsMessage} />
            </div>
          )}

        </div>
      </div>

      {formOpen && (
        <ResearchFormModal
          isEdit={false}
          initial={{ ...EMPTY_FORM, category: newCategory, status: newCategory === "completed" ? "seats_full" : "open", totalSeats: 12, seatsLeft: newCategory === "completed" ? 0 : 12 }}
          onSave={handleAdd}
          onClose={() => setFormOpen(false)}
          requiredFields={contentSettings.requiredOpportunityFields}
          settings={contentSettings}
        />
      )}

      {editItem && (
        <ResearchFormModal
          isEdit={true}
          initial={editItem}
          onSave={handleEdit}
          onClose={() => setEditItem(null)}
          requiredFields={contentSettings.requiredOpportunityFields}
          settings={contentSettings}
        />
      )}

      {deleteItem && (
        <DeleteConfirmModal
          research={deleteItem}
          onConfirm={handleDelete}
          onClose={() => setDeleteItem(null)}
        />
      )}

      {paymentFormOpen && (
        <PaymentFormModal
          onSave={handlePaymentAdd}
          onClose={() => setPaymentFormOpen(false)}
        />
      )}

      {studentResearch && (
        <RegistrationModal
          isOpen={!!studentResearch}
          onClose={() => setStudentResearch(null)}
          researchTitle={studentResearch.titleAr || studentResearch.title}
          researchId={studentResearch.id}
          coordinatorEntry={true}
        />
      )}
    </div>
  );
}