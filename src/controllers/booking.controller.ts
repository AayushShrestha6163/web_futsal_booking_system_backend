import { Request, Response } from "express";
import * as BookingService from "../services/booking.service";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const booking = await BookingService.createBookingService(
      req.user!._id.toString(),
      req.body
    );
    return res.status(201).json({
  success: true,
  bookingId: booking._id,
});
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Booking failed",
    });
  }
};
export const getMyBookings = async (req: Request, res: Response) => {
  const bookings = await BookingService.getMyBookingsService(
    req.user!._id.toString()
  );
  res.json({ success: true, bookings });
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const result = await BookingService.cancelBookingService(
      req.params.id,
      req.user!._id.toString()
    );
    return res.json({ success: true, result });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
  
};
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user!._id.toString();

    const booking = await BookingService.getBookingByIdService(bookingId, userId);

    return res.json({ success: true, booking });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to fetch booking",
    });
  }
};
