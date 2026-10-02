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
  const configuredEmails = (process.env.OWNER_BOOTSTRAP_EMAIL || "srmaacademy@gmail.com")
    .split(",")
    .concat(["23608711@uofn.edu.om"])
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!configuredEmails.includes(email)) return null;

  const [existingOwner] = await db.select().from(ownerAccountsTable).where(eq(ownerAccountsTable.email, email)).limit(1);
  if (existingOwner) return existingOwner;

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
  if (!process.env.CLERK_SECRET_KEY) {
    return null;
  }
  try {
    let auth: { userId?: string | null } | null = null;
    try {
      auth = getAuth(req);
    } catch {
      auth = (req as any).auth || null;
    }
    if (!auth?.userId) return null;

    const user = await clerkClient.users.getUser(auth.userId);
    if (!user) return null;
    const primaryEmail = user.primaryEmailAddress;
    if (!primaryEmail || primaryEmail.verification?.status !== "verified") return null;
    const email = primaryEmail.emailAddress?.trim()?.toLowerCase();
    if (!email) return null;

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
  } catch (error) {
    // If Clerk API fails, token is expired, or network is down, fail safely as unauthenticated
    return null;
  }
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