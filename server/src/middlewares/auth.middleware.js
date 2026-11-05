import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Unauthorized! Access token is required.",
            });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, config.jwtSecret);

        // Attach user payload (id, sessionId) to request object
        req.user = decoded;

        // Pass control to the next handler
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Access token expired. Please refresh your token.",
            });
        }
        return res.status(401).json({
            message: "Unauthorized! Invalid token.",
        });
    }
}