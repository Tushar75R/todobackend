import { ErrorHandler } from "../util/ErrorHandler.js";
import { User } from "../model/User.js";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { Task } from "../model/Task.js";

const cookieOption = {
  maxAge: 1000 * 60 * 60 * 2,
  sameSite: "none",
  httpOnly: true,
  secure: true,
};

const register = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    console.log(name, password);
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return next(ErrorHandler("user already exists", 400));
    }
    const user = await User.create({ name, password, task: [] });
    user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    return res.status(201).cookie("token", token, cookieOption).json({
      sucess: true,
      message: "user registered successfully",
    });
  } catch (error) {
    console.log(error);
    return next(ErrorHandler("error while registering", 500));
  }
};

const login = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    console.log("login -> ", name, password);
    const user = await User.findOne({ name });

    if (!user) {
      return next(ErrorHandler("user not found", 404));
    }
    const isMatch = await compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return next(ErrorHandler("invalid credentials", 401));
    }

    const tasks = await Task.find({ _id: { $in: user.task } });

    const currentDate = new Date();
    for (const task of tasks) {
      if (task.dueDate < currentDate && task.status !== "completed") {
        task.status = "completed";
        await task.save();
      }
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    return res
      .status(200)
      .cookie("token", token, cookieOption)
      .json({ sucess: true, message: "user logged in" });
  } catch (error) {
    console.log(error);
    return next(ErrorHandler("error while logging in", 500));
  }
};

const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    return res.status(200).json({ success: true, message: "Authenticated" });
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
const getTask = async (req, res, next) => {
  const id = req.user.id;

  const user = await User.findById(id).populate("task");

  if (!user) {
    return next(ErrorHandler("user not found", 404));
  }
  console.log(user.task);
  return res
    .status(200)
    .json({ success: true, message: "user logged in", task: user.task });
};

const addTask = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { title, description, category, dueDate, priority } = req.body;
    const user = await User.findById(id);
    if (!user) {
      return next(ErrorHandler("user not found", 404));
    }

    // Ensure dueDate is provided
    if (!dueDate) {
      return next(ErrorHandler("dueDate is required", 400));
    }

    const newTask = new Task({
      title,
      description,
      category,
      dueDate,
      priority,
    });

    user.task.push(newTask._id);
    await newTask.save();
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "task added successfully" });
  } catch (error) {
    console.log(error);
    return next(ErrorHandler("error while adding task", 500));
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(ErrorHandler("user not found", 404));
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return next(ErrorHandler("task not found", 404));
    }

    user.task = user.task.filter((id) => id.toString() !== taskId);
    await user.save();

    await Task.findByIdAndDelete(taskId);

    return res
      .status(200)
      .json({ success: true, message: "task deleted successfully" });
  } catch (error) {
    console.log(error);
    return next(ErrorHandler("error while deleting task", 500));
  }
};

const updateTask = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const { title, description, category, dueDate, priority } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return next(ErrorHandler("task not found", 404));
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.category = category || task.category;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;

    await task.save();

    return res
      .status(200)
      .json({ success: true, message: "task updated successfully", task });
  } catch (error) {
    console.log(error);
    return next(ErrorHandler("error while updating task", 500));
  }
};

const searchTask = async (req, res, next) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return next(ErrorHandler("user not found", 404));
    }

    const tasks = await Task.find({
      _id: { $in: user.task },
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    });
    return res
      .status(200)
      .json({ success: true, message: "tasks retrieved successfully", tasks });
  } catch (error) {
    console.log(error);
    return next(ErrorHandler("error while searching tasks", 500));
  }
};
export {
  register,
  login,
  getTask,
  addTask,
  deleteTask,
  updateTask,
  searchTask,
  isAuth,
};
