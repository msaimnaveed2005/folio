import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

// 1. Ensure private uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure disk storage with collision-resistant filenames
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `book-${uniqueSuffix}${ext}`);
    },
});

// 3. Validate that the uploaded file is strictly an EPUB
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".epub") {
        cb(null, true);
    } else {
        cb(new Error("Invalid file format. Only .epub files are permitted."));
    }
};

// 4. Create the Multer upload instance (50MB maximum limit)
export const uploadBook = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB
    },
}).single("file");