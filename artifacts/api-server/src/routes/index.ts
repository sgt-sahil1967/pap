import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminRouter from "./admin";
import productsRouter from "./products";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import homepageRouter from "./homepage";
import customersRouter from "./customers";
import inventoryRouter from "./inventory";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/admin", adminRouter);
router.use("/products", productsRouter);
router.use("/orders", ordersRouter);
router.use("/payments", paymentsRouter);
router.use("/homepage", homepageRouter);
router.use("/customers", customersRouter);
router.use("/inventory", inventoryRouter);

export default router;
