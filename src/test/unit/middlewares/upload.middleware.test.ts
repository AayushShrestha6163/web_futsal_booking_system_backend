const mockDiskStorage = jest.fn();
const mockSingle = jest.fn();
const mockArray = jest.fn();
const mockFields = jest.fn();

let capturedOptions: any = null;

// ✅ multer mock: capture options at creation time
jest.mock("multer", () => {
  const multerFn: any = (opts: any) => {
    capturedOptions = opts;
    return {
      single: mockSingle,
      array: mockArray,
      fields: mockFields,
    };
  };

  multerFn.diskStorage = mockDiskStorage;
  return multerFn;
});

// ✅ fs mock so no real folder creation
jest.mock("fs", () => ({
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
}));

describe("upload.middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedOptions = null;
    mockDiskStorage.mockReturnValue({}); // storage placeholder
  });

  // helper: reload module fresh so multer() runs again
  const loadUploads = async () => {
    jest.resetModules();
    const mod = await import("../../../middlewares/upload.middleware");
    return mod.uploads;
  };

  test("uploads.single should call multer.single with fieldName", async () => {
    const uploads = await loadUploads();

    uploads.single("profile");
    expect(mockSingle).toHaveBeenCalledWith("profile");
  });

  test("uploads.array should call multer.array with fieldName and maxCount", async () => {
    const uploads = await loadUploads();

    uploads.array("images", 3);
    expect(mockArray).toHaveBeenCalledWith("images", 3);
  });

  test("uploads.fields should call multer.fields with fields array", async () => {
    const uploads = await loadUploads();

    uploads.fields([{ name: "a", maxCount: 1 }]);
    expect(mockFields).toHaveBeenCalledWith([{ name: "a", maxCount: 1 }]);
  });

  test("fileFilter should accept allowed mime types", async () => {
    const uploads = await loadUploads();

    uploads.single("profile"); // ensures multer(options) called

    expect(capturedOptions).not.toBeNull();
    const fileFilter = capturedOptions.fileFilter as Function;

    const cb = jest.fn();
    const req: any = {};
    const file: any = { mimetype: "image/png" };

    fileFilter(req, file, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  test("fileFilter should reject disallowed mime types with HttpError 400", async () => {
    const uploads = await loadUploads();

    uploads.single("profile");

    expect(capturedOptions).not.toBeNull();
    const fileFilter = capturedOptions.fileFilter as Function;

    const cb = jest.fn();
    const req: any = {};
    const file: any = { mimetype: "application/pdf" };

    fileFilter(req, file, cb);

    const err = cb.mock.calls[0][0];
    expect(err).toBeTruthy();
    expect(err.statusCode).toBe(400);
    expect(String(err.message)).toContain("Invalid file type");
  });

  test("limits should be set to 5MB", async () => {
    const uploads = await loadUploads();

    uploads.single("profile");

    expect(capturedOptions).not.toBeNull();
    expect(capturedOptions.limits.fileSize).toBe(5 * 1024 * 1024);
  });
});