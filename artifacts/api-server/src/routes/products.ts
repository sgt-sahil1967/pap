import { Router } from "express";
import { productsService } from "@workspace/db";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", async (req, res): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const status = req.query.status as string | undefined;
    const type = req.query.type as string | undefined;
    const search = req.query.search as string | undefined;

    const result = await productsService.list({ page, limit, status, type, search });
    res.json(result);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/handle/:handle", async (req, res): Promise<void> => {
  try {
    const product = await productsService.getByHandle(req.params.handle as string);
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

router.get("/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const product = await productsService.getById(id);
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

router.post("/", adminAuth, async (req, res): Promise<void> => {
  try {
    const { handle, title, body, type, category, tags, images, status, variants } = req.body;
    const product = await productsService.create(
      { handle, title, body, type, category, tags, images, status },
      variants
    );
    res.status(201).json(product);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", adminAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const { handle, title, body, type, category, tags, images, status } = req.body;
    const product = await productsService.update(id, { handle, title, body, type, category, tags, images, status });
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }
    res.json(product);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", adminAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const hard = req.query.hard === "true";
    await productsService.delete(id, hard);
    res.sendStatus(204);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id/variants", adminAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    await productsService.replaceVariants(id, req.body as Parameters<typeof productsService.replaceVariants>[1]);
    res.sendStatus(204);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:id/variants/:variantId/inventory", adminAuth, async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const variantId = parseInt(req.params.variantId, 10);
    const { inventoryQty } = req.body as { inventoryQty: number };

    await productsService.updateVariantInventory(id, variantId, inventoryQty);
    res.sendStatus(204);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
