# Contact Button (مثال)

تمت إضافة مكوّن React قابل لإعادة الاستخدام باسم `ContactButton` في `src/components/ContactButton.tsx`.

الغ��ض
- عرض زر "تواصل معنا" يمكن أن يشير إلى بريد إلكتروني (mailto:)، واتساب، أو تيليجرام.
- جعل الرابط سهل التحكم عبر متغيّرات البيئة للواجهة الأمامية.

كيفية الاستخدام
1. ضع قيم المتغيّرات في `.env.local` أو إعدادات الاستضافة:

```
# Email example
NEXT_PUBLIC_CONTACT_TYPE=email
NEXT_PUBLIC_CONTACT_VALUE=hello@example.com

# WhatsApp example (number with country code)
NEXT_PUBLIC_CONTACT_TYPE=whatsapp
NEXT_PUBLIC_CONTACT_VALUE=+201234567890

# Telegram example (username with or without @)
NEXT_PUBLIC_CONTACT_TYPE=telegram
NEXT_PUBLIC_CONTACT_VALUE=@yourusername
```

2. استورد واستخدم المكوّن داخل بطاقة الفرصة أو أي مكان تريده:

```tsx
import ContactButton from '../components/ContactButton';

function OpportunityActions({ opportunity }) {
  return (
    <div className="opportunity-actions">
      <a className="register-btn" href={opportunity.registerUrl}>سجل الآن</a>

      {/* زر التواصل العام (من متغيّرات البيئة) */}
      <ContactButton className="contact-btn ml-2" />

      {/* أو تجاوز بالرابط الخاص بهذه الفرصة */}
      {/* <ContactButton className="contact-btn" link={`mailto:${opportunity.contactEmail}`} /> */}
    </div>
  );
}
```

ملاحظات
- يستخدم المكوّن متغيّرات تبدأ بـ `NEXT_PUBLIC_` لتكون متاحة في الكود العميل (Next.js). لو كان مشروعك لا يستخدم Next.js عدّل طريقة قراءة متغيّرات البيئة وفقًا للإطار.
- المكوّن يعيد null (لا يعرض الزر) إن لم يكن هناك رابط فعّال.
