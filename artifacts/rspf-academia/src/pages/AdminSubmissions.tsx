import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { ChevronRight, LogOut, RefreshCw, Users, FileText, Check, X, Clock, Mail, Phone, Download } from "lucide-react";

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
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [role, setRole] = useState<"owner" | "coordinator" | null>(null);

  useEffect(() => {
    fetch("/api/coordinator/session")
      .then((response) => response.json() as Promise<{ authenticated?: boolean; role?: "owner" | "coordinator" }>)
      .then((result) => {
        if (result.authenticated && result.role) {
          setAuthorized(true);
          setRole(result.role);
        }
        else { setAuthorized(false); setLocation("/coordinator"); }
      })
      .catch(() => { setAuthorized(false); setLocation("/coordinator"); });
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
    await fetch("/api/coordinator/logout", { method: "POST" });
    setLocation("/coordinator");
  };

  useEffect(() => { void fetchData(); }, [fetchData]);

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

  const exportRegistrations = () => {
    setExportError("");
    if (filteredRegistrations.length === 0) {
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
        ["الاسم الكامل", "التخصص", "البريد الإلكتروني", "واتساب", "جهة الانتساب", "الدولة", "المدينة", "البرنامج / الفرصة", ...(canManageCoordinatorRequests ? ["المسجّل بواسطة"] : []), "الحالة", "تاريخ التسجيل"],
        ...filteredRegistrations.map((registration) => [
          registration.fullName,
          registration.specialization,
          registration.email,
          registration.whatsapp || "—",
          registration.affiliation,
          registration.country,
          registration.city || "—",
          registration.researchTitle,
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
      link.download = selectedResearchId === "all" ? "srma-student-registrations.xls" : `srma-program-${selectedResearchId}-students.xls`;
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-right" dir="rtl">
      {/* TOP BAR */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-4">
           <div className="text-right">
             <h1 className="text-2xl font-black text-slate-800">الطلبات والتسجيلات</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">{canManageCoordinatorRequests ? "بيانات جميع المستخدمين المسجلين في البرامج" : "تسجيلات الطلاب التي أنشأتها من لوحة المنسق"}</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin" data-testid="link-submissions-dashboard" className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 shadow-sm hover:bg-slate-100 text-slate-700 text-sm font-bold transition-colors">
             <ChevronRight size={16} />
             لوحة التحكم
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
              <button onClick={exportRegistrations} disabled={exporting || filteredRegistrations.length === 0}
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
                    <button key={group.id} onClick={() => setSelectedResearchId(group.id)}
                      className={`min-w-[220px] rounded-2xl border p-4 text-right transition-all ${selectedResearchId === group.id ? "border-[#117b59] bg-[#e6f5ef] shadow-sm" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                      <p className="line-clamp-2 text-xs font-bold text-slate-800 leading-5">{group.title}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-600"><Users size={12} className="inline mr-1 text-slate-400" /> {group.count} مسجل</span>
                        {group.pending > 0 && <span className="text-xs font-bold text-amber-600"><Clock size={12} className="inline mr-1 text-amber-400" /> {group.pending} مراجعة</span>}
                      </div>
                    </button>
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
                        {["الاسم والتخصص", "التواصل", "الجهة / المدينة", "الفرصة البحثية", ...(canManageCoordinatorRequests ? ["المسجّل بواسطة"] : []), "الحالة", "التاريخ", "إجراء"].map((h) => (
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
                              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">للعرض فقط</span>
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
    </div>
  );
}