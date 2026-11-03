import mongoose from "mongoose";
import config from "./config.js";

async function connectDB() {
    try {
        await mongoose.connect(config.mongoURI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

export default connectDB;