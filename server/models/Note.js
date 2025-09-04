const { Schema, model, Types } = require("mongoose");

const noteSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: "", trim: true, maxlength: 5000 },
    pinned: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

noteSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = model("Note", noteSchema);
