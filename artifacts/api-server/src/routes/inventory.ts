import { Router } from "express";
import { inventoryService } from "@workspace/db";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.use(adminAuth);

router.get("/", async (req, res) => {
  try {
    const inventory = await inventoryService.list();
    res.json(inventory);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const productId = req.query.productId ? Number(req.query.productId) : undefined;
    const logs = await inventoryService.listLogs(productId);
    res.json(logs);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:variantId", async (req, res) => {
  try {
    const variantId = Number(req.params.variantId);
    const { delta, reason } = req.body as { delta: number; reason: string };

    await inventoryService.adjust(variantId, delta, reason);
    res.sendStatus(204);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
