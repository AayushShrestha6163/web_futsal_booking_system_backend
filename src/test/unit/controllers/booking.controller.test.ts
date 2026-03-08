import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getBookingById,
  markBookingPaid,
} from "../../../controllers/booking.controller";
import * as BookingService from "../../../services/booking.service";

describe("Booking Controller", () => {
  const json = jest.fn();
  const status = jest.fn(() => ({ json })) as any;

  const makeRes = () =>
    ({
      json,
      status,
    } as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBooking", () => {
    test("should create booking and return bookingId", async () => {
      const req: any = {
        user: { _id: "u1" },
        body: { courtId: "c1", date: "2026-03-05", startTime: "10:00", endTime: "11:00" },
      };
      const res = makeRes();

      const booking = { _id: "b1" };

      const spy = jest
        .spyOn(BookingService, "createBookingService")
        .mockResolvedValue(booking as any);

      await createBooking(req, res);

      expect(spy).toHaveBeenCalledWith("u1", req.body);
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({ success: true, bookingId: "b1" });
    });

    test("should return 400 if service throws error", async () => {
      const req: any = { user: { _id: "u1" }, body: {} };
      const res = makeRes();

      jest
        .spyOn(BookingService, "createBookingService")
        .mockRejectedValue(new Error("Booking failed"));

      await createBooking(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        success: false,
        message: "Booking failed",
      });
    });
  });

  describe("getMyBookings", () => {
    test("should return bookings for current user", async () => {
      const req: any = { user: { _id: "u1" } };
      const res = makeRes();

      const bookings = [{ _id: "b1" }, { _id: "b2" }];

      const spy = jest
        .spyOn(BookingService, "getMyBookingsService")
        .mockResolvedValue(bookings as any);

      await getMyBookings(req, res);

      expect(spy).toHaveBeenCalledWith("u1");
      expect(json).toHaveBeenCalledWith({ success: true, bookings });
      expect(status).not.toHaveBeenCalled();
    });
  });

  describe("cancelBooking", () => {
    test("should cancel booking successfully", async () => {
      const req: any = { params: { id: "b1" }, user: { _id: "u1" } };
      const res = makeRes();

      const result = { cancelled: true };

      const spy = jest
        .spyOn(BookingService, "cancelBookingService")
        .mockResolvedValue(result as any);

      await cancelBooking(req, res);

      expect(spy).toHaveBeenCalledWith("b1", "u1");
      expect(json).toHaveBeenCalledWith({ success: true, result });
    });

    test("should return 400 if cancel fails", async () => {
      const req: any = { params: { id: "b1" }, user: { _id: "u1" } };
      const res = makeRes();

      jest
        .spyOn(BookingService, "cancelBookingService")
        .mockRejectedValue(new Error("Cancel failed"));

      await cancelBooking(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ success: false, message: "Cancel failed" });
    });
  });

  describe("getBookingById", () => {
    test("should return booking by id for current user", async () => {
      const req: any = { params: { id: "b1" }, user: { _id: "u1" } };
      const res = makeRes();

      const booking = { _id: "b1", courtId: "c1" };

      const spy = jest
        .spyOn(BookingService, "getBookingByIdService")
        .mockResolvedValue(booking as any);

      await getBookingById(req, res);

      expect(spy).toHaveBeenCalledWith("b1", "u1");
      expect(json).toHaveBeenCalledWith({ success: true, booking });
    });

    test("should return 400 if service throws error", async () => {
      const req: any = { params: { id: "b1" }, user: { _id: "u1" } };
      const res = makeRes();

      jest
        .spyOn(BookingService, "getBookingByIdService")
        .mockRejectedValue(new Error("Failed to fetch booking"));

      await getBookingById(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch booking",
      });
    });
  });

  describe("markBookingPaid", () => {
    test("should mark booking as PAID when ok=true", async () => {
      const req: any = {
        params: { id: "b1" },
        user: { _id: "u1" },
        body: { ok: true, transactionCode: "TXN123" },
      };
      const res = makeRes();

      const booking = { _id: "b1", paymentStatus: "PAID" };

      const spy = jest
        .spyOn(BookingService, "markBookingPaidService")
        .mockResolvedValue(booking as any);

      await markBookingPaid(req, res);

      expect(spy).toHaveBeenCalledWith("b1", "u1", true, "TXN123");
      expect(json).toHaveBeenCalledWith({
        success: true,
        message: "Payment marked as PAID",
        booking,
      });
    });

    test("should mark booking as FAILED when ok=false", async () => {
      const req: any = {
        params: { id: "b2" },
        user: { _id: "u1" },
        body: { ok: false },
      };
      const res = makeRes();

      const booking = { _id: "b2", paymentStatus: "FAILED" };

      const spy = jest
        .spyOn(BookingService, "markBookingPaidService")
        .mockResolvedValue(booking as any);

      await markBookingPaid(req, res);

      expect(spy).toHaveBeenCalledWith("b2", "u1", false, undefined);
      expect(json).toHaveBeenCalledWith({
        success: true,
        message: "Payment marked as FAILED",
        booking,
      });
    });

    test("should return 400 if payment update fails", async () => {
      const req: any = {
        params: { id: "b1" },
        user: { _id: "u1" },
        body: { ok: true },
      };
      const res = makeRes();

      jest
        .spyOn(BookingService, "markBookingPaidService")
        .mockRejectedValue(new Error("Payment update failed"));

      await markBookingPaid(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        success: false,
        message: "Payment update failed",
      });
    });
  });
});