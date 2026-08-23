import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * The one or more people explicitly permitted to administer SRMA.
 * Passwords and second-factor secrets are deliberately managed by Clerk and
 * never stored in this table.
 */
export const ownerAccountsTable = pgTable("owner_accounts", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").unique(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOwnerAccountSchema = createInsertSchema(ownerAccountsTable).omit({
  id: true,
  clerkUserId: true,
  createdAt: true,
  updatedAt: true,
});

export type OwnerAccount = typeof ownerAccountsTable.$inferSelect;
export type InsertOwnerAccount = z.infer<typeof insertOwnerAccountSchema>;