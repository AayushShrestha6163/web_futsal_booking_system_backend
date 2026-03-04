// src/test/unit/repositories/court.repository.test.ts

const createMock = jest.fn();
const findMock = jest.fn();
const findByIdAndUpdateMock = jest.fn();
const findByIdAndDeleteMock = jest.fn();

// ✅ Court is a default export in your repo: import Court from "../models/court.model"
jest.mock("../../../models/court.model", () => ({
  __esModule: true,
  default: {
    create: (...args: any[]) => createMock(...args),
    find: (...args: any[]) => findMock(...args),
    findByIdAndUpdate: (...args: any[]) => findByIdAndUpdateMock(...args),
    findByIdAndDelete: (...args: any[]) => findByIdAndDeleteMock(...args),
  },
}));

import * as CourtRepo from "../../../repositories/court.repository";

describe("court.repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createCourt should call Court.create and return created court", async () => {
    const data = { name: "Court A", location: "KTM" };
    const created = { _id: "c1", ...data };

    createMock.mockResolvedValue(created);

    const result = await CourtRepo.createCourt(data);

    expect(createMock).toHaveBeenCalledWith(data);
    expect(result).toEqual(created);
  });

  test("getAllCourts should call Court.find and return courts", async () => {
    const courts = [{ _id: "c1" }, { _id: "c2" }];

    findMock.mockResolvedValue(courts);

    const result = await CourtRepo.getAllCourts();

    expect(findMock).toHaveBeenCalledWith();
    expect(result).toEqual(courts);
  });

  test("updateCourt should call Court.findByIdAndUpdate with {new:true}", async () => {
    const updated = { _id: "c1", name: "Updated Court" };

    findByIdAndUpdateMock.mockResolvedValue(updated);

    const result = await CourtRepo.updateCourt("c1", { name: "Updated Court" });

    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
      "c1",
      { name: "Updated Court" },
      { new: true }
    );
    expect(result).toEqual(updated);
  });

  test("deleteCourt should call Court.findByIdAndDelete and return deleted doc", async () => {
    const deleted = { _id: "c1" };

    findByIdAndDeleteMock.mockResolvedValue(deleted);

    const result = await CourtRepo.deleteCourt("c1");

    expect(findByIdAndDeleteMock).toHaveBeenCalledWith("c1");
    expect(result).toEqual(deleted);
  });
});