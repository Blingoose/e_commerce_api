import User from "../models/User.js";
import asyncWrapper from "../middleware/asyncWrapper.js";
import CustomErrors from "../errors/error-index.js";
import { StatusCodes } from "http-status-codes";

const userControllers = {
  getAllUsers: asyncWrapper(async (req, res, next) => {
    console.log(req.user);
    // find the user but exclude password from the user data.
    const users = await User.find({ role: "user" }).select("-password");
    if (users.length === 0) {
      throw new CustomErrors.NotFoundError("No users in database");
    }
    res.status(StatusCodes.OK).json({ users });
  }),

  getSingleUser: asyncWrapper(async (req, res, next) => {
    const { id: userId } = req.params;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new CustomErrors.NotFoundError(`No user with id: ${userId}`);
    }
    res.status(StatusCodes.OK).json({ user });
  }),

  showCurrentUser: asyncWrapper(async (req, res, next) => {
    res.send("show current user route");
  }),

  updateUser: asyncWrapper(async (req, res, next) => {
    res.send(req.body);
  }),

  updateUserPassword: asyncWrapper(async (req, res, next) => {
    res.send(req.body);
  }),
};

export default userControllers;