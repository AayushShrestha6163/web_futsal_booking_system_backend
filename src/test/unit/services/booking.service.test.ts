// src/test/unit/services/booking.service.test.ts

const findOverlapMock = jest.fn();
const createBookingMock = jest.fn();
const getMyBookingsMock = jest.fn();
const getBookingByIdMock = jest.fn();
const cancelBookingMock = jest.fn();

jest.mock("../../../repositories/booking.repository", () => ({
  findOverlap: (...a: any[]) => findOverlapMock(...a),
  createBooking: (...a: any[]) => createBookingMock(...a),
  getMyBookings: (...a: any[]) => getMyBookingsMock(...a),
  getBookingById: (...a: any[]) => getBookingByIdMock(...a),
  cancelBooking: (...a: any[]) => cancelBookingMock(...a),
}));

const courtFindByIdMock = jest.fn();
jest.mock("../../../models/court.model", () => ({
  __esModule: true,
  default: {
    findById: (...a: any[]) => courtFindByIdMock(...a),
  },
}));

const bookingFindOneMock = jest.fn();
jest.mock("../../../models/booking.model", () => ({
  BookingModel: {
    findOne: (...a: any[]) => bookingFindOneMock(...a),
  },
}));

import mongoose from "mongoose";
import {
  createBookingService,
  getMyBookingsService,
  cancelBookingService,
  getBookingByIdService,
  markBookingPaidService,
} from "../../../services/booking.service";

