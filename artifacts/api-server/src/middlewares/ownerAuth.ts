import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { db, ownerAccountsTable, type OwnerAccount } from "@workspace/db";
import { eq } from "drizzle-orm";

export type OwnerContext = Pick<OwnerAccount, "id" | "email" | "fullName" | "phone" | "status"> & {
  clerkUserId: string;
};

async function bootstrapInitialOwner(
  email: string,
  clerkUserId: string,
  clerkFullName: string | null,
): Promise<OwnerAccount | null> {
  const configuredEmail = process.env.OWNER_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  if (!configuredEmail || email !== configuredEmail) return null;

  const [existingOwner] = await db.select().from(ownerAccountsTable).where(eq(ownerAccountsTable.email, email)).limit(1);
  if (existingOwner) return existingOwner;

  const [anyOwner] = await db.select({ id: ownerAccountsTable.id }).from(ownerAccountsTable).limit(1);
  if (anyOwner) return null;

  const [createdOwner] = await db.insert(ownerAccountsTable)
    .values({
      email,
      clerkUserId,
      fullName: clerkFullName?.trim() || "مالك منصة SRMA",
      phone: "",
      status: "active",
    })
    .onConflictDoNothing()
    .returning();

  if (createdOwner) return createdOwner;

  const [racedOwner] = await db.select().from(ownerAccountsTable).where(eq(ownerAccountsTable.email, email)).limit(1);
  return racedOwner || null;
}

/**
 * Resolves only an explicitly allow-listed owner. A Clerk account with the
 * same email is linked exactly once, preventing a different authenticated
 * account from inheriting the owner role.
 */
export async function getManagedOwner(req: Request): Promise<OwnerContext | null> {
  const auth = getAuth(req);
  if (!auth.userId) return null;

  const user = await clerkClient.users.getUser(auth.userId);
  const primaryEmail = user.primaryEmailAddress;
  if (!primaryEmail || primaryEmail.verification?.status !== "verified") return null;
  const email = primaryEmail.emailAddress.trim().toLowerCase();

  let owner: typeof ownerAccountsTable.$inferSelect | null =
    (await db.select().from(ownerAccountsTable).where(eq(ownerAccountsTable.email, email)).limit(1))[0] ?? null;
  if (!owner) {
    owner = await bootstrapInitialOwner(email, auth.userId, user.fullName);
  }
  if (!owner || owner.status !== "active") return null;
  if (owner.clerkUserId && owner.clerkUserId !== auth.userId) return null;

  if (!owner.clerkUserId) {
    await db.update(ownerAccountsTable)
      .set({ clerkUserId: auth.userId, updatedAt: new Date() })
      .where(eq(ownerAccountsTable.id, owner.id));
  }

  return { ...owner, clerkUserId: auth.userId };
}

export async function requireManagedOwner(req: Request, res: Response, next: NextFunction) {
  try {
    const owner = await getManagedOwner(req);
    if (!owner) {
      res.status(403).json({ error: "يلزم تسجيل الدخول بحساب المالك الموثّق." });
      return;
    }
    res.locals.owner = owner;
    next();
  } catch (error) {
    req.log.error({ err: error }, "Could not authorize owner account");
    res.status(503).json({ error: "تعذر التحقق من حساب المالك حالياً." });
  }
}