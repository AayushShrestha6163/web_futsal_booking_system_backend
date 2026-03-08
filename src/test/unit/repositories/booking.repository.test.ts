// src/test/unit/repositories/booking.repository.test.ts

const createMock = jest.fn();
const findOneMock = jest.fn();
const findMock = jest.fn();
const findByIdMock = jest.fn();
const findByIdAndUpdateMock = jest.fn();

// ✅ Mock BookingModel methods used by repository
jest.mock("../../../models/booking.model", () => ({
  BookingModel: {
    create: (...args: any[]) => createMock(...args),
    findOne: (...args: any[]) => findOneMock(...args),
    find: (...args: any[]) => findMock(...args),
    findById: (...args: any[]) => findByIdMock(...args),
    findByIdAndUpdate: (...args: any[]) => findByIdAndUpdateMock(...args),
  },
}));

import * as BookingRepo from "../../../repositories/booking.repository";

describe("booking.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBooking", () => {
    test("should call BookingModel.create with data and return created booking", async () => {
      const data = { user: "u1", court: "c1", date: "2026-03-04" };
      const created = { _id: "b1", ...data };

      createMock.mockResolvedValue(created);

      const result = await BookingRepo.createBooking(data);

      expect(createMock).toHaveBeenCalledWith(data);
      expect(result).toEqual(created);
    });
  });

  describe("findOverlap", () => {
    test("should query correct overlap conditions", async () => {
      const booking = { _id: "b1" };

      findOneMock.mockResolvedValue(booking);

      const result = await BookingRepo.findOverlap(
        "court1",
        "2026-03-04",
        "10:00",
        "11:00"
      );

      expect(findOneMock).toHaveBeenCalledWith({
        court: "court1",
        date: "2026-03-04",
        status: { $ne: "cancelled" },
        startTime: { $lt: "11:00" },
        endTime: { $gt: "10:00" },
      });

      expect(result).toEqual(booking);
    });
  });

  describe("getMyBookings", () => {
    test("should build query with populate, select and sort", async () => {
      const bookings = [{ _id: "b1" }, { _id: "b2" }];

      // ✅ mock chain: find() -> populate() -> select() -> sort()
      const sortMock = jest.fn().mockResolvedValue(bookings);
      const selectMock = jest.fn(() => ({ sort: sortMock }));
      const populateMock = jest.fn(() => ({ select: selectMock }));

      findMock.mockReturnValue({ populate: populateMock });

      const result = await BookingRepo.getMyBookings("u1");

      expect(findMock).toHaveBeenCalledWith({ user: "u1" });
      expect(populateMock).toHaveBeenCalledWith("court", "name location pricePerHour");

      // same select string your repo builds
      const expectedSelect = [
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
      ].join(" ");

      expect(selectMock).toHaveBeenCalledWith(expectedSelect);
      expect(sortMock).toHaveBeenCalledWith({ date: 1, startTime: 1 });

      expect(result).toEqual(bookings);
    });
  });

  describe("getBookingById", () => {
    test("should call BookingModel.findById", async () => {
      const booking = { _id: "b1" };
      findByIdMock.mockResolvedValue(booking);

      const result = await BookingRepo.getBookingById("b1");

      expect(findByIdMock).toHaveBeenCalledWith("b1");
      expect(result).toEqual(booking);
    });
  });

  describe("cancelBooking", () => {
    test("should call findByIdAndUpdate with cancelled status and return updated doc", async () => {
      const updated = { _id: "b1", status: "cancelled" };
      findByIdAndUpdateMock.mockResolvedValue(updated);

      const result = await BookingRepo.cancelBooking("b1");

      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
        "b1",
        { status: "cancelled" },
        { new: true }
      );
      expect(result).toEqual(updated);
    });
  });
});