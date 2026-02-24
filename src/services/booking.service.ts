import * as BookingRepo from "../repositories/booking.repository";
import Court from "../models/court.model";

export const createBookingService = async (
  userId: string,
  data: any
) => {
  const { court, date, startTime, endTime } = data;

  const conflict = await BookingRepo.findOverlap(
    court,
    date,
    startTime,
    endTime
  );

  if (conflict) throw new Error("Slot already booked");

  const courtData = await Court.findById(court);
  if (!courtData) throw new Error("Court not found");

  const hours =
    parseInt(endTime.split(":")[0]) -
    parseInt(startTime.split(":")[0]);

  const price = hours * courtData.pricePerHour;

    return BookingRepo.createBooking({
    user: userId,
    ...data,
    price,
    status: "pending",          // stays pending until payment success
    paymentMethod: "NONE",
    paymentStatus: "UNPAID",
  });
};

export const getMyBookingsService = (userId: string) =>
  BookingRepo.getMyBookings(userId);

export const cancelBookingService = async (
  bookingId: string,
  userId: string
) => {
  const booking = await BookingRepo.getBookingById(bookingId);

  if (!booking) throw new Error("Booking not found");

  if (booking.user.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  if (booking.paymentStatus === "PAID") {
    throw new Error("Paid booking cannot be cancelled (refund flow required)");
  }

  if (new Date(booking.date) < new Date()) {
    throw new Error("Cannot cancel past booking");
  }

  return BookingRepo.cancelBooking(bookingId);
};