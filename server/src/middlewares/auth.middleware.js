import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";

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

/**
 * Authenticates browser <img>/media requests using either a Bearer header
 * or an active non-revoked HttpOnly refreshToken session cookie.
 */
export async function authAssetMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            req.user = jwt.verify(token, config.jwtSecret);
            return next();
        }

        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Unauthorized!" });
        }

        const decoded = jwt.verify(refreshToken, config.jwtSecret);
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
        const session = await sessionModel.findOne({ refreshTokenHash, revoked: false });

        if (!session) {
            return res.status(401).json({ message: "Unauthorized! Session revoked." });
        }

        req.user = { id: decoded.id, sessionId: session._id };
        return next();
    } catch {
        return res.status(401).json({ message: "Unauthorized! Invalid token." });
    }
}
