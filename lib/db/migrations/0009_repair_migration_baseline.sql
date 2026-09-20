CREATE TABLE IF NOT EXISTS "registrations" (
  "id" serial PRIMARY KEY NOT NULL,
  "full_name" text NOT NULL,
  "specialization" text NOT NULL,
  "email" text NOT NULL,
  "whatsapp" text NOT NULL,
  "affiliation" text NOT NULL,
  "country" text DEFAULT 'المملكة العربية السعودية' NOT NULL,
  "city" text DEFAULT '',
  "orcid" text DEFAULT '',
  "custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "research_id" integer NOT NULL,
  "research_title" text NOT NULL,
  "author_role" text DEFAULT 'co_author' NOT NULL,
  "coordinator_id" integer,
  "status" text DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "registrations_coordinator_id_idx"
  ON "registrations" USING btree ("coordinator_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "service_requests" (
  "id" serial PRIMARY KEY NOT NULL,
  "full_name" text NOT NULL,
  "phone" text NOT NULL,
  "email" text NOT NULL,
  "service_type" text NOT NULL,
  "details" text NOT NULL,
  "file_link" text DEFAULT '',
  "status" text DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "coordinators" (
  "id" serial PRIMARY KEY NOT NULL,
  "full_name" text NOT NULL,
  "phone" text NOT NULL,
  "email" text NOT NULL,
  "affiliation" text NOT NULL,
  "access_code_hash" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "last_login_at" timestamp,
  CONSTRAINT "coordinators_access_code_hash_unique" UNIQUE("access_code_hash")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "coordinators_access_code_hash_unique"
  ON "coordinators" USING btree ("access_code_hash");
--> statement-breakpoint
ALTER TABLE "registrations"
  ADD COLUMN IF NOT EXISTS "coordinator_id" integer;
--> statement-breakpoint
ALTER TABLE "registrations"
  ADD COLUMN IF NOT EXISTS "custom_fields" jsonb DEFAULT '{}'::jsonb NOT NULL;
--> statement-breakpoint
ALTER TABLE "registrations"
  ADD COLUMN IF NOT EXISTS "author_role" text DEFAULT 'co_author' NOT NULL;
--> statement-breakpoint
ALTER TABLE "research_programs"
  ADD COLUMN IF NOT EXISTS "image_path" text DEFAULT '' NOT NULL;