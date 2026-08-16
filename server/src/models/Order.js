import mongoose from "mongoose";

// Result shapes below mirror what Solver sends back.

const itemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    label: { type: String, default: "" },
    w: { type: Number, required: true, min: 0 },
    h: { type: Number, required: true, min: 0 },
    d: { type: Number, required: true, min: 0 },
    weight: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const containerSchema = new mongoose.Schema(
  {
    boxId: { type: String, required: true },
    label: { type: String, default: "" },
    w: { type: Number, required: true, min: 0 },
    h: { type: Number, required: true, min: 0 },
    d: { type: Number, required: true, min: 0 },
    maxWeight: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const placedItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },
    rotation: { type: String, default: "XYZ" },
    dimensions: {
      w: { type: Number, required: true },
      h: { type: Number, required: true },
      d: { type: Number, required: true },
    },
  },
  { _id: false }
);

const packedBoxSchema = new mongoose.Schema(
  {
    boxId: { type: String, required: true },
    dimensions: {
      w: { type: Number, required: true },
      h: { type: Number, required: true },
      d: { type: Number, required: true },
    },
    items: [placedItemSchema],
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["success", "error"], required: true },
    message: { type: String, default: "" },
    boxes: [packedBoxSchema],
    unpacked: [{ type: String }],
    solvedAt: { type: Date, default: Date.now },
    solverMs: { type: Number, default: 0 },
    source: { type: String, default: "solver" }, // "solver" | "mock"
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["draft", "packing", "packed", "failed"],
      default: "draft",
      index: true,
    },
    items: { type: [itemSchema], default: [] },
    containers: { type: [containerSchema], default: [] },
    result: { type: resultSchema, default: null },
  },
  { timestamps: true }
);

orderSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    reference: this.reference,
    status: this.status,
    items: this.items,
    containers: this.containers,
    result: this.result,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Order = mongoose.model("Order", orderSchema);
