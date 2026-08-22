import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Plus, Pencil, Trash2, Eye, X, ChevronLeft, LogOut, Search, Users, BookOpen, TrendingUp, AlertCircle, UserPlus, GraduationCap, Award, Landmark, LayoutDashboard, CreditCard, Settings, ClipboardList } from "lucide-react";
import { ResearchOpportunity, SPECIALTY_COLORS } from "@/lib/researchData";
import RegistrationModal from "@/components/RegistrationModal";

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
  indexedIn: [],
  benefits: ["", "", ""],
  duration: "",
  supervisor: "",
};

type FormData = Omit<ResearchOpportunity, "id" | "createdAt">;

function ResearchFormModal({
  initial,
  onSave,
  onClose,
  isEdit,
}: {
  initial: FormData;
  onSave: (data: FormData) => void;
  onClose: () => void;
  isEdit: boolean;
}) {
  const [form, setForm] = useState<FormData>({ ...initial, benefits: [...(initial.benefits || ["", "", ""])] });
  const [indexedStr, setIndexedStr] = useState((initial.indexedIn || []).join("، "));
  const [benefitsArr, setBenefitsArr] = useState<string[]>(
    initial.benefits?.length ? [...initial.benefits] : ["", "", ""]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const indexedIn = indexedStr.split(/[،,]/).map((s) => s.trim()).filter(Boolean);
    const benefits = benefitsArr.filter(Boolean);
    const specialty = form.specialtyEn || form.specialty;
    const title = form.titleEn || form.title;
    const description = form.descriptionAr || form.description;
    const specialtyColor = SPECIALTY_COLORS[specialty] || SPECIALTY_COLORS["Other"];
    onSave({
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
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          <h2 className="text-lg font-black text-slate-900">
            {isEdit ? "تعديل الفرصة البحثية" : "إضافة فرصة بحثية جديدة"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">عنوان البرنامج (بالعربية) *</label>
              <input
                required
                type="text"
                value={form.titleAr || ""}
                onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                placeholder="عنوان البرنامج بالعربية"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] text-right"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">عنوان البرنامج (بالإنجليزية) *</label>
              <input
                required
                type="text"
                value={form.titleEn || form.title}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value, title: e.target.value })}
                placeholder="Program title..."
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156]"
                dir="ltr"
                data-testid="input-admin-title"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">نوع البرنامج *</label>
            <select value={form.category || "active"} onChange={(e) => setForm({ ...form, category: e.target.value as NonNullable<ResearchOpportunity["category"]> })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] bg-white text-right">
              <option value="active">فرصة وبرنامج بحثي</option>
              <option value="completed">دراسة منجزة</option>
              <option value="training">تدريب الباحث</option>
              <option value="cme">دورة CME</option>
            </select>
          </div>

          {/* Specialty + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">التخصص (بالعربية) *</label>
              <input required value={form.specialtyAr || ""} onChange={(e) => setForm({ ...form, specialtyAr: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] text-right" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">التخصص (بالإنجليزية) *</label>
              <select
                required
                value={form.specialtyEn || form.specialty}
                onChange={(e) => setForm({ ...form, specialtyEn: e.target.value, specialty: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] bg-white text-right"
                data-testid="select-admin-specialty"
              >
                <option value="">اختر التخصص...</option>
                {Object.keys(SPECIALTY_COLORS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">الحالة *</label>
              <select
                required
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ResearchOpportunity["status"] })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] bg-white text-right"
                data-testid="select-admin-status"
              >
                <option value="open">مفتوح</option>
                <option value="closed">مغلق</option>
                <option value="upcoming">قادم</option>
              </select>
            </div>
          </div>

          {/* Seats */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">المقاعد الإجمالية *</label>
              <input
                required
                type="number"
                min={1}
                value={form.totalSeats}
                onChange={(e) => setForm({ ...form, totalSeats: parseInt(e.target.value) || 12 })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] text-center"
                data-testid="input-admin-total-seats"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">المقاعد المتبقية *</label>
              <input
                required
                type="number"
                min={0}
                value={form.seatsLeft}
                onChange={(e) => setForm({ ...form, seatsLeft: parseInt(e.target.value) || 0 })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] text-center"
                data-testid="input-admin-seats-left"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">وصف الدراسة (بالعربية) *</label>
            <textarea
              required
              rows={4}
              value={form.descriptionAr || form.description}
              onChange={(e) => setForm({ ...form, descriptionAr: e.target.value, description: e.target.value })}
              placeholder="وصف شامل للدراسة البحثية..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] text-right resize-none"
              data-testid="textarea-admin-description"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">Description (English)</label>
            <textarea rows={3} value={form.descriptionEn || ""} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] resize-none"
              dir="ltr" />
          </div>

          {/* Journal + Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">المجلة المستهدفة *</label>
              <input
                required
                type="text"
                value={form.journalTarget}
                onChange={(e) => setForm({ ...form, journalTarget: e.target.value })}
                placeholder="Journal Name (Q1)"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156]"
                dir="ltr"
                data-testid="input-admin-journal"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">مدة الدراسة *</label>
              <input
                required
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="8 أشهر"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] text-right"
                data-testid="input-admin-duration"
              />
            </div>
          </div>

          {/* Supervisor */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">المشرف</label>
            <input
              type="text"
              value={form.supervisor}
              onChange={(e) => setForm({ ...form, supervisor: e.target.value })}
              placeholder="د. الاسم — التخصص"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] text-right"
              data-testid="input-admin-supervisor"
            />
          </div>

          {/* Indexed in */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">قواعد البيانات (مفصولة بفاصلة)</label>
            <input
              type="text"
              value={indexedStr}
              onChange={(e) => setIndexedStr(e.target.value)}
              placeholder="PubMed, Scopus, WoS"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156]"
              dir="ltr"
              data-testid="input-admin-indexed"
            />
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">مزايا المشاركة</label>
            <div className="space-y-2">
              {benefitsArr.map((b, i) => (
                <div key={i} className="flex gap-2">
                  <button type="button" onClick={() => setBenefitsArr((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 flex-shrink-0">
                    <X size={16} />
                  </button>
                  <input
                    type="text"
                    value={b}
                    onChange={(e) => setBenefitsArr((prev) => prev.map((x, idx) => idx === i ? e.target.value : x))}
                    placeholder={`الميزة ${i + 1}`}
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] text-right"
                    data-testid={`input-admin-benefit-${i}`}
                  />
                </div>
              ))}
              <button type="button" onClick={() => setBenefitsArr((prev) => [...prev, ""])}
                className="text-sm text-[#0C3156] font-semibold hover:underline flex items-center gap-1 mt-1">
                <Plus size={15} /> إضافة ميزة
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm">
              إلغاء
            </button>
            <button type="submit" data-testid="button-admin-save"
              className="flex-1 bg-[#0C3156] text-white font-bold py-3 rounded-xl hover:bg-[#0a2847] transition-colors text-sm shadow-sm">
              {isEdit ? "حفظ التعديلات" : "إضافة الفرصة"}
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-black text-slate-900 text-center mb-2">حذف الفرصة البحثية</h3>
        <p className="text-slate-500 text-sm text-center mb-5">هل أنت متأكد من حذف هذه الفرصة؟ لا يمكن التراجع عن هذا الإجراء.</p>
        <p className="text-xs text-slate-400 bg-slate-50 rounded-lg p-3 mb-5 line-clamp-2">{research.title}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm">
            إلغاء
          </button>
          <button onClick={onConfirm} data-testid="button-confirm-delete"
            className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-xl hover:bg-red-600 transition-colors text-sm">
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <form onSubmit={(event) => { event.preventDefault(); onSave(form); }}
        className="relative w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between">
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
          <h2 className="text-lg font-black text-slate-900">إضافة مستحق مالي</h2>
        </div>
        {[
          { key: "studentName", label: "اسم الطالب", placeholder: "د. الاسم الكامل", type: "text" },
          { key: "programTitle", label: "البرنامج أو الفرصة", placeholder: "اسم البرنامج", type: "text" },
          { key: "amount", label: "المبلغ بالريال", placeholder: "0", type: "number" },
          { key: "dueDate", label: "تاريخ الاستحقاق", placeholder: "", type: "date" },
        ].map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="mb-1.5 block text-right text-sm font-bold text-slate-700">{label}</label>
            <input required={key !== "dueDate"} type={type} placeholder={placeholder}
              value={form[key as keyof typeof form] as string | number}
              onChange={(event) => setForm({ ...form, [key]: type === "number" ? Number(event.target.value) : event.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-right text-sm outline-none focus:border-[#0C3156] focus:ring-2 focus:ring-[#0C3156]/15" />
          </div>
        ))}
        <div>
          <label className="mb-1.5 block text-right text-sm font-bold text-slate-700">حالة السداد</label>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as PaymentRecord["status"] })}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-right text-sm outline-none focus:border-[#0C3156]">
            <option value="due">مستحق</option>
            <option value="partial">مسدد جزئياً</option>
            <option value="paid">مسدد بالكامل</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-right text-sm font-bold text-slate-700">ملاحظات</label>
          <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-right text-sm outline-none focus:border-[#0C3156]" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600">إلغاء</button>
          <button type="submit" className="flex-1 rounded-xl bg-[#0C3156] py-3 text-sm font-bold text-white">حفظ المستحق</button>
        </div>
      </form>
    </div>
  );
}

function SettingsPanel({ role }: { role: "owner" | "coordinator" | null }) {
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [message, setMessage] = useState("");
  const changeCode = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/coordinator/change-access-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentCode, newCode }),
    });
    const result = await response.json() as { error?: string };
    setMessage(response.ok ? "تم تغيير رمز الدخول بنجاح." : result.error || "تعذر تغيير الرمز.");
    if (response.ok) { setCurrentCode(""); setNewCode(""); }
  };
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-right text-xl font-black text-slate-900">إعدادات الحساب</h2>
      <p className="mt-2 text-right text-sm text-slate-500">
        {role === "owner" ? "أنت في وضع المالك. إدارة طلبات المنسقين والبرامج متاحة لك فقط." : "يمكنك تغيير رمز دخولك الشخصي، بينما تبقى البرامج وإدارة المنسقين تحت صلاحية المالك."}
      </p>
      {role === "coordinator" && (
        <form onSubmit={changeCode} className="mt-6 max-w-xl space-y-4">
          <input value={currentCode} onChange={(event) => setCurrentCode(event.target.value)} required type="password" placeholder="رمز الدخول الحالي"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-right text-sm outline-none focus:border-[#117b59]" />
          <input value={newCode} onChange={(event) => setNewCode(event.target.value)} required minLength={8} type="password" placeholder="رمز الدخول الجديد (8 أحرف على الأقل)"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-right text-sm outline-none focus:border-[#117b59]" />
          {message && <p className="text-right text-sm text-[#117b59]">{message}</p>}
          <button type="submit" className="rounded-xl bg-[#117b59] px-5 py-3 text-sm font-bold text-white">تحديث رمز الدخول</button>
        </form>
      )}
    </section>
  );
}

