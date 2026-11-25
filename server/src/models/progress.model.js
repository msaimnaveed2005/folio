import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book",
            required: true,
            index: true,
        },
        currentChapterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chapter",
            required: true,
        },
        currentChapterIndex: {
            type: Number,
            required: true,
            default: 0,
        },
        currentUnit: {
            type: Number,
            default: 1,
        },
        completionPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        lastReadAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// One progress entry per user per book
progressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

const progressModel = mongoose.model("Progress", progressSchema);

export default progressModel;