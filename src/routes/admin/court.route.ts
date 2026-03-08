import { Router } from "express";
import {
  authorizedMiddleware,
  adminOnlyMiddleware,
} from "../../middlewares/authorized.middleware";
import * as CourtController from "../../controllers/admin/court.controller";
import { uploads } from "../../middlewares/upload.middleware";

const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

router.post("/", uploads.single("image"), CourtController.addCourt);
router.get("/", CourtController.getCourts);
router.put("/:id", uploads.single("image"), CourtController.updateCourt);
router.delete("/:id", CourtController.deleteCourt);

export default router;
