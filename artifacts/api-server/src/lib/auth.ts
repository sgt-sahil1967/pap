import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

function base64url(buf: Buffer): string {
  return buf.toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function decodeBase64url(str: string): Buffer {
  return Buffer.from(str.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function generateToken(email: string): string {
  const header = base64url(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = base64url(Buffer.from(JSON.stringify({
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  })));

  const signature = base64url(
    crypto.createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest()
  );

  return `${header}.${payload}.${signature}`;
}

export function verifyToken(token: string): { email: string } | null {
  try {
    const [headerB64, payloadB64, signatureB64] = token.split(".");
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const expectedSignature = base64url(
      crypto.createHmac("sha256", JWT_SECRET)
        .update(`${headerB64}.${payloadB64}`)
        .digest()
    );

    if (signatureB64 !== expectedSignature) return null;

    const payload = JSON.parse(decodeBase64url(payloadB64).toString());
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return { email: payload.email };
  } catch (err) {
    return null;
  }
}
