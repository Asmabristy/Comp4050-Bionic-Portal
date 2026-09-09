import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["operator", "supervisor", "admin"],
      default: "operator",
    },
  },
  { timestamps: true }
);

userSchema.methods.checkPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

// Never leak the hash to the client.
userSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    role: this.role,
  };
};

export const User = mongoose.model("User", userSchema);
