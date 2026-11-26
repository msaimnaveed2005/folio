import fs from "fs";
import path from "path";
import trackModel from "../models/track.model.js";

const MIME_BY_EXT = {
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".m4a": "audio/mp4",
};

/**
 * Upload and save a custom audio track for the authenticated reader.
 */
export async function uploadTrack(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please select an audio file to upload." });
        }

        const ext = path.extname(req.file.originalname).toLowerCase();
        const title =
            req.body?.title?.trim() ||
            req.file.originalname.replace(/\.(mp3|wav|ogg|m4a)$/i, "");
        const mimeType = MIME_BY_EXT[ext] || req.file.mimetype || "audio/mpeg";

        const track = await trackModel.create({
            userId: req.user.id,
            title,
            originalFileName: req.file.originalname,
            filePath: req.file.path,
            mimeType,
            fileSize: req.file.size,
        });

        return res.status(201).json({
            message: "Audio track uploaded successfully",
            track: {
                _id: track._id,
                title: track.title,
                originalFileName: track.originalFileName,
                mimeType: track.mimeType,
                fileSize: track.fileSize,
                createdAt: track.createdAt,
            },
        });
    } catch (error) {
        console.error("Upload track error:", error);
        return res.status(500).json({ message: "Server error during audio upload" });
    }
}

/**
 * Fetch all custom tracks uploaded by the authenticated reader.
 */
export async function getUserTracks(req, res) {
    try {
        const tracks = await trackModel
            .find({ userId: req.user.id })
            .select("-filePath")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Tracks fetched successfully",
            tracks,
        });
    } catch (error) {
        console.error("Get tracks error:", error);
        return res.status(500).json({ message: "Server error fetching tracks" });
    }
}

/**
 * Stream a private audio track file to its owner.
 */
export async function streamTrack(req, res) {
    try {
        const track = await trackModel.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!track || !fs.existsSync(track.filePath)) {
            return res.status(404).json({ message: "Audio track not found" });
        }

        res.setHeader("Content-Type", track.mimeType);
        return res.sendFile(path.resolve(track.filePath));
    } catch (error) {
        console.error("Stream track error:", error);
        return res.status(500).json({ message: "Server error streaming audio track" });
    }
}

/**
 * Delete a custom track from MongoDB and disk.
 */
export async function deleteTrack(req, res) {
    try {
        const track = await trackModel.findOne({
            _id: req.params.id,
            userId: req.user.id,
        });

        if (!track) {
            return res.status(404).json({ message: "Audio track not found" });
        }

        if (track.filePath && fs.existsSync(track.filePath)) {
            await fs.promises.unlink(track.filePath).catch(() => {});
        }

        await track.deleteOne();

        return res.status(200).json({ message: "Track deleted successfully" });
    } catch (error) {
        console.error("Delete track error:", error);
        return res.status(500).json({ message: "Server error deleting track" });
    }
}
