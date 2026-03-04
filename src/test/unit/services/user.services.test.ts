// src/test/unit/services/user.services.test.ts

const getUserByEmailMock = jest.fn();
const createUserMock = jest.fn();
const updateUserMock = jest.fn();
const getUserByIdMock = jest.fn();

jest.mock("../../../repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    getUserByEmail: getUserByEmailMock,
    createUser: createUserMock,
    updateUser: updateUserMock,
    getUserById: getUserByIdMock,
  })),
}));

const hashMock = jest.fn();
const compareMock = jest.fn();

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: (...a: any[]) => hashMock(...a),
    compare: (...a: any[]) => compareMock(...a),
  },
}));

const signMock = jest.fn();
const verifyMock = jest.fn();

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: (...a: any[]) => signMock(...a),
    verify: (...a: any[]) => verifyMock(...a),
  },
}));

const sendEmailMock = jest.fn();
jest.mock("../../../config/email", () => ({
  sendEmail: (...a: any[]) => sendEmailMock(...a),
}));

jest.mock("../../../config", () => ({
  CLIENT_URL: "http://localhost:3000",
  JWT_SECRET: "secret",
}));

import { UserService } from "../../../services/user.services";

describe("UserService", () => {
  const service = new UserService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    test("should throw if email exists", async () => {
      getUserByEmailMock.mockResolvedValue({ _id: "u1" });

      await expect(
        service.createUser({ email: "a@a.com", password: "p" } as any)
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    test("should hash password and create user", async () => {
      getUserByEmailMock.mockResolvedValue(null);
      hashMock.mockResolvedValue("hashed");

      createUserMock.mockResolvedValue({ _id: "u2", email: "b@b.com" });

      const dto: any = { email: "b@b.com", password: "plain" };
      const result = await service.createUser(dto);

      expect(hashMock).toHaveBeenCalledWith("plain", 10);
      expect(createUserMock).toHaveBeenCalledWith(
        expect.objectContaining({ password: "hashed" })
      );
      expect(result).toEqual({ _id: "u2", email: "b@b.com" });
    });
  });

  describe("loginUser", () => {
    test("should throw 404 if user not found", async () => {
      getUserByEmailMock.mockResolvedValue(null);

      await expect(
        service.loginUser({ email: "x@x.com", password: "p" } as any)
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    test("should throw 401 if password invalid", async () => {
      getUserByEmailMock.mockResolvedValue({ _id: "u1", email: "a@a.com", password: "hashed" });
      compareMock.mockResolvedValue(false);

      await expect(
        service.loginUser({ email: "a@a.com", password: "wrong" } as any)
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    test("should return token and user when ok", async () => {
      const user = { _id: "u1", email: "a@a.com", password: "hashed", role: "user" };
      getUserByEmailMock.mockResolvedValue(user);
      compareMock.mockResolvedValue(true);
      signMock.mockReturnValue("token123");

      const result = await service.loginUser({ email: "a@a.com", password: "p" } as any);

      expect(signMock).toHaveBeenCalled();
      expect(result).toEqual({ token: "token123", user });
    });
  });

  describe("updateUser", () => {
    test("should hash password if password provided", async () => {
      hashMock.mockResolvedValue("hashedNew");
      updateUserMock.mockResolvedValue({ _id: "u1" });

      await service.updateUser("u1", { password: "new" } as any);

      expect(hashMock).toHaveBeenCalledWith("new", 10);
      expect(updateUserMock).toHaveBeenCalledWith("u1", { password: "hashedNew" });
    });

    test("should throw 404 if update returns null", async () => {
      updateUserMock.mockResolvedValue(null);

      await expect(service.updateUser("u1", { firstName: "A" } as any)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe("sendResetPasswordEmail", () => {
    test("should throw 400 if email missing", async () => {
      await expect(service.sendResetPasswordEmail(undefined)).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    test("should throw 404 if user not found", async () => {
      getUserByEmailMock.mockResolvedValue(null);

      await expect(service.sendResetPasswordEmail("x@x.com")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    test("should send email with reset link", async () => {
      getUserByEmailMock.mockResolvedValue({ _id: "u1", email: "a@a.com" });
      signMock.mockReturnValue("resetToken");

      await service.sendResetPasswordEmail("a@a.com");

      expect(sendEmailMock).toHaveBeenCalled();
      const htmlArg = sendEmailMock.mock.calls[0][2];
      expect(String(htmlArg)).toContain("resetToken");
    });
  });

  describe("resetPassword", () => {
    test("should throw invalid token if verify fails", async () => {
      verifyMock.mockImplementation(() => {
        throw new Error("bad");
      });

      await expect(service.resetPassword("t", "new")).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    test("should update password when valid", async () => {
      verifyMock.mockReturnValue({ id: "u1" });
      getUserByIdMock.mockResolvedValue({ _id: "u1" });
      hashMock.mockResolvedValue("hashedNew");

      await service.resetPassword("t", "new");

      expect(updateUserMock).toHaveBeenCalledWith("u1", { password: "hashedNew" });
    });
  });

  describe("getMyProfile", () => {
    test("should remove password from returned object", async () => {
      getUserByIdMock.mockResolvedValue({
        toObject: () => ({ email: "a@a.com", password: "hashed" }),
      });

      const res = await service.getMyProfile("u1");

      expect(res.password).toBeUndefined();
      expect(res.email).toBe("a@a.com");
    });
  });
});