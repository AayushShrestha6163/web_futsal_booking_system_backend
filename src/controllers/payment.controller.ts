import { Request, Response } from "express";
import mongoose from "mongoose";
import axios from "axios";
import { BookingModel } from "../models/booking.model";
import {
  buildEsewaRequestSignature,
  buildEsewaResponseSignature,
  decodeEsewaBase64Data,
  timingSafeEqualB64,
  formatEsewaAmount,
} from "../services/esewa.services";

const PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const SECRET = process.env.ESEWA_SECRET_KEY || "";
const FORM_URL = process.env.ESEWA_FORM_URL || "";
const STATUS_URL = process.env.ESEWA_STATUS_URL || "";

const API_BASE_URL = process.env.API_BASE_URL || "";
const WEB_BASE_URL = process.env.WEB_BASE_URL || "";

function requireEnv(res: Response) {
  const missing: string[] = [];
  if (!SECRET) missing.push("ESEWA_SECRET_KEY");
  if (!FORM_URL) missing.push("ESEWA_FORM_URL");
  if (!STATUS_URL) missing.push("ESEWA_STATUS_URL");
  if (!API_BASE_URL) missing.push("API_BASE_URL");
  if (!WEB_BASE_URL) missing.push("WEB_BASE_URL");

  if (missing.length) {
    res.status(500).json({
      success: false,
      message: `Missing env: ${missing.join(", ")}`,
    });
    return false;
  }
  return true;
}

export const initiateEsewa = async (req: Request, res: Response) => {
  try {
    if (!requireEnv(res)) return;

    const { bookingId } = req.body;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid bookingId" });
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // owner check
    const userId = (req.user as any)?._id?.toString();
    if (!userId || booking.user.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // must be payable
    if (booking.paymentStatus === "PAID") {
      return res.status(400).json({ success: false, message: "Already paid" });
    }
    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending bookings can be paid" });
    }

    // Create transaction uuid (unique per attempt)
    const transaction_uuid = `${booking._id.toString()}_${Date.now()}`;

    const total_amount = formatEsewaAmount(Number(booking.price));
    const amount = total_amount;

    const tax_amount = "0.00";
    const product_service_charge = "0.00";
    const product_delivery_charge = "0.00";

    const signed_field_names = "total_amount,transaction_uuid,product_code";
    const signature = buildEsewaRequestSignature(
      SECRET,
      total_amount,
      transaction_uuid,
      PRODUCT_CODE
    );

    // ✅ callback URLs (must be reachable from emulator/phone)
    const success_url = `${API_BASE_URL}/api/payments/esewa/success`;
    const failure_url = `${API_BASE_URL}/api/payments/esewa/failure`;

    // Store intent on booking
    booking.paymentMethod = "ESEWA";
    booking.paymentStatus = "UNPAID";
    booking.transactionUuid = transaction_uuid;
    await booking.save();

    // helpful debug (optional)
    console.log("initiateEsewa success_url:", success_url);

    return res.json({
      success: true,
      formUrl: FORM_URL,
      fields: {
        amount,
        tax_amount,
        total_amount,
        transaction_uuid,
        product_code: PRODUCT_CODE,
        product_service_charge,
        product_delivery_charge,
        success_url,
        failure_url,
        signed_field_names,
        signature,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message || "Internal error" });
  }
};

export const esewaSuccess = async (req: Request, res: Response) => {
  try {
    if (!requireEnv(res)) return;

    const data = req.query.data as string;
    if (!data) return res.status(400).send("Missing data");

    const payload = decodeEsewaBase64Data(data);

    // Verify callback signature
    const expected = buildEsewaResponseSignature(
      SECRET,
      payload.signed_field_names,
      payload
    );

    if (!timingSafeEqualB64(expected, payload.signature)) {
      return res.status(400).send("Invalid signature");
    }

    const transaction_uuid = String(payload.transaction_uuid || "");
    if (!transaction_uuid) return res.status(400).send("Missing transaction_uuid");

    const booking = await BookingModel.findOne({ transactionUuid: transaction_uuid });
    if (!booking) return res.status(404).send("Booking not found");

    // Idempotency
    if (booking.paymentStatus === "PAID") {
      const okUrl = new URL(`${WEB_BASE_URL}/dashboard`);
      okUrl.searchParams.set("success", "Payment successful");
      okUrl.searchParams.set("bookingId", booking._id.toString());
      return res.redirect(okUrl.toString());
    }

    // ✅ Server-to-server verification
    const statusResp = await axios.get(STATUS_URL, {
      params: {
        product_code: PRODUCT_CODE,
        total_amount: payload.total_amount,
        transaction_uuid,
      },
      timeout: 10000,
    });

    // ✅ IMPORTANT FIX: normalize status
    const statusRaw = String(statusResp.data?.status || "");
    const status = statusRaw.trim().toUpperCase();

    console.log("eSewa statusResp:", statusResp.data);
    console.log("normalized status:", status);

    if (status === "COMPLETE" || status === "COMPLETED" || status === "SUCCESS") {
      booking.paymentStatus = "PAID";
      booking.status = "confirmed";
      booking.transactionCode = payload.transaction_code;
      booking.paidAt = new Date();
      await booking.save();

      console.log("UPDATED:", booking.paymentStatus, booking.status);

      const okUrl = new URL(`${WEB_BASE_URL}/dashboard`);
      okUrl.searchParams.set("success", "Payment successful");
      okUrl.searchParams.set("bookingId", booking._id.toString());
      return res.redirect(okUrl.toString());
    }

    // not complete => treat as failed/cancelled
    const failUrl = new URL(`${WEB_BASE_URL}/dashboard`);
    failUrl.searchParams.set("error", `Payment not complete (${status || "UNKNOWN"})`);
    failUrl.searchParams.set("bookingId", booking._id.toString());
    return res.redirect(failUrl.toString());
  } catch (e: any) {
    const failUrl = new URL(`${process.env.WEB_BASE_URL || "http://localhost:3000"}/dashboard`);
    failUrl.searchParams.set("error", e.message || "Payment verification error");
    return res.redirect(failUrl.toString());
  }
};

export const esewaFailure = async (req: Request, res: Response) => {
  const failUrl = new URL(`${process.env.WEB_BASE_URL || "http://localhost:3000"}/dashboard`);
  failUrl.searchParams.set("error", "Payment failed or cancelled");

  const data = req.query.data as string | undefined;
  if (data) {
    try {
      const payload = decodeEsewaBase64Data(data);
      if (payload?.transaction_uuid) failUrl.searchParams.set("txn", String(payload.transaction_uuid));
    } catch {}
  }

  return res.redirect(failUrl.toString());
};