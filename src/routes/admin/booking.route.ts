import { Router } from "express";
import { authorizedMiddleware, adminOnlyMiddleware } from "../../middlewares/authorized.middleware";
import * as AdminBookingController from "../../controllers/admin/booking.controller";

const router = Router();

router.use(authorizedMiddleware);
router.use(adminOnlyMiddleware);

router.get("/", AdminBookingController.getAllBookings);

export default router;