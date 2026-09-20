import { useState, useEffect } from "react";
import { Users, Save, Trash2, Download, AlertCircle, Phone, Mail, CheckCircle, XCircle, Key, FileDown, ShieldAlert, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  useEffect(() => {
    loadCoordinators();
  }, []);

  const loadCoordinators = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/coordinators");
      if (!response.ok) throw new Error("فشل جلب بيانات المنسقين");
      const data = await response.json();
      setCoordinators(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      toast({
        title: "بدأ التصدير",
        description: "جاري تحضير النسخة الاحتياطية",
      });
      const response = await fetch("/api/admin/export");
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
    }
  };

  const handleResetAccessCode = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/coordinators/${id}/reset-access-code`, {
        method: "POST"
      });
      if (!response.ok) throw new Error("فشل إصدار الرمز الجديد");
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
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/coordinators/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        if (response.status === 409) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || "توجد سجلات مرتبطة بهذا المنسق");
        }
        throw new Error("فشل الحذف");
      }
      
      setCoordinators(prev => prev.filter(c => c.id !== id));
      setConfirmDelete(null);
      toast({
        title: "تم الحذف",
        description: "تم حذف المنسق بنجاح",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: err instanceof Error ? err.message : "حدث خطأ",
      });
    }
  };

  const handleEditSave = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/coordinators/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
      });
      if (!response.ok) throw new Error("فشل تحديث البيانات");
      
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
            className="flex items-center gap-2 bg-slate-900 text-white hover:bg-slate-800 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm"
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

        {loading ? (
           <div className="p-12 text-center text-slate-400">جاري التحميل...</div>
        ) : error ? (
           <div className="p-12 text-center text-red-500 font-bold">{error}</div>
        ) : coordinators.length === 0 ? (
           <div className="p-12 text-center text-slate-400 font-medium">لا يوجد منسقين مسجلين</div>
        ) : (
          <div className="overflow-x-auto">
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
                          <button onClick={() => handleEditSave(c.id)} className="bg-emerald-600 text-white p-1.5 rounded-lg hover:bg-emerald-700"><Check size={14}/></button>
                          <button onClick={() => setEditingId(null)} className="bg-slate-200 text-slate-700 p-1.5 rounded-lg hover:bg-slate-300"><XCircle size={14}/></button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 min-w-[120px]">
                           <div className="flex items-center gap-1.5">
                             <button onClick={() => startEdit(c)} data-testid={`btn-edit-coordinator-${c.id}`} className="text-slate-400 hover:text-[#117b59] p-1 transition-colors" title="تعديل"><Save size={16} /></button>
                             <button onClick={() => setConfirmDelete(c.id)} data-testid={`btn-delete-coordinator-${c.id}`} className="text-slate-400 hover:text-red-500 p-1 transition-colors" title="حذف"><Trash2 size={16} /></button>
                             <button onClick={() => handleResetAccessCode(c.id)} data-testid={`btn-reset-code-${c.id}`} className="text-slate-400 hover:text-amber-500 p-1 transition-colors" title="إصدار رمز جديد"><Key size={16} /></button>
                           </div>
                           
                           {resetCodeMap[c.id] && (
                             <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-1">
                               <p className="text-[10px] text-amber-700 font-bold mb-1">الرمز الجديد:</p>
                               <div className="flex items-center gap-1 bg-white p-1 rounded border border-amber-100">
                                  <code className="text-xs font-black tracking-widest text-slate-800 w-full text-center" data-testid={`access-code-${c.id}`}>{resetCodeMap[c.id]}</code>
                               </div>
                               <button 
                                  onClick={() => navigator.clipboard.writeText(resetCodeMap[c.id])} 
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
             <p className="text-sm text-slate-500 mb-6">هل أنت متأكد من حذف حساب المنسق؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسح وصوله نهائياً.</p>
             <div className="flex gap-3">
               <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl text-sm hover:bg-slate-200 transition-colors">إلغاء</button>
               <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-red-600 transition-colors">نعم، حذف</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
