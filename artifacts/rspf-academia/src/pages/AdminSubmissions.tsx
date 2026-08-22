import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, LogOut, RefreshCw, Users, FileText, Check, X, Clock, Mail, Phone } from "lucide-react";

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
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-600",
  contacted: "bg-blue-100 text-blue-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  rejected: "مرفوض",
  contacted: "تم التواصل",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}`}>
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
          className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
          <Check size={15} />
        </button>
      )}
      {current !== "contacted" && (
        <button onClick={() => update("contacted")} disabled={loading} title="تم التواصل"
          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
          <Phone size={15} />
        </button>
      )}
      {current !== "rejected" && (
        <button onClick={() => update("rejected")} disabled={loading} title="رفض"
          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
          <X size={15} />
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
        `مرحباً ${fullName}\nتم اعتمادك كمنسق في SRMA Research Academy.\n\nرمز الدخول الخاص بك: ${result.accessCode}\nبوابة المنسق: ${window.location.origin}/coordinator-portal\n\nاحتفظ بالرمز ولا تشاركه مع الآخرين.`
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
    <div className="mt-2">
      {status === "approved" && message === "" ? (
        <span className="text-xs text-emerald-600 font-semibold">تم اعتماد الطلب</span>
      ) : (
        <button onClick={approve} disabled={loading} className="rounded-lg bg-[#117b59] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[#0c6549] disabled:opacity-60">
          {loading ? "جارٍ الإصدار..." : "اعتماد وإصدار رمز"}
        </button>
      )}
      {message && <p className="mt-1 max-w-[180px] text-[11px] leading-4 text-emerald-700">{message}</p>}
    </div>
  );
}

export default function AdminSubmissions() {
  const [tab, setTab] = useState<"registrations" | "services">("registrations");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/coordinator/session")
      .then((response) => response.json() as Promise<{ authenticated?: boolean }>)
      .then((result) => {
        if (result.authenticated) setAuthorized(true);
        else { setAuthorized(false); setLocation("/coordinator-portal"); }
      })
      .catch(() => { setAuthorized(false); setLocation("/coordinator-portal"); });
  }, [setLocation]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        fetch(`${API_BASE}/registrations`).then((res) => res.json()),
        fetch(`${API_BASE}/service-requests`).then((res) => res.json()),
      ]);
      setRegistrations(Array.isArray(r) ? r : []);
      setServices(Array.isArray(s) ? s : []);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/coordinator/logout", { method: "POST" });
    setLocation("/coordinator-portal");
  };

  useEffect(() => { void fetchData(); }, [fetchData]);

  if (authorized !== true) return null;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const stats = {
    totalReg: registrations.length,
    pendingReg: registrations.filter((r) => r.status === "pending").length,
    totalSvc: services.length,
    pendingSvc: services.filter((s) => s.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP BAR */}
      <div className="bg-[#0C3156] text-white px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" data-testid="link-submissions-dashboard"
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm transition-colors">
              <ChevronLeft size={16} />
              لوحة التحكم
            </Link>
            <span className="text-blue-400">|</span>
            <button onClick={handleLogout} data-testid="link-submissions-logout"
              className="flex items-center gap-1.5 text-blue-200 hover:text-white text-sm transition-colors">
              <LogOut size={14} />
              خروج
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h1 className="text-lg font-black tracking-tight">الطلبات والتسجيلات</h1>
              <p className="text-blue-300 text-xs">بيانات المستخدمين المسجلين</p>
            </div>
            <div className="w-9 h-9 bg-[#E9A020] rounded-full flex items-center justify-center font-black text-white text-sm">R</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "إجمالي التسجيلات", value: stats.totalReg, icon: <Users size={20} className="text-[#0C3156]" />, bg: "bg-blue-50", pending: stats.pendingReg },
            { label: "بانتظار المراجعة", value: stats.pendingReg, icon: <Clock size={20} className="text-yellow-500" />, bg: "bg-yellow-50", pending: null },
            { label: "طلبات الخدمات", value: stats.totalSvc, icon: <FileText size={20} className="text-purple-500" />, bg: "bg-purple-50", pending: stats.pendingSvc },
            { label: "خدمات بانتظار الرد", value: stats.pendingSvc, icon: <Clock size={20} className="text-orange-500" />, bg: "bg-orange-50", pending: null },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm text-right">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>{s.icon}</div>
              <div className="text-3xl font-black text-slate-900">{s.value}</div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* TABS + REFRESH */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <button onClick={fetchData} disabled={loading}
            className="flex items-center gap-2 text-slate-500 hover:text-[#0C3156] text-sm font-medium transition-colors">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            تحديث
          </button>
          <div className="flex gap-2">
            <button onClick={() => setTab("services")}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${tab === "services" ? "bg-[#E9A020] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              طلبات الخدمات ({stats.totalSvc})
            </button>
            <button onClick={() => setTab("registrations")}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all ${tab === "registrations" ? "bg-[#0C3156] text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              تسجيلات الفرص البحثية ({stats.totalReg})
            </button>
          </div>
        </div>

        {/* REGISTRATIONS TABLE */}
        {tab === "registrations" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {registrations.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">لا توجد تسجيلات بعد</p>
                <p className="text-sm mt-1">ستظهر هنا بعد تسجيل أول مشارك</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {["الاسم والتخصص", "التواصل", "الجهة / المدينة", "الفرصة البحثية", "الحالة", "التاريخ", "إجراء"].map((h) => (
                        <th key={h} className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {registrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800 text-sm">{reg.fullName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{reg.specialization}</p>
                          {reg.orcid && <p className="text-xs text-blue-400 mt-0.5" dir="ltr">ORCID: {reg.orcid}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <a href={`mailto:${reg.email}`} className="flex items-center gap-1 text-xs text-slate-600 hover:text-[#0C3156] mb-1">
                            <Mail size={11} /> {reg.email}
                          </a>
                          <a href={`https://wa.me/${reg.whatsapp.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                            <Phone size={11} /> {reg.whatsapp}
                          </a>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-slate-700">{reg.affiliation}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{reg.country}{reg.city ? ` — ${reg.city}` : ""}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs text-slate-600 line-clamp-2 max-w-[200px]">{reg.researchTitle}</p>
                          <p className="text-xs text-slate-400 mt-0.5">ID: {reg.researchId}</p>
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={reg.status} />
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs text-slate-500 whitespace-nowrap">{formatDate(reg.createdAt)}</p>
                        </td>
                        <td className="px-4 py-4">
                          <StatusActions id={reg.id} current={reg.status} onUpdate={fetchData} endpoint="registrations" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {registrations.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-right">
                {registrations.length} تسجيل إجمالاً — {stats.pendingReg} بانتظار المراجعة
              </div>
            )}
          </div>
        )}

        {/* SERVICE REQUESTS TABLE */}
        {tab === "services" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {services.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">لا توجد طلبات خدمات بعد</p>
                <p className="text-sm mt-1">ستظهر هنا بعد تقديم أول طلب</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {["مقدم الطلب", "التواصل", "نوع الخدمة", "التفاصيل", "الحالة", "التاريخ", "إجراء"].map((h) => (
                        <th key={h} className="px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map((svc) => (
                      <tr key={svc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800 text-sm">{svc.fullName}</p>
                        </td>
                        <td className="px-4 py-4">
                          <a href={`mailto:${svc.email}`} className="flex items-center gap-1 text-xs text-slate-600 hover:text-[#0C3156] mb-1">
                            <Mail size={11} /> {svc.email}
                          </a>
                          <a href={`https://wa.me/${svc.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:underline">
                            <Phone size={11} /> {svc.phone}
                          </a>
                        </td>
                        <td className="px-4 py-4">
                          <span className="bg-[#0C3156]/10 text-[#0C3156] text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                            {svc.serviceType}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs text-slate-600 line-clamp-3 max-w-[220px]">{svc.details}</p>
                          {svc.fileLink && (
                            <a href={svc.fileLink} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                              🔗 ملف مرفق
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={svc.status} />
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-xs text-slate-500 whitespace-nowrap">{formatDate(svc.createdAt)}</p>
                        </td>
                        <td className="px-4 py-4">
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
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-right">
                {services.length} طلب إجمالاً — {stats.pendingSvc} بانتظار الرد
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