const STATUS_MAP = {
  open: { label: "مفتوح", className: "bg-emerald-100 text-emerald-700" },
  closed: { label: "مغلق", className: "bg-red-100 text-red-600" },
  draft: { label: "مسودة", className: "bg-gray-100 text-gray-600" },
  upcoming: { label: "قادم", className: "bg-amber-100 text-amber-700" },
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [role, setRole] = useState<"owner" | "coordinator" | null>(null);
  const [research, setResearch] = useState<ResearchOpportunity[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ResearchOpportunity["status"]>("all");
  const [categoryFilter, setCategoryFilter] = useState<NonNullable<ResearchOpportunity["category"]>>("active");
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [view, setView] = useState<"programs" | "payments" | "settings">("programs");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<ResearchOpportunity | null>(null);
  const [deleteItem, setDeleteItem] = useState<ResearchOpportunity | null>(null);
  const [studentResearch, setStudentResearch] = useState<ResearchOpportunity | null>(null);

  useEffect(() => {
    fetch("/api/coordinator/session")
      .then((response) => response.json() as Promise<{ authenticated?: boolean; role?: "owner" | "coordinator" }>)
      .then((result) => {
        if (result.authenticated && result.role) {
          setAuthorized(true);
          setRole(result.role);
        }
        else { setAuthorized(false); setLocation("/coordinator-portal"); }
      })
      .catch(() => { setAuthorized(false); setLocation("/coordinator-portal"); });
  }, [setLocation]);

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
    setLocation("/coordinator-portal");
  };

  const filtered = research.filter((r) => {
    const matchSearch = !search || [r.title, r.titleAr, r.titleEn, r.specialty, r.specialtyAr, r.specialtyEn]
      .filter(Boolean).some((value) => value!.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchCategory = (r.category || "active") === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const stats = {
    total: research.length,
    open: research.filter((r) => r.status === "open" && (r.category || "active") === "active").length,
    totalParticipants: research.reduce((sum, r) => sum + (r.totalSeats - r.seatsLeft), 0),
    completed: research.filter((r) => (r.category || "active") === "completed").length,
    training: research.filter((r) => (r.category || "active") === "training").length,
  };

  if (authorized !== true) return null;
  const canManage = role === "owner";

  return (
      <div className="min-h-screen bg-[#f4f7fb]">
      {/* TOP BAR */}
       <div className="bg-gradient-to-l from-[#0b2a4d] via-[#0C3156] to-[#164e78] text-white px-4 sm:px-6 lg:px-8 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" data-testid="link-admin-site"
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm transition-colors">
              <ChevronLeft size={16} />
              الموقع
            </Link>
            <span className="text-blue-400">|</span>
              <Link href="/admin/submissions" data-testid="link-admin-submissions"
               className="flex items-center gap-1.5 text-[#ffd47d] hover:text-white text-sm font-semibold transition-colors">
              <Users size={14} />
              {canManage ? "الطلاب وإدارة الطلبات" : "الطلاب المسجلون"}
            </Link>
            <span className="text-blue-400">|</span>
            <button onClick={handleLogout} data-testid="link-admin-logout"
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm transition-colors">
              <LogOut size={14} />
              خروج
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-black tracking-tight text-right">لوحة تحكم SRMA</h1>
              <p className="text-blue-300 text-xs text-right">{canManage ? "إدارة البرامج والفرص المشتركة" : "متابعة البرامج والطلاب المسجلين"}</p>
            </div>
            <div className="w-10 h-10 border border-white/25 bg-white/10 rounded-xl flex items-center justify-center font-black text-[#ffd47d] text-sm">SR</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#dbe8f2] bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="text-right">
            <p className="text-xs font-bold text-[#117b59]">SRMA RESEARCH ACADEMY</p>
            <h2 className="mt-1 text-xl font-black text-[#172238]">مرحباً بك في لوحة {canManage ? "المالك" : "المنسق"}</h2>
            <p className="mt-1 text-sm text-slate-500">{canManage ? "أدر البرامج والتسجيلات والمستحقات من مكان واحد." : "تابع البرامج وسجّل الطلاب الجدد بسرعة ووضوح."}</p>
          </div>
          <div className="rounded-xl bg-[#f3fbf8] px-4 py-3 text-right text-sm text-[#28634f]">
            <p className="font-bold">الصلاحية الحالية</p>
            <p className="mt-1">{canManage ? "مالك المنصة" : "منسق معتمد"}</p>
          </div>
        </div>
        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: "إجمالي الفرص", value: stats.total, icon: <BookOpen size={20} className="text-[#0C3156]" />, bg: "bg-blue-50" },
            { label: "مفتوحة للتسجيل", value: stats.open, icon: <TrendingUp size={20} className="text-emerald-600" />, bg: "bg-emerald-50" },
            { label: "مشارك مسجل", value: stats.totalParticipants, icon: <Users size={20} className="text-orange-500" />, bg: "bg-orange-50" },
            { label: "الدراسات المنجزة", value: stats.completed, icon: <Award size={20} className="text-violet-600" />, bg: "bg-violet-50" },
          ].map((s) => (
             <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-[0_8px_24px_rgba(15,43,76,.06)] text-right transition hover:-translate-y-0.5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
              <div className="text-3xl font-black text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {[
            { key: "programs", label: "الفرص والبرامج", icon: LayoutDashboard },
            { key: "students", label: "الطلاب المسجلون", icon: ClipboardList },
            { key: "payments", label: "المستحقات والتسديدات", icon: CreditCard },
            { key: "settings", label: "الإعدادات", icon: Settings },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => key === "students" ? setLocation("/admin/submissions") : setView(key as typeof view)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                view === key ? "bg-[#117b59] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {view === "payments" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              {canManage ? (
                <button onClick={() => setPaymentFormOpen(true)} className="flex items-center gap-2 self-start rounded-xl bg-[#0C3156] px-4 py-2.5 text-sm font-bold text-white">
                  <Plus size={16} /> إضافة مستحق
                </button>
              ) : <p className="text-sm font-semibold text-[#117b59]">يعرض هذا السجل المستحقات التي أضافتها الإدارة.</p>}
              <div className="text-right">
                <h2 className="font-black text-slate-900">سجل المستحقات والتسديدات</h2>
                <p className="mt-1 text-xs text-slate-500">سجل إداري داخلي، دون تنفيذ دفع إلكتروني.</p>
              </div>
            </div>
            {payments.length === 0 ? (
              <div className="py-16 text-center text-slate-400"><Landmark size={38} className="mx-auto mb-3 opacity-30" />لا توجد مستحقات مسجلة بعد.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="border-b border-slate-100 bg-slate-50">
                    <tr>{["الطالب", "البرنامج", "المبلغ", "تاريخ الاستحقاق", "الحالة", "إجراء"].map((item) => <th key={item} className="px-5 py-3 text-xs font-bold text-slate-500">{item}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">{payment.studentName}</td>
                        <td className="px-5 py-4 text-sm text-slate-600">{payment.programTitle || "—"}</td>
                        <td className="px-5 py-4 text-sm font-bold text-slate-800">{payment.amount.toLocaleString("ar-SA")} {payment.currency}</td>
                        <td className="px-5 py-4 text-sm text-slate-500">{payment.dueDate || "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            payment.status === "paid" ? "bg-emerald-100 text-emerald-700" : payment.status === "partial" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"
                          }`}>{payment.status === "paid" ? "مسدد بالكامل" : payment.status === "partial" ? "مسدد جزئياً" : "مستحق"}</span>
                        </td>
                        <td className="px-5 py-4">
                          {canManage && payment.status !== "paid" && <button onClick={() => markPaymentPaid(payment)} className="rounded-lg bg-[#117b59] px-3 py-1.5 text-xs font-bold text-white">تأكيد السداد</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {view === "settings" && <SettingsPanel role={role} />}

        {view === "programs" && <>
        <div className="flex gap-2 overflow-x-auto pb-3 mb-2">
          {[
            { key: "active", label: "الفرص والبرامج", icon: <BookOpen size={15} /> },
            { key: "completed", label: "الدراسات المنجزة", icon: <Award size={15} /> },
            { key: "training", label: "تدريب الباحث", icon: <GraduationCap size={15} /> },
            { key: "cme", label: "دورات CME", icon: <Landmark size={15} /> },
          ].map(({ key, label, icon }) => (
            <button key={key} onClick={() => setCategoryFilter(key as NonNullable<ResearchOpportunity["category"]>)}
              className={`whitespace-nowrap flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                categoryFilter === key ? "bg-[#0C3156] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* TOOLBAR */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {canManage ? (
              <button
                data-testid="button-add-research"
                onClick={() => setFormOpen(true)}
                className="flex items-center gap-2 bg-[#0C3156] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#0a2847] transition-colors shadow-sm text-sm"
              >
                <Plus size={18} />
                إضافة برنامج أو فرصة
              </button>
            ) : (
              <p className="text-sm font-semibold text-[#117b59]">البرامج مشتركة وتُدار من قبل الإدارة</p>
            )}
            <div className="flex gap-3 flex-wrap justify-end">
              <div className="relative">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  data-testid="input-admin-search"
                  type="text"
                  placeholder="بحث..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border border-slate-200 rounded-xl pr-9 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] w-48"
                  dir="rtl"
                />
              </div>
              <select
                data-testid="select-admin-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 bg-white"
              >
                <option value="all">جميع الحالات</option>
                <option value="open">مفتوح</option>
                <option value="closed">مغلق</option>
                <option value="upcoming">قادم</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loadingPrograms ? (
            <div className="py-16 text-center text-slate-400">جارٍ تحميل البرامج...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">لا توجد عناصر في هذا القسم</p>
              <p className="text-sm mt-1">{canManage ? "أضف برنامجاً جديداً ليظهر هنا" : "ستظهر البرامج التي تنشرها الإدارة هنا"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["التخصص", "عنوان البرنامج", "المقاعد", "الحالة", "الإجراءات"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => {
                    const pct = item.totalSeats > 0 ? Math.round(((item.totalSeats - item.seatsLeft) / item.totalSeats) * 100) : 0;
                    const statusInfo = STATUS_MAP[item.status];
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors" data-testid={`row-research-${item.id}`}>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${item.specialtyColor}`}>
                            {item.specialtyAr || item.specialty}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2 max-w-xs">{item.titleAr || item.title}</p>
                          <p className="text-xs text-slate-400 mt-1" dir="ltr">{item.titleEn || item.title}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                              <div className="h-full bg-[#0C3156] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-slate-600 font-medium whitespace-nowrap">{item.seatsLeft}/{item.totalSeats}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1.5 rounded-full ${statusInfo.className}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {canManage && <>
                              <button
                                onClick={() => setDeleteItem(item)}
                                data-testid={`button-delete-${item.id}`}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <Trash2 size={16} />
                              </button>
                              <button
                                onClick={() => setEditItem(item)}
                                data-testid={`button-edit-${item.id}`}
                                className="p-2 text-blue-400 hover:text-[#0C3156] hover:bg-blue-50 rounded-lg transition-colors"
                                title="تعديل"
                              >
                                <Pencil size={16} />
                              </button>
                            </>}
                            <button
                              onClick={() => setStudentResearch(item)}
                              data-testid={`button-add-student-${item.id}`}
                              className="flex items-center gap-1.5 rounded-lg bg-[#117b59] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0c6549]"
                              title="إضافة طالب"
                            >
                              <UserPlus size={14} />
                              إضافة طالب
                            </button>
                            <Link
                              href={`/research/${item.id}`}
                              data-testid={`button-view-${item.id}`}
                              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="عرض"
                            >
                              <Eye size={16} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-right">
              يتم عرض {filtered.length} عنصر من {research.length} برنامج وفرصة
            </div>
          )}
        </div>
        </>}
      </div>

      {/* MODALS */}
      {formOpen && (
        <ResearchFormModal
          initial={{ ...EMPTY_FORM }}
          onSave={handleAdd}
          onClose={() => setFormOpen(false)}
          isEdit={false}
        />
      )}
      {editItem && (
        <ResearchFormModal
          initial={{ ...editItem }}
          onSave={handleEdit}
          onClose={() => setEditItem(null)}
          isEdit={true}
        />
      )}
      {deleteItem && (
        <DeleteConfirmModal
          research={deleteItem}
          onConfirm={handleDelete}
          onClose={() => setDeleteItem(null)}
        />
      )}
      {paymentFormOpen && <PaymentFormModal onClose={() => setPaymentFormOpen(false)} onSave={handlePaymentAdd} />}
      {studentResearch && (
        <RegistrationModal
          isOpen={true}
          onClose={() => setStudentResearch(null)}
          researchTitle={studentResearch.title}
          researchId={studentResearch.id}
            coordinatorEntry
        />
      )}
    </div>
  );
}
