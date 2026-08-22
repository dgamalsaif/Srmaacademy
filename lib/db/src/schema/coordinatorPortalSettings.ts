import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coordinatorPortalSettingsTable = pgTable("coordinator_portal_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCoordinatorPortalSettingsSchema = createInsertSchema(coordinatorPortalSettingsTable);
export type InsertCoordinatorPortalSettings = z.infer<typeof insertCoordinatorPortalSettingsSchema>;
export type CoordinatorPortalSettingsRecord = typeof coordinatorPortalSettingsTable.$inferSelect;