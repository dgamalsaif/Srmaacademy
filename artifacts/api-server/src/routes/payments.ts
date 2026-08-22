import { Router } from "express";
import { db, insertPaymentRecordSchema, paymentRecordsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireCoordinator, requireOwner } from "../middlewares/coordinatorAuth";

const router = Router();

router.get("/payments", requireCoordinator, async (_req, res) => {
  const rows = await db.select().from(paymentRecordsTable).orderBy(desc(paymentRecordsTable.createdAt));
  res.json(rows);
});

router.post("/payments", requireOwner, async (req, res) => {
  const parsed = insertPaymentRecordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات المستحق غير صحيحة", details: parsed.error.issues });
    return;
  }
  const [row] = await db.insert(paymentRecordsTable).values({
    ...parsed.data,
    paidAt: parsed.data.status === "paid" ? new Date() : null,
  }).returning();
  res.status(201).json(row);
});

router.patch("/payments/:id", requireOwner, async (req, res) => {
  const id = Number(req.params["id"]);
  const parsed = insertPaymentRecordSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "بيانات المستحق غير صحيحة", details: parsed.error.issues });
    return;
  }
  const [row] = await db.update(paymentRecordsTable).set({
    ...parsed.data,
    paidAt: parsed.data.status === "paid" ? new Date() : parsed.data.status ? null : undefined,
    updatedAt: new Date(),
  }).where(eq(paymentRecordsTable.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "السجل غير موجود" });
    return;
  }
  res.json(row);
});

export default router;