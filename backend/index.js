const server = require("./app");
const connectDatabase = require("./db/Database");
const cloudinary = require("cloudinary");

// Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down server for uncaught exception");

  process.exit(1);
});

// Config
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: "./config/.env",
  });
}

// Connect to DB
connectDatabase();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Start the server including Socket.IO
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `Server (API + Socket.IO) is running on http://localhost:${PORT}`,
  );
});

// Unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down server for: ${err.message}`);

  server.close(() => {
    process.exit(1);
  });
});
