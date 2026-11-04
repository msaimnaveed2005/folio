import userModel from "../models/user.model.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import sessionModel from "../models/session.model.js";
import { sendEmail } from "../services/email.service.js";
import { generateOTP, getOTPHTML } from "../utils/utils.js";
import otpModel from "../models/otp.model.js";

const isProduction = process.env.NODE_ENV === "production";

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const isAlreadyRegistered = await userModel.findOne({
            $or: [{ username }, { email }],
        });

        if (isAlreadyRegistered) {
            return res.status(400).json({
                message: "User already registered with this username or email",
            });
        }

        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
        });

        const otp = generateOTP();
        const html = getOTPHTML(otp);

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        await otpModel.create({
            email,
            user: user._id,
            otpHash,
        });

        await sendEmail(email, "Verify your Folio account", `Your OTP is ${otp}`, html);

        return res.status(201).json({
            message: "User registered successfully. Please verify your email.",
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Server error during registration" });
    }
}

export async function verifyEmail(req, res) {
    try {
        const { otp, email } = req.body;
        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        const otpDoc = await otpModel.findOne({ email, otpHash });
        if (!otpDoc) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        const user = await userModel.findByIdAndUpdate(
            otpDoc.user,
            { verified: true },
            { new: true }
        );

        await otpModel.deleteMany({ email });

        return res.status(200).json({
            message: "Email verified successfully",
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified,
            },
        });
    } catch (error) {
        console.error("Verify email error:", error);
        return res.status(500).json({ message: "Server error during email verification" });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!user.verified) {
            return res.status(401).json({ message: "Please verify your email before logging in" });
        }

        const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
        const isPasswordValid = hashedPassword === user.password;

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 1. Generate 7-day Refresh Token & store hash in Session
        const refreshToken = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: "7d" });
        const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

        const session = await sessionModel.create({
            userId: user._id,
            refreshTokenHash,
            ip: req.ip || "127.0.0.1",
            userAgent: req.headers["user-agent"] || "unknown",
        });

        // 2. Generate 15-minute Access Token
        const accessToken = jwt.sign(
            { id: user._id, sessionId: session._id },
            config.jwtSecret,
            { expiresIn: "15m" }
        );

        // 3. Send Refresh Token as HttpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error during login" });
    }
}

export async function getMe(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized! Token not found" });
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await userModel.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User profile fetched successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                verified: user.verified,
            },
        });
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized! Invalid or expired token" });
    }
}

export async function refreshToken(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized! Refresh token not found" });
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex");

        const session = await sessionModel.findOne({
            refreshTokenHash,
            revoked: false,
        });

        if (!session) {
            return res.status(401).json({ message: "Unauthorized! Session invalid or revoked" });
        }

        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: "Unauthorized! User not found" });
        }

        // Rotate tokens
        const newAccessToken = jwt.sign(
            { id: user._id, sessionId: session._id },
            config.jwtSecret,
            { expiresIn: "15m" }
        );

        const newRefreshToken = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: "7d" });
        const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex");

        session.refreshTokenHash = newRefreshTokenHash;
        await session.save();

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Access token refreshed successfully",
            accessToken: newAccessToken,
        });
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized! Invalid refresh token" });
    }
}

export async function logout(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            const refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex");
            const session = await sessionModel.findOne({ refreshTokenHash, revoked: false });
            if (session) {
                session.revoked = true;
                await session.save();
            }
        }

        res.clearCookie("refreshToken");
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error during logout" });
    }
}

export async function logoutAll(req, res) {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.status(400).json({ message: "Refresh token not found" });
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        await sessionModel.updateMany({ userId: decoded.id, revoked: false }, { revoked: true });

        res.clearCookie("refreshToken");
        return res.status(200).json({ message: "Logged out from all devices successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error during logout all" });
    }
}