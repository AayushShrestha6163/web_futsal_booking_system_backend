import * as CourtRepo from "../../repositories/court.repository";
import Court from "../../models/court.model";

export const addCourtService = (data: any) =>
  CourtRepo.createCourt({ ...data, isActive: true }); // ✅ add this

export const getCourtsService = () => CourtRepo.getAllCourts();

export const updateCourtService = async (id: string, updateData: any) => {
  return Court.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteCourtService = (id: string) => CourtRepo.deleteCourt(id);