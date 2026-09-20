import { ChevronDown, ChevronUp, Eye, EyeOff, Palette, Save, SlidersHorizontal, Image, Phone, Mail, Link as LinkIcon, FileText } from "lucide-react";
import { useState } from "react";
import { CARD_PARTS, OPPORTUNITY_FIELDS, OpportunityDisplayMode, OpportunityFieldId, RegistrationFieldSetting, SiteContentSettings, SpecialtyOption, JournalOption, PublicPageId, BrandContactSettings, PublicPageContent, SOCIAL_ICON_OPTIONS, SocialIconId, FloatingIconPosition } from "@/lib/siteContentSettings";

interface Props {
  settings: SiteContentSettings;
  onChange: (settings: SiteContentSettings) => void;
  onSave: () => void;
  saving: boolean;
  message: string;
}

export default function ContentControlPanel({ settings, onChange, onSave, saving, message }: Props) {
  const [specialtyDraft, setSpecialtyDraft] = useState({ nameAr: "", nameEn: "" });
  const [journalDraft, setJournalDraft] = useState({ nameAr: "", nameEn: "", issn: "", pubmed: "", scopus: "", wos: "" });
  const [activePageTab, setActivePageTab] = useState<PublicPageId>("home");
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
  const updateBrand = (key: keyof BrandContactSettings, value: string) => {
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
    const option: SpecialtyOption = { id: `specialty-${Date.now()}`, nameAr: specialtyDraft.nameAr.trim(), nameEn: specialtyDraft.nameEn.trim() };
    update("specialtyOptions", [...settings.specialtyOptions, option]);
    setSpecialtyDraft({ nameAr: "", nameEn: "" });
  };
  const addJournal = () => {
    if (!journalDraft.nameAr.trim() && !journalDraft.nameEn.trim()) return;
    const option: JournalOption = { id: `journal-${Date.now()}`, nameAr: journalDraft.nameAr.trim(), nameEn: journalDraft.nameEn.trim(), issn: journalDraft.issn.trim(), pubmed: journalDraft.pubmed.trim(), scopus: journalDraft.scopus.trim(), wos: journalDraft.wos.trim() };
    update("journalOptions", [...settings.journalOptions, option]);
    setJournalDraft({ nameAr: "", nameEn: "", issn: "", pubmed: "", scopus: "", wos: "" });
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

          <Panel title="التخصصات المتاحة" icon={SlidersHorizontal}>
            <p className="mb-5 text-sm leading-6 text-slate-500">أضف التخصصات التي تريد أن تظهر في نموذج الفرصة. يمكنك إدخال الاسم بالعربية أو الإنجليزية أو كليهما.</p>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <TextField label="التخصص بالعربية" value={specialtyDraft.nameAr} onChange={(value) => setSpecialtyDraft({ ...specialtyDraft, nameAr: value })} />
              <TextField label="Specialty in English" value={specialtyDraft.nameEn} onChange={(value) => setSpecialtyDraft({ ...specialtyDraft, nameEn: value })} />
              <button type="button" onClick={addSpecialty} className="mt-6 h-11 rounded-xl bg-[#117b59] px-4 text-sm font-black text-white transition hover:bg-[#0c6549]">إضافة تخصص</button>
            </div>
            <div className="mt-5 space-y-2">
              {settings.specialtyOptions.length === 0 ? <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">لم تُضف تخصصات بعد.</p> : settings.specialtyOptions.map((option) => (
                <div key={option.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div><p className="font-bold text-slate-800">{option.nameAr || option.nameEn}</p>{option.nameAr && option.nameEn && <p className="mt-1 text-xs text-slate-500" dir="ltr">{option.nameEn}</p>}</div>
                  <button type="button" onClick={() => update("specialtyOptions", settings.specialtyOptions.filter((item) => item.id !== option.id))} className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">حذف</button>
                </div>
              ))}
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