import { Router } from "express";
import * as CourtController from "../controllers/court.controller";

const router = Router();

// Public or user-authenticated (your choice)
router.get("/", CourtController.getAllCourtsForUsers);
router.get("/:id", CourtController.getCourtByIdForUsers);

export default router;