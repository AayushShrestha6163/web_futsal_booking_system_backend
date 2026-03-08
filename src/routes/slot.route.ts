import { Router } from "express";
import * as SlotController from "../controllers/slot.controller";

const router = Router();

router.get("/:courtId/slots", SlotController.getAvailableSlots);

export default router;
