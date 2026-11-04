import nodemailer from "nodemailer";
import config from "../config/config.js";

// Check if Google OAuth credentials are provided
const hasGoogleAuth =
    Boolean(config.googleUser && config.googleClientId && config.googleRefreshToken);

let transporter = null;

if (hasGoogleAuth) {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: config.googleUser,
            clientId: config.googleClientId,
            clientSecret: config.googleClientSecret,
            refreshToken: config.googleRefreshToken,
        },
    });

    transporter.verify((error) => {
        if (error) {
            console.log("⚠️ Email server notice:", error.message);
        } else {
            console.log("📧 Email server is ready to send messages");
        }
    });
}

export const sendEmail = async (to, subject, text, html) => {
    // If no Gmail keys configured, print code to console for easy testing
    if (!transporter) {
        console.log("\n========================================");
        console.log("📨 [DEV MODE: EMAIL DISPATCH]");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${text}`);
        console.log("========================================\n");
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"Folio Reading" <${config.googleUser}>`,
            to,
            subject,
            text,
            html,
        });
        console.log("Message sent successfully:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error.message);
    }
};