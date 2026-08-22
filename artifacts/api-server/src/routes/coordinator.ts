import { Router } from "express";
import {
  clearCoordinatorCookie,
  createCoordinatorSession,
  isCoordinatorSession,
  setCoordinatorCookie,
} from "../middlewares/coordinatorAuth";

const router = Router();

router.post("/coordinator/login", (req, res) => {
  const configuredPassword = process.env["COORDINATOR_PASSWORD"];
  if (!configuredPassword) {
    res.status(503).json({ error: "لم يتم إعداد كلمة مرور المنسق بعد" });
    return;
  }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (password !== configuredPassword) {
    res.status(401).json({ error: "رمز الدخول غير صحيح. يرجى التحقق والمحاولة مجدداً." });
    return;
  }

  setCoordinatorCookie(res, createCoordinatorSession());
  res.json({ authenticated: true });
});

router.post("/coordinator/logout", (_req, res) => {
  clearCoordinatorCookie(res);
  res.json({ authenticated: false });
});

router.get("/coordinator/session", (req, res) => {
  res.json({ authenticated: isCoordinatorSession(req.cookies?.srma_coordinator_session) });
});

export default router;