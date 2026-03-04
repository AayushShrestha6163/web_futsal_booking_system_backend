// src/test/unit/services/admin.booking.service.test.ts

const findMock = jest.fn();
const countDocumentsMock = jest.fn();

// chain mocks
const populateUserMock = jest.fn();
const populateCourtMock = jest.fn();
const sortMock = jest.fn();
const skipMock = jest.fn();
const limitMock = jest.fn();

// ✅ FIXED PATH (3 levels up)
jest.mock("../../../models/booking.model", () => ({
  BookingModel: {
    find: (...args: any[]) => findMock(...args),
    countDocuments: (...args: any[]) => countDocumentsMock(...args),
  },
}));

// ✅ import your service (adjust if your filename is booking.services.ts)
import { getAllBookingsService } from "../../../services/admin/booking.service";

describe("Admin Booking Service - getAllBookingsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // setup chain:
    // find().populate().populate().sort().skip().limit()
    limitMock.mockResolvedValue([{ _id: "b1" }, { _id: "b2" }]);
    skipMock.mockReturnValue({ limit: limitMock });
    sortMock.mockReturnValue({ skip: skipMock });
    populateCourtMock.mockReturnValue({ sort: sortMock });
    populateUserMock.mockReturnValue({ populate: populateCourtMock });

    findMock.mockReturnValue({ populate: populateUserMock });
  });

  test("should return bookings, total and totalPages with correct skip/limit", async () => {
    countDocumentsMock.mockResolvedValue(25); // total=25, limit=10 => pages=3

    const page = 2;
    const limit = 10;

    const result = await getAllBookingsService(page, limit);

    expect(findMock).toHaveBeenCalledWith();

    expect(populateUserMock).toHaveBeenCalledWith(
      "user",
      "email firstName lastName role"
    );
    expect(populateCourtMock).toHaveBeenCalledWith(
      "court",
      "name location pricePerHour"
    );

    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(skipMock).toHaveBeenCalledWith(10); // (2-1)*10
    expect(limitMock).toHaveBeenCalledWith(10);

    expect(countDocumentsMock).toHaveBeenCalledWith();

    expect(result).toEqual({
      bookings: [{ _id: "b1" }, { _id: "b2" }],
      total: 25,
      totalPages: 3,
    });
  });

  test("should return totalPages=0 when total=0", async () => {
    limitMock.mockResolvedValue([]);
    countDocumentsMock.mockResolvedValue(0);

    const result = await getAllBookingsService(1, 10);

    expect(result).toEqual({
      bookings: [],
      total: 0,
      totalPages: 0,
    });
  });

  test("should compute totalPages correctly for limit=1", async () => {
    limitMock.mockResolvedValue([{ _id: "b1" }]);
    countDocumentsMock.mockResolvedValue(3);

    const result = await getAllBookingsService(1, 1);

    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(1);
    expect(result.totalPages).toBe(3);
  });
});