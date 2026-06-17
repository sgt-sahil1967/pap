import { Router } from "express";
import { db, ordersTable, productVariantsTable, customersTable, paymentLogsTable } from "@workspace/db";
import { eq, and, like, desc, sql, or } from "drizzle-orm";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", adminAuth, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const paymentStatus = req.query.paymentStatus as string;
    const search = req.query.search as string;

    const filters = [];
    if (status) filters.push(eq(ordersTable.status, status));
    if (paymentStatus) filters.push(eq(ordersTable.paymentStatus, paymentStatus));
    if (search) {
      filters.push(
        or(
          like(ordersTable.customerEmail, `%${search}%`),
          like(ordersTable.orderNumber, `%${search}%`)
        )
      );
    }

    const orders = await db.select().from(ordersTable)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(ordersTable.createdAt));

    res.json({ orders, page, limit });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/customer/:email", adminAuth, async (req, res) => {
  try {
    const orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.customerEmail, String(req.params.email)))
      .orderBy(desc(ordersTable.createdAt));
    res.json(orders);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", adminAuth, async (req, res) => {
  try {
    const [order] = await db.select().from(ordersTable)
      .where(eq(ordersTable.id, Number(req.params.id)))
      .limit(1);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const paymentLogs = await db.select().from(paymentLogsTable)
      .where(eq(paymentLogsTable.orderId, order.id));
    res.json({ ...order, paymentLogs });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// SQLite (better-sqlite3) transactions are synchronous — no async/await inside db.transaction()
router.post("/", async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items } = req.body;
    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Validate inventory outside transaction (reads are fine async)
    for (const item of items) {
      const [variant] = await db.select().from(productVariantsTable)
        .where(eq(productVariantsTable.id, item.variantId));
      if (!variant || (variant.inventoryQty - variant.inventoryReserved) < item.quantity) {
        res.status(400).json({ error: `Insufficient inventory for ${item.title} (${item.size})` });
        return;
      }
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const shipping = 0;
    const total = subtotal + shipping;

    // Upsert customer
    let [customer] = await db.select().from(customersTable)
      .where(eq(customersTable.email, customerEmail));
    if (!customer) {
      [customer] = await db.insert(customersTable).values({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      }).returning();
    }

    // Generate order number
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(ordersTable);
    const orderNumber = `PE-${1000 + Number(count) + 1}`;

    // Create order
    const [order] = await db.insert(ordersTable).values({
      orderNumber,
      customerId: customer.id,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      subtotal,
      shipping,
      total,
      status: "pending",
      paymentStatus: "pending",
    }).returning();

    // Reserve inventory (best-effort after insert)
    for (const item of items) {
      await db.update(productVariantsTable)
        .set({ inventoryReserved: sql`${productVariantsTable.inventoryReserved} + ${item.quantity}` })
        .where(eq(productVariantsTable.id, item.variantId));
    }

    res.status(201).json(order);
  } catch (error: any) {
    req.log.error(error);
    res.status(400).json({ error: error.message || "Bad Request" });
  }
});

router.patch("/:id/status", adminAuth, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const [order] = await db.update(ordersTable)
      .set({ status, notes, updatedAt: new Date() })
      .where(eq(ordersTable.id, Number(req.params.id)))
      .returning();
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
