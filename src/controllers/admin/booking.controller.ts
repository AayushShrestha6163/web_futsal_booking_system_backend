import { Request, Response } from "express";
import * as AdminBookingService from "../../services/admin/booking.service";

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.max(1, parseInt(String(req.query.limit || "10"), 10));

    const result = await AdminBookingService.getAllBookingsService(page, limit);

    return res.json({
      success: true,
      bookings: result.bookings,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};