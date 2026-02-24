import { Schema, model } from "mongoose";

const CourtSchema = new Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    openingTime: { type: String, required: true },
    closingTime: { type: String, required: true },
    image: { type: String },
    status: {
      type: String,
      enum: ["available", "maintenance"],
      default: "available",
    },
  },
  { timestamps: true }
);

export default model("Court", CourtSchema);
