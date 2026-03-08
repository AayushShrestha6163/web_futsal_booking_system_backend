import Court from "../models/court.model";
import { BookingModel } from "../models/booking.model";

const generateSlots = (start: string, end: string) => {
  const slots: string[] = [];

  let startHour = parseInt(start.split(":")[0]);
  let endHour = parseInt(end.split(":")[0]);

  while (startHour < endHour) {
    const nextHour = startHour + 1;
    slots.push(
      `${String(startHour).padStart(2, "0")}:00-${String(nextHour).padStart(2, "0")}:00`
    );
    startHour = nextHour;
  }

  return slots;
};

export const getAvailableSlotsService = async (
  courtId: string,
  date: string
) => {
  const court = await Court.findById(courtId);
  if (!court) throw new Error("Court not found");

  const allSlots = generateSlots(
    court.openingTime,
    court.closingTime
  );

  const bookings = await BookingModel.find({
    court: courtId,
    date,
    status: { $ne: "cancelled" },
  });

  const bookedSlots = new Set<string>();

  bookings.forEach((b) => {
    bookedSlots.add(`${b.startTime}-${b.endTime}`);
  });

  return allSlots.map((slot) => ({
    time: slot,
    available: !bookedSlots.has(slot),
  }));
};
