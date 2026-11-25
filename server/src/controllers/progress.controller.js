import progressModel from "../models/progress.model.js";
import bookModel from "../models/book.model.js";

/**
 * Save or update reading position for a book.
 */
export async function saveProgress(req, res) {
    try {
        const { bookId } = req.params;
        const { chapterId, chapterIndex, unit, completionPercentage } = req.body;

        if (!chapterId) {
            return res.status(400).json({ message: "chapterId is required to save progress." });
        }

        // Verify that the book belongs to the user
        const book = await bookModel.findOne({ _id: bookId, userId: req.user.id });
        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Atomic upsert: Update existing progress or insert a new one
        const progress = await progressModel.findOneAndUpdate(
            {
                userId: req.user.id,
                bookId,
            },
            {
                currentChapterId: chapterId,
                currentChapterIndex: Number(chapterIndex) || 0,
                currentUnit: Number(unit) || 1,
                completionPercentage: Math.min(100, Math.max(0, Number(completionPercentage) || 0)),
                lastReadAt: new Date(),
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            }
        );

        return res.status(200).json({
            message: "Progress updated successfully",
            progress,
        });
    } catch (error) {
        console.error("Save progress error:", error);
        return res.status(500).json({ message: "Server error saving reading progress" });
    }
}

/**
 * Get reading position for a book.
 */
export async function getProgress(req, res) {
    try {
        const { bookId } = req.params;

        const progress = await progressModel.findOne({
            userId: req.user.id,
            bookId,
        });

        return res.status(200).json({
            message: "Progress fetched successfully",
            progress: progress || null,
        });
    } catch (error) {
        console.error("Get progress error:", error);
        return res.status(500).json({ message: "Server error fetching reading progress" });
    }
}