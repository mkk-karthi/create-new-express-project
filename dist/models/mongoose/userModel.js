import mongoose from "mongoose";
import counterModel from "./counterModel.js";

const UserSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, min: 1 },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

UserSchema.pre("save", async function () {
  if (!this.isNew) return;

  // id increament
  const id = await counterModel.increment("users");
  this.id = id;
});

const UserModel = mongoose.model("user", UserSchema);
export default UserModel;
