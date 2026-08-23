CREATE TABLE IF NOT EXISTS "owner_accounts" (
  "id" serial PRIMARY KEY NOT NULL,
  "clerk_user_id" text,
  "email" text NOT NULL,
  "full_name" text NOT NULL,
  "phone" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "owner_accounts_clerk_user_id_unique" UNIQUE("clerk_user_id"),
  CONSTRAINT "owner_accounts_email_unique" UNIQUE("email")
);