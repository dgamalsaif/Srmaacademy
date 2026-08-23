ALTER TABLE "research_programs" ADD COLUMN IF NOT EXISTS "journal_issn" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "research_programs" ADD COLUMN IF NOT EXISTS "journal_pubmed" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "research_programs" ADD COLUMN IF NOT EXISTS "journal_scopus" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "research_programs" ADD COLUMN IF NOT EXISTS "journal_wos" text DEFAULT '' NOT NULL;