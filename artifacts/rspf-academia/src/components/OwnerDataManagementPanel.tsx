import { useState, useEffect, useRef } from "react";
import { Users, Save, Trash2, Download, AlertCircle, Phone, Mail, CheckCircle, XCircle, Key, FileDown, ShieldAlert, Check, Plus, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

interface CoordinatorAdmin {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  affiliation: string;
  status: "active" | "disabled";
  createdAt: string;
  lastLoginAt: string | null;
  registrationCount: number;
}

export default function OwnerDataManagementPanel() {
  const [coordinators, setCoordinators] = useState<CoordinatorAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // State for resets
  const [resetCodeMap, setResetCodeMap] = useState<Record<number, string>>({});
  
  // State for confirm modal
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  
  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<CoordinatorAdmin>>({});

  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [exporting, setExporting] = useState(false);
  const [newForm, setNewForm] = useState({ fullName: "", phone: "", email: "", affiliation: "" });
  const [newCode, setNewCode] = useState<{ name: string; code: string } | null>(null);
  const [addError, setAddError] = useState("");
  const inFlight = useRef(false);

  const setBusy = (k: string, v: boolean) => setPending(p => ({ ...p, [k]: v }));

  const serverError = async (response: Response, fallback: string) => {
    const data = await response.json().catch(() => ({}));
    return (data && (data.error || data.message)) || fallback;
  };

  const loadCoordinators = async (background = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (!background) setLoading(true);
    try {
      const response = await apiFetch("/api/admin/coordinators");
      if (!response.ok) throw new Error(await serverError(response, "فشل جلب بيانات المنسقين"));
      const data = await response.json();
      setCoordinators(data);
      setError("");
    } catch (err) {
      if (!background) setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      inFlight.current = false;
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    loadCoordinators();
    const refresh = () => { if (document.visibilityState === "visible") loadCoordinators(true); };
    const timer = setInterval(refresh, 10000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending.add) return;
    setAddError("");
    const body = {
      fullName: newForm.fullName.trim(),
      phone: newForm.phone.trim(),
      email: newForm.email.trim(),
      affiliation: newForm.affiliation.trim(),
    };
    if (!body.fullName || !body.phone || !body.email || !body.affiliation) {
      setAddError("جميع الحقول مطلوبة");
      return;
    }
    setBusy("add", true);
    try {
      const response = await apiFetch("/api/admin/coordinators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(await serverError(response, "فشل إضافة المنسق"));
      const data = await response.json();
      if (!data?.accessCode) throw new Error("لم يرجع الخادم رمز الدخول");
      setNewCode({ name: data.coordinator?.fullName || body.fullName, code: data.accessCode });
      setNewForm({ fullName: "", phone: "", email: "", affiliation: "" });
      toast({ title: "تمت الإضافة", description: "احفظ رمز الدخول الآن فهو يظهر مرة واحدة" });
      await loadCoordinators(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      setAddError(msg);
      toast({ variant: "destructive", title: "خطأ", description: msg });
    } finally {
      setBusy("add", false);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: "تم النسخ", description: "تم نسخ الرمز" });
    } catch {
      toast({ variant: "destructive", title: "خطأ", description: "تعذر النسخ، انسخ الرمز يدوياً" });
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      toast({
        title: "بدأ التصدير",
        description: "جاري تحضير النسخة الاحتياطية",
      });
      const response = await apiFetch("/api/admin/export");
      if (!response.ok) throw new Error("فشل التصدير");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "srma_backup.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "اكتمل التصدير",
        description: "تم تنزيل النسخة الاحتياطية بنجاح",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: err instanceof Error ? err.message : "حدث خطأ",
      });
    } finally {
      setExporting(false);
    }
  };

  const handleResetAccessCode = async (id: number) => {
    if (pending[`reset${id}`]) return;
    setBusy(`reset${id}`, true);
    try {
      const response = await apiFetch(`/api/admin/coordinators/${id}/reset-access-code`, {
        method: "POST"
      });
      if (!response.ok) throw new Error(await serverError(response, "فشل إصدار الرمز الجديد"));
      const data = await response.json();
      setResetCodeMap(prev => ({ ...prev, [id]: data.accessCode }));
      toast({
        title: "تم الإصدار",
        description: "تم إصدار رمز دخول جديد بنجاح",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: err instanceof Error ? err.message : "حدث خطأ",
      });
    } finally {
      setBusy(`reset${id}`, false);
    }
  };

  const handleDelete = async (id: number) => {
    if (pending[`del${id}`]) return;
    setBusy(`del${id}`, true);
    try {
      const response = await apiFetch(`/api/admin/coordinators/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error(await serverError(response, "فشل الحذف"));
      setCoordinators(prev => prev.filter(c => c.id !== id));
      setConfirmDelete(null);
      toast({
        title: "تم الحذف",
        description: "تم حذف حساب المنسق. تسجيلات الطلاب والمقاعد باقية دون تغيير",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: err instanceof Error ? err.message : "حدث خطأ",
      });
    } finally {
      setBusy(`del${id}`, false);
    }
  };

  const handleEditSave = async (id: number) => {
    if (pending[`edit${id}`]) return;
    setBusy(`edit${id}`, true);
    try {
      const response = await apiFetch(`/api/admin/coordinators/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error(await serverError(response, "فشل تحديث البيانات"));
      
      const updated = await response.json();
      setCoordinators(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
      setEditingId(null);
      toast({
        title: "تم التحديث",
        description: "تم تحديث بيانات المنسق بنجاح",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: err instanceof Error ? err.message : "حدث خطأ",
      });
    } finally {
      setBusy(`edit${id}`, false);
    }
  };

  const startEdit = (c: CoordinatorAdmin) => {
    setEditingId(c.id);
    setEditForm({
      fullName: c.fullName,
      phone: c.phone,
      email: c.email,
      affiliation: c.affiliation,
      status: c.status
    });
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
               <ShieldAlert className="text-rose-600" size={24} />
               صلاحيات المالك: تصدير البيانات
            </h2>
            <p className="text-sm text-slate-500 mt-2">تنزيل نسخة احتياطية كاملة من قاعدة البيانات تشمل كافة الجداول. يُرجى حفظ الملف في مكان آمن.</p>
          </div>
          <button 
            data-testid="btn-export-backup"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm"
          >
            <FileDown size={18} />
            تنزيل نسخة احتياطية (JSON)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-800">إدارة المنسقين</h2>
            <p className="text-sm text-slate-500 mt-1">التحكم في وصول وبيانات جميع المنسقين المعتمدين</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-3" data-testid="form-add-coordinator">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5"><Plus size={16} /> إضافة منسق جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input data-testid="input-new-name" placeholder="الاسم الكامل" value={newForm.fullName} onChange={e => setNewForm({ ...newForm, fullName: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white" />
            <input data-testid="input-new-phone" placeholder="رقم الهاتف" dir="ltr" value={newForm.phone} onChange={e => setNewForm({ ...newForm, phone: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-left" />
            <input data-testid="input-new-email" type="email" placeholder="البريد الإلكتروني" dir="ltr" value={newForm.email} onChange={e => setNewForm({ ...newForm, email: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white text-left" />
            <input data-testid="input-new-affiliation" placeholder="الجهة / الارتباط" value={newForm.affiliation} onChange={e => setNewForm({ ...newForm, affiliation: e.target.value })} className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white" />
          </div>
          {addError && <p className="text-xs font-bold text-red-600" role="alert">{addError}</p>}
          <button type="submit" disabled={!!pending.add} data-testid="btn-add-coordinator" className="bg-[#117b59] text-white hover:opacity-90 disabled:opacity-50 px-5 py-2 rounded-xl text-sm font-bold">
            {pending.add ? "جاري الإضافة..." : "إضافة المنسق"}
          </button>
          {newCode && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3" data-testid="new-coordinator-code">
              <p className="text-xs text-amber-800 font-bold mb-2">رمز دخول {newCode.name} — يظهر مرة واحدة فقط، انسخه الآن:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-amber-100 rounded-lg py-2 text-center font-black tracking-widest text-slate-800" data-testid="text-new-access-code">{newCode.code}</code>
                <button type="button" onClick={() => copyCode(newCode.code)} data-testid="btn-copy-new-code" className="bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"><Copy size={14} /> نسخ</button>
                <button type="button" onClick={() => setNewCode(null)} className="bg-slate-200 text-slate-700 hover:bg-slate-300 px-3 py-2 rounded-lg text-xs font-bold">إخفاء</button>
              </div>
            </div>
          )}
        </form>

        {loading ? (
           <div className="p-12 text-center text-slate-400">جاري التحميل...</div>
        ) : error ? (
           <div className="p-12 text-center text-red-500 font-bold">{error}</div>
        ) : coordinators.length === 0 ? (
           <div className="p-12 text-center text-slate-400 font-medium">لا يوجد منسقين مسجلين</div>
        ) : (
          <div className="w-full max-w-full min-w-0 overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500">المنسق</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500">التواصل</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500">الارتباط</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500">تسجيلات</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500">الحالة</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coordinators.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      {editingId === c.id ? (
                         <input 
                           type="text" 
                           value={editForm.fullName || ""}
                           onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                           className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white"
                         />
                      ) : (
                        <div>
                          <p className="font-bold text-sm text-slate-800">{c.fullName}</p>
                          <p className="text-xs text-slate-500">انضم: {formatDate(c.createdAt)}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === c.id ? (
                        <div className="space-y-2">
                           <input type="text" placeholder="رقم الهاتف" value={editForm.phone || ""} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-left" dir="ltr" />
                           <input type="email" placeholder="البريد" value={editForm.email || ""} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-left" dir="ltr" />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5"><Phone size={12}/> <span dir="ltr">{c.phone}</span></p>
                          <p className="text-xs font-medium text-slate-600 flex items-center gap-1.5"><Mail size={12}/> {c.email}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                       {editingId === c.id ? (
                         <input 
                           type="text" 
                           value={editForm.affiliation || ""}
                           onChange={e => setEditForm({...editForm, affiliation: e.target.value})}
                           className="w-full border border-slate-200 rounded-lg px-2 py-1 text-sm bg-white"
                         />
                       ) : (
                         <span className="text-sm text-slate-700">{c.affiliation}</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                       <span className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 font-black rounded-xl h-8 px-3 text-xs border border-emerald-100">{c.registrationCount}</span>
                    </td>
                    <td className="px-6 py-4">
                       {editingId === c.id ? (
                         <select 
                           value={editForm.status || "active"} 
                            onChange={e => setEditForm({...editForm, status: e.target.value as "active" | "disabled"})}
                           className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-slate-700"
                         >
                           <option value="active">نشط</option>
                           <option value="disabled">معطل</option>
                         </select>
                       ) : (
                         <span className={`text-[11px] font-black px-2 py-1 rounded-lg ${
                            c.status === "active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                             "bg-red-50 text-red-700 border border-red-200"
                         }`}>
                            {c.status === "active" ? "نشط" : "معطل"}
                         </span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === c.id ? (
                        <div className="flex gap-2">
                          <button disabled={!!pending[`edit${c.id}`]} onClick={() => handleEditSave(c.id)} className="disabled:opacity-50 bg-emerald-600 text-white p-1.5 rounded-lg hover:bg-emerald-700"><Check size={14}/></button>
                          <button disabled={!!pending[`edit${c.id}`]} onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-700 p-1.5 rounded-lg hover:bg-slate-300"><XCircle size={14}/></button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 min-w-[120px]">
                           <div className="flex items-center gap-1.5">
                             <button onClick={() => startEdit(c)} data-testid={`btn-edit-coordinator-${c.id}`} className="text-slate-400 hover:text-[#117b59] p-1 transition-colors" title="تعديل"><Save size={16} /></button>
                             <button onClick={() => setConfirmDelete(c.id)} data-testid={`btn-delete-coordinator-${c.id}`} className="text-slate-400 hover:text-red-500 p-1 transition-colors" title="حذف"><Trash2 size={16} /></button>
                             <button disabled={!!pending[`reset${c.id}`]} onClick={() => handleResetAccessCode(c.id)} data-testid={`btn-reset-code-${c.id}`} className="text-slate-400 hover:text-amber-500 disabled:opacity-40 p-1 transition-colors" title="إصدار رمز جديد"><Key size={16} /></button>
                           </div>
                           
                           {resetCodeMap[c.id] && (
                             <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-1">
                               <p className="text-[10px] text-amber-700 font-bold mb-1">الرمز الجديد:</p>
                               <div className="flex items-center gap-1 bg-white p-1 rounded border border-amber-100">
                                  <code className="text-xs font-black tracking-widest text-slate-800 w-full text-center" data-testid={`access-code-${c.id}`}>{resetCodeMap[c.id]}</code>
                               </div>
                               <button 
                                  onClick={() => copyCode(resetCodeMap[c.id])} 
                                  data-testid={`btn-copy-code-${c.id}`}
                                  className="w-full mt-1 bg-amber-100 text-amber-800 text-[10px] font-bold py-1 rounded hover:bg-amber-200 transition-colors"
                               >
                                 نسخ الرمز
                               </button>
                             </div>
                           )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
           <div className="bg-white rounded-3xl p-6 w-full max-w-sm border border-slate-100 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <Trash2 size={24} className="text-red-500" />
             </div>
             <h3 className="text-lg font-black text-slate-800 mb-2">تأكيد الحذف</h3>
             <p className="text-sm text-slate-500 mb-6">سيتم حذف حساب المنسق ووصوله نهائياً. تسجيلات الطلاب المرتبطة به ومقاعدهم ستبقى كما هي ولن تُحذف.</p>
             <div className="flex gap-3">
               <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-sm hover:bg-slate-200 transition-colors">إلغاء</button>
               <button disabled={!!pending[`del${confirmDelete}`]} onClick={() => handleDelete(confirmDelete)} className="disabled:opacity-50 flex-1 bg-red-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-red-600 transition-colors">نعم، حذف</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
