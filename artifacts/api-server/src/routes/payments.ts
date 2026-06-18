import { Router } from "express";
import { paymentsService } from "@workspace/db";
import { initiatePayment, checkPaymentStatus, buildChecksum } from "../lib/phonepe";
import crypto from "crypto";

const router = Router();

router.post("/initiate", async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await paymentsService.getOrderById(orderId);

    if (!order || order.paymentStatus !== "pending") {
      res.status(400).json({ error: "Invalid order or payment already processed" });
      return;
    }

    const merchantTransactionId = `PE${orderId}${Date.now()}`;
    const domain = process.env.REPLIT_DOMAINS?.split(",")[0] || req.hostname;
    const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const baseUrl = `${protocol}://${domain}`;

    const redirectUrl = `${baseUrl}/payment/status?txnId=${merchantTransactionId}`;
    const callbackUrl = `${baseUrl}/api/payments/webhook`;

    const amountInPaise = Math.round(Number(order.total) * 100);

    const result = await initiatePayment({
      merchantTransactionId,
      amount: amountInPaise,
      mobileNumber: order.customerPhone,
      redirectUrl,
      callbackUrl,
    });

    await paymentsService.createLog({
      orderId,
      merchantTransactionId,
      amount: amountInPaise,
      requestPayload: result.data as Record<string, unknown>,
    });

    if (result.success && result.redirectUrl) {
      res.json({ success: true, redirectUrl: result.redirectUrl, merchantTransactionId });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/webhook", async (req, res) => {
  try {
    const { response } = req.body;
    const xVerify = req.headers["x-verify"] as string;
    const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
    const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";

    const expectedChecksum =
      crypto.createHash("sha256").update(response + SALT_KEY).digest("hex") +
      "###" +
      SALT_INDEX;

    if (xVerify !== expectedChecksum) {
      res.status(400).send("Invalid signature");
      return;
    }

    const decoded = JSON.parse(Buffer.from(response, "base64").toString());
    const { success, code, data } = decoded;
    const merchantTransactionId = data.merchantTransactionId;

    const paymentLog = await paymentsService.getLogByMerchantId(merchantTransactionId);
    if (!paymentLog) {
      res.status(404).send("Payment log not found");
      return;
    }

    await paymentsService.updateLog(paymentLog.id, {
      status: code,
      phonePeTransactionId: data.transactionId,
      responsePayload: decoded,
    });

    const order = await paymentsService.getOrderById(paymentLog.orderId);
    if (!order) {
      res.status(200).send("OK");
      return;
    }

    if (success && code === "PAYMENT_SUCCESS") {
      await paymentsService.handlePaymentSuccess(paymentLog.id, order.id, order.items);
    } else if (code !== "PAYMENT_PENDING") {
      await paymentsService.handlePaymentFailure(order.id, order.items);
    }

    res.status(200).send("OK");
  } catch (error) {
    req.log.error(error);
    res.status(200).send("OK"); // Always 200 for PhonePe
  }
});

router.get("/status/:merchantTransactionId", async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;
    const result = await checkPaymentStatus(merchantTransactionId);

    const paymentLog = await paymentsService.getLogByMerchantId(merchantTransactionId);
    if (!paymentLog) {
      res.status(404).json({ error: "Payment not found" });
      return;
    }

    if (result.code !== paymentLog.status) {
      await paymentsService.updateLog(paymentLog.id, {
        status: result.code,
        phonePeTransactionId: result.transactionId,
      });
    }

    const order = await paymentsService.getOrderById(paymentLog.orderId);
    res.json({ order, paymentStatus: result.code });
  } catch (error) {
    req.log.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/callback", async (req, res) => {
  try {
    const txnId = req.query.txnId as string;
    await checkPaymentStatus(txnId);
    res.redirect(`/payment/status?txnId=${txnId}&verified=true`);
  } catch (error) {
    req.log.error(error);
    res.redirect(`/payment/status?error=true`);
  }
});

export default router;
