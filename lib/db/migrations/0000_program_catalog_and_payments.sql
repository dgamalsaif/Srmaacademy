CREATE TABLE IF NOT EXISTS "research_programs" (
  "id" serial PRIMARY KEY NOT NULL,
  "category" text DEFAULT 'active' NOT NULL,
  "title_ar" text NOT NULL,
  "title_en" text NOT NULL,
  "specialty_ar" text NOT NULL,
  "specialty_en" text NOT NULL,
  "description_ar" text NOT NULL,
  "description_en" text DEFAULT '' NOT NULL,
  "seats_left" integer DEFAULT 0 NOT NULL,
  "total_seats" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'open' NOT NULL,
  "journal_target" text DEFAULT '' NOT NULL,
  "indexed_in" text DEFAULT '' NOT NULL,
  "benefits" text DEFAULT '' NOT NULL,
  "duration" text DEFAULT '' NOT NULL,
  "supervisor" text DEFAULT '' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "program_catalog_bootstrap" (
  "key" text PRIMARY KEY NOT NULL,
  "initialized_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_records" (
  "id" serial PRIMARY KEY NOT NULL,
  "registration_id" integer,
  "student_name" text NOT NULL,
  "program_title" text DEFAULT '' NOT NULL,
  "amount" integer DEFAULT 0 NOT NULL,
  "currency" text DEFAULT 'SAR' NOT NULL,
  "status" text DEFAULT 'due' NOT NULL,
  "due_date" text DEFAULT '' NOT NULL,
  "paid_at" timestamp,
  "notes" text DEFAULT '' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);