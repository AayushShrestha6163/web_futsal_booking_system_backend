import { Request, Response } from "express";
import mongoose from "mongoose";
import * as CourtService from "../services/court.service";

export const getAllCourtsForUsers = async (_req: Request, res: Response) => {
  try {
    const courts = await CourtService.getAllCourtsForUsers();
    return res.json({ success: true, courts });
  } catch (err: any) {
    console.error("getAllCourtsForUsers error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

export const getCourtByIdForUsers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // ✅ prevents CastError -> 500
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid court id" });
    }

    const court = await CourtService.getCourtByIdForUsers(id);

    if (!court) {
      return res.status(404).json({ success: false, message: "Court not found" });
    }

    return res.json({ success: true, court });
  } catch (err: any) {
    // ✅ now you'll see exact reason in backend terminal
    console.error("getCourtByIdForUsers error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};