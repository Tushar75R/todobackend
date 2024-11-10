import express from "express";
import {
  register,
  login,
  getTask,
  addTask,
  deleteTask,
  updateTask,
  searchTask,
  isAuth,
} from "../controller/User.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { get } from "mongoose";

const app = express.Router();

app.post("/register", register);
app.post("/login", login);
app.get("/isauth", isAuth);
app.use(authMiddleware);

app.get("/getTask", getTask);
app.post("/addTask", addTask);

app.delete("/:taskId", deleteTask);
app.put("/:taskId", updateTask);

app.get("/search", searchTask);
export default app;
