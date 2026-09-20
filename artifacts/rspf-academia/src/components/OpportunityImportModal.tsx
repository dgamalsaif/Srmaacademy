import { ChangeEvent, useRef, useState } from "react";
import ExcelJS from "exceljs";
import { Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { ResearchOpportunity } from "@/lib/researchData";
import { SpecialtyOption } from "@/lib/siteContentSettings";
import { useSiteContentSettings } from "@/hooks/use-site-content-settings";

const IMPORT_COLUMNS = [
  "category", "titleAr", "titleEn", "specialtyAr", "specialtyEn", "seatsLeft", "status",
  "descriptionAr", "descriptionEn", "journalTarget", "journalIssn", "journalPubmed",
  "journalScopus", "journalWos", "indexedIn", "benefits", "duration", "supervisor",
  "priceOriginalSar", "priceDiscountedSar",
] as const;

type ImportRow = Record<string, string | number> & { sourceRow?: number };
type ImportResult = {
  inserted?: ResearchOpportunity[];
  rejected?: Array<{ row: number; reason: string }>;
  skipped?: number;
  received?: number;
  error?: string;
  specialtyOptions?: SpecialtyOption[];
};

const EXAMPLE_ROW: ImportRow = {
  category: "active",
  titleAr: "فرصة بحثية في طب العيون",
  titleEn: "Example Ophthalmology Research Opportunity",
  specialtyAr: "طب العيون",
  specialtyEn: "Ophthalmology",
  seatsLeft: 15,
  status: "open",
  descriptionAr: "وصف مختصر للفرصة البحثية.",
  descriptionEn: "A short description of this research opportunity.",
  journalTarget: "Example Medical Journal (Q2)",
  journalIssn: "",
  journalPubmed: "Indexed",
  journalScopus: "Q2",
  journalWos: "",
  indexedIn: "PubMed|Scopus",
  benefits: "إشراف متخصص|شهادة مشاركة",
  duration: "8 أشهر",
  supervisor: "د. الاسم",
  priceOriginalSar: 1500,
  priceDiscountedSar: 1000,
};

const COLUMN_LABELS: Record<(typeof IMPORT_COLUMNS)[number], string> = {
  category: "نوع البرنامج / category",
  titleAr: "عنوان الفرصة بالعربية / titleAr",
  titleEn: "عنوان الفرصة بالإنجليزية / titleEn",
  specialtyAr: "التخصص بالعربية / specialtyAr",
  specialtyEn: "التخصص بالإنجليزية / specialtyEn",
  seatsLeft: "المقاعد المتبقية (0–15) / seatsLeft",
  status: "الحالة / status",
  descriptionAr: "الوصف بالعربية / descriptionAr",
  descriptionEn: "الوصف بالإنجليزية / descriptionEn",
  journalTarget: "المجلة المستهدفة / journalTarget",
  journalIssn: "ISSN / journalIssn",
  journalPubmed: "تصنيف PubMed / journalPubmed",
  journalScopus: "تصنيف Scopus / journalScopus",
  journalWos: "تصنيف WOS / journalWos",
  indexedIn: "قواعد البيانات (|) / indexedIn",
  benefits: "المزايا (|) / benefits",
  duration: "المدة / duration",
  supervisor: "المشرف / supervisor",
  priceOriginalSar: "السعر قبل الخصم / priceOriginalSar",
  priceDiscountedSar: "السعر بعد الخصم / priceDiscountedSar",
};

async function downloadTemplate(siteName: string) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Opportunities", { views: [{ rightToLeft: true }] });
  worksheet.columns = IMPORT_COLUMNS.map((column) => ({
    header: column,
    key: column,
    width: Math.max(18, COLUMN_LABELS[column].length + 2),
  }));
  worksheet.addRow(EXAMPLE_ROW);
  const guidance = workbook.addWorksheet("Instructions", { views: [{ rightToLeft: true }] });
  guidance.addRows([
    [`${siteName} — Opportunity Import Template`],
    ["التعليمات / Instructions"],
    ["املأ صفاً واحداً لكل فرصة. العناوين المطلوبة: titleAr, titleEn, specialtyAr, specialtyEn."],
    ["إجمالي المقاعد ثابت دائماً على 15. استخدم seatsLeft لتحديد المقاعد المتبقية من 0 إلى 15."],
    ["افصل أكثر من ميزة أو قاعدة بيانات بعلامة |. استخدم الحالات: open, closed, upcoming, seats_full."],
    ["الأنواع المدعومة: active, completed, training, cme. سيُضاف التخصص الجديد تلقائياً."],
    [],
    ["Column / العمود", "Meaning / المعنى"],
    ...IMPORT_COLUMNS.map((column) => [column, COLUMN_LABELS[column]]),
  ]);
  guidance.getColumn(1).width = 28;
  guidance.getColumn(2).width = 88;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "research-opportunities-template.xlsx";
  link.click();
  URL.revokeObjectURL(url);
}

