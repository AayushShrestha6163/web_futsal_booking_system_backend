// src/test/unit/services/admin.user.service.test.ts

const getUserByEmailMock = jest.fn();
const createUserMock = jest.fn();
const getAllUsersMock = jest.fn();
const getUserByIdMock = jest.fn();
const deleteUserMock = jest.fn();
const updateUserMock = jest.fn();

jest.mock("../../../repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    getUserByEmail: getUserByEmailMock,
    createUser: createUserMock,
    getAllUsers: getAllUsersMock,
    getUserById: getUserByIdMock,
    deleteUser: deleteUserMock,
    updateUser: updateUserMock,
  })),
}));

const hashMock = jest.fn();

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: (...args: any[]) => hashMock(...args),
  },
}));

import { AdminUserService } from "../../../services/admin/user.service";

describe("AdminUserService", () => {
  const service = new AdminUserService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    test("should throw 403 if email already exists", async () => {
      getUserByEmailMock.mockResolvedValue({ _id: "u1" });

      await expect(
        service.createUser({ email: "a@a.com", password: "123" } as any)
      ).rejects.toMatchObject({ statusCode: 403 });

      expect(getUserByEmailMock).toHaveBeenCalledWith("a@a.com");
      expect(createUserMock).not.toHaveBeenCalled();
    });

    test("should hash password and create user", async () => {
      getUserByEmailMock.mockResolvedValue(null);
      hashMock.mockResolvedValue("hashed_pw");

      const created = { _id: "u2", email: "b@b.com", password: "hashed_pw" };
      createUserMock.mockResolvedValue(created);

      const dto: any = { email: "b@b.com", password: "plain" };
      const result = await service.createUser(dto);

      expect(hashMock).toHaveBeenCalledWith("plain", 10);
      expect(createUserMock).toHaveBeenCalledWith(
        expect.objectContaining({ email: "b@b.com", password: "hashed_pw" })
      );
      expect(result).toEqual(created);
    });
  });

  describe("getAllUsers", () => {
    test("should parse page/size and return users with pagination", async () => {
      getAllUsersMock.mockResolvedValue({
        users: [{ _id: "u1" }],
        total: 21,
      });

      const result = await service.getAllUsers("2", "5", "ram");

      expect(getAllUsersMock).toHaveBeenCalledWith(2, 5, "ram");

      expect(result).toEqual({
        users: [{ _id: "u1" }],
        pagination: {
          page: 2,
          size: 5,
          totalItems: 21,
          totalPages: Math.ceil(21 / 5), // 5
        },
      });
    });

    test("should use defaults page=1 size=10 if not provided", async () => {
      getAllUsersMock.mockResolvedValue({ users: [], total: 0 });

      const result = await service.getAllUsers(undefined, undefined, undefined);

      expect(getAllUsersMock).toHaveBeenCalledWith(1, 10, undefined);
      expect(result.pagination).toEqual({
        page: 1,
        size: 10,
        totalItems: 0,
        totalPages: 0,
      });
    });
  });

  describe("deleteUser", () => {
    test("should throw 404 if user not found", async () => {
      getUserByIdMock.mockResolvedValue(null);

      await expect(service.deleteUser("u1")).rejects.toMatchObject({
        statusCode: 404,
      });

      expect(deleteUserMock).not.toHaveBeenCalled();
    });

    test("should delete user if exists", async () => {
      getUserByIdMock.mockResolvedValue({ _id: "u1" });
      deleteUserMock.mockResolvedValue(true);

      const result = await service.deleteUser("u1");

      expect(deleteUserMock).toHaveBeenCalledWith("u1");
      expect(result).toBe(true);
    });
  });

  describe("updateUser", () => {
    test("should throw 404 if user not found", async () => {
      getUserByIdMock.mockResolvedValue(null);

      await expect(
        service.updateUser("u1", { firstName: "A" } as any)
      ).rejects.toMatchObject({ statusCode: 404 });

      expect(updateUserMock).not.toHaveBeenCalled();
    });

    test("should update user if exists", async () => {
      getUserByIdMock.mockResolvedValue({ _id: "u1" });
      updateUserMock.mockResolvedValue({ _id: "u1", firstName: "A" });

      const result = await service.updateUser("u1", { firstName: "A" } as any);

      expect(updateUserMock).toHaveBeenCalledWith("u1", { firstName: "A" });
      expect(result).toEqual({ _id: "u1", firstName: "A" });
    });
  });

  describe("getUserById", () => {
    test("should throw 404 if user not found", async () => {
      getUserByIdMock.mockResolvedValue(null);

      await expect(service.getUserById("x")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    test("should return user if found", async () => {
      const user = { _id: "u1", email: "a@a.com" };
      getUserByIdMock.mockResolvedValue(user);

      const result = await service.getUserById("u1");

      expect(getUserByIdMock).toHaveBeenCalledWith("u1");
      expect(result).toEqual(user);
    });
  });
});