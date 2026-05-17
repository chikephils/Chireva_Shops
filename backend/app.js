const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: "./config/.env",
  });
}

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);

const allowedOrigins = [
  "https://chireva.vercel.app",
  "http://localhost:5173",
];

// Attach Socket.IO to  HTTP server
const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Make io available to all routes/controllers
app.set("io", io);

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id} (Socket.IO is active!)`);

  socket.on("addUser", (userId) => {
    if (!userId) return;
    console.log("addUser received. User ID:", userId);
    onlineUsers.set(userId.toString(), socket.id);
    // console.log("Current online users:", Array.from(onlineUsers.keys()));
    io.emit("getUsers", Array.from(onlineUsers.keys()));
    // console.log("Emitted getUsers to all clients");
  });

  socket.on("getOnlineUsers", () => {
    // console.log("Client requested current online users");
    socket.emit("getUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    console.log(`Disconnected: ${socket.id}`);
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(userId);
        io.emit("getUsers", Array.from(onlineUsers.keys()));
        break;
      }
    }
  });
});

// Security &  middlewares
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// CORS
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
  }),
);

//Cookies
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static files
app.use(express.static("public"));

// Root route
app.get("/", (req, res) => {
  res.send("Hello world... Chireva Shops Server is Running!");
});

// Import routes
const user = require("./controller/user");
const shop = require("./controller/shop");
const product = require("./controller/product");
const order = require("./controller/order");
const messages = require("./controller/messages");
const conversation = require("./controller/conversation");
const payment = require("./controller/payment");
const withdraw = require("./controller/withdraw");

app.use("/api/v2/user", user);
app.use("/api/v2/shop", shop);
app.use("/api/v2/product", product);
app.use("/api/v2/order", order);
app.use("/api/v2/messages", messages);
app.use("/api/v2/conversation", conversation);
app.use("/api/v2/payment", payment);
app.use("/api/v2/withdraw", withdraw);

// Error handler
const ErrorHandler = require("./middleware/Error");
app.use(ErrorHandler);

module.exports = server;
