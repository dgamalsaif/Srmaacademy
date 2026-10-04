-- Add only the missing registration-answer columns; preserve existing records.
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "academic_degree" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "has_research_experience" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "research_experience_details" text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "agreed_to_fee_and_tasks" text DEFAULT '' NOT NULL;
--> statement-breakpoint
-- Recover answers already saved in JSON, without replacing nonempty answers.
UPDATE "registrations"
SET
  "academic_degree" = COALESCE(NULLIF("academic_degree", ''), "custom_fields"->>'academicDegree', ''),
  "has_research_experience" = COALESCE(NULLIF("has_research_experience", ''),
    "custom_fields"->>'hasResearchExperience', "custom_fields"->>'hasResearchExp', ''),
  "research_experience_details" = COALESCE(NULLIF("research_experience_details", ''),
    "custom_fields"->>'researchExperienceDetails', "custom_fields"->>'researchExpDetails', ''),
  "agreed_to_fee_and_tasks" = COALESCE(NULLIF("agreed_to_fee_and_tasks", ''),
    "custom_fields"->>'agreedToFeeAndTasks', "custom_fields"->>'agreeFeesAndTasks', '')
WHERE "academic_degree" IS NULL OR "has_research_experience" IS NULL
  OR "research_experience_details" IS NULL OR "agreed_to_fee_and_tasks" IS NULL
  OR "custom_fields" ?| ARRAY['academicDegree', 'hasResearchExperience',
    'hasResearchExp', 'researchExperienceDetails', 'researchExpDetails',
    'agreedToFeeAndTasks', 'agreeFeesAndTasks'];
--> statement-breakpoint
ALTER TABLE "registrations"
  ALTER COLUMN "academic_degree" SET DEFAULT '', ALTER COLUMN "academic_degree" SET NOT NULL,
  ALTER COLUMN "has_research_experience" SET DEFAULT '', ALTER COLUMN "has_research_experience" SET NOT NULL,
  ALTER COLUMN "research_experience_details" SET DEFAULT '', ALTER COLUMN "research_experience_details" SET NOT NULL,
  ALTER COLUMN "agreed_to_fee_and_tasks" SET DEFAULT '', ALTER COLUMN "agreed_to_fee_and_tasks" SET NOT NULL;