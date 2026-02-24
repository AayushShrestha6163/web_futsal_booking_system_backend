import { BookingModel } from "../../models/booking.model";

export const getAllBookingsService = async () => {
  return BookingModel.find()
    .populate("user", "email firstName lastName role")
    .populate("court", "name location pricePerHour")
    .sort({ createdAt: -1 });
};