import * as CourtRepo from "../../repositories/court.repository";
import Court from "../../models/court.model";

export const addCourtService = (data: any) =>
  CourtRepo.createCourt({ ...data, isActive: true });

export const getCourtsService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [courts, total] = await Promise.all([
    Court.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Court.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { courts, total, totalPages };
};

export const updateCourtService = async (id: string, updateData: any) => {
  return Court.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteCourtService = (id: string) => CourtRepo.deleteCourt(id);