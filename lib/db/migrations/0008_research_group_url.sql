ALTER TABLE "research_programs"
ADD COLUMN IF NOT EXISTS "research_group_url" text DEFAULT '' NOT NULL;