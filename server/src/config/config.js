import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
}

const config = {
    port: process.env.PORT || 3000,
    mongoURI: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
};

export default config;