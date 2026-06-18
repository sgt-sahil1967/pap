import { Router } from "express";
import { ordersService } from "@workspace/db";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", adminAuth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string | undefined;
    const paymentStatus = req.query.paymentStatus as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await ordersService.list({ page, limit, status, paymentStatus, search });
    res.json(result);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/customer/:email", adminAuth, async (req, res) => {
  try {
    const orders = await ordersService.getByCustomerEmail(String(req.params.email));
    res.json(orders);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", adminAuth, async (req, res) => {
  try {
    const order = await ordersService.getById(Number(req.params.id));
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items } = req.body;
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const order = await ordersService.create({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
    });
    res.status(201).json(order);
  } catch (error: unknown) {
    req.log.error(error);
    const message = error instanceof Error ? error.message : "Bad Request";
    res.status(400).json({ error: message });
  }
});

router.patch("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await ordersService.updateStatus(Number(req.params.id), status, notes);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
