import { ChevronDown, ChevronUp, Eye, EyeOff, Palette, Save, SlidersHorizontal, Image, Phone, Mail, Link as LinkIcon, FileText, Send, Share2, ExternalLink, MessageCircle, Check } from "lucide-react";
import { useState } from "react";
import { CARD_PARTS, OPPORTUNITY_FIELDS, OpportunityDisplayMode, OpportunityFieldId, RegistrationFieldSetting, SiteContentSettings, SpecialtyOption, JournalOption, PublicPageId, BrandContactSettings, PublicPageContent, SOCIAL_ICON_OPTIONS, SocialIconId, FloatingIconPosition, ForwardingType, ContactUsType } from "@/lib/siteContentSettings";

interface Props {
  settings: SiteContentSettings;
  onChange: (settings: SiteContentSettings) => void;
  onSave: () => void;
  saving: boolean;
  message: string;
}

export default function ContentControlPanel({ settings, onChange, onSave, saving, message }: Props) {
  const [specialtyDraft, setSpecialtyDraft] = useState({ nameAr: "", nameEn: "", groupUrl: "" });
  const [journalDraft, setJournalDraft] = useState({ nameAr: "", nameEn: "", issn: "", pubmed: "", scopus: "", wos: "", specialty: "" });
  const [activePageTab, setActivePageTab] = useState<PublicPageId>("home");
  const [activeForwardTab, setActiveForwardTab] = useState<"participant" | "coordinator">("participant");
  const update = <K extends keyof SiteContentSettings>(key: K, value: SiteContentSettings[K]) => onChange({ ...settings, [key]: value });
  const updateField = (index: number, changes: Partial<RegistrationFieldSetting>) => {
    const fields = [...settings.registrationFields];
    fields[index] = { ...fields[index], ...changes };
    update("registrationFields", fields);
  };
  const moveField = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= settings.registrationFields.length) return;
    const fields = [...settings.registrationFields];
    [fields[index], fields[next]] = [fields[next], fields[index]];
    update("registrationFields", fields);
  };
  const togglePart = (audience: "participant" | "coordinator", part: string) => {
    const key = audience === "participant" ? "visibleParticipantCardParts" : "visibleCoordinatorCardParts";
    const current = settings[key];
    update(key, current.includes(part) ? current.filter((item) => item !== part) : [...current, part]);
  };
  const movePart = (audience: "participant" | "coordinator", index: number, direction: -1 | 1) => {
    const key = audience === "participant" ? "participantCardOrder" : "coordinatorCardOrder";
    const order = [...settings[key]];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    update(key, order);
  };
  const toggleOpportunityFieldRequired = (fieldId: OpportunityFieldId) => {
    const fields = settings.requiredOpportunityFields;
    update("requiredOpportunityFields", fields.includes(fieldId) ? fields.filter((id) => id !== fieldId) : [...fields, fieldId]);
  };
  const updateBrand = <K extends keyof BrandContactSettings>(key: K, value: BrandContactSettings[K]) => {
    update("brand", { ...settings.brand, [key]: value });
  };
  const toggleSocialIcon = (audience: "public" | "participant" | "coordinator", id: SocialIconId) => {
    const key = `${audience}SocialIcons` as const;
    const current = settings.brand[key];
    update("brand", { ...settings.brand, [key]: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] });
  };
  const updateIconPosition = (audience: "public" | "participant" | "coordinator", value: FloatingIconPosition) => {
    const key = `${audience}IconPosition` as const;
    update("brand", { ...settings.brand, [key]: value });
  };
  const updatePage = (pageId: PublicPageId, key: keyof PublicPageContent, value: string) => {
    update("pages", { ...settings.pages, [pageId]: { ...settings.pages[pageId], [key]: value } });
  };
  const addSpecialty = () => {
    if (!specialtyDraft.nameAr.trim() && !specialtyDraft.nameEn.trim()) return;
    const option: SpecialtyOption = {
      id: `specialty-${Date.now()}`,
      nameAr: specialtyDraft.nameAr.trim(),
      nameEn: specialtyDraft.nameEn.trim(),
      groupUrl: specialtyDraft.groupUrl.trim() || undefined,
    };
    update("specialtyOptions", [...settings.specialtyOptions, option]);
    setSpecialtyDraft({ nameAr: "", nameEn: "", groupUrl: "" });
  };
  const updateSpecialty = (id: string, changes: Partial<SpecialtyOption>) => {
    const updated = settings.specialtyOptions.map((item) => item.id === id ? { ...item, ...changes } : item);
    update("specialtyOptions", updated);
  };
  const addJournal = () => {
    if (!journalDraft.nameAr.trim() && !journalDraft.nameEn.trim()) return;
    const option: JournalOption = {
      id: `journal-${Date.now()}`,
      nameAr: journalDraft.nameAr.trim(),
      nameEn: journalDraft.nameEn.trim(),
      issn: journalDraft.issn.trim(),
      pubmed: journalDraft.pubmed.trim(),
      scopus: journalDraft.scopus.trim(),
      wos: journalDraft.wos.trim(),
      specialty: journalDraft.specialty.trim() || undefined,
    };
    update("journalOptions", [...settings.journalOptions, option]);
    setJournalDraft({ nameAr: "", nameEn: "", issn: "", pubmed: "", scopus: "", wos: "", specialty: "" });
  };
  const updateJournal = (id: string, changes: Partial<JournalOption>) => {
    const updated = settings.journalOptions.map((item) => item.id === id ? { ...item, ...changes } : item);
    update("journalOptions", updated);
  };

  return (
    <section className="space-y-6" dir="rtl">
      <div className="sticky top-4 z-30 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black tracking-wider text-[#117b59]">مركز التحكم بالمحتوى</p>
          <h1 className="mt-1 text-2xl font-black text-slate-900">المحتوى والحقول والمظهر</h1>
          <p className="mt-1 text-sm text-slate-500">حدّد ما يظهر للمشترك والمنسق وكيف يُرتَّب ويُلوَّن.</p>
        </div>
        <div className="flex items-center gap-3">
          {message && <p className={`text-sm font-bold ${message.includes("نجاح") ? "text-[#117b59]" : "text-rose-600"}`}>{message}</p>}
          <button type="button" onClick={onSave} disabled={saving} data-testid="button-save-content-settings" className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#117b59] px-5 py-3 font-black text-white shadow-sm transition hover:bg-[#0c6549] disabled:opacity-60">
            <Save size={17} />{saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <Panel title="إعدادات الهوية والتواصل" icon={Palette}>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="اسم المنصة (عربي)" value={settings.brand.siteNameAr} onChange={(v) => updateBrand("siteNameAr", v)} />
              <TextField label="اسم المنصة (إنجليزي)" value={settings.brand.siteNameEn} onChange={(v) => updateBrand("siteNameEn", v)} />
              <div className="md:col-span-2">
                <TextField label="رابط الشعار (Logo URL)" value={settings.brand.logoUrl} onChange={(v) => updateBrand("logoUrl", v)} />
                {settings.brand.logoUrl && (
                  <div className="mt-3 inline-block rounded-xl border border-slate-200 p-2 bg-slate-50">
                    <img src={settings.brand.logoUrl} alt="Logo Preview" className="h-10 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>
              <TextField label="اسم التطبيق (عربي)" value={settings.brand.appNameAr} onChange={(v) => updateBrand("appNameAr", v)} />
              <TextField label="App name (English)" value={settings.brand.appNameEn} onChange={(v) => updateBrand("appNameEn", v)} />
              <TextField label="الاسم المختصر للتطبيق" value={settings.brand.appShortName} onChange={(v) => updateBrand("appShortName", v)} />
              <div>
                <TextField label="رابط أيقونة التطبيق (PNG مربع موصى به)" value={settings.brand.appIconUrl} onChange={(v) => updateBrand("appIconUrl", v)} />
                {settings.brand.appIconUrl && <img src={settings.brand.appIconUrl} alt="معاينة أيقونة التطبيق" className="mt-3 h-14 w-14 rounded-2xl border border-slate-200 object-cover" />}
              </div>
              <ColorField label="لون التطبيق عند التشغيل" value={settings.brand.appThemeColor} onChange={(v) => updateBrand("appThemeColor", v)} />
              <TextField label="رقم الهاتف للاتصال" value={settings.brand.phone} onChange={(v) => updateBrand("phone", v)} />
              <TextField label="رقم واتساب مع رمز الدولة" value={settings.brand.whatsapp} onChange={(v) => updateBrand("whatsapp", v)} />
              <TextField label="رقم واتساب للمشاركين" value={settings.brand.participantWhatsapp} onChange={(v) => updateBrand("participantWhatsapp", v)} />
              <TextField label="رقم واتساب للمنسقين وطلبات الاعتماد" value={settings.brand.coordinatorWhatsapp} onChange={(v) => updateBrand("coordinatorWhatsapp", v)} />
              <TextField label="رابط قناة واتساب" value={settings.brand.whatsappChannelUrl} onChange={(v) => updateBrand("whatsappChannelUrl", v)} />
              <TextField label="البريد الإلكتروني" value={settings.brand.email} onChange={(v) => updateBrand("email", v)} />
              <TextField label="رابط أو معرف تيليجرام" value={settings.brand.telegramUsername} onChange={(v) => updateBrand("telegramUsername", v)} />
              <TextField label="رابط أو معرف إنستجرام" value={settings.brand.instagramUsername} onChange={(v) => updateBrand("instagramUsername", v)} />
              <TextField label="رابط أو معرف منصة X" value={settings.brand.xUsername} onChange={(v) => updateBrand("xUsername", v)} />
              <TextField label="رابط أو معرف لينكد إن" value={settings.brand.linkedinUsername} onChange={(v) => updateBrand("linkedinUsername", v)} />
              <TextField label="رابط فيسبوك الكامل" value={settings.brand.facebookUrl} onChange={(v) => updateBrand("facebookUrl", v)} />
              <TextField label="رابط تيك توك الكامل" value={settings.brand.tiktokUrl} onChange={(v) => updateBrand("tiktokUrl", v)} />
              <TextField label="رابط يوتيوب الكامل" value={settings.brand.youtubeUrl} onChange={(v) => updateBrand("youtubeUrl", v)} />
              <TextField label="رابط سناب شات الكامل" value={settings.brand.snapchatUrl} onChange={(v) => updateBrand("snapchatUrl", v)} />

              <div className="md:col-span-2 rounded-2xl border-2 border-emerald-300 bg-emerald-50/50 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="text-[#117b59]" size={20} />
                  <h3 className="font-black text-slate-900 text-base">التحكم في طريقة التواصل في زر "تواصل معنا" (صفحة تفاصيل الفرصة وبقية الموقع)</h3>
                </div>
                <p className="text-xs text-slate-600 leading-5">حدد كيف يتواصل الزوار عند الضغط على "تواصل معنا" في الموقع وتحت خيار التسجيل في صفحة الفرصة البحثية (عبر الإيميل، الهاتف، تيليجرام، واتساب، أو رابط مخصص).</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">نوع وسيلة التواصل</label>
                    <select
                      value={settings.brand.contactUsType || "whatsapp"}
                      onChange={(e) => updateBrand("contactUsType", e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 focus:border-[#117b59] focus:outline-none"
                    >
                      <option value="whatsapp">واتساب (رقم أو رابط)</option>
                      <option value="phone">اتصال هاتفي مباشر (رقم هاتف)</option>
                      <option value="email">بريد إلكتروني (إيميل)</option>
                      <option value="telegram">تيليجرام (اسم مستخدم أو رابط)</option>
                      <option value="instagram">إنستجرام (اسم مستخدم أو رابط)</option>
                      <option value="custom_url">رابط ويب مخصص</option>
                    </select>
                  </div>
                  <TextField
                    label={
                      settings.brand.contactUsType === "phone"
                        ? "رقم الهاتف للاتصال"
                        : settings.brand.contactUsType === "email"
                        ? "البريد الإلكتروني"
                        : settings.brand.contactUsType === "telegram"
                        ? "اسم المستخدم في تيليجرام أو الرابط"
                        : settings.brand.contactUsType === "instagram"
                        ? "اسم المستخدم في إنستجرام أو الرابط"
                        : settings.brand.contactUsType === "custom_url"
                        ? "الرابط المخصص بالكامل"
                        : "رقم الواتساب أو الرابط"
                    }
                    value={settings.brand.contactUsValue || ""}
                    onChange={(v) => updateBrand("contactUsValue", v)}
                    placeholder="مثال: 966562159258 أو srma@example.com أو @SRMAAcademy"
                  />
                  <TextField label="نص الزر بالعربية" value={settings.brand.contactUsLabelAr || "تواصل معنا"} onChange={(v) => updateBrand("contactUsLabelAr", v)} />
                  <TextField label="نص الزر بالإنجليزية" value={settings.brand.contactUsLabelEn || "Contact Us"} onChange={(v) => updateBrand("contactUsLabelEn", v)} />
                </div>
              </div>

              {/* Dedicated Opportunity Inquiry Button under "Register Now" */}
              <div className="md:col-span-2 rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50/60 via-white to-sky-50/40 p-5 space-y-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold text-lg shadow-sm">💬</span>
                    <div>
                      <h4 className="text-base font-black text-slate-900">زر «تواصل معنا للاستفسار 💬» (تحت زر «سجل الآن» مباشرة)</h4>
                      <p className="text-xs text-slate-600 mt-0.5">تحكم كامل بالزر الموجود أسفل زر «سجل الآن»؛ خصص وسيلة التواصل (واتساب، بريد إلكتروني، أو تيليجرام)، الرقم أو المعرف، ونصوص الزر والرسالة الفورية.</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.brand.opportunityInquiryEnabled !== false}
                      onChange={(e) => updateBrand("opportunityInquiryEnabled", e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>تفعيل زر الاستفسار تحت «سجل الآن»</span>
                  </label>
                </div>

                {settings.brand.opportunityInquiryEnabled !== false && (
                  <div className="space-y-4 pt-3 border-t border-emerald-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">طريقة التواصل للزر (اختر واحدة):</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => updateBrand("opportunityInquiryChannel", "whatsapp")}
                          className={`p-3.5 rounded-xl border-2 text-start transition-all relative flex flex-col gap-1 ${
                            (settings.brand.opportunityInquiryChannel || "whatsapp") === "whatsapp"
                              ? "border-emerald-500 bg-emerald-50/80 shadow-xs"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                              <MessageCircle size={16} className="text-emerald-600" /> واتساب (WhatsApp)
                            </span>
                            {(settings.brand.opportunityInquiryChannel || "whatsapp") === "whatsapp" && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">✓</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">محادثة فورية مع رسالة قصيرة تحمل اسم الفرصة وعنوانها.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateBrand("opportunityInquiryChannel", "email")}
                          className={`p-3.5 rounded-xl border-2 text-start transition-all relative flex flex-col gap-1 ${
                            settings.brand.opportunityInquiryChannel === "email"
                              ? "border-amber-500 bg-amber-50/80 shadow-xs"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-black text-amber-800">
                              <Mail size={16} className="text-amber-600" /> بريد إلكتروني (Email)
                            </span>
                            {settings.brand.opportunityInquiryChannel === "email" && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white text-[10px] font-bold">✓</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">فتح تطبيق البريد برسالة وموضوع يحمل اسم الفرصة.</p>
                        </button>

                        <button
                          type="button"
                          onClick={() => updateBrand("opportunityInquiryChannel", "telegram")}
                          className={`p-3.5 rounded-xl border-2 text-start transition-all relative flex flex-col gap-1 ${
                            settings.brand.opportunityInquiryChannel === "telegram"
                              ? "border-sky-500 bg-sky-50/80 shadow-xs"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-black text-sky-800">
                              <Send size={16} className="text-sky-600" /> اسم مستخدم تيليجرام
                            </span>
                            {settings.brand.opportunityInquiryChannel === "telegram" && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white text-[10px] font-bold">✓</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">فتح حساب التيليجرام مباشرة للتواصل والمحادثة الفورية.</p>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                      {(settings.brand.opportunityInquiryChannel || "whatsapp") === "whatsapp" && (
                        <div>
                          <TextField
                            label="رقم الواتساب للاستفسارات عن الفرص"
                            value={settings.brand.opportunityInquiryValue || settings.brand.opportunityContactWhatsapp || settings.brand.whatsapp || ""}
                            onChange={(v) => {
                              updateBrand("opportunityInquiryValue", v);
                              updateBrand("opportunityContactWhatsapp", v);
                            }}
                            placeholder="مثال: 966562159258 (أو اتركه فارغاً لاستخدام رقم الواتساب العام)"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">يفتح تطبيق الواتساب مباشرة فور النقر، مع رسالة تلقائية تتضمن اسم الفرصة البحثية.</p>
                        </div>
                      )}

                      {settings.brand.opportunityInquiryChannel === "email" && (
                        <div>
                          <TextField
                            label="البريد الإلكتروني المخصص للاستفسارات"
                            value={settings.brand.opportunityInquiryValue || settings.brand.opportunityContactEmail || settings.brand.email || ""}
                            onChange={(v) => {
                              updateBrand("opportunityInquiryValue", v);
                              updateBrand("opportunityContactEmail", v);
                            }}
                            placeholder="مثال: srmaacademy@gmail.com"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">يفتح عميل البريد الإلكتروني مع إدراج عنوان الفرصة واسمها في الموضوع والمحتوى تلقائياً.</p>
                        </div>
                      )}

                      {settings.brand.opportunityInquiryChannel === "telegram" && (
                        <div>
                          <TextField
                            label="اسم مستخدم تيليجرام (Username)"
                            value={settings.brand.opportunityInquiryValue || settings.brand.opportunityContactTelegram || settings.brand.telegramUsername || ""}
                            onChange={(v) => {
                              updateBrand("opportunityInquiryValue", v);
                              updateBrand("opportunityContactTelegram", v);
                            }}
                            placeholder="مثال: SRMAAcademy (بدون @)"
                          />
                          <p className="text-[11px] text-slate-500 mt-1">يوجه الزائر مباشرة لمحادثة الحساب على تيليجرام مع رسالة استفسار باسم الفرصة.</p>
                        </div>
                      )}

                      <div className="grid gap-3 sm:grid-cols-2 pt-1">
                        <TextField
                          label="نص الزر بالعربية (أسفل سجل الآن)"
                          value={settings.brand.opportunityInquiryLabelAr || "تواصل معنا للاستفسار 💬"}
                          onChange={(v) => updateBrand("opportunityInquiryLabelAr", v)}
                          placeholder="تواصل معنا للاستفسار 💬"
                        />
                        <TextField
                          label="نص الزر بالإنجليزية"
                          value={settings.brand.opportunityInquiryLabelEn || "Contact us for inquiries 💬"}
                          onChange={(v) => updateBrand("opportunityInquiryLabelEn", v)}
                          placeholder="Contact us for inquiries 💬"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100">
                        <TextField
                          label="قالب رسالة الاستفسار بالعربية ({title} = اسم الفرصة)"
                          value={settings.brand.opportunityInquiryMessageAr || "مرحباً، أود الاستفسار والتسجيل بخصوص الفرصة البحثية: {title}"}
                          onChange={(v) => updateBrand("opportunityInquiryMessageAr", v)}
                          placeholder="مرحباً، أود الاستفسار والتسجيل بخصوص الفرصة البحثية: {title}"
                        />
                        <TextField
                          label="قالب رسالة الاستفسار بالإنجليزية"
                          value={settings.brand.opportunityInquiryMessageEn || "Hello, I would like to inquire about the research opportunity: {title}"}
                          onChange={(v) => updateBrand("opportunityInquiryMessageEn", v)}
                          placeholder="Hello, I would like to inquire about the research opportunity: {title}"
                        />
                      </div>
                    </div>

                    {/* Interactive Preview Card */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                      <p className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5">
                        <span>👁️</span>
                        <span>معاينة حية لشكل الزر وموضعه تحت «سجل الآن»:</span>
                      </p>
                      <div className="max-w-xs mx-auto bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1 bg-[#0C3156] text-white font-bold py-2.5 rounded-xl text-xs text-center flex items-center justify-center gap-1">
                            <span>سجل الآن</span> <span>👤</span>
                          </div>
                          <div className="border border-[#0C3156]/30 text-[#0C3156] font-bold px-3 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1">
                            <span>التفاصيل</span> <span>‹</span>
                          </div>
                        </div>

                        <div
                          className={`w-full font-bold py-2.5 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 border transition-all ${
                            (settings.brand.opportunityInquiryChannel || "whatsapp") === "whatsapp"
                              ? "border-emerald-500/40 bg-emerald-50 text-emerald-800"
                              : settings.brand.opportunityInquiryChannel === "telegram"
                              ? "border-sky-500/40 bg-sky-50 text-sky-800"
                              : "border-amber-500/40 bg-amber-50 text-amber-800"
                          }`}
                        >
                          {(settings.brand.opportunityInquiryChannel || "whatsapp") === "whatsapp" && (
                            <MessageCircle size={15} className="text-emerald-600 shrink-0" />
                          )}
                          {settings.brand.opportunityInquiryChannel === "telegram" && (
                            <Send size={14} className="text-sky-600 shrink-0" />
                          )}
                          {settings.brand.opportunityInquiryChannel === "email" && (
                            <Mail size={14} className="text-amber-600 shrink-0" />
                          )}
                          <span className="truncate">{settings.brand.opportunityInquiryLabelAr || "تواصل معنا للاستفسار 💬"}</span>
                        </div>

                        <div className="text-[11px] text-slate-400 py-0.5 text-center font-medium">
                          🔗 نسخ رابط الفرصة
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Opportunity Page Direct Contact Channels */}
              <div className="md:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">💬</span>
                    <div>
                      <h4 className="text-sm font-black text-slate-800">قنوات التواصل في صفحة الفرصة البحثية (تحت زر التسجيل والطلب)</h4>
                      <p className="text-xs text-slate-600">إظهار أزرار تواصل مباشرة (واتساب، تيليجرام، إيميل، هاتف) أسفل زر التسجيل للتسهيل على المشتركين والباحثين.</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-800">
                    <input
                      type="checkbox"
                      checked={settings.brand.opportunityContactEnabled !== false}
                      onChange={(e) => updateBrand("opportunityContactEnabled", e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span>تفعيل قنوات التواصل في صفحة الفرصة</span>
                  </label>
                </div>

                {settings.brand.opportunityContactEnabled !== false && (
                  <div className="space-y-4 pt-2 border-t border-emerald-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">القنوات المفعلة للظهور:</label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: "whatsapp" as const, label: "واتساب (WhatsApp)" },
                          { id: "telegram" as const, label: "تيليجرام (Telegram)" },
                          { id: "email" as const, label: "البريد الإلكتروني (Email)" },
                          { id: "phone" as const, label: "الهاتف (Phone Call)" },
                        ].map((ch) => {
                          const activeChannels = settings.brand.opportunityContactChannels || ["whatsapp", "telegram", "email", "phone"];
                          const isSelected = activeChannels.includes(ch.id);
                          return (
                            <button
                              key={ch.id}
                              type="button"
                              onClick={() => {
                                const next = isSelected
                                  ? activeChannels.filter((c) => c !== ch.id)
                                  : [...activeChannels, ch.id];
                                updateBrand("opportunityContactChannels", next);
                              }}
                              className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                                isSelected
                                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                              }`}
                            >
                              {isSelected ? "✓ " : "+ "}{ch.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField
                        label="عنوان القسم بالعربية (تحت زر التسجيل)"
                        value={settings.brand.opportunityContactLabelAr || "تواصل معنا بخصوص هذه الفرصة"}
                        onChange={(v) => updateBrand("opportunityContactLabelAr", v)}
                        placeholder="تواصل معنا بخصوص هذه الفرصة"
                      />
                      <TextField
                        label="عنوان القسم بالإنجليزية"
                        value={settings.brand.opportunityContactLabelEn || "Contact us about this opportunity"}
                        onChange={(v) => updateBrand("opportunityContactLabelEn", v)}
                        placeholder="Contact us about this opportunity"
                      />
                      <TextField
                        label="رقم واتساب المخصص للفرص (فارغ = استخدام واتساب العام)"
                        value={settings.brand.opportunityContactWhatsapp || ""}
                        onChange={(v) => updateBrand("opportunityContactWhatsapp", v)}
                        placeholder={settings.brand.whatsapp || "966562159258"}
                      />
                      <TextField
                        label="معرف تيليجرام المخصص (فارغ = استخدام معرف تيليجرام العام)"
                        value={settings.brand.opportunityContactTelegram || ""}
                        onChange={(v) => updateBrand("opportunityContactTelegram", v)}
                        placeholder={settings.brand.telegramUsername || "SRMAAcademy"}
                      />
                      <TextField
                        label="البريد الإلكتروني المخصص (فارغ = استخدام البريد العام)"
                        value={settings.brand.opportunityContactEmail || ""}
                        onChange={(v) => updateBrand("opportunityContactEmail", v)}
                        placeholder={settings.brand.email || "srmaacademy@gmail.com"}
                      />
                      <TextField
                        label="رقم الهاتف المخصص للاتصال (فارغ = استخدام هاتف الأكاديمية)"
                        value={settings.brand.opportunityContactPhone || ""}
                        onChange={(v) => updateBrand("opportunityContactPhone", v)}
                        placeholder={settings.brand.phone || "966562159258"}
                      />
                    </div>
                  </div>
                )}
              </div>

              {(["public", "participant", "coordinator"] as const).map((audience) => {
                const title = audience === "public" ? "بقية الموقع" : audience === "participant" ? "بوابة المشاركين" : "بوابة المنسقين";
                const icons = settings.brand[`${audience}SocialIcons`];
                const position = settings.brand[`${audience}IconPosition`];
                return <div key={audience} className="md:col-span-2 rounded-2xl border border-slate-200 p-4">
                  <h3 className="mb-3 font-black text-slate-800">أيقونات {title}</h3>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {SOCIAL_ICON_OPTIONS.map((option) => <button key={option.id} type="button" onClick={() => toggleSocialIcon(audience, option.id)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${icons.includes(option.id) ? "border-[#117b59] bg-[#e6f5ef] text-[#117b59]" : "border-slate-200 text-slate-500"}`}>
                      {icons.includes(option.id) ? "✓ " : ""}{option.label}
                    </button>)}
                  </div>
                  <label className="block text-xs font-bold text-slate-600">مكان الظهور</label>
                  <select value={position} onChange={(event) => updateIconPosition(audience, event.target.value as FloatingIconPosition)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                    <option value="bottom-left">أسفل اليسار</option><option value="bottom-right">أسفل اليمين</option>
                    <option value="middle-left">منتصف اليسار</option><option value="middle-right">منتصف اليمين</option>
                  </select>
                </div>;
              })}
            </div>
          </Panel>

          <Panel title="نصوص الصفحات العامة" icon={FileText}>
            <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-100 pb-4">
              {(Object.keys(settings.pages) as PublicPageId[]).map((pageId) => {
                const label = pageId === "home" ? "الرئيسية" : pageId === "participant" ? "بوابة المشارك" : pageId === "knowledge" ? "مركز المعرفة" : pageId === "about" ? "عن الأكاديمية" : pageId === "faq" ? "الأسئلة الشائعة" : pageId === "specialRequests" ? "الطلبات الخاصة" : "تفاصيل الفرصة";
                return (
                  <button
                    key={pageId}
                    type="button"
                    onClick={() => setActivePageTab(pageId)}
                    className={`rounded-xl px-4 py-2 text-sm font-bold transition ${activePageTab === pageId ? "bg-[#117b59] text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="العنوان الرئيسي (عربي)" value={settings.pages[activePageTab].titleAr} onChange={(v) => updatePage(activePageTab, "titleAr", v)} />
              <TextField label="Main Title (English)" value={settings.pages[activePageTab].titleEn} onChange={(v) => updatePage(activePageTab, "titleEn", v)} />
              <TextArea label="الوصف التقديمي (عربي)" value={settings.pages[activePageTab].descriptionAr} onChange={(v) => updatePage(activePageTab, "descriptionAr", v)} />
              <TextArea label="Intro Description (English)" value={settings.pages[activePageTab].descriptionEn} onChange={(v) => updatePage(activePageTab, "descriptionEn", v)} />
              <div className="md:col-span-2">
                <TextArea label="المحتوى التفصيلي (عربي)" value={settings.pages[activePageTab].contentAr || ""} onChange={(v) => updatePage(activePageTab, "contentAr", v)} />
              </div>
              <div className="md:col-span-2">
                <TextArea label="Detailed Content (English)" value={settings.pages[activePageTab].contentEn || ""} onChange={(v) => updatePage(activePageTab, "contentEn", v)} />
              </div>
            </div>
          </Panel>

          <Panel title="نصوص النماذج والبوابات" icon={SlidersHorizontal}>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="عنوان بوابة المشارك (عربي)" value={settings.participantTitle} onChange={(value) => update("participantTitle", value)} />
              <TextField label="Participant portal title (English)" value={settings.participantTitleEn} onChange={(value) => update("participantTitleEn", value)} />
              <TextField label="عنوان نموذج المنسق (عربي)" value={settings.coordinatorFormTitle} onChange={(value) => update("coordinatorFormTitle", value)} />
              <TextField label="Coordinator form title (English)" value={settings.coordinatorFormTitleEn} onChange={(value) => update("coordinatorFormTitleEn", value)} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <LanguageField label="لغة عناوين الفرص للمشترك" value={settings.participantTitleLanguage} onChange={(value) => update("participantTitleLanguage", value)} />
              <LanguageField label="لغة عناوين الفرص للمنسق" value={settings.coordinatorTitleLanguage} onChange={(value) => update("coordinatorTitleLanguage", value)} />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TextArea label="وصف بوابة المشارك (عربي)" value={settings.participantDescription} onChange={(value) => update("participantDescription", value)} />
              <TextArea label="Participant portal description (English)" value={settings.participantDescriptionEn} onChange={(value) => update("participantDescriptionEn", value)} />
              <TextArea label="وصف نموذج المنسق (عربي)" value={settings.coordinatorFormDescription} onChange={(value) => update("coordinatorFormDescription", value)} />
              <TextArea label="Coordinator form description (English)" value={settings.coordinatorFormDescriptionEn} onChange={(value) => update("coordinatorFormDescriptionEn", value)} />
            </div>
          </Panel>

          <Panel title="تحويل بيانات التسجيل وإعادة التوجيه (المشاركون والمنسقون)" icon={Send}>
            <p className="mb-4 text-xs leading-6 text-slate-500">
              تحكم بالكامل في ما يحدث بعد أن يُدخل المشارك أو المنسق بياناته: أين يتم تحويله (رقم واتساب، بريد إلكتروني، تيليجرام، ماسنجر، إنستجرام، أو رابط مخصص)، وما نص الرسالة المُرسلة تلقائياً.
            </p>

            <div className="mb-6 flex gap-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setActiveForwardTab("participant")}
                className={`rounded-xl px-5 py-2.5 text-sm font-black transition ${activeForwardTab === "participant" ? "bg-[#117b59] text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
              >
                بوابة المشاركين (الطلاب والأطباء)
              </button>
              <button
                type="button"
                onClick={() => setActiveForwardTab("coordinator")}
                className={`rounded-xl px-5 py-2.5 text-sm font-black transition ${activeForwardTab === "coordinator" ? "bg-[#117b59] text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}
              >
                بوابة المنسقين (تسجيل الطلاب)
              </button>
            </div>

            {activeForwardTab === "participant" ? (
              <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">طريقة التحويل للمشاركين</label>
                    <select
                      value={settings.brand.participantForwardType || "whatsapp"}
                      onChange={(e) => updateBrand("participantForwardType", e.target.value as ForwardingType)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 focus:border-[#117b59] focus:outline-none"
                    >
                      <option value="whatsapp">واتساب (إرسال رسالة إلى رقم محدد)</option>
                      <option value="whatsapp_direct_url">رابط واتساب مباشر أو مخصص</option>
                      <option value="email">بريد إلكتروني (إرسال إيميل تلقائي)</option>
                      <option value="telegram">تيليجرام (اسم مستخدم أو رابط)</option>
                      <option value="messenger">فيسبوك ماسنجر (رابط m.me)</option>
                      <option value="instagram">إنستجرام (حساب إنستجرام)</option>
                      <option value="custom_url">رابط مخصص (URL)</option>
                      <option value="none">بدون تحويل (حفظ في قاعدة البيانات فقط)</option>
                    </select>
                  </div>
                  <TextField
                    label={
                      settings.brand.participantForwardType === "email"
                        ? "البريد الإلكتروني لاستلام البيانات"
                        : settings.brand.participantForwardType === "telegram"
                        ? "معرف تيليجرام أو الرابط (@username)"
                        : settings.brand.participantForwardType === "messenger"
                        ? "معرف ماسنجر فيسبوك (أو الرابط)"
                        : settings.brand.participantForwardType === "instagram"
                        ? "حساب إنستجرام أو الرابط"
                        : settings.brand.participantForwardType === "custom_url"
                        ? "الرابط المخصص بالكامل"
                        : "رقم الواتساب المستهدف (مع رمز الدولة بدون +)"
                    }
                    value={settings.brand.participantForwardTarget || ""}
                    onChange={(v) => updateBrand("participantForwardTarget", v)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5">
                  <div>
                    <p className="text-sm font-bold text-slate-800">التوجيه التلقائي للمشارك</p>
                    <p className="text-xs text-slate-500">فتح نافذة التحويل تلقائياً بعد إتمام التسجيل فوراً</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBrand("participantAutoRedirect", !settings.brand.participantAutoRedirect)}
                    className={`rounded-xl px-4 py-2 text-xs font-black transition ${settings.brand.participantAutoRedirect ? "bg-[#117b59] text-white" : "bg-slate-200 text-slate-600"}`}
                  >
                    {settings.brand.participantAutoRedirect ? "مفعّل ✓" : "معطّل"}
                  </button>
                </div>

                <div>
                  <TextArea
                    label="قالب رسالة التحويل المخصصة للمشارك (اختياري - اتركه فارغاً لاستخدام النص الافتراضي)"
                    value={settings.brand.participantCustomMessage || ""}
                    onChange={(v) => updateBrand("participantCustomMessage", v)}
                  />
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    يمكنك استخدام المتغيرات التالية: <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-700">{"{name}"}</code> اسم المشارك، <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-700">{"{title}"}</code> عنوان الفرصة، <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-700">{"{specialty}"}</code> التخصص، <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-700">{"{email}"}</code> البريد، <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-700">{"{whatsapp}"}</code> الهاتف، <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-700">{"{affiliation}"}</code> جهة الانتساب.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">طريقة التحويل للمنسقين</label>
                    <select
                      value={settings.brand.coordinatorForwardType || "whatsapp"}
                      onChange={(e) => updateBrand("coordinatorForwardType", e.target.value as ForwardingType)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 focus:border-[#117b59] focus:outline-none"
                    >
                      <option value="whatsapp">واتساب (إرسال رسالة إلى رقم محدد)</option>
                      <option value="whatsapp_direct_url">رابط واتساب مباشر أو مخصص</option>
                      <option value="email">بريد إلكتروني (إرسال إيميل تلقائي)</option>
                      <option value="telegram">تيليجرام (اسم مستخدم أو رابط)</option>
                      <option value="messenger">فيسبوك ماسنجر (رابط m.me)</option>
                      <option value="instagram">إنستجرام (حساب إنستجرام)</option>
                      <option value="custom_url">رابط مخصص (URL)</option>
                      <option value="none">بدون تحويل (حفظ في قاعدة البيانات فقط)</option>
                    </select>
                  </div>
                  <TextField
                    label={
                      settings.brand.coordinatorForwardType === "email"
                        ? "البريد الإلكتروني لاستلام بيانات تسجيل المنسق"
                        : settings.brand.coordinatorForwardType === "telegram"
                        ? "معرف تيليجرام أو الرابط (@username)"
                        : settings.brand.coordinatorForwardType === "messenger"
                        ? "معرف ماسنجر فيسبوك"
                        : settings.brand.coordinatorForwardType === "instagram"
                        ? "حساب إنستجرام أو الرابط"
                        : settings.brand.coordinatorForwardType === "custom_url"
                        ? "الرابط المخصص بالكامل"
                        : "رقم الواتساب المستهدف لتسجيل المنسق"
                    }
                    value={settings.brand.coordinatorForwardTarget || ""}
                    onChange={(v) => updateBrand("coordinatorForwardTarget", v)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5">
                  <div>
                    <p className="text-sm font-bold text-slate-800">التوجيه التلقائي للمنسق</p>
                    <p className="text-xs text-slate-500">فتح نافذة التحويل تلقائياً بعد إضافة المنسق للطالب</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateBrand("coordinatorAutoRedirect", !settings.brand.coordinatorAutoRedirect)}
                    className={`rounded-xl px-4 py-2 text-xs font-black transition ${settings.brand.coordinatorAutoRedirect ? "bg-[#117b59] text-white" : "bg-slate-200 text-slate-600"}`}
                  >
                    {settings.brand.coordinatorAutoRedirect ? "مفعّل ✓" : "معطّل"}
                  </button>
                </div>

                <div>
                  <TextArea
                    label="قالب رسالة التحويل المخصصة لتسجيل المنسق (اختياري)"
                    value={settings.brand.coordinatorCustomMessage || ""}
                    onChange={(v) => updateBrand("coordinatorCustomMessage", v)}
                  />
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    يمكنك استخدام المتغيرات: <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-700">{"{name}"}</code>، <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-700">{"{title}"}</code>، <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-700">{"{specialty}"}</code>، <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-700">{"{email}"}</code>، <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-700">{"{whatsapp}"}</code>.
                  </p>
                </div>
              </div>
            )}
          </Panel>

          <Panel title="التخصصات المتاحة وروابط المجموعات" icon={SlidersHorizontal}>
            <p className="mb-5 text-sm leading-6 text-slate-500">
              أضف التخصصات ورابط مجموعة كل تخصص (قروب واتساب أو تيليجرام للتخصص). يُحفظ رابط المجموعة في قاعدة البيانات ويظهر للمشتركين عند التسجيل في بحوث هذا التخصص.
            </p>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.5fr_auto]">
              <TextField label="التخصص بالعربية" value={specialtyDraft.nameAr} onChange={(value) => setSpecialtyDraft({ ...specialtyDraft, nameAr: value })} />
              <TextField label="Specialty in English" value={specialtyDraft.nameEn} onChange={(value) => setSpecialtyDraft({ ...specialtyDraft, nameEn: value })} />
              <TextField label="رابط قروب التخصص (واتساب أو تيليجرام)" value={specialtyDraft.groupUrl} onChange={(value) => setSpecialtyDraft({ ...specialtyDraft, groupUrl: value })} />
              <button type="button" onClick={addSpecialty} className="mt-6 h-11 rounded-xl bg-[#117b59] px-4 text-sm font-black text-white transition hover:bg-[#0c6549]">إضافة تخصص</button>
            </div>
            <div className="mt-5 space-y-3">
              {settings.specialtyOptions.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">لم تُضف تخصصات بعد.</p>
              ) : (
                settings.specialtyOptions.map((option) => (
                  <div key={option.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800">{option.nameAr || option.nameEn}</p>
                          {option.nameAr && option.nameEn && <span className="text-xs text-slate-500" dir="ltr">({option.nameEn})</span>}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className="flex-1 min-w-[200px]">
                            <input
                              type="text"
                              value={option.groupUrl || ""}
                              placeholder="أدخل أو عدّل رابط قروب التخصص (مثال: https://chat.whatsapp.com/...)"
                              onChange={(e) => updateSpecialty(option.id, { groupUrl: e.target.value })}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#117b59]"
                              dir="ltr"
                            />
                          </div>
                          {option.groupUrl && (
                            <a
                              href={option.groupUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-200"
                            >
                              <ExternalLink size={12} /> تجربة الرابط
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => update("specialtyOptions", settings.specialtyOptions.filter((item) => item.id !== option.id))}
                        className="self-end rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 sm:self-center"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel title="المجلات والفهرسة العلمية" icon={SlidersHorizontal}>
            <p className="mb-5 text-sm leading-6 text-slate-500">أضف اسم المجلة ورقم ISSN وتصنيفها أو حالتها في PubMed وScopus وWeb of Science. ستظهر في نموذج الفرصة لتختارها وتُملأ بياناتها تلقائياً.</p>
            <div className="grid gap-3 md:grid-cols-2">
              <TextField label="اسم المجلة بالعربية" value={journalDraft.nameAr} onChange={(value) => setJournalDraft({ ...journalDraft, nameAr: value })} />
              <TextField label="Journal name in English" value={journalDraft.nameEn} onChange={(value) => setJournalDraft({ ...journalDraft, nameEn: value })} />
              <TextField label="ISSN / eISSN" value={journalDraft.issn} onChange={(value) => setJournalDraft({ ...journalDraft, issn: value })} />
              <TextField label="تصنيف PubMed" value={journalDraft.pubmed} onChange={(value) => setJournalDraft({ ...journalDraft, pubmed: value })} />
              <TextField label="تصنيف Scopus" value={journalDraft.scopus} onChange={(value) => setJournalDraft({ ...journalDraft, scopus: value })} />
              <TextField label="تصنيف Web of Science" value={journalDraft.wos} onChange={(value) => setJournalDraft({ ...journalDraft, wos: value })} />
            </div>
            <button type="button" onClick={addJournal} className="mt-4 rounded-xl bg-[#117b59] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0c6549]">إضافة مجلة</button>
            <div className="mt-5 space-y-3">
              {settings.journalOptions.length === 0 ? <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">لم تُضف مجلات بعد.</p> : settings.journalOptions.map((journal) => (
                <div key={journal.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-black text-slate-800">{journal.nameAr || journal.nameEn}</p>{journal.nameAr && journal.nameEn && <p className="mt-1 text-xs text-slate-500" dir="ltr">{journal.nameEn}</p>}</div>
                    <button type="button" onClick={() => update("journalOptions", settings.journalOptions.filter((item) => item.id !== journal.id))} className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100">حذف</button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                    {journal.issn && <span className="rounded-lg bg-white px-2 py-1">ISSN: {journal.issn}</span>}
                    {journal.pubmed && <span className="rounded-lg bg-white px-2 py-1">PubMed: {journal.pubmed}</span>}
                    {journal.scopus && <span className="rounded-lg bg-white px-2 py-1">Scopus: {journal.scopus}</span>}
                    {journal.wos && <span className="rounded-lg bg-white px-2 py-1">WOS: {journal.wos}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="حقول التسجيل" icon={SlidersHorizontal}>
            <p className="mb-5 text-sm leading-6 text-slate-500">يمكنك تغيير التسمية والنص المساعد واللون، وتحديد ظهور الحقل وإلزاميته بشكل مستقل للمشترك والمنسق. الأسهم تغيّر ترتيب الحقول في النموذج.</p>
            <div className="space-y-4">
              {settings.registrationFields.map((field, index) => (
                <article key={field.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: field.color }} />
                       <h3 className="font-black text-slate-800">{field.label || field.labelEn || field.id}</h3>
                      <span className="rounded-lg bg-white px-2 py-1 text-[11px] font-bold text-slate-400">{field.type}</span>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => moveField(index, -1)} disabled={index === 0} className="rounded-lg p-2 text-slate-500 hover:bg-white disabled:opacity-30" aria-label="نقل للأعلى"><ChevronUp size={17} /></button>
                      <button type="button" onClick={() => moveField(index, 1)} disabled={index === settings.registrationFields.length - 1} className="rounded-lg p-2 text-slate-500 hover:bg-white disabled:opacity-30" aria-label="نقل للأسفل"><ChevronDown size={17} /></button>
                    </div>
                  </div>
                   <div className="mt-4 grid gap-3 md:grid-cols-2">
                     <TextField label="اسم الحقل (عربي)" value={field.label} onChange={(value) => updateField(index, { label: value })} />
                     <TextField label="Field label (English)" value={field.labelEn} onChange={(value) => updateField(index, { labelEn: value })} />
                     <TextField label="النص المساعد (عربي)" value={field.placeholder} onChange={(value) => updateField(index, { placeholder: value })} />
                     <TextField label="Placeholder (English)" value={field.placeholderEn} onChange={(value) => updateField(index, { placeholderEn: value })} />
                    <div><label className="mb-2 block text-xs font-bold text-slate-500">اللون</label><input type="color" value={field.color} onChange={(event) => updateField(index, { color: event.target.value })} className="h-11 w-full rounded-xl border border-slate-200 bg-white p-1" /></div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <AudienceToggle label="إظهار للمشترك" active={field.showParticipant} onClick={() => updateField(index, { showParticipant: !field.showParticipant })} />
                    <AudienceToggle label="إلزامي للمشترك" active={field.requiredParticipant} onClick={() => updateField(index, { requiredParticipant: !field.requiredParticipant })} />
                    <AudienceToggle label="إظهار للمنسق" active={field.showCoordinator} onClick={() => updateField(index, { showCoordinator: !field.showCoordinator })} />
                    <AudienceToggle label="إلزامي للمنسق" active={field.requiredCoordinator} onClick={() => updateField(index, { requiredCoordinator: !field.requiredCoordinator })} />
                  </div>
                </article>
              ))}
            </div>
          </Panel>
          <Panel title="حقول إضافة وتعديل الفرص" icon={SlidersHorizontal}>
            <p className="mb-5 text-sm leading-6 text-slate-500">حدّد الحقول التي تريد إلزام المالك بإدخالها عند إضافة أو تعديل فرصة. جميعها اختيارية حالياً.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {OPPORTUNITY_FIELDS.map((field) => {
                const required = settings.requiredOpportunityFields.includes(field.id);
                return <AudienceToggle key={field.id} label={required ? `${field.label} — إلزامي` : `${field.label} — اختياري`} active={required} onClick={() => toggleOpportunityFieldRequired(field.id)} />;
              })}
            </div>
          </Panel>
        </div>

        <div className="space-y-6 xl:col-span-4">
          <Panel title="ألوان الواجهة" icon={Palette}>
            <div className="space-y-4">
              <ColorField label="اللون الرئيسي" value={settings.primaryColor} onChange={(value) => update("primaryColor", value)} />
              <ColorField label="لون الإجراءات" value={settings.accentColor} onChange={(value) => update("accentColor", value)} />
              <ColorField label="خلفية البطاقة" value={settings.cardBackgroundColor} onChange={(value) => update("cardBackgroundColor", value)} />
            </div>
          </Panel>
           <Panel title="عرض الفرص حسب التخصص" icon={SlidersHorizontal}>
             <p className="mb-4 text-xs leading-5 text-slate-500">ينطبق هذا الاختيار على بوابة المشارك ولوحة المنسق بعد تسجيل الدخول.</p>
             <label className="mb-2 block text-xs font-bold text-slate-500">طريقة عرض فرص كل تخصص</label>
             <select
               data-testid="select-opportunity-display-mode"
               value={settings.opportunityDisplayMode}
               onChange={(event) => update("opportunityDisplayMode", event.target.value as OpportunityDisplayMode)}
               className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none focus:border-[#117b59]"
             >
               <option value="grid">بطاقات متجاورة (شبكة)</option>
               <option value="scroll">شريط تمرير أفقي</option>
             </select>
           </Panel>
          <CardParts title="بطاقة المشارك" audience="participant" settings={settings} onToggle={togglePart} onMove={movePart} />
          <CardParts title="بطاقة المنسق" audience="coordinator" settings={settings} onToggle={togglePart} onMove={movePart} />
        </div>
      </div>
    </section>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Palette; children: React.ReactNode }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-6 flex items-center gap-3"><div className="rounded-2xl bg-[#e6f5ef] p-3 text-[#117b59]"><Icon size={21} /></div><h2 className="text-lg font-black text-slate-800">{title}</h2></div>{children}</div>;
}
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="mb-2 block text-xs font-bold text-slate-500">{label}</label><input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-[#117b59]" /></div>;
}
function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="mb-2 block text-xs font-bold text-slate-500">{label}</label><textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium outline-none focus:border-[#117b59]" /></div>;
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"><label className="text-sm font-bold text-slate-700">{label}</label><div className="flex items-center gap-2"><span className="font-mono text-xs text-slate-500">{value}</span><input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-10 rounded-lg border border-slate-200 bg-white p-1" /></div></div>;
}
function LanguageField({ label, value, onChange }: { label: string; value: "arabic" | "english" | "both"; onChange: (value: "arabic" | "english" | "both") => void }) {
  return <div><label className="mb-2 block text-xs font-bold text-slate-500">{label}</label><select value={value} onChange={(event) => onChange(event.target.value as "arabic" | "english" | "both")} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-bold outline-none focus:border-[#117b59]"><option value="arabic">العربية</option><option value="english">الإنجليزية</option><option value="both">العربية والإنجليزية</option></select></div>;
}
function AudienceToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-bold transition ${active ? "border-emerald-200 bg-[#e6f5ef] text-[#117b59]" : "border-slate-200 bg-white text-slate-500"}`}><span>{label}</span>{active ? <Eye size={16} /> : <EyeOff size={16} />}</button>;
}
function CardParts({ title, audience, settings, onToggle, onMove }: { title: string; audience: "participant" | "coordinator"; settings: SiteContentSettings; onToggle: (audience: "participant" | "coordinator", part: string) => void; onMove: (audience: "participant" | "coordinator", index: number, direction: -1 | 1) => void }) {
  const order = audience === "participant" ? settings.participantCardOrder : settings.coordinatorCardOrder;
  const visible = audience === "participant" ? settings.visibleParticipantCardParts : settings.visibleCoordinatorCardParts;
  return <Panel title={title} icon={SlidersHorizontal}><p className="mb-3 text-xs leading-5 text-slate-500">غيّر ما يظهر وترتيبه داخل البطاقة.</p><div className="space-y-2">{order.map((part, index) => { const label = CARD_PARTS.find((item) => item.id === part)?.label || part; const active = visible.includes(part); return <div key={part} className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-2"><button type="button" onClick={() => onToggle(audience, part)} className={`flex flex-1 items-center gap-2 px-2 text-sm font-bold ${active ? "text-[#117b59]" : "text-slate-400"}`}>{active ? <Eye size={15} /> : <EyeOff size={15} />}{label}</button><button type="button" onClick={() => onMove(audience, index, -1)} disabled={index === 0} className="p-1 text-slate-400 disabled:opacity-30"><ChevronUp size={15} /></button><button type="button" onClick={() => onMove(audience, index, 1)} disabled={index === order.length - 1} className="p-1 text-slate-400 disabled:opacity-30"><ChevronDown size={15} /></button></div>; })}</div></Panel>;
}