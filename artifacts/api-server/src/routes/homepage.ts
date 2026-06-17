import { Router } from "express";
import { db, homepageSettingsTable } from "@workspace/db";
import { adminAuth } from "../middlewares/adminAuth";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  try {
    let settings = await db.query.homepageSettingsTable.findFirst();
    if (!settings) {
      settings = {
        id: 1,
        banners: [],
        announcementText: "Free Shipping On Any 2 Purchases!",
        announcementEnabled: true,
        updatedAt: new Date(),
      };
    }
    res.json(settings);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/", adminAuth, async (req, res) => {
  try {
    const { banners, announcementText, announcementEnabled } = req.body;
    let settings = await db.query.homepageSettingsTable.findFirst();

    if (settings) {
      [settings] = await db.update(homepageSettingsTable)
        .set({ banners, announcementText, announcementEnabled, updatedAt: new Date() })
        .where(eq(homepageSettingsTable.id, settings.id))
        .returning();
    } else {
      [settings] = await db.insert(homepageSettingsTable)
        .values({ banners, announcementText, announcementEnabled })
        .returning();
    }
    res.json(settings);
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
