import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
// add remaning routes like login, logout, etc.
router.put("/update", authorizedMiddleware, uploads.single("profile"), authController.updateUser)
router.get("/users/:id", authController.getUserById)
router.post(
    '/request-password-reset',
    authController.requestPasswordReset
)
router.post("/reset-password/:token", authController.resetPassword);


export default router;