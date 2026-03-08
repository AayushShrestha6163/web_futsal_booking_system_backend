const mockCreateUser = jest.fn();
const mockLoginUser = jest.fn();
const mockUpdateUser = jest.fn();
const mockGetUserById = jest.fn();
const mockSendResetPasswordEmail = jest.fn();
const mockResetPassword = jest.fn();
const mockGetMyProfile = jest.fn();

jest.mock("../../../services/user.services", () => ({
  UserService: jest.fn().mockImplementation(() => ({
    createUser: mockCreateUser,
    loginUser: mockLoginUser,
    updateUser: mockUpdateUser,
    getUserById: mockGetUserById,
    sendResetPasswordEmail: mockSendResetPasswordEmail,
    resetPassword: mockResetPassword,
    getMyProfile: mockGetMyProfile,
  })),
}));

import { AuthController } from "../../../controllers/auth.controller";

describe("AuthController", () => {
  const controller = new AuthController();

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

  describe("register", () => {
    test("should register user successfully", async () => {
      const req: any = {
        body: { email: "test@test.com", password: "Password123!" },
      };
      const res = makeRes();

      const createdUser = { _id: "u1", email: "test@test.com" };
      mockCreateUser.mockResolvedValue(createdUser);

      await controller.register(req, res);

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        success: true,
        message: "User Created",
        data: createdUser,
      });
    });

    test("should return 400 if validation fails", async () => {
      const req: any = { body: {} };
      const res = makeRes();

      await controller.register(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: expect.any(String) })
      );
    });
  });

  describe("login", () => {
    test("should login successfully", async () => {
      const req: any = {
        body: { email: "test@test.com", password: "Password123!" },
      };
      const res = makeRes();

      const user = { _id: "u1", email: "test@test.com" };
      mockLoginUser.mockResolvedValue({ token: "token123", user });

      await controller.login(req, res);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        data: user,
        token: "token123",
      });
    });

    test("should return 400 if validation fails", async () => {
      const req: any = { body: {} };
      const res = makeRes();

      await controller.login(req, res);

      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: expect.any(String) })
      );
    });

    // ✅ FIXED: use VALID body so it reaches service and returns 401
    test("should return error.statusCode if service throws", async () => {
      const req: any = {
        body: { email: "test@test.com", password: "Password123!" }, // valid
      };
      const res = makeRes();

      mockLoginUser.mockRejectedValue({ statusCode: 401, message: "Invalid credentials" });

      await controller.login(req, res);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({ success: false, message: "Invalid credentials" });
    });
  });
});