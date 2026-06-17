import { Router } from "express";
import { db, productsTable, productVariantsTable, inventoryLogsTable } from "@workspace/db";
import { eq, and, ilike, sql, desc } from "drizzle-orm";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status as string;
    const type = req.query.type as string;
    const search = req.query.search as string;

    const filters = [];
    if (status) filters.push(eq(productsTable.status, status));
    if (type) filters.push(eq(productsTable.type, type));
    if (search) filters.push(ilike(productsTable.title, `%${search}%`));

    const query = db
      .select({
        id: productsTable.id,
        handle: productsTable.handle,
        title: productsTable.title,
        type: productsTable.type,
        category: productsTable.category,
        images: productsTable.images,
        status: productsTable.status,
        variantCount: sql<number>`count(${productVariantsTable.id})::int`,
        minPrice: sql<string>`min(${productVariantsTable.price})`,
      })
      .from(productsTable)
      .leftJoin(productVariantsTable, eq(productsTable.id, productVariantsTable.productId))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .groupBy(productsTable.id)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(productsTable.createdAt));

    const products = await query;
    res.json({ products, page, limit });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const params = req.params as unknown as { id: string };
    const id = Number(params.id);
    const product = await db.query.productsTable.findFirst({
      where: eq(productsTable.id, id),
      with: {
        variants: true,
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/handle/:handle", async (req, res) => {
  try {
    const product = await db.query.productsTable.findFirst({
      where: eq(productsTable.handle, req.params.handle),
      with: {
        variants: true,
      },
    });

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", adminAuth, async (req, res) => {
  try {
    const { handle, title, body, type, category, tags, images, status, variants } = req.body;

    const result = await db.transaction(async (tx) => {
      const [product] = await tx.insert(productsTable).values({
        handle, title, body, type, category, tags, images, status
      }).returning();

      if (variants && variants.length > 0) {
        await tx.insert(productVariantsTable).values(
          variants.map((v: any) => ({
            ...v,
            productId: product.id,
          }))
        );
      }
      return product;
    });

    res.status(201).json(result);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const params = req.params as unknown as { id: string };
    const id = Number(params.id);
    const { handle, title, body, type, category, tags, images, status } = req.body;

    const [product] = await db.update(productsTable)
      .set({ handle, title, body, type, category, tags, images, status, updatedAt: new Date() })
      .where(eq(productsTable.id, id))
      .returning();

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const params = req.params as unknown as { id: string };
    const id = Number(params.id);
    const hard = req.query.hard === "true";

    if (hard) {
      await db.delete(productsTable).where(eq(productsTable.id, id));
    } else {
      await db.update(productsTable).set({ status: "draft" }).where(eq(productsTable.id, id));
    }

    res.sendStatus(204);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id/variants", adminAuth, async (req, res) => {
  try {
    const params = req.params as unknown as { id: string };
    const productId = Number(params.id);
    const variants = req.body;

    await db.transaction(async (tx) => {
      await tx.delete(productVariantsTable).where(eq(productVariantsTable.productId, productId));
      if (variants.length > 0) {
        await tx.insert(productVariantsTable).values(
          variants.map((v: any) => ({ ...v, productId }))
        );
      }
    });

    res.sendStatus(204);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:id/variants/:variantId/inventory", adminAuth, async (req, res) => {
  try {
    const params = req.params as unknown as { id: string; variantId: string };
    const productId = Number(params.id);
    const variantId = Number(params.variantId);
    const { inventoryQty } = req.body;

    const [variant] = await db.select().from(productVariantsTable).where(eq(productVariantsTable.id, variantId));
    if (!variant) {
      res.status(404).json({ error: "Variant not found" });
      return;
    }

    const delta = inventoryQty - variant.inventoryQty;

    await db.transaction(async (tx) => {
      await tx.update(productVariantsTable)
        .set({ inventoryQty, updatedAt: new Date() })
        .where(eq(productVariantsTable.id, variantId));

      await tx.insert(inventoryLogsTable).values({
        productId,
        variantId,
        delta,
        reason: "manual_adjustment",
      });
    });

    res.sendStatus(204);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
