import React from "react";
import { CoordinatorCopyKey, CoordinatorPortalSettings, PORTAL_NAV_ICONS, PortalNavItem, PortalNavIcon } from "@/lib/coordinatorPortalSettings";
import { Save, ChevronUp, ChevronDown, Eye, EyeOff, Star, Layout, MessageCircle, Link as LinkIcon, Smartphone, Cookie, Plus, Trash2 } from "lucide-react";

interface Props {
  settings: CoordinatorPortalSettings;
  onChange: (settings: CoordinatorPortalSettings) => void;
  onSave: () => void;
  saving: boolean;
  message: string;
}

export default function CoordinatorPortalSettingsPanel({
  settings,
  onChange,
  onSave,
  saving,
  message,
}: Props) {
  const updateField = <K extends keyof CoordinatorPortalSettings>(field: K, value: CoordinatorPortalSettings[K]) => {
    onChange({ ...settings, [field]: value });
  };

  const updateNav = (newNav: PortalNavItem[]) => updateField("navItems", newNav);
  const updateTranslation = (key: CoordinatorCopyKey, value: string) => {
    updateField("translations", { ...settings.translations, [key]: value });
  };

  const moveNavUp = (index: number) => {
    if (index === 0) return;
    const newNav = [...settings.navItems];
    [newNav[index - 1], newNav[index]] = [newNav[index], newNav[index - 1]];
    updateNav(newNav);
  };

  const moveNavDown = (index: number) => {
    if (index === settings.navItems.length - 1) return;
    const newNav = [...settings.navItems];
    [newNav[index + 1], newNav[index]] = [newNav[index], newNav[index + 1]];
    updateNav(newNav);
  };

  const removeNav = (index: number) => {
    if (settings.navItems.length <= 1) return;
    const newNav = [...settings.navItems];
    newNav.splice(index, 1);
    updateNav(newNav);
  };

  const addNav = () => {
    const newNav = [...settings.navItems, {
      id: `nav-${Date.now()}`,
      label: "رابط جديد",
      labelEn: "New link",
      href: "/new-link",
      icon: "file" as PortalNavIcon,
      visible: true,
      accent: false
    }];
    updateNav(newNav);
  };

  const updateNavItem = (index: number, updates: Partial<PortalNavItem>) => {
    const newNav = [...settings.navItems];
    newNav[index] = { ...newNav[index], ...updates };
    updateNav(newNav);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Save Header */}
      <div className="flex items-center justify-between bg-white rounded-3xl p-5 border border-slate-200 shadow-sm sticky top-4 z-40">
        <div>
          <h1 className="text-xl font-black text-slate-800">إعدادات بوابة المنسق</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">تخصيص الواجهة العامة، النصوص، الروابط وتجربة المستخدم.</p>
        </div>
        <div className="flex items-center gap-4">
          {message && (
            <span className={`text-sm font-bold ${message.includes("نجاح") ? "text-[#117b59]" : "text-red-500"}`}>
              {message}
            </span>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            data-testid="button-save-settings"
            className="flex items-center gap-2 bg-[#117b59] hover:bg-[#0c6549] text-white px-6 py-3 rounded-2xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            حفظ التغييرات
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          {/* الهوية والنصوص */}
          <SectionCard icon={Layout} title="الهوية والنصوص">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="اسم العلامة" value={settings.brandName} onChange={v => updateField("brandName", v)} testId="input-brand-name" />
              <InputField label="سنة العلامة" value={settings.brandYear} onChange={v => updateField("brandYear", v)} testId="input-brand-year" />
              <InputField label="الشعار اللفظي" value={settings.brandSubtitle} onChange={v => updateField("brandSubtitle", v)} testId="input-brand-subtitle" />
              <InputField label="عنوان الصفحة (في المتصفح)" value={settings.pageTitle} onChange={v => updateField("pageTitle", v)} testId="input-page-title" />
            </div>

            <div className="h-px bg-slate-100 my-8" />

            <h3 className="text-sm font-black text-slate-800 mb-5">نصوص صفحة الدخول</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="عنوان تسجيل الدخول" value={settings.loginTitle} onChange={v => updateField("loginTitle", v)} testId="input-login-title" />
              <InputField label="تسمية حقل الرمز" value={settings.codeLabel} onChange={v => updateField("codeLabel", v)} testId="input-code-label" />
              <InputField label="نص تلميح حقل الرمز" value={settings.codePlaceholder} onChange={v => updateField("codePlaceholder", v)} testId="input-code-placeholder" />
              <InputField label="تسمية زر الدخول" value={settings.loginLabel} onChange={v => updateField("loginLabel", v)} testId="input-login-label" />
              <InputField label="بادئة رابط التسجيل" value={settings.registrationPrefix} onChange={v => updateField("registrationPrefix", v)} testId="input-reg-prefix" />
              <InputField label="رابط التسجيل" value={settings.registrationLabel} onChange={v => updateField("registrationLabel", v)} testId="input-reg-label" />
            </div>
            
            <div className="mt-5 space-y-5">
              <TextAreaField label="وصف تسجيل الدخول" value={settings.loginDescription} onChange={v => updateField("loginDescription", v)} testId="input-login-desc" />
              <TextAreaField label="النص السفلي (Footnote)" value={settings.footnote} onChange={v => updateField("footnote", v)} testId="input-footnote" />
            </div>
          </SectionCard>

          {/* قائمة التنقل */}
          <SectionCard icon={LinkIcon} title="قائمة التنقل">
            <div className="space-y-4">
              {settings.navItems.map((item, index) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-4 p-4 border border-slate-200 rounded-2xl bg-white shadow-sm items-start relative group transition-all hover:border-[#117b59]/30">
                  <div className="flex md:flex-col gap-1 shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                    <button type="button" onClick={() => moveNavUp(index)} disabled={index === 0} data-testid={`button-nav-up-${item.id}`} className="p-1.5 text-slate-400 hover:text-[#117b59] hover:bg-[#e6f5ef] rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><ChevronUp size={18} /></button>
                    <button type="button" onClick={() => moveNavDown(index)} disabled={index === settings.navItems.length - 1} data-testid={`button-nav-down-${item.id}`} className="p-1.5 text-slate-400 hover:text-[#117b59] hover:bg-[#e6f5ef] rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"><ChevronDown size={18} /></button>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-1.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">العنوان</label>
                      <input value={item.label} onChange={e => updateNavItem(index, { label: e.target.value })} data-testid={`input-nav-label-${item.id}`} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-[#117b59] focus:bg-white transition-all" />
                    </div>
                     <div>
                       <label className="block text-[11px] font-bold text-slate-500 mb-1.5">العنوان بالإنجليزية</label>
                       <input value={item.labelEn ?? ""} onChange={e => updateNavItem(index, { labelEn: e.target.value })} data-testid={`input-nav-label-en-${item.id}`} dir="ltr" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-left text-sm font-medium outline-none focus:border-[#117b59] focus:bg-white transition-all" />
                     </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">الرابط المسار</label>
                      <input value={item.href} onChange={e => updateNavItem(index, { href: e.target.value })} data-testid={`input-nav-href-${item.id}`} dir="ltr" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-[#117b59] focus:bg-white transition-all text-left" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">الأيقونة</label>
                      <div className="relative">
                        <select value={item.icon} onChange={e => updateNavItem(index, { icon: e.target.value as PortalNavIcon })} data-testid={`select-nav-icon-${item.id}`} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 pl-8 text-sm font-medium outline-none focus:border-[#117b59] focus:bg-white transition-all appearance-none cursor-pointer text-right">
                          {PORTAL_NAV_ICONS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-stretch gap-2 shrink-0 md:border-r border-slate-100 md:pr-4 w-full md:w-auto md:mt-0 mt-2 pt-4 md:pt-0 border-t md:border-t-0">
                    <button type="button" onClick={() => updateNavItem(index, { visible: !item.visible })} data-testid={`button-nav-visible-${item.id}`} className={`flex-1 md:flex-none flex justify-center items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all border ${item.visible ? 'bg-[#e6f5ef] text-[#117b59] border-[#117b59]/20' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                      {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      {item.visible ? 'مرئي' : 'مخفي'}
                    </button>
                    <button type="button" onClick={() => updateNavItem(index, { accent: !item.accent })} data-testid={`button-nav-accent-${item.id}`} className={`flex-1 md:flex-none flex justify-center items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all border ${item.accent ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}>
                      <Star size={14} className={item.accent ? 'fill-amber-500 text-amber-500' : ''} />
                      {item.accent ? 'بارز' : 'عادي'}
                    </button>
                    <button type="button" onClick={() => removeNav(index)} disabled={settings.navItems.length <= 1} data-testid={`button-nav-remove-${item.id}`} className="flex-1 md:flex-none flex justify-center items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-200 transition-all disabled:opacity-50 disabled:pointer-events-none mt-auto md:mt-2">
                      <Trash2 size={14} />
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button type="button" onClick={addNav} data-testid="button-nav-add" className="mt-5 flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 hover:text-[#117b59] hover:border-[#117b59]/30 hover:bg-[#e6f5ef]/50 transition-all font-bold text-sm">
              <Plus size={18} />
              إضافة رابط جديد
            </button>
          </SectionCard>
           
           <SectionCard icon={Layout} title="النصوص الإنجليزية">
             <p className="mb-5 text-sm text-slate-500">تُعرض هذه النصوص عند اختيار اللغة الإنجليزية.</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               {(Object.entries(ENGLISH_COPY_LABELS) as [CoordinatorCopyKey, string][]).map(([key, label]) => (
                 <InputField
                   key={key}
                   label={label}
                   value={settings.translations[key]}
                   onChange={value => updateTranslation(key, value)}
                   testId={`input-translation-${key}`}
                   dir="ltr"
                 />
               ))}
             </div>
           </SectionCard>
        </div>

        <div className="xl:col-span-4 space-y-6">
          {/* روابط التواصل */}
          <SectionCard icon={MessageCircle} title="روابط التواصل">
            <div className="space-y-4">
              <div className="space-y-3 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                <ToggleField label="تفعيل واتساب" value={settings.showWhatsapp} onChange={v => updateField("showWhatsapp", v)} testId="toggle-show-whatsapp" />
                <InputField label="رابط واتساب" value={settings.whatsappUrl} onChange={v => updateField("whatsappUrl", v)} dir="ltr" disabled={!settings.showWhatsapp} testId="input-url-whatsapp" />
              </div>
              <div className="space-y-3 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
                <ToggleField label="تفعيل تيليجرام" value={settings.showTelegram} onChange={v => updateField("showTelegram", v)} testId="toggle-show-telegram" />
                <InputField label="رابط تيليجرام" value={settings.telegramUrl} onChange={v => updateField("telegramUrl", v)} dir="ltr" disabled={!settings.showTelegram} testId="input-url-telegram" />
              </div>
            </div>
          </SectionCard>

          {/* إشعار ملفات الارتباط */}
          <SectionCard icon={Cookie} title="إشعار ملفات الارتباط">
            <div className="space-y-5">
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <ToggleField label="تفعيل إشعار ملفات الارتباط" value={settings.showCookieBanner} onChange={v => updateField("showCookieBanner", v)} testId="toggle-show-cookies" />
              </div>
              
              <div className={`space-y-4 transition-all duration-300 ${settings.showCookieBanner ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale-[50%]'}`}>
                <InputField label="عنوان الإشعار" value={settings.cookieTitle} onChange={v => updateField("cookieTitle", v)} testId="input-cookie-title" />
                <TextAreaField label="نص الإشعار" value={settings.cookieDescription} onChange={v => updateField("cookieDescription", v)} testId="input-cookie-desc" />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="زر القبول" value={settings.cookieAcceptLabel} onChange={v => updateField("cookieAcceptLabel", v)} testId="input-cookie-accept" />
                  <InputField label="زر الرفض" value={settings.cookieRejectLabel} onChange={v => updateField("cookieRejectLabel", v)} testId="input-cookie-reject" />
                </div>
                <InputField label="رابط سياسة الخصوصية" value={settings.cookiePolicyUrl} onChange={v => updateField("cookiePolicyUrl", v)} dir="ltr" testId="input-cookie-policy" />
              </div>
            </div>
          </SectionCard>

          {/* دعوة التثبيت */}
          <SectionCard icon={Smartphone} title="دعوة التثبيت (PWA)">
            <div className="space-y-5">
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                <ToggleField label="تفعيل نافذة التثبيت" value={settings.showInstallPrompt} onChange={v => updateField("showInstallPrompt", v)} testId="toggle-show-install" />
              </div>
              
              <div className={`space-y-4 transition-all duration-300 ${settings.showInstallPrompt ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale-[50%]'}`}>
                <InputField label="عنوان الدعوة" value={settings.installTitle} onChange={v => updateField("installTitle", v)} testId="input-install-title" />
                <TextAreaField label="نص الدعوة" value={settings.installDescription} onChange={v => updateField("installDescription", v)} testId="input-install-desc" />
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="زر التثبيت" value={settings.installActionLabel} onChange={v => updateField("installActionLabel", v)} testId="input-install-action" />
                  <InputField label="زر التجاهل" value={settings.installDismissLabel} onChange={v => updateField("installDismissLabel", v)} testId="input-install-dismiss" />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

const ENGLISH_COPY_LABELS: Record<CoordinatorCopyKey, string> = {
  brandSubtitle: "الشعار اللفظي",
  pageTitle: "عنوان الصفحة",
  loginTitle: "عنوان تسجيل الدخول",
  loginDescription: "وصف تسجيل الدخول",
  codeLabel: "تسمية حقل الرمز",
  codePlaceholder: "تلميح حقل الرمز",
  loginLabel: "زر الدخول",
  registrationPrefix: "بادئة التسجيل",
  registrationLabel: "رابط التسجيل",
  footnote: "النص السفلي",
  cookieTitle: "عنوان ملفات الارتباط",
  cookieDescription: "وصف ملفات الارتباط",
  cookieRejectLabel: "زر الرفض",
  cookieAcceptLabel: "زر القبول",
  installTitle: "عنوان التثبيت",
  installDescription: "وصف التثبيت",
  installActionLabel: "زر التثبيت",
  installDismissLabel: "زر التجاهل",
};

function SectionCard({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-7">
        <div className="w-12 h-12 rounded-2xl bg-[#e6f5ef] text-[#117b59] flex items-center justify-center border border-[#117b59]/10 shrink-0">
          <Icon size={24} />
        </div>
        <h2 className="text-xl font-black text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, dir = "rtl", disabled = false, testId }: { label: string, value: string, onChange: (v: string) => void, dir?: "rtl" | "ltr", disabled?: boolean, testId: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-700">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        dir={dir}
        disabled={disabled}
        data-testid={testId}
        className={`w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition-all ${dir === 'ltr' ? 'text-left' : 'text-right'} ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-slate-50 focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/10 focus:bg-white text-slate-800'}`}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, disabled = false, testId }: { label: string, value: string, onChange: (v: string) => void, disabled?: boolean, testId: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-bold text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        data-testid={testId}
        className={`w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition-all resize-none text-right ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-500' : 'bg-slate-50 focus:border-[#117b59] focus:ring-2 focus:ring-[#117b59]/10 focus:bg-white text-slate-800'}`}
      />
    </div>
  );
}

function ToggleField({ label, value, onChange, testId }: { label: string, value: boolean, onChange: (v: boolean) => void, testId: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!value)}>
      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors select-none">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        data-testid={testId}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-[#117b59] focus-visible:outline-none pointer-events-none ${value ? 'bg-[#117b59]' : 'bg-slate-300'}`}
      >
        <span className={`absolute h-5 w-5 rounded-full bg-white transition-all shadow-sm ${value ? 'left-1' : 'right-1'}`} />
      </button>
    </div>
  );
}
