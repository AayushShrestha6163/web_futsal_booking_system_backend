// IMPORTANT: mock service BEFORE importing controller
const mockCreateUser = jest.fn();
const mockGetAllUsers = jest.fn();
const mockUpdateUser = jest.fn();
const mockDeleteUser = jest.fn();
const mockGetUserById = jest.fn();

jest.mock("../../../services/admin/user.service", () => ({
  AdminUserService: jest.fn().mockImplementation(() => ({
    createUser: mockCreateUser,
    getAllUsers: mockGetAllUsers,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser,
    getUserById: mockGetUserById,
  })),
}));

import { AdminUserController } from "../../../controllers/admin/user.controller";

describe("AdminUserController", () => {
  const controller = new AdminUserController();

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

  describe("createUser", () => {
    test("should create user successfully (no file)", async () => {
      const req: any = {
        body: { email: "a@a.com", password: "Password123!" },
      };
      const res = makeRes();

      const createdUser = { _id: "u1", email: "a@a.com" };
      mockCreateUser.mockResolvedValue(createdUser);

      await controller.createUser(req, res, jest.fn());

      expect(mockCreateUser).toHaveBeenCalledTimes(1);
      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        success: true,
        message: "User Created",
        data: createdUser,
      });
    });

    test("should create user successfully (with file sets profile)", async () => {
      const req: any = {
        body: { email: "b@b.com", password: "Password123!" },
        file: { filename: "profile.png" },
      };
      const res = makeRes();

      const createdUser = { _id: "u2", email: "b@b.com" };
      mockCreateUser.mockResolvedValue(createdUser);

      await controller.createUser(req, res, jest.fn());

      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({ profile: "/uploads/profile.png" })
      );

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        success: true,
        message: "User Created",
        data: createdUser,
      });
    });

    test("should return 400 if validation fails", async () => {
      const req: any = { body: {} }; // invalid for CreateUserDTO
      const res = makeRes();

      await controller.createUser(req, res, jest.fn());

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
        })
      );
    });

    test("should return error.statusCode if service throws", async () => {
      const req: any = {
        body: { email: "c@c.com", password: "Password123!" },
      };
      const res = makeRes();

      mockCreateUser.mockRejectedValue({ statusCode: 409, message: "Email exists" });

      await controller.createUser(req, res, jest.fn());

      expect(status).toHaveBeenCalledWith(409);
      expect(json).toHaveBeenCalledWith({ success: false, message: "Email exists" });
    });
  });

  describe("getAllUsers", () => {
    test("should return all users with pagination", async () => {
      const req: any = { query: { page: "1", size: "10", search: "" } };
      const res = makeRes();

      const users = [{ _id: "u1" }, { _id: "u2" }];
      const pagination = { page: 1, size: 10, total: 2, totalPages: 1 };

      mockGetAllUsers.mockResolvedValue({ users, pagination });

      await controller.getAllUsers(req, res, jest.fn());

      expect(mockGetAllUsers).toHaveBeenCalledWith(
        req.query.page,
        req.query.size,
        req.query.search
      );

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: users,
        pagination,
        message: "All Users Retrieved",
      });
    });
  });

  describe("updateUser", () => {
    test("should update user successfully (no file)", async () => {
      const req: any = {
        params: { id: "u1" },
        body: { firstName: "New" },
      };
      const res = makeRes();

      const updatedUser = { _id: "u1", firstName: "New" };
      mockUpdateUser.mockResolvedValue(updatedUser);

      await controller.updateUser(req, res, jest.fn());

      expect(mockUpdateUser).toHaveBeenCalledWith("u1", expect.any(Object));

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        message: "User Updated",
        data: updatedUser,
      });
    });

    test("should update user successfully (with file sets profile)", async () => {
      const req: any = {
        params: { id: "u2" },
        body: { firstName: "New2" },
        file: { filename: "newpic.png" },
      };
      const res = makeRes();

      const updatedUser = { _id: "u2", profile: "/uploads/newpic.png" };
      mockUpdateUser.mockResolvedValue(updatedUser);

      await controller.updateUser(req, res, jest.fn());

      expect(mockUpdateUser).toHaveBeenCalledWith(
        "u2",
        expect.objectContaining({ profile: "/uploads/newpic.png" })
      );

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        message: "User Updated",
        data: updatedUser,
      });
    });

    // ✅ FIXED: guaranteed invalid type for zod (string expected, number provided)
    test("should return 400 if validation fails", async () => {
      const req: any = {
        params: { id: "u3" },
        body: { firstName: 12345 }, // ❌ invalid
      };
      const res = makeRes();

      await controller.updateUser(req, res, jest.fn());

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.any(String),
        })
      );
    });
  });

  describe("deleteUser", () => {
    test("should delete user successfully", async () => {
      const req: any = { params: { id: "u1" } };
      const res = makeRes();

      mockDeleteUser.mockResolvedValue(true);

      await controller.deleteUser(req, res, jest.fn());

      expect(mockDeleteUser).toHaveBeenCalledWith("u1");

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({ success: true, message: "User Deleted" });
    });

    test("should return 404 if user not found", async () => {
      const req: any = { params: { id: "missing" } };
      const res = makeRes();

      mockDeleteUser.mockResolvedValue(false);

      await controller.deleteUser(req, res, jest.fn());

      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith({ success: false, message: "User not found" });
    });
  });

  describe("getUserById", () => {
    test("should return a single user", async () => {
      const req: any = { params: { id: "u1" } };
      const res = makeRes();

      const user = { _id: "u1", email: "a@a.com" };
      mockGetUserById.mockResolvedValue(user);

      await controller.getUserById(req, res, jest.fn());

      expect(mockGetUserById).toHaveBeenCalledWith("u1");

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        data: user,
        message: "Single User Retrieved",
      });
    });
  });
});