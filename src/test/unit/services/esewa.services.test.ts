// src/test/unit/services/esewa.services.test.ts

import crypto from "crypto";
import {
  buildEsewaRequestSignature,
  decodeEsewaBase64Data,
  buildEsewaResponseSignature,
  timingSafeEqualB64,
  formatEsewaAmount,
} from "../../../services/esewa.services";

describe("esewa.services", () => {
  test("formatEsewaAmount should format to 2 decimals", () => {
    expect(formatEsewaAmount(10)).toBe("10.00");
    expect(formatEsewaAmount(10.5)).toBe("10.50");
  });

  test("decodeEsewaBase64Data should decode base64 JSON", () => {
    const obj = { a: 1, b: "x" };
    const b64 = Buffer.from(JSON.stringify(obj), "utf-8").toString("base64");

    expect(decodeEsewaBase64Data(b64)).toEqual(obj);
  });

  test("buildEsewaRequestSignature should match crypto hmac sha256 base64", () => {
    const secret = "s";
    const total = "100.00";
    const txn = "t1";
    const code = "P";

    const msg = `total_amount=${total},transaction_uuid=${txn},product_code=${code}`;
    const expected = crypto.createHmac("sha256", secret).update(msg).digest("base64");

    expect(buildEsewaRequestSignature(secret, total, txn, code)).toBe(expected);
  });

  test("buildEsewaResponseSignature should sign only signed fields in order", () => {
    const secret = "s";
    const payload: any = { a: "1", b: "2", c: "3" };
    const signed = "b,a";

    const msg = "b=2,a=1";
    const expected = crypto.createHmac("sha256", secret).update(msg).digest("base64");

    expect(buildEsewaResponseSignature(secret, signed, payload)).toBe(expected);
  });

  test("timingSafeEqualB64 should return true for same strings and false for different", () => {
    expect(timingSafeEqualB64("abc", "abc")).toBe(true);
    expect(timingSafeEqualB64("abc", "abcd")).toBe(false);
    expect(timingSafeEqualB64("abc", "abx")).toBe(false);
  });
});