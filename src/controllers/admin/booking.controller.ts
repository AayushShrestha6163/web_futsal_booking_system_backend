import { Request, Response } from "express";
import * as AdminBookingService from "../../services/admin/booking.service";

export const getAllBookings = async (_req: Request, res: Response) => {
  try {
    const bookings = await AdminBookingService.getAllBookingsService();
    return res.json({ success: true, bookings });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
};