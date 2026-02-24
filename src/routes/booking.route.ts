import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import * as BookingController from "../controllers/booking.controller";

const router = Router();

router.use(authorizedMiddleware);

router.post("/", BookingController.createBooking);
router.get("/me", BookingController.getMyBookings);
router.delete("/:id", BookingController.cancelBooking);


export default router;
