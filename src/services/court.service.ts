import Court from "../models/court.model";

export const getAllCourtsForUsers = async () => {
  return Court.find({ status: "available" }).sort({ createdAt: -1 });
};

export const getCourtByIdForUsers = async (id: string) => {
  return Court.findOne({ _id: id, status: "available" });
};