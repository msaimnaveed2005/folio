import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

/**
 * Factory helper to build Multer single-file upload middleware without duplicating storage/filter boilerplate.
 */
function createUploader({ dirPath, prefix, allowedExts, maxSizeMb, fieldName, rejectMessage }) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, dirPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, `${prefix}-${uniqueSuffix}${ext}`);
        },
    });

    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(rejectMessage));
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSizeMb * 1024 * 1024,
        },
    }).single(fieldName);
}

// EPUB Book Upload (50 MB max)
export const uploadBook = createUploader({
    dirPath: path.join(process.cwd(), "uploads"),
    prefix: "book",
    allowedExts: [".epub"],
    maxSizeMb: 50,
    fieldName: "file",
    rejectMessage: "Invalid file format. Only .epub files are permitted.",
});

// Reading Music Upload (25 MB max)
export const uploadTrack = createUploader({
    dirPath: path.join(process.cwd(), "uploads", "music"),
    prefix: "track",
    allowedExts: [".mp3", ".wav", ".ogg", ".m4a"],
    maxSizeMb: 25,
    fieldName: "audio",
    rejectMessage: "Invalid audio format. Allowed: .mp3, .wav, .ogg, .m4a.",
});
