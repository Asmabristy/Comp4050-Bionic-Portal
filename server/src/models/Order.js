import mongoose from "mongoose";

// Result shapes below mirror what Solver sends back.

const itemSchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      required: true,
      trim: true,
    },

    itemReference: {
      type: String,
      required: true,
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

    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    boxGroup: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  { _id: false }
);

const containerSchema = new mongoose.Schema(
  {
    reference: {
      type: String,
      required: true,
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
  { _id: false }
);
const placedItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
    },

    itemCode: {
      type: String,
      default: null,
    },

    itemReference: {
      type: String,
      default: null,
    },

    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      z: { type: Number, required: true },
    },

    rotation: {
      type: String,
      default: "XYZ",
    },

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

    totalWeight: {
      type: Number,
      default: null,
      min: 0,
    },

    utilization: {
      type: Number,
      default: null,
      min: 0,
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
