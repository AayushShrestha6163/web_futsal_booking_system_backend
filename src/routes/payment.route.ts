import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import * as PaymentController from "../controllers/payment.controller";

const router = Router();


router.post("/esewa/initiate", authorizedMiddleware, PaymentController.initiateEsewa);


router.get("/esewa/success", PaymentController.esewaSuccess);
router.get("/esewa/failure", PaymentController.esewaFailure);

export default router;