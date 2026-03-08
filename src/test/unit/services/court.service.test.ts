// src/test/unit/services/court.service.test.ts

const findMock = jest.fn();
const findOneMock = jest.fn();
const sortMock = jest.fn();

jest.mock("../../../models/court.model", () => ({
  __esModule: true,
  default: {
    find: (...a: any[]) => findMock(...a),
    findOne: (...a: any[]) => findOneMock(...a),
  },
}));

import {
  getAllCourtsForUsers,
  getCourtByIdForUsers,
} from "../../../services/court.service";

describe("court.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sortMock.mockResolvedValue([{ _id: "c1" }]);
    findMock.mockReturnValue({ sort: sortMock });
  });

  test("getAllCourtsForUsers should find available courts and sort by createdAt desc", async () => {
    const result = await getAllCourtsForUsers();

    expect(findMock).toHaveBeenCalledWith({ status: "available" });
    expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toEqual([{ _id: "c1" }]);
  });

  test("getCourtByIdForUsers should findOne by id and status available", async () => {
    findOneMock.mockResolvedValue({ _id: "c1" });

    const result = await getCourtByIdForUsers("c1");

    expect(findOneMock).toHaveBeenCalledWith({ _id: "c1", status: "available" });
    expect(result).toEqual({ _id: "c1" });
  });
});