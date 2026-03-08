import { BookingModel } from "../../models/booking.model";

export const getAllBookingsService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [bookings, total] = await Promise.all([
    BookingModel.find()
      .populate("user", "email firstName lastName role")
      .populate("court", "name location pricePerHour")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    BookingModel.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { bookings, total, totalPages };
};