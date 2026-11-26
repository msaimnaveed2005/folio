import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import bookRouter from "./routes/book.routes.js";
import progressRouter from "./routes/progress.routes.js";
import musicRouter from "./routes/music.routes.js";

const app = express();

// 1. Logging
app.use(morgan("dev"));

// 2. CORS - Allow React frontend with cookies enabled
app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

// 3. Body & Cookie Parsing
app.use(express.json());
app.use(cookieParser());

// 4. Healthcheck Route (for verifying the server is alive)
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Folio API is running smoothly",
        timestamp: new Date().toISOString(),
    });
});

// 5. Mount API Routes
app.use("/api/auth", authRouter);
app.use("/api/books", bookRouter);
app.use("/api/progress", progressRouter);
app.use("/api/music", musicRouter);

export default app;