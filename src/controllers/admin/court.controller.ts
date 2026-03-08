import { Request, Response } from "express";
import * as CourtService from "../../services/admin/court.service";

export const addCourt = async (req: Request, res: Response) => {
  const image = req.file ? req.file.filename : undefined;
  const court = await CourtService.addCourtService({ ...req.body, image });
  res.status(201).json({ success: true, court });
};

export const getCourts = async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
  const limit = Math.max(1, parseInt(String(req.query.limit || "6"), 10));

  const result = await CourtService.getCourtsService(page, limit);

  res.json({
    success: true,
    courts: result.courts,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
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
