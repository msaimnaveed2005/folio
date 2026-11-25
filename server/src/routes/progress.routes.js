import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import * as progressController from "../controllers/progress.controller.js";

const progressRouter = Router();

// Protect all progress endpoints: user must be authenticated
progressRouter.use(authMiddleware);

// 1. Fetch saved reading position for a specific book
progressRouter.get("/:bookId", progressController.getProgress);

// 2. Save or update reading position for a specific book
progressRouter.put("/:bookId", progressController.saveProgress);

export default progressRouter;