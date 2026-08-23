import { clerkClient, getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import { db, ownerAccountsTable, type OwnerAccount } from "@workspace/db";
import { eq } from "drizzle-orm";

export type OwnerContext = Pick<OwnerAccount, "id" | "email" | "fullName" | "phone" | "status"> & {
  clerkUserId: string;
};

function hasSecondFactor(auth: ReturnType<typeof getAuth>) {
  const secondFactorAge = auth.factorVerificationAge?.[1];
  return typeof secondFactorAge === "number" && secondFactorAge >= 0;
}

/**
 * Resolves only an explicitly allow-listed owner. A Clerk account with the
 * same email is linked exactly once, preventing a different authenticated
 * account from inheriting the owner role.
 */
export async function getManagedOwner(req: Request): Promise<OwnerContext | null> {
  const auth = getAuth(req);
  if (!auth.userId) return null;
  if (!hasSecondFactor(auth)) return null;

  const user = await clerkClient.users.getUser(auth.userId);
  const primaryEmail = user.primaryEmailAddress;
  if (!primaryEmail || primaryEmail.verification?.status !== "verified") return null;
  const email = primaryEmail.emailAddress.trim().toLowerCase();

  const [owner] = await db.select().from(ownerAccountsTable).where(eq(ownerAccountsTable.email, email)).limit(1);
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