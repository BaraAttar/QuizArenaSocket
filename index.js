// استيراد المكتبات
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// تهيئة السيرفر والمنفذ
const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.JWT_SECRET;

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware للتحقق من التوكن JWT قبل السماح بالاتصال
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error: Token missing"));

  try {
    const user = jwt.verify(token, SECRET_KEY);
    socket.user = user; // تخزين بيانات المستخدم في socket
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// استقبال الاتصالات والتعامل مع الرسائل
io.on("connection", (client) => {
  console.log("User connected:", JSON.stringify(client.user));

  client.on("joinRoom", (roomName) => {
    client.join(roomName);
    console.log(`User joined room: ${roomName}`);
  });

  client.on("message", ({ room, text }) => {
  io.to(room).emit("message", {
    text,
    sender: client.user.id, 
  });
});
 
  client.on("leaveRoom", (roomName) => {
    client.leave(roomName);
    console.log(`🚪 User left room: ${roomName}`);
  });

  // عند قطع الاتصال
  client.on("disconnect", () => {
    console.log(`User disconnected: ${JSON.stringify(client.user)}`);
  });
});

console.log(`Socket.IO server running on port ${PORT}`);
