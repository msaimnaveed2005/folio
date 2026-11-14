import fs from "fs";
import bookModel from "../models/book.model.js";
import chapterModel from "../models/chapter.model.js";
import { parseEpubFile } from "../services/epub.service.js";

/**
 * Upload and parse a new EPUB book.
 */
export async function uploadBook(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please provide an EPUB file to upload." });
        }

        // 1. Create initial book record
        const book = await bookModel.create({
            userId: req.user.id,
            title: req.file.originalname.replace(/\.epub$/i, ""),
            originalFileName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            format: "epub",
            processingStatus: "processing",
        });

        // 2. Parse the EPUB in the background/sync pipeline
        try {
            const parsed = await parseEpubFile(req.file.path);

            // 3. Bulk insert parsed chapters
            const chapterDocs = parsed.chapters.map((ch) => ({
                bookId: book._id,
                chapterIndex: ch.chapterIndex,
                title: ch.title,
                htmlContent: ch.htmlContent,
                plainTextContent: ch.plainTextContent,
                wordCount: ch.wordCount,
                unitCount: ch.unitCount,
            }));

            if (chapterDocs.length > 0) {
                await chapterModel.insertMany(chapterDocs);
            }

            // 4. Update book record with parsed metadata and mark ready
            book.title = parsed.title;
            book.author = parsed.author;
            book.coverImage = parsed.coverImage;
            book.totalWords = parsed.totalWords;
            book.totalUnits = parsed.totalUnits;
            book.totalChapters = parsed.totalChapters;
            book.processingStatus = "ready";
            await book.save();

            return res.status(201).json({
                message: "Book uploaded and processed successfully",
                book,
            });
        } catch (parseError) {
            book.processingStatus = "failed";
            book.processingError = parseError.message || "Failed to parse EPUB archive";
            await book.save();

            return res.status(422).json({
                message: "Uploaded file could not be parsed as a valid EPUB",
                error: parseError.message,
                book,
            });
        }
    } catch (error) {
        console.error("Upload book error:", error);
        return res.status(500).json({ message: "Server error during book upload" });
    }
}

/**
 * Fetch all books belonging to the authenticated user.
 */
export async function getUserBooks(req, res) {
    try {
        const books = await bookModel
            .find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Books fetched successfully",
            books,
        });
    } catch (error) {
        console.error("Get books error:", error);
        return res.status(500).json({ message: "Server error fetching books" });
    }
}

/**
 * Fetch a single book's details along with its table of contents.
 */
export async function getBookById(req, res) {
    try {
        const book = await bookModel.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Only select summary fields for the Table of Contents, omit massive htmlContent
        const chapters = await chapterModel
            .find({ bookId: book._id })
            .select("chapterIndex title wordCount unitCount")
            .sort({ chapterIndex: 1 });

        return res.status(200).json({
            message: "Book details fetched successfully",
            book,
            chapters,
        });
    } catch (error) {
        console.error("Get book by id error:", error);
        return res.status(500).json({ message: "Server error fetching book details" });
    }
}

/**
 * Fetch a single chapter's full HTML content for reading.
 */
export async function getChapter(req, res) {
    try {
        const { bookId, chapterId } = req.params;

        // Verify book belongs to the authenticated user
        const book = await bookModel.findOne({
            _id: bookId,
            userId: req.user.id,
        });

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        const chapter = await chapterModel.findOne({
            _id: chapterId,
            bookId,
        });

        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        return res.status(200).json({
            message: "Chapter fetched successfully",
            chapter,
        });
    } catch (error) {
        console.error("Get chapter error:", error);
        return res.status(500).json({ message: "Server error fetching chapter content" });
    }
}

/**
 * Delete a book, all its chapters, and its file from disk.
 */
export async function deleteBook(req, res) {
    try {
        const book = await bookModel.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // 1. Delete all chapter documents
        await chapterModel.deleteMany({ bookId: book._id });

        // 2. Delete physical file from disk
        if (book.filePath && fs.existsSync(book.filePath)) {
            await fs.promises.unlink(book.filePath).catch(() => { });
        }

        // 3. Delete book document
        await book.deleteOne();

        return res.status(200).json({
            message: "Book and its chapters deleted successfully",
        });
    } catch (error) {
        console.error("Delete book error:", error);
        return res.status(500).json({ message: "Server error deleting book" });
    }
}