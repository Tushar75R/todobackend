import mongoose, { model, Schema } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "panding",
      enum: ["panding", "completed"],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Task = model("Task", taskSchema);
