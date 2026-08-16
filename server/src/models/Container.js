import mongoose from "mongoose";

/** The standing catalogue of carton types the warehouse stocks. */
const containerSchema = new mongoose.Schema(
  {
    boxId: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    w: { type: Number, required: true, min: 0 },
    h: { type: Number, required: true, min: 0 },
    d: { type: Number, required: true, min: 0 },
    maxWeight: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

containerSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    boxId: this.boxId,
    label: this.label,
    w: this.w,
    h: this.h,
    d: this.d,
    maxWeight: this.maxWeight,
    active: this.active,
  };
};

export const Container = mongoose.model("Container", containerSchema);
