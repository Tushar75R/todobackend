import mongoose, { model, Schema } from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  task: [
    {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

export const User = model("User", userSchema);
