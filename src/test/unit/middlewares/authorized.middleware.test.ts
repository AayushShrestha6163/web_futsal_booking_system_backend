import { Request, Response } from "express";

const mockVerify = jest.fn();

// ✅ mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  verify: (...args: any[]) => mockVerify(...args),
}));

// ✅ mock JWT_SECRET from config
jest.mock("../../../config", () => ({
  JWT_SECRET: "test-secret",
}));

// ✅ mock UserRepository class
const mockGetUserById = jest.fn();

jest.mock("../../../repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    getUserById: mockGetUserById,
  })),
}));

import { authorizedMiddleware, adminOnlyMiddleware } from "../../../middlewares/authorized.middleware";

describe("authorized.middleware", () => {
  const makeRes = () => {
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    return { status, json } as any as Response;
  };

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("authorizedMiddleware", () => {
    test("should return 401 if Authorization header missing", async () => {
      const req: any = { headers: {} } as Request;
      const res = makeRes();

      await authorizedMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized Token Malformed",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 401 if Authorization header malformed", async () => {
      const req: any = { headers: { authorization: "Token abc" } };
      const res = makeRes();

      await authorizedMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized Token Malformed",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 401 if token missing after Bearer", async () => {
      const req: any = { headers: { authorization: "Bearer " } };
      const res = makeRes();

      await authorizedMiddleware(req, res, next);

      // Your code splits and token becomes "" -> treated as missing
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized Token Missing",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 401 if jwt.verify returns no id", async () => {
      const req: any = { headers: { authorization: "Bearer abc" } };
      const res = makeRes();

      mockVerify.mockReturnValue({}); // no id

      await authorizedMiddleware(req, res, next);

      expect(mockVerify).toHaveBeenCalledWith("abc", "test-secret");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized Token Invalid",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 401 if user not found", async () => {
      const req: any = { headers: { authorization: "Bearer abc" } };
      const res = makeRes();

      mockVerify.mockReturnValue({ id: "u1" });
      mockGetUserById.mockResolvedValue(null);

      await authorizedMiddleware(req, res, next);

      expect(mockGetUserById).toHaveBeenCalledWith("u1");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized User Not Found",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should attach user and call next() if valid", async () => {
      const req: any = { headers: { authorization: "Bearer abc" } };
      const res = makeRes();

      const user = { _id: "u1", role: "user", email: "a@a.com" };

      mockVerify.mockReturnValue({ id: "u1" });
      mockGetUserById.mockResolvedValue(user);

      await authorizedMiddleware(req, res, next);

      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("should return 500 if jwt.verify throws unknown error", async () => {
      const req: any = { headers: { authorization: "Bearer abc" } };
      const res = makeRes();

      mockVerify.mockImplementation(() => {
        throw new Error("jwt error");
      });

      await authorizedMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "jwt error",
      });
    });
  });

  describe("adminOnlyMiddleware", () => {
    test("should return 401 if req.user missing", async () => {
      const req: any = {};
      const res = makeRes();

      await adminOnlyMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized User Not Found",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should return 403 if user is not admin", async () => {
      const req: any = { user: { role: "user" } };
      const res = makeRes();

      await adminOnlyMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Forbidden Admins Only",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("should call next if user is admin", async () => {
      const req: any = { user: { role: "admin" } };
      const res = makeRes();

      await adminOnlyMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});