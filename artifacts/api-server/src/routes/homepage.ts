import { Router } from "express";
import { homepageService } from "@workspace/db";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const settings = await homepageService.get();
    res.json(settings);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/", adminAuth, async (req, res) => {
  try {
    const { banners, announcementText, announcementEnabled } = req.body;
    const settings = await homepageService.upsert({ banners, announcementText, announcementEnabled });
    res.json(settings);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
