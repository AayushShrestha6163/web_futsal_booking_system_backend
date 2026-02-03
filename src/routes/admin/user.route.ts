import { Router } from "express";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorized.middleware";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { uploads } from "../../middlewares/upload.middleware";
let adminUserController = new AdminUserController();

const router = Router();

router.use(authorizedMiddleware); // apply all with middleware
router.use(adminOnlyMiddleware); // apply all with middleware

router.post("/", uploads.single("profile"), adminUserController.createUser);
router.get("/", adminUserController.getAllUsers);
router.put("/:id", uploads.single("profile"), adminUserController.updateUser);
router.delete("/:id", adminUserController.deleteUser);
router.get("/:id", adminUserController.getUserById);

export default router;