import { Router, type IRouter } from "express";
import healthRouter from "./health";
import submissionsRouter from "./submissions";
import coordinatorRouter from "./coordinator";
import programsRouter from "./programs";
import paymentsRouter from "./payments";
import coordinatorPortalSettingsRouter from "./coordinatorPortalSettings";
import siteContentSettingsRouter from "./siteContentSettings";
import adminRouter from "./admin";
import { COOKIE_NAME, getStaffSession, readSession } from "../middlewares/coordinatorAuth";
import { isAllowedCoordinatorMutation } from "../lib/coordinatorPermissions";

const router: IRouter = Router();

// Defense in depth: coordinator cookies never authorize other writes, including
// future endpoints. Owner Clerk access remains independent and takes precedence.
router.use(async (req, res, next) => {
  if (isAllowedCoordinatorMutation(req.method, req.path) ||
      !readSession(req.cookies?.[COOKIE_NAME])) {
    next();
    return;
  }
  const staff = await getStaffSession(req);
  if (staff?.role === "coordinator") {
    res.status(403).json({ error: "صلاحيات المنسق تقتصر على إضافة الطلاب وإزالتهم فقط." });
    return;
  }
  next();
});

router.use(healthRouter);
router.use(submissionsRouter);
router.use(coordinatorRouter);
router.use(programsRouter);
router.use(paymentsRouter);
router.use(coordinatorPortalSettingsRouter);
router.use(siteContentSettingsRouter);
router.use(adminRouter);

export default router;
