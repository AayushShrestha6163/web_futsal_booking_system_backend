import { Request, Response } from "express";
import * as CourtService from "../../services/admin/court.service";

export const addCourt = async (req: Request, res: Response) => {
  const image = req.file ? req.file.filename : undefined;
  const court = await CourtService.addCourtService({ ...req.body, image });
  res.status(201).json({ success: true, court });
};

export const getCourts = async (_: Request, res: Response) => {
  const courts = await CourtService.getCourtsService();
  res.json({ success: true, courts });
};

export const updateCourt = async (req: Request, res: Response) => {
  try {
    const updateData: any = { ...req.body };

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const court = await CourtService.updateCourtService(
      req.params.id,
      updateData
    );

    return res.json({ success: true, court });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteCourt = async (req: Request, res: Response) => {
  await CourtService.deleteCourtService(req.params.id);
  res.json({ success: true, message: "Deleted" });
};
