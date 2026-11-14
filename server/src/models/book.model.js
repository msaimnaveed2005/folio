import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            default: "Untitled Book",
        },
        author: {
            type: String,
            trim: true,
            default: "Unknown Author",
        },
        coverImage: {
            type: String, // Base64 data URL or relative URL path
            default: null,
        },
        format: {
            type: String,
            enum: ["epub", "pdf"],
            default: "epub",
        },
        fileSize: {
            type: Number,
            required: true, // in bytes
        },
        originalFileName: {
            type: String,
            required: true,
        },
        filePath: {
            type: String,
            required: true,
        },
        totalWords: {
            type: Number,
            default: 0,
        },
        totalUnits: {
            type: Number,
            default: 0, // 250 words = 1 Folio Reading Unit
        },
        totalChapters: {
            type: Number,
            default: 0,
        },
        processingStatus: {
            type: String,
            enum: ["pending", "processing", "ready", "failed"],
            default: "pending",
            index: true,
        },
        processingError: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const bookModel = mongoose.model("Book", bookSchema);

export default bookModel;