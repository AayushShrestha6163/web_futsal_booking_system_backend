import {
  addCourt,
  getCourts,
  updateCourt,
  deleteCourt,
} from "../../../controllers/admin/court.controller";
import * as CourtService from "../../../services/admin/court.service";

describe("Admin Court Controller", () => {
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

  describe("addCourt", () => {
    test("should add court with image filename if file exists", async () => {
      const req: any = {
        body: { name: "Court A", price: 100 },
        file: { filename: "court.png" },
      };
      const res = makeRes();

      const created = { _id: "c1", name: "Court A", image: "court.png" };

      const spy = jest
        .spyOn(CourtService, "addCourtService")
        .mockResolvedValue(created as any);

      await addCourt(req, res);

      expect(spy).toHaveBeenCalledWith({
        ...req.body,
        image: "court.png",
      });

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({ success: true, court: created });
    });

    test("should add court without image if file not provided", async () => {
      const req: any = {
        body: { name: "Court B", price: 150 },
      };
      const res = makeRes();

      const created = { _id: "c2", name: "Court B" };

      const spy = jest
        .spyOn(CourtService, "addCourtService")
        .mockResolvedValue(created as any);

      await addCourt(req, res);

      expect(spy).toHaveBeenCalledWith({
        ...req.body,
        image: undefined,
      });

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({ success: true, court: created });
    });
  });

  describe("getCourts", () => {
    test("should return courts with default pagination (page=1, limit=6)", async () => {
      const req: any = { query: {} };
      const res = makeRes();

      const result = {
        courts: [{ _id: "c1" }, { _id: "c2" }],
        total: 2,
        totalPages: 1,
      };

      const spy = jest
        .spyOn(CourtService, "getCourtsService")
        .mockResolvedValue(result as any);

      await getCourts(req, res);

      expect(spy).toHaveBeenCalledWith(1, 6);
      expect(json).toHaveBeenCalledWith({
        success: true,
        courts: result.courts,
        pagination: {
          page: 1,
          limit: 6,
          total: 2,
          totalPages: 1,
        },
      });
    });

    test("should parse page and limit from query", async () => {
      const req: any = { query: { page: "2", limit: "3" } };
      const res = makeRes();

      const result = {
        courts: [{ _id: "c9" }],
        total: 10,
        totalPages: 4,
      };

      const spy = jest
        .spyOn(CourtService, "getCourtsService")
        .mockResolvedValue(result as any);

      await getCourts(req, res);

      expect(spy).toHaveBeenCalledWith(2, 3);
      expect(json).toHaveBeenCalledWith({
        success: true,
        courts: result.courts,
        pagination: {
          page: 2,
          limit: 3,
          total: 10,
          totalPages: 4,
        },
      });
    });

    test("should clamp page and limit to minimum 1", async () => {
      const req: any = { query: { page: "0", limit: "-5" } };
      const res = makeRes();

      const result = {
        courts: [],
        total: 0,
        totalPages: 0,
      };

      const spy = jest
        .spyOn(CourtService, "getCourtsService")
        .mockResolvedValue(result as any);

      await getCourts(req, res);

      expect(spy).toHaveBeenCalledWith(1, 1);
      expect(json).toHaveBeenCalledWith({
        success: true,
        courts: [],
        pagination: {
          page: 1,
          limit: 1,
          total: 0,
          totalPages: 0,
        },
      });
    });
  });

  describe("updateCourt", () => {
    test("should update court without file", async () => {
      const req: any = {
        params: { id: "courtId1" },
        body: { name: "Updated Court" },
      };
      const res = makeRes();

      const updated = { _id: "courtId1", name: "Updated Court" };

      const spy = jest
        .spyOn(CourtService, "updateCourtService")
        .mockResolvedValue(updated as any);

      await updateCourt(req, res);

      expect(spy).toHaveBeenCalledWith("courtId1", { name: "Updated Court" });
      expect(json).toHaveBeenCalledWith({ success: true, court: updated });
    });

    test("should update court with image if file exists", async () => {
      const req: any = {
        params: { id: "courtId2" },
        body: { name: "Updated Court 2" },
        file: { filename: "new.png" },
      };
      const res = makeRes();

      const updated = { _id: "courtId2", name: "Updated Court 2", image: "new.png" };

      const spy = jest
        .spyOn(CourtService, "updateCourtService")
        .mockResolvedValue(updated as any);

      await updateCourt(req, res);

      expect(spy).toHaveBeenCalledWith("courtId2", {
        name: "Updated Court 2",
        image: "new.png",
      });

      expect(json).toHaveBeenCalledWith({ success: true, court: updated });
    });

    test("should return 500 if update service throws error", async () => {
      const req: any = {
        params: { id: "courtId3" },
        body: { name: "Fail Court" },
      };
      const res = makeRes();

      jest
        .spyOn(CourtService, "updateCourtService")
        .mockRejectedValue(new Error("Update failed"));

      await updateCourt(req, res);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        success: false,
        message: "Update failed",
      });
    });
  });

  describe("deleteCourt", () => {
    test("should delete court and return success", async () => {
      const req: any = { params: { id: "courtIdDel" } };
      const res = makeRes();

      const spy = jest
        .spyOn(CourtService, "deleteCourtService")
        .mockResolvedValue(undefined as any);

      await deleteCourt(req, res);

      expect(spy).toHaveBeenCalledWith("courtIdDel");
      expect(json).toHaveBeenCalledWith({ success: true, message: "Deleted" });
    });
  });
});