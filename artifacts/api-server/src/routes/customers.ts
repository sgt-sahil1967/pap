import { Router } from "express";
import { customersService } from "@workspace/db";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.use(adminAuth);

router.get("/", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search as string | undefined;

    const result = await customersService.list({ page, limit, search });
    res.json(result);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const customer = await customersService.getById(Number(req.params.id));
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json(customer);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
