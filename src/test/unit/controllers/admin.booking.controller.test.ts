import { getAllBookings } from "../../../controllers/admin/booking.controller";
import * as AdminBookingService from "../../../services/admin/booking.service";

describe("Admin Booking Controller - getAllBookings", () => {
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

  test("should return bookings with default pagination (page=1, limit=10)", async () => {
    const req: any = { query: {} };
    const res = makeRes();

    const serviceResult = {
      bookings: [{ _id: "b1" }, { _id: "b2" }],
      total: 2,
      totalPages: 1,
    };

    const spy = jest
      .spyOn(AdminBookingService, "getAllBookingsService")
      .mockResolvedValue(serviceResult as any);

    await getAllBookings(req, res);

    expect(spy).toHaveBeenCalledWith(1, 10);
    expect(status).not.toHaveBeenCalled();

    expect(json).toHaveBeenCalledWith({
      success: true,
      bookings: serviceResult.bookings,
      pagination: {
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      },
    });
  });

  test("should parse page and limit from query", async () => {
    const req: any = { query: { page: "3", limit: "5" } };
    const res = makeRes();

    const serviceResult = {
      bookings: [{ _id: "b99" }],
      total: 21,
      totalPages: 5,
    };

    const spy = jest
      .spyOn(AdminBookingService, "getAllBookingsService")
      .mockResolvedValue(serviceResult as any);

    await getAllBookings(req, res);

    expect(spy).toHaveBeenCalledWith(3, 5);

    expect(json).toHaveBeenCalledWith({
      success: true,
      bookings: serviceResult.bookings,
      pagination: {
        page: 3,
        limit: 5,
        total: 21,
        totalPages: 5,
      },
    });
  });

  test("should clamp page and limit to minimum 1", async () => {
    const req: any = { query: { page: "0", limit: "-10" } };
    const res = makeRes();

    const serviceResult = {
      bookings: [],
      total: 0,
      totalPages: 0,
    };

    const spy = jest
      .spyOn(AdminBookingService, "getAllBookingsService")
      .mockResolvedValue(serviceResult as any);

    await getAllBookings(req, res);

    expect(spy).toHaveBeenCalledWith(1, 1);

    expect(json).toHaveBeenCalledWith({
      success: true,
      bookings: [],
      pagination: {
        page: 1,
        limit: 1,
        total: 0,
        totalPages: 0,
      },
    });
  });

  test("should return 500 if service throws error", async () => {
    const req: any = { query: { page: "1", limit: "10" } };
    const res = makeRes();

    jest
      .spyOn(AdminBookingService, "getAllBookingsService")
      .mockRejectedValue(new Error("DB error"));

    await getAllBookings(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ success: false, message: "DB error" });
  });
});