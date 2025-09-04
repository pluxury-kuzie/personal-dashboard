const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: { type: String, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    password: { type: String, required: true, minlength: 6, select: false }, // select:false — не выдаём по умолчанию
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password; // не отдаём пароль
    return ret;
  },
});

module.exports = model("User", userSchema);
