import mongoose from "mongoose";

/** The standing catalogue of carton types the warehouse stocks. */

const containerSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    width: {
      type: Number,
      required: true,
      min: 0,
    },

    length: {
      type: Number,
      required: true,
      min: 0,
    },

    depth: {
      type: Number,
      required: true,
      min: 0,
    },

    maxWeight: {
      type: Number,
      default: null,
      min: 0,
    },

    boxWeight: {
      type: Number,
      default: null,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },

    maximumBoxes: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true }
);

containerSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    reference: this.reference,
    width: this.width,
    length: this.length,
    depth: this.depth,
    maxWeight: this.maxWeight,
    boxWeight: this.boxWeight,
    active: this.active,
    maximumBoxes: this.maximumBoxes,
  };
};

export const Container = mongoose.model("Container", containerSchema);