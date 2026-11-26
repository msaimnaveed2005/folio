import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadTrack } from "../middlewares/upload.middleware.js";
import * as musicController from "../controllers/music.controller.js";

const musicRouter = Router();

musicRouter.use(authMiddleware);

musicRouter.post("/upload", uploadTrack, musicController.uploadTrack);
musicRouter.get("/", musicController.getUserTracks);
musicRouter.get("/:id/stream", musicController.streamTrack);
musicRouter.delete("/:id", musicController.deleteTrack);

export default musicRouter;
