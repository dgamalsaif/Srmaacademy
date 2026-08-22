import nodemailer from "nodemailer";
import { logger } from "./logger";

const NOTIFY_EMAIL = "170610009@su.edu.ye";
const FROM_EMAIL = process.env["SMTP_FROM"] || "noreply@srma-research-academy.com";

function createTransport() {
  if (process.env["SMTP_HOST"]) {
    return nodemailer.createTransport({
      host: process.env["SMTP_HOST"],
      port: Number(process.env["SMTP_PORT"] || 587),
      secure: process.env["SMTP_SECURE"] === "true",
      auth: {
        user: process.env["SMTP_USER"],
        pass: process.env["SMTP_PASS"],
      },
    });
  }
  return null;
}

export async function sendRegistrationEmail(data: {
  fullName: string;
  specialization: string;
  email: string;
  whatsapp: string;
  affiliation: string;
  country: string;
  city: string;
  orcid: string;
  researchTitle: string;
}) {
  const transport = createTransport();
  if (!transport) {
    logger.info("SMTP not configured — skipping email notification");
    return;
  }

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0C3156; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin:0;">🔬 تسجيل جديد في فرصة بحثية — SRMA Research Academy</h2>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:8px; font-weight:bold; color:#0C3156;">الاسم الكامل:</td><td style="padding:8px;">${data.fullName}</td></tr>
          <tr style="background:#fff;"><td style="padding:8px; font-weight:bold; color:#0C3156;">التخصص:</td><td style="padding:8px;">${data.specialization}</td></tr>
          <tr><td style="padding:8px; font-weight:bold; color:#0C3156;">البريد الإلكتروني:</td><td style="padding:8px;">${data.email}</td></tr>
          <tr style="background:#fff;"><td style="padding:8px; font-weight:bold; color:#0C3156;">واتساب:</td><td style="padding:8px;">${data.whatsapp}</td></tr>
          <tr><td style="padding:8px; font-weight:bold; color:#0C3156;">جهة الانتساب:</td><td style="padding:8px;">${data.affiliation}</td></tr>
          <tr style="background:#fff;"><td style="padding:8px; font-weight:bold; color:#0C3156;">الدولة / المدينة:</td><td style="padding:8px;">${data.country} — ${data.city || "—"}</td></tr>
          <tr><td style="padding:8px; font-weight:bold; color:#0C3156;">ORCID:</td><td style="padding:8px;">${data.orcid || "—"}</td></tr>
          <tr style="background:#fff;"><td style="padding:8px; font-weight:bold; color:#0C3156;">الفرصة البحثية:</td><td style="padding:8px;">${data.researchTitle}</td></tr>
        </table>
        <div style="margin-top:16px; padding:12px; background:#EFF6FF; border-radius:6px; font-size:12px; color:#64748b;">
          تم الإرسال تلقائياً من منصة SRMA Research Academy
        </div>
      </div>
    </div>
  `;

  try {
    await transport.sendMail({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: `[SRMA Research Academy] تسجيل جديد — ${data.fullName} — ${data.researchTitle.substring(0, 50)}`,
      html,
    });
    logger.info({ to: NOTIFY_EMAIL }, "Registration email sent");
  } catch (err) {
    logger.warn({ err }, "Failed to send registration email");
  }
}

export async function sendServiceRequestEmail(data: {
  fullName: string;
  phone: string;
  email: string;
  serviceType: string;
  details: string;
  fileLink: string;
}) {
  const transport = createTransport();
  if (!transport) {
    logger.info("SMTP not configured — skipping service request email");
    return;
  }

  const html = `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #E9A020; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="margin:0;">📤 طلب خدمة جديد — SRMA Research Academy</h2>
      </div>
      <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
        <table style="width:100%; border-collapse:collapse;">
          <tr><td style="padding:8px; font-weight:bold; color:#0C3156;">الاسم الكامل:</td><td style="padding:8px;">${data.fullName}</td></tr>
          <tr style="background:#fff;"><td style="padding:8px; font-weight:bold; color:#0C3156;">الجوال:</td><td style="padding:8px;">${data.phone}</td></tr>
          <tr><td style="padding:8px; font-weight:bold; color:#0C3156;">البريد الإلكتروني:</td><td style="padding:8px;">${data.email}</td></tr>
          <tr style="background:#fff;"><td style="padding:8px; font-weight:bold; color:#0C3156;">نوع الخدمة:</td><td style="padding:8px;">${data.serviceType}</td></tr>
          <tr><td style="padding:8px; font-weight:bold; color:#0C3156;">تفاصيل الطلب:</td><td style="padding:8px;">${data.details}</td></tr>
          <tr style="background:#fff;"><td style="padding:8px; font-weight:bold; color:#0C3156;">رابط الملفات:</td><td style="padding:8px;">${data.fileLink || "—"}</td></tr>
        </table>
      </div>
    </div>
  `;

  try {
    await transport.sendMail({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      subject: `[SRMA Research Academy] طلب خدمة — ${data.serviceType} — ${data.fullName}`,
      html,
    });
    logger.info({ to: NOTIFY_EMAIL }, "Service request email sent");
  } catch (err) {
    logger.warn({ err }, "Failed to send service request email");
  }
}
