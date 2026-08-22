import { Router, type IRouter } from "express";
import healthRouter from "./health";
import submissionsRouter from "./submissions";
import coordinatorRouter from "./coordinator";

const router: IRouter = Router();

router.use(healthRouter);
router.use(submissionsRouter);
router.use(coordinatorRouter);

export default router;
