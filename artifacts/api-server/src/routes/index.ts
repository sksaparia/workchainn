import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import workersRouter from "./workers";
import bookingsRouter from "./bookings";
import statsRouter from "./stats";
import messagesRouter from "./messages";
import downloadRouter from "./download";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(workersRouter);
router.use(bookingsRouter);
router.use(statsRouter);
router.use(messagesRouter);
router.use(downloadRouter);

export default router;
