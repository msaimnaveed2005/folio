import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const authRouter = Router();

// Registration & Email Verification
authRouter.post("/register", authController.register);
authRouter.post("/verify-email", authController.verifyEmail);

// Login & Session Management
authRouter.post("/login", authController.login);
authRouter.get("/get-me", authController.getMe);
authRouter.get("/refresh-token", authController.refreshToken);
authRouter.get("/logout", authController.logout);
authRouter.get("/logout-all", authController.logoutAll);

export default authRouter;