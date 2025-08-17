// test-ngrok.js - اختبار الاتصال عبر ngrok
const io = require("socket.io-client");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// === الإعدادات ===
// يمكنك تغيير هذا الرابط إلى رابط ngrok الخاص بك
const NGROK_URL = process.env.NGROK_URL || "https://your-ngrok-url.ngrok.io";
const JWT_SECRET = process.env.JWT_SECRET;
const CONNECT_TIMEOUT_MS = 10000; // زيادة وقت الاتصال

console.log(`🔗 محاولة الاتصال بـ: ${NGROK_URL}`);

// إنشاء JWT token للاختبار
function createTestToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
}

function testNgrokConnection(userID, roomID) {
  const token = createTestToken(userID);
  
  console.log(`👤 اختبار الاتصال للمستخدم: ${userID}`);
  
  const socket = io(NGROK_URL, {
    auth: { token },
    query: { roomID },
    transports: ["websocket", "polling"], // السماح بكلا النوعين
    timeout: CONNECT_TIMEOUT_MS,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
  });

  // === أحداث الاتصال ===
  socket.on("connect", () => {
    console.log("✅ تم الاتصال بنجاح!");
    console.log(`🔌 Socket ID: ${socket.id}`);
    
    const user = jwt.verify(socket.auth.token, JWT_SECRET);
    console.log(`👤 المستخدم: ${user.id}`);
    
    // إغلاق الاتصال بعد ثانيتين
    setTimeout(() => {
      console.log("🔌 إغلاق الاتصال...");
      socket.close();
      process.exit(0);
    }, 2000);
  });

  socket.on("connect_error", (error) => {
    console.error("❌ خطأ في الاتصال:", error.message);
    console.log("💡 تأكد من:");
    console.log("   1. أن السيرفر يعمل على المنفذ 8080");
    console.log("   2. أن ngrok يعمل بشكل صحيح");
    console.log("   3. أن رابط ngrok صحيح");
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

  socket.on("reconnect", (attemptNumber) => {
    console.log(`🔄 إعادة الاتصال - المحاولة ${attemptNumber}`);
  });

  socket.on("reconnect_error", (error) => {
    console.error("❌ خطأ في إعادة الاتصال:", error.message);
  });
}

// اختبار الاتصال
testNgrokConnection("TestUser", "test-room-123");

// إضافة معالج لإيقاف البرنامج
process.on('SIGINT', () => {
  console.log('\n🛑 إيقاف الاختبار...');
  process.exit(0);
});