export default function OpportunityImportModal({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: (programs: ResearchOpportunity[], specialtyOptions: SpecialtyOption[]) => void;
}) {
  const { data: settings } = useSiteContentSettings();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setResult(null);
    setMessage("");
    setRows([]);
    if (!file) return;
    if (!/\.xlsx$/i.test(file.name)) {
      setMessage("يرجى اختيار ملف Excel حديث بامتداد .xlsx.");
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const sheet = workbook.worksheets[0];
      if (!sheet) throw new Error("missing sheet");
      const headerColumns = new Map<string, number>();
      sheet.getRow(1).eachCell((cell, columnNumber) => {
        const header = cell.text.trim();
        if (header) headerColumns.set(header, columnNumber);
      });
      const headers = IMPORT_COLUMNS.filter((column) => headerColumns.has(column));
      const missing = ["titleAr", "titleEn", "specialtyAr", "specialtyEn"].filter((column) => !headers.includes(column as (typeof IMPORT_COLUMNS)[number]));
      if (missing.length) {
        setMessage(`القالب لا يحتوي على الأعمدة المطلوبة: ${missing.join(", ")}.`);
        return;
      }
      const data: ImportRow[] = [];
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        const item = Object.fromEntries(IMPORT_COLUMNS.map((column) => {
          const columnIndex = headerColumns.get(column);
          return [column, columnIndex ? row.getCell(columnIndex).text.trim() : ""];
        })) as ImportRow;
        if (Object.values(item).some((value) => String(value).trim())) data.push(item);
      });
      setRows(data.map((row, index) => ({ ...row, sourceRow: index + 2 })));
      setFileName(file.name);
      setMessage(`تمت قراءة ${data.length} فرصة. راجع الملف ثم ابدأ الاستيراد.`);
    } catch {
      setMessage("تعذر قراءة ملف Excel. استخدم القالب الذي تم تنزيله من هذه النافذة.");
    }
  };

  const submit = async () => {
    if (!rows.length) {
      setMessage("اختر ملف Excel صالحاً أولاً.");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/programs/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const payload = await response.json() as ImportResult;
      if (!response.ok) {
        setMessage(payload.error || "تعذر استيراد الفرص.");
        return;
      }
      setResult(payload);
      onImported(payload.inserted || [], payload.specialtyOptions || []);
      setMessage(`تم استيراد ${(payload.inserted || []).length} فرصة من أصل ${payload.received || rows.length}.`);
    } catch {
      setMessage("تعذر الاتصال بالخادم. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
      <section className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl sm:p-8" dir="rtl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <button type="button" onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"><X size={20} /></button>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 text-[#117b59]"><FileSpreadsheet size={22} /><span className="text-sm font-black">Excel</span></div>
            <h2 className="mt-1 text-xl font-black text-slate-800">استيراد فرص بحثية</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">إجمالي المقاعد ثابت على 15. حدّد المتبقي فقط في عمود <span dir="ltr">seatsLeft</span>.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-right">
          <p className="font-black text-slate-800">1. نزّل القالب واملأه</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">العناوين مطابقة لحقول الفرص في المنصة، والتخصصات الجديدة تُضاف تلقائياً.</p>
          <button type="button" onClick={() => downloadTemplate(settings?.brand.siteNameEn || "Research Academy")} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#117b59]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#117b59] shadow-sm transition hover:bg-emerald-50">
            <Download size={16} /> تنزيل قالب Excel
          </button>
        </div>

        <div className="mt-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center">
          <input ref={inputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={selectFile} />
          <FileSpreadsheet className="mx-auto text-slate-400" size={32} />
          <p className="mt-3 font-black text-slate-700">{fileName || "2. ارفع ملف Excel المكتمل"}</p>
          <p className="mt-1 text-xs text-slate-500">يدعم ملفات XLSX وXLS فقط.</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0C3156] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#082844]">
            <Upload size={16} /> اختيار ملف
          </button>
        </div>

        {message && <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-right text-sm font-bold ${result ? "bg-emerald-50 text-[#117b59]" : "bg-amber-50 text-amber-800"}`}>{message}</p>}
        {result?.rejected?.length ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-right">
            <p className="font-black text-amber-900">صفوف لم تُستورد ({result.rejected.length})</p>
            <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs leading-5 text-amber-800">
              {result.rejected.map((item) => <li key={`${item.row}-${item.reason}`}>الصف {item.row}: {item.reason}</li>)}
            </ul>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">إغلاق</button>
          <button type="button" disabled={!rows.length || submitting} onClick={() => void submit()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#117b59] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0c6549] disabled:cursor-not-allowed disabled:opacity-50">
            <Upload size={16} /> {submitting ? "جارٍ الاستيراد..." : `استيراد ${rows.length || ""} فرصة`}
          </button>
        </div>
      </section>
    </div>
  );
}