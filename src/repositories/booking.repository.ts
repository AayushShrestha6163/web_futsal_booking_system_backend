import { BookingModel } from "../models/booking.model";

export const createBooking = (data: any) =>
  BookingModel.create(data);

export const findOverlap = (
  court: string,
  date: string,
  start: string,
  end: string
) => {
  return BookingModel.findOne({
    court,
    date,
    status: { $ne: "cancelled" },
    startTime: { $lt: end },
    endTime: { $gt: start },
  });
};


export const getMyBookings = async (userId: string) => {
  return BookingModel.find({ user: userId })
    .populate("court", "name location pricePerHour")
    .select(
      [
        "court",
        "date",
        "startTime",
        "endTime",
        "price",
        "status",
        "paymentMethod",
        "paymentStatus",
        "transactionUuid",
        "transactionCode",
        "paidAt",
        "createdAt",
      ].join(" ")
    )
    .sort({ date: 1, startTime: 1 });
};
export const getBookingById = (id: string) =>
  BookingModel.findById(id);

export const cancelBooking = (id: string) =>
  BookingModel.findByIdAndUpdate(
    id,
    { status: "cancelled" },
    { new: true }
  );