describe("booking.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBookingService", () => {
    test("should throw if overlap exists", async () => {
      findOverlapMock.mockResolvedValue({ _id: "b1" });

      await expect(
        createBookingService("u1", {
          court: "c1",
          date: "2026-03-04",
          startTime: "10:00",
          endTime: "11:00",
        })
      ).rejects.toThrow("Slot already booked");

      expect(createBookingMock).not.toHaveBeenCalled();
    });

    test("should throw if court not found", async () => {
      findOverlapMock.mockResolvedValue(null);
      courtFindByIdMock.mockResolvedValue(null);

      await expect(
        createBookingService("u1", {
          court: "c1",
          date: "2026-03-04",
          startTime: "10:00",
          endTime: "11:00",
        })
      ).rejects.toThrow("Court not found");
    });

    test("should compute price and create booking", async () => {
      findOverlapMock.mockResolvedValue(null);
      courtFindByIdMock.mockResolvedValue({ pricePerHour: 500 });

      const created = { _id: "b1" };
      createBookingMock.mockResolvedValue(created);

      const result = await createBookingService("u1", {
        court: "c1",
        date: "2026-03-04",
        startTime: "10:00",
        endTime: "12:00", // 2 hours
      });

      expect(createBookingMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user: "u1",
          court: "c1",
          date: "2026-03-04",
          startTime: "10:00",
          endTime: "12:00",
          price: 1000,
          status: "pending",
          paymentMethod: "NONE",
          paymentStatus: "UNPAID",
        })
      );

      expect(result).toEqual(created);
    });
  });

  describe("getMyBookingsService", () => {
    test("should call repo.getMyBookings", async () => {
      getMyBookingsMock.mockResolvedValue([{ _id: "b1" }]);

      const result = await getMyBookingsService("u1");

      expect(getMyBookingsMock).toHaveBeenCalledWith("u1");
      expect(result).toEqual([{ _id: "b1" }]);
    });
  });

  describe("cancelBookingService", () => {
    test("should throw if booking not found", async () => {
      getBookingByIdMock.mockResolvedValue(null);

      await expect(cancelBookingService("b1", "u1")).rejects.toThrow(
        "Booking not found"
      );
    });

    test("should throw if unauthorized", async () => {
      getBookingByIdMock.mockResolvedValue({
        _id: "b1",
        user: { toString: () => "other" },
        paymentStatus: "UNPAID",
        date: "2099-01-01",
      });

      await expect(cancelBookingService("b1", "u1")).rejects.toThrow(
        "Unauthorized"
      );
    });

    test("should throw if already paid", async () => {
      getBookingByIdMock.mockResolvedValue({
        _id: "b1",
        user: { toString: () => "u1" },
        paymentStatus: "PAID",
        date: "2099-01-01",
      });

      await expect(cancelBookingService("b1", "u1")).rejects.toThrow(
        "Paid booking cannot be cancelled (refund flow required)"
      );
    });

    test("should throw if past booking", async () => {
      getBookingByIdMock.mockResolvedValue({
        _id: "b1",
        user: { toString: () => "u1" },
        paymentStatus: "UNPAID",
        date: "2000-01-01",
      });

      await expect(cancelBookingService("b1", "u1")).rejects.toThrow(
        "Cannot cancel past booking"
      );
    });

    test("should cancel booking when valid", async () => {
      getBookingByIdMock.mockResolvedValue({
        _id: "b1",
        user: { toString: () => "u1" },
        paymentStatus: "UNPAID",
        date: "2099-01-01",
      });
      cancelBookingMock.mockResolvedValue({ _id: "b1", status: "cancelled" });

      const result = await cancelBookingService("b1", "u1");

      expect(cancelBookingMock).toHaveBeenCalledWith("b1");
      expect(result).toEqual({ _id: "b1", status: "cancelled" });
    });
  });

  describe("getBookingByIdService", () => {
    test("should throw if not found", async () => {
      getBookingByIdMock.mockResolvedValue(null);

      await expect(getBookingByIdService("b1", "u1")).rejects.toThrow(
        "Booking not found"
      );
    });

    test("should throw if unauthorized", async () => {
      getBookingByIdMock.mockResolvedValue({
        _id: "b1",
        user: { toString: () => "other" },
      });

      await expect(getBookingByIdService("b1", "u1")).rejects.toThrow(
        "Unauthorized"
      );
    });

    test("should return booking if ok", async () => {
      const booking = { _id: "b1", user: { toString: () => "u1" } };
      getBookingByIdMock.mockResolvedValue(booking);

      const result = await getBookingByIdService("b1", "u1");

      expect(result).toEqual(booking);
    });
  });

  describe("markBookingPaidService", () => {
    test("should throw invalid booking id", async () => {
      await expect(
        markBookingPaidService("bad-id", "u1", true, "T")
      ).rejects.toThrow("Invalid booking id");
    });

    test("should throw if booking not found", async () => {
      const id = new mongoose.Types.ObjectId().toString();
      bookingFindOneMock.mockResolvedValue(null);

      await expect(markBookingPaidService(id, "u1", true)).rejects.toThrow(
        "Booking not found"
      );
    });

    test("should throw if booking cancelled/completed", async () => {
      const id = new mongoose.Types.ObjectId().toString();
      bookingFindOneMock.mockResolvedValue({
        status: "cancelled",
      });

      await expect(markBookingPaidService(id, "u1", true)).rejects.toThrow(
        "Cannot pay a cancelled booking"
      );
    });

    test("should mark paid when ok=true", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      const save = jest.fn().mockResolvedValue(true);
      const booking: any = {
        _id: id,
        status: "pending",
        paymentStatus: "UNPAID",
        save,
      };

      bookingFindOneMock.mockResolvedValue(booking);

      const result = await markBookingPaidService(id, "u1", true, "TCODE");

      expect(booking.paymentMethod).toBe("ESEWA");
      expect(booking.paymentStatus).toBe("PAID");
      expect(booking.status).toBe("confirmed");
      expect(booking.transactionCode).toBe("TCODE");
      expect(booking.paidAt).toBeInstanceOf(Date);
      expect(save).toHaveBeenCalled();

      expect(result).toBe(booking);
    });

    test("should mark failed when ok=false", async () => {
      const id = new mongoose.Types.ObjectId().toString();

      const save = jest.fn().mockResolvedValue(true);
      const booking: any = {
        _id: id,
        status: "pending",
        paymentStatus: "UNPAID",
        save,
      };

      bookingFindOneMock.mockResolvedValue(booking);

      const result = await markBookingPaidService(id, "u1", false);

      expect(booking.paymentMethod).toBe("ESEWA");
      expect(booking.paymentStatus).toBe("FAILED");
      expect(save).toHaveBeenCalled();
      expect(result).toBe(booking);
    });
  });
});