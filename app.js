import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./Database/connectDB.js";
import { errorMiddleware } from "./util/ErrorHandler.js";
import route from "./routes/route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();

const app = express();
connectDB();
console.log(process.env.CLIENT_URL);
const corsOption = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) => {
  return res.status(200).json({ message: "Home Route" });
});

app.use("/api", route);

app.use(errorMiddleware);
app.listen(process.env.PORT || 3100, () => {
  console.log(`Server running on port ${process.env.PORT || 3100}`);
});
