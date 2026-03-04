import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

let authController = new AuthController();
const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)

router.put("/update", authorizedMiddleware, uploads.single("profile"), authController.updateUser)
router.get("/users/:id", authController.getUserById)
router.get("/me", authorizedMiddleware, authController.getMyProfile.bind(authController));
router.post(
    '/request-password-reset',
    authController.requestPasswordReset
)
router.post("/reset-password/:token", authController.resetPassword);


export default router;