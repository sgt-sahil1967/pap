import { Router } from "express";
import { generateToken } from "../lib/auth";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

router.post("/login", (req, res): void => {
  const { email, password } = req.body as { email: string; password: string };
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = generateToken(email);
    res.json({ token });
    return;
  }
  res.status(401).json({ error: "Invalid credentials" });
});

router.get("/me", adminAuth, (req, res): void => {
  res.json({ email: req.admin?.email });
});

router.post("/logout", (_req, res): void => {
  res.sendStatus(200);
});

export default router;
