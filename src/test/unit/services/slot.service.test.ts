// src/test/unit/services/slot.service.test.ts

const courtFindByIdMock = jest.fn();
jest.mock("../../../models/court.model", () => ({
  __esModule: true,
  default: {
    findById: (...a: any[]) => courtFindByIdMock(...a),
  },
}));

const bookingFindMock = jest.fn();
jest.mock("../../../models/booking.model", () => ({
  BookingModel: {
    find: (...a: any[]) => bookingFindMock(...a),
  },
}));

import { getAvailableSlotsService } from "../../../services/slot.service";

describe("slot.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should throw if court not found", async () => {
    courtFindByIdMock.mockResolvedValue(null);

    await expect(getAvailableSlotsService("c1", "2026-03-04")).rejects.toThrow(
      "Court not found"
    );
  });

  test("should return slots with availability", async () => {
    courtFindByIdMock.mockResolvedValue({
      openingTime: "10:00",
      closingTime: "13:00",
    });

    // booked slot 11-12
    bookingFindMock.mockResolvedValue([
      { startTime: "11:00", endTime: "12:00" },
    ]);

    const result = await getAvailableSlotsService("c1", "2026-03-04");

    expect(result).toEqual([
      { time: "10:00-11:00", available: true },
      { time: "11:00-12:00", available: false },
      { time: "12:00-13:00", available: true },
    ]);
  });
});