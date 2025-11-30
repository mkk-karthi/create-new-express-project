import mongoose from "mongoose";

const counterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { versionKey: false }
);

counterSchema.static("increment", async function (counterName) {
  const count = await this.findByIdAndUpdate(
    counterName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return count.seq;
});

const counterModel = mongoose.model("auto_increment", counterSchema);
export default counterModel;
