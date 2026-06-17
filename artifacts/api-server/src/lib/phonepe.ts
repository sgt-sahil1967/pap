import crypto from "crypto";
import { logger } from "./logger";

const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID!;
const SALT_KEY = process.env.PHONEPE_SALT_KEY!;
const SALT_INDEX = Number(process.env.PHONEPE_SALT_INDEX ?? "1");
const BASE_URL = process.env.PHONEPE_BASE_URL ?? "https://api-preprod.phonepe.com/apis/pg-sandbox";

export function buildChecksum(base64Payload: string, endpoint: string): string {
  const hash = crypto.createHash("sha256").update(base64Payload + endpoint + SALT_KEY).digest("hex");
  return hash + "###" + SALT_INDEX;
}

export async function initiatePayment(params: {
  merchantTransactionId: string;
  amount: number; // in paise
  mobileNumber: string;
  redirectUrl: string;
  callbackUrl: string;
}): Promise<{ success: boolean; redirectUrl?: string; message?: string; data?: unknown }> {
  const payload = {
    merchantId: MERCHANT_ID,
    merchantTransactionId: params.merchantTransactionId,
    merchantUserId: "MUID" + Date.now(),
    amount: params.amount,
    redirectUrl: params.redirectUrl,
    redirectMode: "REDIRECT",
    callbackUrl: params.callbackUrl,
    mobileNumber: params.mobileNumber,
    paymentInstrument: { type: "PAY_PAGE" },
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");
  const checksum = buildChecksum(base64Payload, "/pg/v1/pay");
  const res = await fetch(BASE_URL + "/pg/v1/pay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": MERCHANT_ID,
    },
    body: JSON.stringify({ request: base64Payload }),
  });
  const json = await res.json() as { success: boolean; data?: { instrumentResponse?: { redirectInfo?: { url?: string } } }; message?: string };
  return {
    success: json.success,
    redirectUrl: json.data?.instrumentResponse?.redirectInfo?.url,
    message: json.message,
    data: json.data,
  };
}

export async function checkPaymentStatus(merchantTransactionId: string): Promise<{
  success: boolean; code: string; message?: string; transactionId?: string;
}> {
  const endpoint = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`;
  const statusChecksum = crypto.createHash("sha256").update(endpoint + SALT_KEY).digest("hex") + "###" + SALT_INDEX;
  const res = await fetch(BASE_URL + endpoint, {
    headers: { "X-VERIFY": statusChecksum, "X-MERCHANT-ID": MERCHANT_ID },
  });
  const json = await res.json() as { success: boolean; code: string; message?: string; data?: { transactionId?: string } };
  return { success: json.success, code: json.code, message: json.message, transactionId: json.data?.transactionId };
}
