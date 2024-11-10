import jwt from "jsonwebtoken";
import { ErrorHandler } from "../util/ErrorHandler.js";

const authMiddleware = async (req, res, next) => {
  try {
    console.log(req.cookies);
    const token = req.cookies["token"];
    if (!token) return ErrorHandler("unauthorized", 401);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return ErrorHandler("unauthorized", 401);
  }
};

export { authMiddleware };
