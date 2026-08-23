import { pgTable, serial, text, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  specialization: text("specialization").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  affiliation: text("affiliation").notNull(),
  country: text("country").notNull().default("المملكة العربية السعودية"),
  city: text("city").default(""),
  orcid: text("orcid").default(""),
  customFields: jsonb("custom_fields").$type<Record<string, string>>().notNull().default({}),
  researchId: integer("research_id").notNull(),
  researchTitle: text("research_title").notNull(),
  coordinatorId: integer("coordinator_id"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("registrations_coordinator_id_idx").on(table.coordinatorId),
]);

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  id: true,
  createdAt: true,
  status: true,
  researchTitle: true,
  coordinatorId: true,
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;

export const serviceRequestsTable = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  serviceType: text("service_type").notNull(),
  details: text("details").notNull(),
  fileLink: text("file_link").default(""),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const coordinatorsTable = pgTable("coordinators", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  affiliation: text("affiliation").notNull(),
  accessCodeHash: text("access_code_hash").notNull().unique(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export type Coordinator = typeof coordinatorsTable.$inferSelect;

export const insertServiceRequestSchema = createInsertSchema(serviceRequestsTable).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequestsTable.$inferSelect;

export const researchProgramsTable = pgTable("research_programs", {
  id: serial("id").primaryKey(),
  category: text("category").notNull().default("active"),
  titleAr: text("title_ar").notNull().default(""),
  titleEn: text("title_en").notNull().default(""),
  specialtyAr: text("specialty_ar").notNull().default(""),
  specialtyEn: text("specialty_en").notNull().default(""),
  descriptionAr: text("description_ar").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  seatsLeft: integer("seats_left").notNull().default(0),
  totalSeats: integer("total_seats").notNull().default(0),
  status: text("status").notNull().default("open"),
  journalTarget: text("journal_target").notNull().default(""),
  journalIssn: text("journal_issn").notNull().default(""),
  journalPubmed: text("journal_pubmed").notNull().default(""),
  journalScopus: text("journal_scopus").notNull().default(""),
  journalWos: text("journal_wos").notNull().default(""),
  indexedIn: text("indexed_in").notNull().default(""),
  benefits: text("benefits").notNull().default(""),
  duration: text("duration").notNull().default(""),
  supervisor: text("supervisor").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const programCatalogBootstrapTable = pgTable("program_catalog_bootstrap", {
  key: text("key").primaryKey(),
  initializedAt: timestamp("initialized_at").notNull().defaultNow(),
});

export const insertResearchProgramSchema = createInsertSchema(researchProgramsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertResearchProgram = z.infer<typeof insertResearchProgramSchema>;
export type ResearchProgram = typeof researchProgramsTable.$inferSelect;

export const paymentRecordsTable = pgTable("payment_records", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id"),
  studentName: text("student_name").notNull(),
  programTitle: text("program_title").notNull().default(""),
  amount: integer("amount").notNull().default(0),
  currency: text("currency").notNull().default("SAR"),
  status: text("status").notNull().default("due"),
  dueDate: text("due_date").notNull().default(""),
  paidAt: timestamp("paid_at"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPaymentRecordSchema = createInsertSchema(paymentRecordsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PaymentRecord = typeof paymentRecordsTable.$inferSelect;
