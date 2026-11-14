import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { uploadBook } from "../middlewares/upload.middleware.js";
import * as bookController from "../controllers/book.controller.js";

const bookRouter = Router();

// Protect all book endpoints: user must be authenticated
bookRouter.use(authMiddleware);

// 1. Upload EPUB book (handled by Multer, then parsed by controller)
bookRouter.post("/upload", uploadBook, bookController.uploadBook);

// 2. Fetch all books for the authenticated user's bookshelf
bookRouter.get("/", bookController.getUserBooks);

// 3. Fetch a specific book details and Table of Contents
bookRouter.get("/:id", bookController.getBookById);

// 4. Fetch a specific chapter's reading content
bookRouter.get("/:bookId/chapters/:chapterId", bookController.getChapter);

// 5. Delete a book and its chapters
bookRouter.delete("/:id", bookController.deleteBook);

export default bookRouter;