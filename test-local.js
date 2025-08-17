// test-local.js - اختبار الاتصال المحلي
const io = require("socket.io-client");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const LOCAL_URL = "http://localhost:8080";
const JWT_SECRET = process.env.JWT_SECRET;

console.log(`🔗 اختبار الاتصال المحلي: ${LOCAL_URL}`);

function createTestToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
}

function testLocalConnection(userID, roomID) {
  const token = createTestToken(userID);
  
  console.log(`👤 اختبار الاتصال للمستخدم: ${userID}`);
  
  const socket = io(LOCAL_URL, {
    auth: { token },
    query: { roomID },
    transports: ["websocket", "polling"],
    timeout: 5000,
  });

  socket.on("connect", () => {
    console.log("✅ تم الاتصال المحلي بنجاح!");
    console.log(`🔌 Socket ID: ${socket.id}`);
    
    const user = jwt.verify(socket.auth.token, JWT_SECRET);
    console.log(`👤 المستخدم: ${user.id}`);
    
    setTimeout(() => {
      console.log("🔌 إغلاق الاتصال...");
      socket.close();
      process.exit(0);
    }, 2000);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ خطأ في الاتصال المحلي:", error.message);
    console.log("💡 تأكد من أن السيرفر يعمل على المنفذ 8080");
    process.exit(1);
  });

  socket.on("joined-room", (data) => {
    if (data.status === 200) {
      console.log("✅ انضم للغرفة بنجاح:", data.message);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("🔌 تم قطع الاتصال:", reason);
  });
}

testLocalConnection("LocalTestUser", "local-room-123");

process.on('SIGINT', () => {
  console.log('\n🛑 إيقاف الاختبار...');
  process.exit(0);
});
