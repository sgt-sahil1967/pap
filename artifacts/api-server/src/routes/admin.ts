import { Router } from "express";
import { generateToken } from "../lib/auth";
import { adminAuth } from "../middlewares/adminAuth";

const router = Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = generateToken(email);
    return res.json({ token });
  }
  return res.status(401).json({ error: "Invalid credentials" });
});

router.get("/me", adminAuth, (req, res) => {
  res.json({ email: req.admin?.email });
});

router.post("/logout", (req, res) => {
  res.sendStatus(200);
});

export default router;
