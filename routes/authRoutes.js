import authControllers from "../controllers/authController.js";
import express from "express";
import { authenticateUser } from "../middleware/authentication-middleware.js";

const authRouter = express.Router();

authRouter.post("/register", authControllers.register);
authRouter.post("/login", authControllers.login);
authRouter.delete("/logout", authenticateUser, authControllers.logout);
authRouter.get("/verify-email", authControllers.verifyEmail);

export default authRouter;
