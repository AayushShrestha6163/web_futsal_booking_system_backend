import { Request, Response } from "express";
import * as SlotService from "../services/slot.service";

export const getAvailableSlots = async (req: Request, res: Response) => {
  try {
    const { courtId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }

    const slots = await SlotService.getAvailableSlotsService(
      courtId,
      date as string
    );

    res.json({ success: true, slots });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
