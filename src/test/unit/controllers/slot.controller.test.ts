import {
  getAllCourtsForUsers,
  getCourtByIdForUsers,
} from "../../../controllers/court.controller";

import * as CourtService from "../../../services/court.service";
import mongoose from "mongoose";

describe("Court Controller (Users)", () => {
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

  describe("getAllCourtsForUsers", () => {
    test("should return all courts", async () => {
      const req: any = {};
      const res = makeRes();

      const courts = [{ _id: "c1" }, { _id: "c2" }];

      jest
        .spyOn(CourtService, "getAllCourtsForUsers")
        .mockResolvedValue(courts as any);

      await getAllCourtsForUsers(req, res);

      expect(json).toHaveBeenCalledWith({ success: true, courts });
      expect(status).not.toHaveBeenCalled();
    });

    test("should return 500 if service throws", async () => {
      const req: any = {};
      const res = makeRes();

      jest
        .spyOn(CourtService, "getAllCourtsForUsers")
        .mockRejectedValue(new Error("DB error"));

      await getAllCourtsForUsers(req, res);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ success: false, message: "DB error" });
    });
  });

  describe("getCourtByIdForUsers", () => {
    test("should return 400 if id is invalid", async () => {
      const req: any = { params: { id: "invalid" } };
      const res = makeRes();

      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(false);

      await getCourtByIdForUsers(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({ success: false, message: "Invalid court id" });
    });

    test("should return 404 if court not found", async () => {
      const req: any = { params: { id: "507f1f77bcf86cd799439011" } };
      const res = makeRes();

      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      jest
        .spyOn(CourtService, "getCourtByIdForUsers")
        .mockResolvedValue(null as any);

      await getCourtByIdForUsers(req, res);

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ success: false, message: "Court not found" });
    });

    test("should return court if found", async () => {
      const req: any = { params: { id: "507f1f77bcf86cd799439011" } };
      const res = makeRes();

      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      const court = { _id: req.params.id, name: "Court A" };

      jest
        .spyOn(CourtService, "getCourtByIdForUsers")
        .mockResolvedValue(court as any);

      await getCourtByIdForUsers(req, res);

      expect(json).toHaveBeenCalledWith({ success: true, court });
      expect(status).not.toHaveBeenCalled();
    });

    test("should return 500 if service throws", async () => {
      const req: any = { params: { id: "507f1f77bcf86cd799439011" } };
      const res = makeRes();

      jest.spyOn(mongoose.Types.ObjectId, "isValid").mockReturnValue(true);

      jest
        .spyOn(CourtService, "getCourtByIdForUsers")
        .mockRejectedValue(new Error("Server boom"));

      await getCourtByIdForUsers(req, res);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({ success: false, message: "Server boom" });
    });
  });
});