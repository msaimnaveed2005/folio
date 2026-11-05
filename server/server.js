import app from "./src/app.js";
import connectDB from "./src/config/database.js";
import config from "./src/config/config.js";

// 1. Connect to MongoDB Atlas
await connectDB();

// 2. Start listening for incoming HTTP requests
app.listen(config.port, () => {
    console.log(`Folio Server running on http://localhost:${config.port}`);
});