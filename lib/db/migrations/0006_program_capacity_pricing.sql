ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "author_role" text DEFAULT 'co_author' NOT NULL;
--> statement-breakpoint
ALTER TABLE "research_programs" ADD COLUMN IF NOT EXISTS "first_author_seats" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "research_programs" ADD COLUMN IF NOT EXISTS "first_author_seats_left" integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE "research_programs" ADD COLUMN IF NOT EXISTS "co_author_seats" integer DEFAULT 14 NOT NULL;
--> statement-breakpoint
ALTER TABLE "research_programs" ADD COLUMN IF NOT EXISTS "co_author_seats_left" integer DEFAULT 14 NOT NULL;
--> statement-breakpoint
ALTER TABLE "research_programs" ADD COLUMN IF NOT EXISTS "price_original_sar" integer DEFAULT 1500 NOT NULL;
--> statement-breakpoint
ALTER TABLE "research_programs" ADD COLUMN IF NOT EXISTS "price_discounted_sar" integer DEFAULT 1000 NOT NULL;