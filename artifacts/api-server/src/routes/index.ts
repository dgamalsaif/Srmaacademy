import { Router, type IRouter } from "express";
import healthRouter from "./health";
import submissionsRouter from "./submissions";
import coordinatorRouter from "./coordinator";
import programsRouter from "./programs";
import paymentsRouter from "./payments";
import coordinatorPortalSettingsRouter from "./coordinatorPortalSettings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submissionsRouter);
router.use(coordinatorRouter);
router.use(programsRouter);
router.use(paymentsRouter);
router.use(coordinatorPortalSettingsRouter);

export default router;
