import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Plus, Pencil, Trash2, Eye, X, ChevronLeft, LogOut, Search, Users, BookOpen, TrendingUp, AlertCircle, UserPlus } from "lucide-react";
import { getResearchOpportunities, saveResearchOpportunities, getNextId, ResearchOpportunity, SPECIALTY_COLORS } from "@/lib/researchData";
import RegistrationModal from "@/components/RegistrationModal";

const EMPTY_FORM: Omit<ResearchOpportunity, "id" | "createdAt"> = {
  specialty: "",
  specialtyColor: "bg-gray-100 text-gray-700",
  title: "",
  description: "",
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
    const specialtyColor = SPECIALTY_COLORS[form.specialty] || SPECIALTY_COLORS["Other"];
    onSave({ ...form, indexedIn, benefits, specialtyColor });
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
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">عنوان البحث (بالإنجليزية) *</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Research title..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156]"
              dir="ltr"
              data-testid="input-admin-title"
            />
          </div>

          {/* Specialty + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 text-right">التخصص *</label>
              <select
                required
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] bg-white text-right"
                data-testid="select-admin-specialty"
              >
                <option value="">اختر التخصص...</option>
                {Object.keys(SPECIALTY_COLORS).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
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
                <option value="draft">مسودة</option>
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
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="وصف شامل للدراسة البحثية..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3156]/20 focus:border-[#0C3156] text-right resize-none"
              data-testid="textarea-admin-description"
            />
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

const STATUS_MAP = {
  open: { label: "مفتوح", className: "bg-emerald-100 text-emerald-700" },
  closed: { label: "مغلق", className: "bg-red-100 text-red-600" },
  draft: { label: "مسودة", className: "bg-gray-100 text-gray-600" },
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [research, setResearch] = useState<ResearchOpportunity[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ResearchOpportunity["status"]>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<ResearchOpportunity | null>(null);
  const [deleteItem, setDeleteItem] = useState<ResearchOpportunity | null>(null);
  const [studentResearch, setStudentResearch] = useState<ResearchOpportunity | null>(null);

  useEffect(() => {
    fetch("/api/coordinator/session")
      .then((response) => response.json() as Promise<{ authenticated?: boolean }>)
      .then((result) => {
        if (result.authenticated) setAuthorized(true);
        else { setAuthorized(false); setLocation("/coordinator-portal"); }
      })
      .catch(() => { setAuthorized(false); setLocation("/coordinator-portal"); });
  }, [setLocation]);

  useEffect(() => {
    setResearch(getResearchOpportunities());
  }, []);

  const save = (data: typeof research) => {
    setResearch(data);
    saveResearchOpportunities(data);
  };

  const handleAdd = (form: FormData) => {
    const now = new Date().toISOString().split("T")[0];
    const newItem: ResearchOpportunity = { ...form, id: getNextId(research), createdAt: now };
    save([...research, newItem]);
    setFormOpen(false);
  };

  const handleEdit = (form: FormData) => {
    if (!editItem) return;
    save(research.map((r) => (r.id === editItem.id ? { ...form, id: editItem.id, createdAt: editItem.createdAt } : r)));
    setEditItem(null);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    save(research.filter((r) => r.id !== deleteItem.id));
    setDeleteItem(null);
  };

  const filtered = research.filter((r) => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.specialty.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: research.length,
    open: research.filter((r) => r.status === "open").length,
    totalParticipants: research.reduce((sum, r) => sum + (r.totalSeats - r.seatsLeft), 0),
    closed: research.filter((r) => r.status === "closed").length,
  };

  if (authorized !== true) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP BAR */}
      <div className="bg-[#0C3156] text-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" data-testid="link-admin-site"
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm transition-colors">
              <ChevronLeft size={16} />
              الموقع
            </Link>
            <span className="text-blue-400">|</span>
            <Link href="/admin/submissions" data-testid="link-admin-submissions"
              className="flex items-center gap-1.5 text-[#E9A020] hover:text-white text-sm font-semibold transition-colors">
              <Users size={14} />
              الطلبات والتسجيلات
            </Link>
            <span className="text-blue-400">|</span>
            <Link href="/coordinator-portal" data-testid="link-admin-logout"
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm transition-colors">
              <LogOut size={14} />
              خروج
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-black tracking-tight text-right">لوحة تحكم SRMA</h1>
              <p className="text-blue-300 text-xs text-right">إدارة الفرص البحثية</p>
            </div>
            <div className="w-9 h-9 bg-[#E9A020] rounded-full flex items-center justify-center font-black text-white text-sm">R</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "إجمالي الفرص", value: stats.total, icon: <BookOpen size={20} className="text-[#0C3156]" />, bg: "bg-blue-50" },
            { label: "مفتوحة للتسجيل", value: stats.open, icon: <TrendingUp size={20} className="text-emerald-600" />, bg: "bg-emerald-50" },
            { label: "مشارك مسجل", value: stats.totalParticipants, icon: <Users size={20} className="text-orange-500" />, bg: "bg-orange-50" },
            { label: "مكتملة/مغلقة", value: stats.closed, icon: <AlertCircle size={20} className="text-red-500" />, bg: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-right">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
              <div className="text-3xl font-black text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* TOOLBAR */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <button
              data-testid="button-add-research"
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-2 bg-[#0C3156] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#0a2847] transition-colors shadow-sm text-sm"
            >
              <Plus size={18} />
              إضافة فرصة بحثية جديدة
            </button>
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
                <option value="draft">مسودة</option>
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">لا توجد فرص بحثية</p>
              <p className="text-sm mt-1">أضف فرصة جديدة لتظهر هنا</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {["التخصص", "عنوان البحث", "المقاعد", "الحالة", "الإجراءات"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((item) => {
                    const pct = Math.round(((item.totalSeats - item.seatsLeft) / item.totalSeats) * 100);
                    const statusInfo = STATUS_MAP[item.status];
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors" data-testid={`row-research-${item.id}`}>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${item.specialtyColor}`}>
                            {item.specialty}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2 max-w-xs">{item.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{item.journalTarget}</p>
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
              يتم عرض {filtered.length} من {research.length} فرصة بحثية
            </div>
          )}
        </div>
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
      {studentResearch && (
        <RegistrationModal
          isOpen={true}
          onClose={() => setStudentResearch(null)}
          researchTitle={studentResearch.title}
          researchId={studentResearch.id}
        />
      )}
    </div>
  );
}
