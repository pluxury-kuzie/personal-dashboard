const { Schema, model, Types } = require("mongoose");

const taskSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

taskSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = model("Task", taskSchema);
