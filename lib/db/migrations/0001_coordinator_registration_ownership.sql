ALTER TABLE "registrations" ADD COLUMN IF NOT EXISTS "coordinator_id" integer;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "registrations_coordinator_id_idx" ON "registrations" USING btree ("coordinator_id");