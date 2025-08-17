// socket.test.js
const io = require("socket.io-client");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// === الإعدادات ===
const SERVER_URL = process.env.SOCKET_URL || "http://localhost:8080";
const JWT_SECRET = process.env.JWT_SECRET;
const CONNECT_TIMEOUT_MS = 5000;

// إنشاء JWT token للاختبار
function createTestToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
}

function createUser(userID, roomID) {
  const token = createTestToken(userID);
  startConnection(token, roomID);
}

function startConnection(token, roomID) {
  const socket = io(SERVER_URL, {
    auth: { token },
    query: { roomID },
    transports: ["websocket"],
    timeout: CONNECT_TIMEOUT_MS,
    reconnection: false,
  });

  // === أحداث الاتصال ===
  socket.on("connect", () => {
    const user = jwt.verify(socket.auth.token, JWT_SECRET);
    log("connected:", user);

    setTimeout(() => done(0), 1500);
  });

  socket.on("joined-room", (data) => {
    if (data.status === 200) {
      console.log("✅ Joined successfully" , data.message);
    }
  });

  socket.on("disconnect", (reason) => {
    log("disconnected:", reason);
  });

  // === لوج مختصر ومنظم ===
  const log = (...a) => console.log("[TEST]", ...a);
  const done = (code = 0) => {
    socket.close();
    process.exit(code);
  };
}

createUser("Barra", "123");
createUser("ali", "123");

// createUser("haha", "123");
// createUser("d", "123");
// createUser("dd", "123");

// === الاستماع للأحداث القادمة من السيرفر ===
// socket.on("joined-room", (payload) => log("joined-room:", payload));
// socket.on("user-joined", (payload) => log("user-joined:", payload));
// socket.on("user-left", (payload) => log("user-left:", payload));
