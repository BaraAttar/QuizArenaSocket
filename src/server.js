const http = require("http");

const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { instrument } = require("@socket.io/admin-ui");

const roomHandler = require("./multiplayer/roomHandler");
const singlePlayerHandler = require("./singlePlayer/singlePlayerHandler");

const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.JWT_SECRET;

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://admin.socket.io",
      "https://cd284f31033b.ngrok-free.app",
      "http://localhost:3000",
      "http://localhost:3000/private/room/123",
      "http://localhost:8080", // إضافة مهمة للـ polling
      /^https:\/\/.*\.ngrok\.io$/, // السماح لجميع عناوين ngrok
      /^https:\/\/.*\.ngrok-free\.app$/, // السماح لجميع عناوين ngrok الجديدة
    ],
    methods: ["GET", "POST"],
    credentials: true, // مهم للـ Admin UI
  },
  transports: ["websocket", "polling"],
  allowEIO3: true, // مهم لتوافق Admin UI
});

// إنشاء admin namespace
const adminNamespace = io.of("/admin");

instrument(io, {
  auth: false,
  namespaceName: "/admin",
});

// Middleware
io.use((socket, next) => {
  if (socket.nsp.name === "/admin") {
    return next();
  }

  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error: Token missing"));

  try {
    const user = jwt.verify(token, SECRET_KEY);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Admin namespace connection
adminNamespace.on("connection", (socket) => {
  console.log("Admin UI connected:", socket.id);
});

io.on("connection", (socket) => {
  if (socket.user) {
    socket.data = {
      ...socket.data,
      userID: socket.user?.id,
    };
  }
  const { gameType } = socket.handshake.auth;

  if (gameType === "single") singlePlayerHandler(socket);
  else if (gameType === "multi") roomHandler(io, socket);
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`🔧 Admin UI: https://admin.socket.io`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for ngrok domains`);
  console.log(`🔌 Transports: websocket, polling`);
  console.log(`🔐 JWT authentication enabled`);
});
