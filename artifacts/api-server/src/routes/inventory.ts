import { Router } from "express";
import { db, productVariantsTable, productsTable, inventoryLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.use(adminAuth);

router.get("/", async (req, res) => {
  try {
    const inventory = await db.select({
      id: productVariantsTable.id,
      productId: productVariantsTable.productId,
      productTitle: productsTable.title,
      size: productVariantsTable.size,
      sku: productVariantsTable.sku,
      inventoryQty: productVariantsTable.inventoryQty,
      inventoryReserved: productVariantsTable.inventoryReserved,
    })
    .from(productVariantsTable)
    .innerJoin(productsTable, eq(productVariantsTable.productId, productsTable.id))
    .orderBy(desc(productVariantsTable.updatedAt));

    res.json(inventory);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const productId = req.query.productId ? Number(req.query.productId) : undefined;
    const logs = await db.query.inventoryLogsTable.findMany({
      where: productId ? eq(inventoryLogsTable.productId, productId) : undefined,
      orderBy: desc(inventoryLogsTable.createdAt),
    });
    res.json(logs);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:variantId", async (req, res) => {
  try {
    const variantId = Number(req.params.variantId);
    const { delta, reason } = req.body;

    const [variant] = await db.select().from(productVariantsTable).where(eq(productVariantsTable.id, variantId));
    if (!variant) {
      res.status(404).json({ error: "Variant not found" });
      return;
    }

    await db.transaction(async (tx) => {
      await tx.update(productVariantsTable)
        .set({
          inventoryQty: variant.inventoryQty + delta,
          updatedAt: new Date(),
        })
        .where(eq(productVariantsTable.id, variantId));

      await tx.insert(inventoryLogsTable).values({
        productId: variant.productId,
        variantId,
        delta,
        reason: reason || "manual_adjustment",
      });
    });

    res.sendStatus(204);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
