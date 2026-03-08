import Court from "../models/court.model";

export const createCourt = (data: any) => Court.create(data);
export const getAllCourts = () => Court.find();
export const updateCourt = (id: string, data: any) =>
  Court.findByIdAndUpdate(id, data, { new: true });
export const deleteCourt = (id: string) =>
  Court.findByIdAndDelete(id);
