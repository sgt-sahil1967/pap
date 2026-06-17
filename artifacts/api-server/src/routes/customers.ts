import { Router } from "express";
import { db, customersTable, ordersTable } from "@workspace/db";
import { eq, ilike, and, desc } from "drizzle-orm";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.use(adminAuth);

router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string;

    const filters = [];
    if (search) filters.push(ilike(customersTable.name, `%${search}%`));

    const customers = await db.select().from(customersTable)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(customersTable.createdAt));

    res.json({ customers, page, limit });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const customer = await db.query.customersTable.findFirst({
      where: eq(customersTable.id, id),
    });
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }

    const orders = await db.select().from(ordersTable)
      .where(eq(ordersTable.customerId, id))
      .orderBy(desc(ordersTable.createdAt));

    res.json({ ...customer, orders });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
