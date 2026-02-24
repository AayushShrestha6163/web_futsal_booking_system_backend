import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import * as PaymentController from "../controllers/payment.controller";

const router = Router();

// user initiates payment
router.post("/esewa/initiate", authorizedMiddleware, PaymentController.initiateEsewa);

// esewa redirects here (no auth)
router.get("/esewa/success", PaymentController.esewaSuccess);
router.get("/esewa/failure", PaymentController.esewaFailure);

export default router;