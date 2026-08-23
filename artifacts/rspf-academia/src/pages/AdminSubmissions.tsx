import { useState, useEffect, useCallback } from "react";
import { useClerk } from "@clerk/react";
import { Link, useLocation } from "wouter";
import { ChevronRight, LogOut, RefreshCw, Users, FileText, Check, X, Clock, Mail, Phone, Download, Pencil, Trash2, Save, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import { SRMA_LOGO } from "@/components/BrandBackground";

const API_BASE = "/api";

interface Registration {
  id: number;
  fullName: string;
  specialization: string;
  email: string;
  whatsapp: string;
  affiliation: string;
  country: string;
  city: string;
  orcid: string;
  researchId: number;
  researchTitle: string;
  authorRole?: "first_author" | "co_author";
  researchStatus?: string;
  researchCategory?: string;
  coordinatorId: number | null;
  coordinatorName: string | null;
  registrationSource: "coordinator" | "public";
  status: string;
  createdAt: string;
}

interface ServiceRequest {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  serviceType: string;
  details: string;
  fileLink: string;
  status: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  approved: "bg-[#e6f5ef] text-[#117b59] border border-[#117b59]/20",
  rejected: "bg-red-50 text-red-600 border border-red-200",
  contacted: "bg-blue-50 text-blue-700 border border-blue-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
  contacted: "تم التواصل",
};

const RESEARCH_STATUS_LABELS: Record<string, string> = {
  open: "مفتوحة للتسجيل",
  closed: "أُغلقت",
  upcoming: "قريباً",
  seats_full: "اكتملت المقاعد",
  ethics_approved: "موافقة أخلاقية / PROSPERO",
  submitted: "تم الرفع في المجلة",
  under_review: "قيد مراجعة المجلة",
  accepted: "مقبولة للنشر",
  published: "تم النشر",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[11px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600 border border-slate-200"}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function StatusActions({ id, current, onUpdate, endpoint }: { id: number; current: string; onUpdate: () => void; endpoint: string }) {
  const [loading, setLoading] = useState(false);

  const update = async (status: string) => {
    setLoading(true);
    await fetch(`${API_BASE}/${endpoint}/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    onUpdate();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      {current !== "approved" && (
        <button onClick={() => update("approved")} disabled={loading} title="قبول"
          className="p-2 text-[#117b59] hover:bg-[#e6f5ef] rounded-lg transition-colors border border-transparent hover:border-[#117b59]/20">
          <Check size={16} />
        </button>
      )}
      {current !== "contacted" && (
        <button onClick={() => update("contacted")} disabled={loading} title="تم التواصل"
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200">
          <Phone size={16} />
        </button>
      )}
      {current !== "rejected" && (
        <button onClick={() => update("rejected")} disabled={loading} title="رفض"
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function StudentEditModal({ registration, onClose, onSaved }: { registration: Registration; onClose: () => void; onSaved: (registration: Registration) => void }) {
  const [form, setForm] = useState({
    fullName: registration.fullName,
    specialization: registration.specialization,
    email: registration.email,
    whatsapp: registration.whatsapp,
    affiliation: registration.affiliation,
    country: registration.country,
    city: registration.city,
    orcid: registration.orcid,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/registrations/${registration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const saved = await response.json().catch(() => ({})) as Registration & { error?: string };
      if (!response.ok) throw new Error(saved.error || "تعذر حفظ تعديلات الطالب.");
      onSaved({ ...registration, ...saved });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ تعديلات الطالب.");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text", dir?: "ltr") => (
    <label className="block text-right text-sm font-bold text-slate-700">
      <span className="mb-1.5 block">{label}</span>
      <input required={["fullName", "specialization", "email", "affiliation", "country"].includes(key)} type={type} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} dir={dir} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/20" />
    </label>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
      <form onSubmit={save} onClick={(event) => event.stopPropagation()} className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" dir="rtl">
        <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-4">
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="إغلاق"><X size={20} /></button>
          <div className="text-right">
            <p className="text-xs font-black text-[#117b59]">تعديل بيانات الطالب</p>
            <h2 className="mt-1 text-xl font-black text-slate-800">{registration.fullName}</h2>
            <p className="mt-1 text-xs text-slate-500">{registration.researchTitle}</p>
            <p className="mt-1 text-xs font-bold text-[#117b59]">{registration.authorRole === "first_author" ? "دور التأليف: الكاتب الأول" : "دور التأليف: مؤلف مشارك"}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {field("fullName", "الاسم الكامل")}
          {field("specialization", "التخصص")}
          {field("email", "البريد الإلكتروني", "email", "ltr")}
          {field("whatsapp", "رقم واتساب", "tel", "ltr")}
          {field("affiliation", "جهة الانتساب")}
          {field("country", "الدولة")}
          {field("city", "المدينة")}
          {field("orcid", "ORCID", "text", "ltr")}
        </div>
        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">إلغاء</button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#117b59] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0c6549] disabled:opacity-60">
            {saving ? <><Loader2 size={17} className="animate-spin" /> جارٍ الحفظ...</> : <><Save size={17} /> حفظ التعديلات</>}
          </button>
        </div>
      </form>
    </div>
  );
}

function CoordinatorApproval({ requestId, fullName, phone, status, onUpdate }: {
  requestId: number; fullName: string; phone: string; status: string; onUpdate: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const approve = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`${API_BASE}/coordinator-accounts/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const result = await response.json() as { accessCode?: string; error?: string };
      if (!response.ok || !result.accessCode) throw new Error(result.error || "تعذر إصدار الرمز");
      setMessage(`تم الإصدار: ${result.accessCode}`);
      const text = encodeURIComponent(
        `مرحباً ${fullName}\nتم اعتمادك كمنسق في SRMA Research Academy.\n\nرمز الدخول الخاص بك: ${result.accessCode}\nبوابة المنسق: ${window.location.origin}/coordinator\n\nاحتفظ بالرمز ولا تشاركه مع الآخرين.`
      );
      window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${text}`, "_blank");
      onUpdate();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  if (!status.includes("pending") && !status.includes("approved")) return null;
  return (
    <div className="mt-3">
      {status === "approved" && message === "" ? (
        <span className="text-xs text-[#117b59] font-bold bg-[#e6f5ef] px-2 py-1 rounded">تم اعتماد الطلب</span>
      ) : (
        <button onClick={approve} disabled={loading} className="rounded-xl bg-[#117b59] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c6549] disabled:opacity-60 transition-colors shadow-sm w-full">
          {loading ? "جارٍ الإصدار..." : "اعتماد وإصدار رمز"}
        </button>
      )}
      {message && <p className="mt-2 text-xs font-bold text-[#117b59]">{message}</p>}
    </div>
  );
}

export default function AdminSubmissions() {
  const [tab, setTab] = useState<"registrations" | "services">("registrations");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [selectedResearchId, setSelectedResearchId] = useState<number | "all">("all");
  const [, setLocation] = useLocation();
  const { signOut } = useClerk();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [role, setRole] = useState<"owner" | "coordinator" | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [deletingRegistration, setDeletingRegistration] = useState<Registration | null>(null);
  const [mutationError, setMutationError] = useState("");

  useEffect(() => {
    fetch("/api/coordinator/session")
      .then((response) => response.json() as Promise<{ authenticated?: boolean; role?: "owner" | "coordinator" }>)
      .then((result) => {
        if (result.authenticated && result.role) {
          setAuthorized(true);
          setRole(result.role);
        }
        else { setAuthorized(false); setLocation(result.authenticated ? "/coordinator/dashboard" : "/sign-in"); }
      })
      .catch(() => { setAuthorized(false); setLocation("/sign-in"); });
  }, [setLocation]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/registrations`).then((res) => res.json());
      const s = role === "owner"
        ? await fetch(`${API_BASE}/service-requests`).then((res) => res.json())
        : [];
      setRegistrations(Array.isArray(r) ? r : []);
      setServices(Array.isArray(s) ? s : []);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [role]);

  const handleLogout = async () => {
    if (role === "owner") {
      await signOut({ redirectUrl: `${import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}/sign-in` });
      return;
    }
    await fetch("/api/coordinator/logout", { method: "POST" });
    setLocation("/coordinator");
  };

  useEffect(() => { void fetchData(); }, [fetchData]);
  useEffect(() => {
    if (authorized !== true) return;
    const timer = window.setInterval(() => void fetchData(), 30000);
    return () => window.clearInterval(timer);
  }, [authorized, fetchData]);

  if (authorized !== true) return null;
  const canManageCoordinatorRequests = role === "owner";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const stats = {
    totalReg: registrations.length,
    pendingReg: registrations.filter((r) => r.status === "pending").length,
    totalSvc: services.length,
    pendingSvc: services.filter((s) => s.status === "pending").length,
  };

  const registrationGroups = registrations.reduce<Record<number, { id: number; title: string; count: number; pending: number }>>((groups, registration) => {
    const current = groups[registration.researchId] || {
      id: registration.researchId,
      title: registration.researchTitle,
      count: 0,
      pending: 0,
    };
    current.count += 1;
    if (registration.status === "pending") current.pending += 1;
    groups[registration.researchId] = current;
    return groups;
  }, {});

  const filteredRegistrations = selectedResearchId === "all"
    ? registrations
    : registrations.filter((registration) => registration.researchId === selectedResearchId);

  const exportRegistrations = (records = filteredRegistrations, fileName?: string) => {
    setExportError("");
    if (records.length === 0) {
      setExportError("لا توجد تسجيلات في العرض الحالي لتصديرها.");
      return;
    }

    setExporting(true);
    try {
      const escapeXml = (value: string | number) => String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
      const formatExportDate = (date: string) => new Date(date).toLocaleString("ar-SA", {
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
      });
      const rows = [
        ["الاسم الكامل", "التخصص", "البريد الإلكتروني", "واتساب", "جهة الانتساب", "الدولة", "المدينة", "البرنامج / الفرصة", "دور التأليف", "مرحلة الفرصة", ...(canManageCoordinatorRequests ? ["المسجّل بواسطة"] : []), "حالة الطالب", "تاريخ التسجيل"],
        ...records.map((registration) => [
          registration.fullName,
          registration.specialization,
          registration.email,
          registration.whatsapp || "—",
          registration.affiliation,
          registration.country,
          registration.city || "—",
          registration.researchTitle,
          registration.authorRole === "first_author" ? "الكاتب الأول" : "مؤلف مشارك",
          RESEARCH_STATUS_LABELS[registration.researchStatus || ""] || registration.researchStatus || "—",
          ...(canManageCoordinatorRequests ? [registration.coordinatorName || "تسجيل عام"] : []),
          STATUS_LABELS[registration.status] || registration.status,
          formatExportDate(registration.createdAt),
        ]),
      ];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1"/>
      <Interior ss:Color="#E8F1F8" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="تسجيلات الطلاب">
    <Table>
      ${rows.map((row, rowIndex) => `<Row>${row.map((cell) => `<Cell${rowIndex === 0 ? ' ss:StyleID="Header"' : ""}><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join("")}</Row>`).join("")}
    </Table>
  </Worksheet>
</Workbook>`;
      const blob = new Blob(["\uFEFF", xml], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || (selectedResearchId === "all" ? "srma-student-registrations.xls" : `srma-program-${selectedResearchId}-students.xls`);
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setExportError("تعذر إنشاء ملف Excel. تحقق من مساحة الجهاز وحاول مرة أخرى.");
    } finally {
      setExporting(false);
    }
  };

  const saveEditedRegistration = (saved: Registration) => {
    setRegistrations((items) => items.map((item) => item.id === saved.id ? { ...item, ...saved } : item));
    setEditingRegistration(null);
  };

  const deleteRegistration = async () => {
    if (!deletingRegistration) return;
    setMutationError("");
    try {
      const response = await fetch(`${API_BASE}/registrations/${deletingRegistration.id}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(result.error || "تعذر حذف الطالب.");
      }
      setRegistrations((items) => items.filter((item) => item.id !== deletingRegistration.id));
      setDeletingRegistration(null);
    } catch (deleteError) {
      setMutationError(deleteError instanceof Error ? deleteError.message : "تعذر حذف الطالب.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-right" dir="rtl">
      {/* TOP BAR */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
           <img src={SRMA_LOGO} alt="" className="h-12 w-12 rounded-2xl border border-emerald-100 object-cover shadow-sm" />
           <div className="text-right">
             <h1 className="text-2xl font-black text-slate-800">الطلبات والتسجيلات</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">{canManageCoordinatorRequests ? "بيانات جميع المستخدمين المسجلين في البرامج" : "تسجيلات الطلاب التي أنشأتها من لوحة المنسق"}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href={role === "owner" ? "/admin" : "/coordinator/dashboard"} data-testid="link-submissions-dashboard" className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 shadow-sm hover:bg-slate-100 text-slate-700 text-sm font-bold transition-colors">
             <ChevronRight size={16} />
              {role === "owner" ? "لوحة التحكم" : "بوابة التنسيق"}
          </Link>
          <button onClick={handleLogout} data-testid="link-submissions-logout" className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
            خروج <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "إجمالي التسجيلات", value: stats.totalReg, icon: <Users size={28} className="text-[#117b59]" />, bg: "bg-[#e6f5ef]", pending: stats.pendingReg },
            { label: "بانتظار المراجعة", value: stats.pendingReg, icon: <Clock size={28} className="text-amber-600" />, bg: "bg-amber-50", pending: null },
              ...(canManageCoordinatorRequests ? [
                { label: "طلبات الخدمات", value: stats.totalSvc, icon: <FileText size={28} className="text-purple-600" />, bg: "bg-purple-50", pending: stats.pendingSvc },
                { label: "خدمات بانتظار الرد", value: stats.pendingSvc, icon: <Clock size={28} className="text-orange-600" />, bg: "bg-orange-50", pending: null },
              ] : [
                { label: "برامج قيد المتابعة", value: new Set(registrations.map((item) => item.researchId)).size, icon: <FileText size={28} className="text-purple-600" />, bg: "bg-purple-50", pending: null },
                { label: "طلبات تم التواصل معها", value: registrations.filter((item) => item.status === "contacted").length, icon: <Phone size={28} className="text-orange-600" />, bg: "bg-orange-50", pending: null },
              ]),
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-right transition hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${s.bg} rounded-2xl flex items-center justify-center`}>{s.icon}</div>
                <div className="text-3xl font-black text-slate-800">{s.value}</div>
              </div>
              <div className="text-sm font-bold text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS + REFRESH */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex gap-2 w-full md:w-auto">
            {canManageCoordinatorRequests && <button onClick={() => setTab("services")}
              className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${tab === "services" ? "bg-[#117b59] text-white border border-[#117b59]" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"}`}>
              طلبات الخدمات ({stats.totalSvc})
            </button>}
            <button onClick={() => setTab("registrations")}
              className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm ${tab === "registrations" ? "bg-[#117b59] text-white border border-[#117b59]" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"}`}>
              تسجيلات الفرص ({stats.totalReg})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {tab === "registrations" && (
              <div className="flex items-center gap-3">
              <button onClick={() => exportRegistrations()} disabled={exporting || filteredRegistrations.length === 0}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
                <Download size={16} className={exporting ? "animate-pulse" : "text-slate-400"} />
                {exporting ? "جارٍ تجهيز Excel..." : "تنزيل Excel"}
              </button>
              {exportError && <span className="text-xs font-bold text-red-600">{exportError}</span>}
              </div>
            )}
            <button onClick={fetchData} disabled={loading}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-50">
              <RefreshCw size={16} className={loading ? "animate-spin" : "text-slate-400"} />
              تحديث
            </button>
          </div>
        </div>

        {/* REGISTRATIONS TABLE */}
        {tab === "registrations" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {!canManageCoordinatorRequests && (
               <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-right text-sm leading-6 text-blue-800">
                 <span className="font-black">خصوصية التسجيلات:</span> تعرض هذه القائمة التسجيلات المرتبطة بحسابك فقط. أما السجلات التاريخية التي سبقت تفعيل هذا الفصل ولا يمكن إسنادها بأمان، فيراجعها مالك المنصة كتسجيل عام.
               </div>
             )}
            {registrations.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-right text-sm font-black text-slate-800">تصفية حسب البرنامج</h2>
                  <button onClick={() => setSelectedResearchId("all")} className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${selectedResearchId === "all" ? "bg-[#117b59] text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>عرض الكل</button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {Object.values(registrationGroups).map((group) => (
                    <div key={group.id} className={`min-w-[230px] rounded-2xl border p-1.5 text-right transition-all ${selectedResearchId === group.id ? "border-[#117b59] bg-[#e6f5ef] shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                      <button onClick={() => setSelectedResearchId(group.id)} className="w-full rounded-xl p-2.5 text-right">
                        <p className="line-clamp-2 text-xs font-bold leading-5 text-slate-800">{group.title}</p>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-600"><Users size={12} className="inline mr-1 text-slate-400" /> {group.count} مسجل</span>
                          {group.pending > 0 && <span className="text-xs font-bold text-amber-600"><Clock size={12} className="inline mr-1 text-amber-400" /> {group.pending} مراجعة</span>}
                        </div>
                      </button>
                      <button onClick={() => exportRegistrations(registrations.filter((registration) => registration.researchId === group.id), `srma-program-${group.id}-students.xls`)} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-black text-[#117b59] shadow-sm ring-1 ring-[#117b59]/15 transition hover:bg-[#f3fbf8]">
                        <Download size={14} /> Excel لهذه الفرصة
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {filteredRegistrations.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users size={32} className="text-slate-300" />
                  </div>
                  <p className="font-black text-slate-800 text-lg mb-1">لا توجد تسجيلات</p>
                  <p className="text-sm font-medium">اختر فرصة أخرى أو انتظر تسجيل أول مشارك</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {["الاسم والتخصص", "التواصل", "الجهة / المدينة", "الفرصة البحثية", ...(canManageCoordinatorRequests ? ["المسجّل بواسطة"] : []), "الحالة", "التاريخ", "إجراءات"].map((h) => (
                          <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-800 text-sm mb-1">{reg.fullName}</p>
                            <p className="text-xs font-medium text-slate-500">{reg.specialization}</p>
                            {reg.orcid && <p className="text-[11px] font-bold text-[#117b59] mt-1.5" dir="ltr">ORCID: {reg.orcid}</p>}
                          </td>
                          <td className="px-6 py-5">
                            <a href={`mailto:${reg.email}`} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#117b59] mb-2 transition-colors">
                              <Mail size={14} className="text-slate-400" /> <span className="truncate max-w-[150px]">{reg.email}</span>
                            </a>
                            {reg.whatsapp && (
                              <a href={`https://wa.me/${reg.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                <Phone size={14} className="text-emerald-400" /> <span dir="ltr">{reg.whatsapp}</span>
                              </a>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-slate-700 mb-1">{reg.affiliation}</p>
                            <p className="text-xs font-medium text-slate-500">{reg.country}{reg.city ? ` — ${reg.city}` : ""}</p>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-xs font-bold text-slate-700 leading-5 line-clamp-2 max-w-[220px] mb-1">{reg.researchTitle}</p>
                             {reg.researchStatus && <span className="inline-flex rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-700">{RESEARCH_STATUS_LABELS[reg.researchStatus] || reg.researchStatus}</span>}
                            <p className="text-[11px] font-medium text-slate-400">ID: {reg.researchId}</p>
                          </td>
                          {canManageCoordinatorRequests && (
                            <td className="px-6 py-5">
                              <span className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-bold ${reg.coordinatorName ? "bg-[#e6f5ef] text-[#117b59]" : "bg-slate-100 text-slate-500"}`}>
                                {reg.coordinatorName || "تسجيل عام"}
                              </span>
                            </td>
                          )}
                          <td className="px-6 py-5">
                            <StatusBadge status={reg.status} />
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-xs font-bold text-slate-500 whitespace-nowrap">{formatDate(reg.createdAt)}</p>
                          </td>
                          <td className="px-6 py-5">
                            {canManageCoordinatorRequests ? (
                              <StatusActions id={reg.id} current={reg.status} onUpdate={fetchData} endpoint="registrations" />
                            ) : (
                              <div className="flex items-center gap-1">
                                <button onClick={() => exportRegistrations([reg], `srma-student-${reg.id}.xls`)} title="تنزيل Excel للطالب" className="rounded-lg p-2 text-[#117b59] transition hover:bg-[#e6f5ef]"><Download size={16} /></button>
                                <button onClick={() => setEditingRegistration(reg)} title="تعديل بيانات الطالب" className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"><Pencil size={16} /></button>
                                <button onClick={() => { setMutationError(""); setDeletingRegistration(reg); }} title="حذف الطالب" className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"><Trash2 size={16} /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {filteredRegistrations.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 text-right">
                  {filteredRegistrations.length} تسجيل ظاهر — {stats.pendingReg} بانتظار المراجعة إجمالاً
                </div>
              )}
            </div>
          </div>
        )}

        {/* SERVICE REQUESTS TABLE */}
        {canManageCoordinatorRequests && tab === "services" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            {services.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-slate-300" />
                </div>
                <p className="font-black text-slate-800 text-lg mb-1">لا توجد طلبات خدمات</p>
                <p className="text-sm font-medium">ستظهر هنا بعد تقديم أول طلب</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      {["مقدم الطلب", "التواصل", "نوع الخدمة", "التفاصيل", "الحالة", "التاريخ", "إجراء"].map((h) => (
                        <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map((svc) => (
                      <tr key={svc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5">
                          <p className="font-bold text-slate-800 text-sm">{svc.fullName}</p>
                        </td>
                        <td className="px-6 py-5">
                          <a href={`mailto:${svc.email}`} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#117b59] mb-2 transition-colors">
                            <Mail size={14} className="text-slate-400" /> <span className="truncate max-w-[150px]">{svc.email}</span>
                          </a>
                          <a href={`https://wa.me/${svc.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                            <Phone size={14} className="text-emerald-400" /> <span dir="ltr">{svc.phone}</span>
                          </a>
                        </td>
                        <td className="px-6 py-5">
                          <span className="bg-purple-50 border border-purple-100 text-purple-700 text-[11px] font-black px-3 py-1.5 rounded-lg whitespace-nowrap inline-block">
                            {svc.serviceType}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-medium text-slate-600 leading-5 line-clamp-3 max-w-[240px]">{svc.details}</p>
                          {svc.fileLink && (
                            <a href={svc.fileLink} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                              🔗 ملف مرفق
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <StatusBadge status={svc.status} />
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold text-slate-500 whitespace-nowrap">{formatDate(svc.createdAt)}</p>
                        </td>
                        <td className="px-6 py-5 min-w-[180px]">
                          <StatusActions id={svc.id} current={svc.status} onUpdate={fetchData} endpoint="service-requests" />
                          {svc.serviceType.includes("منسق") && (
                            <CoordinatorApproval requestId={svc.id} fullName={svc.fullName} phone={svc.phone} status={svc.status} onUpdate={fetchData} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {services.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 text-right">
                {services.length} طلب إجمالاً — {stats.pendingSvc} بانتظار الرد
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
      {editingRegistration && <StudentEditModal registration={editingRegistration} onClose={() => setEditingRegistration(null)} onSaved={saveEditedRegistration} />}
      {deletingRegistration && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={() => setDeletingRegistration(null)}>
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 text-right shadow-2xl" dir="rtl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600"><Trash2 size={21} /></div>
              <div>
                <h2 className="text-lg font-black text-slate-800">حذف تسجيل الطالب</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">هل تريد حذف تسجيل <strong className="text-slate-800">{deletingRegistration.fullName}</strong> نهائياً؟ لا يمكن استرجاعه بعد الحذف.</p>
              </div>
            </div>
            {mutationError && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">{mutationError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeletingRegistration(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50">إلغاء</button>
              <button type="button" onClick={() => void deleteRegistration()} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-red-700">حذف التسجيل</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}