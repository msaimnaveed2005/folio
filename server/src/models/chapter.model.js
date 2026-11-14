import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
    {
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
            index: true,
        },
        chapterIndex: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            trim: true,
            default: "Untitled Chapter",
        },
        htmlContent: {
            type: String,
            required: true,
        },
        plainTextContent: {
            type: String,
            default: "",
        },
        wordCount: {
            type: Number,
            default: 0,
        },
        unitCount: {
            type: Number,
            default: 0, // Math.ceil(wordCount / 250)
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to ensure uniqueness and fast chapter ordering queries
chapterSchema.index({ bookId: 1, chapterIndex: 1 }, { unique: true });

const chapterModel = mongoose.model("Chapter", chapterSchema);

export default chapterModel;