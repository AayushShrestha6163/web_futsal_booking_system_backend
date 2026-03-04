import crypto from "crypto";

export const buildEsewaRequestSignature = (
  secret: string,
  totalAmount: string,
  transactionUuid: string,
  productCode: string
) => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
};

export const decodeEsewaBase64Data = (base64: string) => {
  const json = Buffer.from(base64, "base64").toString("utf-8");
  return JSON.parse(json);
};

export const buildEsewaResponseSignature = (
  secret: string,
  signedFieldNames: string,
  payload: Record<string, any>
) => {
  const fields = signedFieldNames.split(",").map((s) => s.trim()).filter(Boolean);
  const message = fields.map((k) => `${k}=${payload[k]}`).join(",");
  return crypto.createHmac("sha256", secret).update(message).digest("base64");
};

export const timingSafeEqualB64 = (a: string, b: string) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
};


export const formatEsewaAmount = (amount: number) => amount.toFixed(2);