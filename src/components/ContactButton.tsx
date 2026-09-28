import React from 'react';

type Props = {
  className?: string;
  label?: string; // نص الزر، افتراضي: "تواصل معنا"
  link?: string; // رابط مخصص يتجاوز متغيّرات البيئة (مثلاً mailto:... أو https://wa.me/...)
  whatsappText?: string; // نص تحية اختياري لواتساب
};

function buildFromEnv() {
  const type = (process.env.NEXT_PUBLIC_CONTACT_TYPE || 'email').toLowerCase();
  const value = process.env.NEXT_PUBLIC_CONTACT_VALUE || '';
  switch (type) {
    case 'email':
      return `mailto:${value}`;
    case 'whatsapp': {
      const raw = value.trim();
      if (!raw) return '';
      // إذا تم تمرير رابط كامل نعيده كما هو
      if (raw.startsWith('http')) return raw;
      const phone = raw.replace(/[^\d+]/g, '');
      return `https://wa.me/${phone}`;
    }
    case 'telegram': {
      const raw = value.trim();
      if (!raw) return '';
      if (raw.startsWith('http')) return raw;
      const username = raw.replace(/^@/, '');
      return `https://t.me/${username}`;
    }
    default:
      return value;
  }
}

export default function ContactButton({ className = '', label = 'تواصل معنا', link, whatsappText }: Props) {
  const envLink = buildFromEnv();
  let href = link || envLink || '#';

  // دعم إضافة نص في رابط واتساب
  if (whatsappText && href.includes('wa.me') && !href.includes('text=')) {
    const encoded = encodeURIComponent(whatsappText);
    href = href.includes('?') ? `${href}&text=${encoded}` : `${href}?text=${encoded}`;
  }

  const isMail = href.startsWith('mailto:');
  const target = isMail ? undefined : '_blank';

  // إذا لم يوجد رابط فعّال نعيد null (لا نعرض الزر)
  if (!href || href === '#') return null;

  return (
    <a
      href={href}
      className={className || 'contact-button'}
      {...(target ? { target, rel: 'noopener noreferrer' } : {})}
    >
      {label}
    </a>
  );
}
