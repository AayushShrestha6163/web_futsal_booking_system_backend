// src/test/unit/services/admin.court.service.test.ts

import { addCourtService, deleteCourtService, getCourtsService, updateCourtService } from "../../../services/admin/court.service";

const createCourtMock = jest.fn();
const deleteCourtMock = jest.fn();

// Court model chain mocks
const findMock = jest.fn();
const sortMock = jest.fn();
const skipMock = jest.fn();
const limitMock = jest.fn();
const countDocumentsMock = jest.fn();
const findByIdAndUpdateMock = jest.fn();

jest.mock("../../../repositories/court.repository", () => ({
  createCourt: (...args: any[]) => createCourtMock(...args),
  deleteCourt: (...args: any[]) => deleteCourtMock(...args),
}));

jest.mock("../../../models/court.model", () => ({
  __esModule: true,
  default: {
    find: (...args: any[]) => findMock(...args),
    countDocuments: (...args: any[]) => countDocumentsMock(...args),
    findByIdAndUpdate: (...args: any[]) => findByIdAndUpdateMock(...args),
  },
}));



describe("Admin Court Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // chain: find().sort().skip().limit()
    limitMock.mockResolvedValue([{ _id: "c1" }, { _id: "c2" }]);
    skipMock.mockReturnValue({ limit: limitMock });
    sortMock.mockReturnValue({ skip: skipMock });
    findMock.mockReturnValue({ sort: sortMock });
  });

  describe("addCourtService", () => {
    test("should call createCourt with isActive:true", async () => {
      createCourtMock.mockResolvedValue({ _id: "c1" });

      const data = { name: "Court A", location: "KTM" };
      const result = await addCourtService(data);

      expect(createCourtMock).toHaveBeenCalledWith({
        ...data,
        isActive: true,
      });
      expect(result).toEqual({ _id: "c1" });
    });
  });

  describe("getCourtsService", () => {
    test("should return courts + pagination values", async () => {
      countDocumentsMock.mockResolvedValue(25); // total=25, limit=10 => pages=3

      const result = await getCourtsService(2, 10);

      expect(findMock).toHaveBeenCalledWith();
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(skipMock).toHaveBeenCalledWith(10); // (2-1)*10
      expect(limitMock).toHaveBeenCalledWith(10);

      expect(countDocumentsMock).toHaveBeenCalledWith();

      expect(result).toEqual({
        courts: [{ _id: "c1" }, { _id: "c2" }],
        total: 25,
        totalPages: 3,
      });
    });
  });

  describe("updateCourtService", () => {
    test("should call Court.findByIdAndUpdate with {new:true}", async () => {
      const updated = { _id: "c1", name: "Updated" };
      findByIdAndUpdateMock.mockResolvedValue(updated);

      const result = await updateCourtService("c1", { name: "Updated" });

      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
        "c1",
        { name: "Updated" },
        { new: true }
      );
      expect(result).toEqual(updated);
    });
  });

  describe("deleteCourtService", () => {
    test("should call repo.deleteCourt", async () => {
      deleteCourtMock.mockResolvedValue({ _id: "c1" });

      const result = await deleteCourtService("c1");

      expect(deleteCourtMock).toHaveBeenCalledWith("c1");
      expect(result).toEqual({ _id: "c1" });
    });
  });
});