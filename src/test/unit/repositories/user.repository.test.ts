// src/test/unit/repositories/user.repository.test.ts

const saveMock = jest.fn();

// chain mocks for getAllUsers
const skipMock = jest.fn();
const limitMock = jest.fn();

const findOneMock = jest.fn();
const findByIdMock = jest.fn();
const findMock = jest.fn();
const countDocumentsMock = jest.fn();
const findByIdAndUpdateMock = jest.fn();
const findByIdAndDeleteMock = jest.fn();

// ✅ Mock UserModel (note: in your repository you use `new UserModel(...)` too)
jest.mock("../../../models/user.model", () => {
  // this function will behave like a constructor when called with `new`
  const UserModelCtor: any = function (this: any, data: any) {
    Object.assign(this, data);
    this.save = saveMock;
  };

  // attach static methods used by repository
  UserModelCtor.findOne = (...args: any[]) => findOneMock(...args);
  UserModelCtor.findById = (...args: any[]) => findByIdMock(...args);
  UserModelCtor.find = (...args: any[]) => findMock(...args);
  UserModelCtor.countDocuments = (...args: any[]) => countDocumentsMock(...args);
  UserModelCtor.findByIdAndUpdate = (...args: any[]) => findByIdAndUpdateMock(...args);
  UserModelCtor.findByIdAndDelete = (...args: any[]) => findByIdAndDeleteMock(...args);

  return {
    __esModule: true,
    UserModel: UserModelCtor,
  };
});

import { UserRepository } from "../../../repositories/user.repository";

describe("UserRepository", () => {
  const repo = new UserRepository();

  beforeEach(() => {
    jest.clearAllMocks();

    // default chain for UserModel.find(filter).skip().limit()
    limitMock.mockResolvedValue([{ _id: "u1" }]);
    skipMock.mockReturnValue({ limit: limitMock });
    findMock.mockReturnValue({ skip: skipMock });
  });

  describe("createUser", () => {
    test("should create new UserModel and call save()", async () => {
      const userData = { email: "test@test.com", password: "hashed" };
      const savedUser = { _id: "u1", ...userData };

      saveMock.mockResolvedValue(savedUser);

      const result = await repo.createUser(userData as any);

      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(savedUser);
    });
  });

  describe("getUserByEmail", () => {
    test("should call UserModel.findOne with email filter", async () => {
      const user = { _id: "u1", email: "a@a.com" };
      findOneMock.mockResolvedValue(user);

      const result = await repo.getUserByEmail("a@a.com");

      expect(findOneMock).toHaveBeenCalledWith({ email: "a@a.com" });
      expect(result).toEqual(user);
    });

    test("should return null if no user found", async () => {
      findOneMock.mockResolvedValue(null);

      const result = await repo.getUserByEmail("missing@a.com");

      expect(result).toBeNull();
    });
  });

  describe("getUserById", () => {
    test("should call UserModel.findById", async () => {
      const user = { _id: "u1" };
      findByIdMock.mockResolvedValue(user);

      const result = await repo.getUserById("u1");

      expect(findByIdMock).toHaveBeenCalledWith("u1");
      expect(result).toEqual(user);
    });
  });

  describe("getAllUsers", () => {
    test("should return users+total without search", async () => {
      const users = [{ _id: "u1" }, { _id: "u2" }];
      limitMock.mockResolvedValue(users);
      countDocumentsMock.mockResolvedValue(2);

      const result = await repo.getAllUsers(2, 10); // page 2, size 10

      // filter should be empty
      expect(findMock).toHaveBeenCalledWith({});

      // skip should use (page - 1) * size => (2-1)*10 = 10
      expect(skipMock).toHaveBeenCalledWith(10);
      expect(limitMock).toHaveBeenCalledWith(10);

      expect(countDocumentsMock).toHaveBeenCalledWith({});
      expect(result).toEqual({ users, total: 2 });
    });

    test("should apply $or regex filter when search provided", async () => {
      const users = [{ _id: "u1" }];
      limitMock.mockResolvedValue(users);
      countDocumentsMock.mockResolvedValue(1);

      const result = await repo.getAllUsers(1, 5, "ram");

      const expectedFilter = {
        $or: [
          { username: { $regex: "ram", $options: "i" } },
          { email: { $regex: "ram", $options: "i" } },
          { firstName: { $regex: "ram", $options: "i" } },
          { lastName: { $regex: "ram", $options: "i" } },
        ],
      };

      expect(findMock).toHaveBeenCalledWith(expectedFilter);
      expect(countDocumentsMock).toHaveBeenCalledWith(expectedFilter);
      expect(result).toEqual({ users, total: 1 });
    });
  });

  describe("updateUser", () => {
    test("should call findByIdAndUpdate with {new:true}", async () => {
      const updated = { _id: "u1", firstName: "Aayush" };
      findByIdAndUpdateMock.mockResolvedValue(updated);

      const result = await repo.updateUser("u1", { firstName: "Aayush" } as any);

      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
        "u1",
        { firstName: "Aayush" },
        { new: true }
      );
      expect(result).toEqual(updated);
    });

    test("should return null if user not found", async () => {
      findByIdAndUpdateMock.mockResolvedValue(null);

      const result = await repo.updateUser("missing", { firstName: "X" } as any);

      expect(result).toBeNull();
    });
  });

  describe("deleteUser", () => {
    test("should return true if findByIdAndDelete returns doc", async () => {
      findByIdAndDeleteMock.mockResolvedValue({ _id: "u1" });

      const result = await repo.deleteUser("u1");

      expect(findByIdAndDeleteMock).toHaveBeenCalledWith("u1");
      expect(result).toBe(true);
    });

    test("should return false if findByIdAndDelete returns null", async () => {
      findByIdAndDeleteMock.mockResolvedValue(null);

      const result = await repo.deleteUser("missing");

      expect(result).toBe(false);
    });
  });
});