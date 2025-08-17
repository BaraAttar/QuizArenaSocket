// roomHandler.js

const { startQuiz } = require("./quiz/startQuiz");
const roomQuizCache = require('./quiz/quizCache');

module.exports = (io, client) => {
  const userID = String(client.user?.id ?? "");
  const roomID = String(client.handshake.query?.roomID ?? "");

  if (!roomID) return;

  // const room = io.sockets.adapter.rooms.get(roomID);
  // فحص إذا المستخدم موجود مسبقًا في الغرفة (لمنع التكرار)
  // if (room) {
  //   for (const socketId of room) {
  //     const socket = io.sockets.sockets.get(socketId);
  //     if (socket?.user?.id === client.user?.id) {
  //       // المستخدم موجود مسبقًا، نرسل رسالة رفض ونوقف التنفيذ
  //       return client.emit("already-in-room", {
  //         status: 409,
  //         message: `User ${userID} is already in room ${roomID}.`,
  //       });
  //     }
  //   }
  // }

  // فحص عدد الأعضاء قبل الانضمام
  if ((io.sockets.adapter.rooms.get(roomID)?.size ?? 0) >= 2)
    return client.emit("room-full", {
      status: 403,
      message: `Room ${roomID} is full.`,
    });
  

  // إذا الغرفة فيها مكان، انضم
  client.join(roomID);
  client.emit("joined-room", {
    status: 200,
    userId: userID,
    message: `You have joined ${roomID} successfully.`,
  });
  client
    .to(roomID)
    .emit("user-joined", { message: `User ${userID} joined the room.` });

  // SATRT THE GAME
  if (
    (io.sockets.adapter.rooms.get(roomID)?.size ?? 0) === 2 &&
    !roomQuizCache.has(roomID)
  ) {
    startQuiz(io, roomID);
  }

  client.on("disconnect", () => {
    client.to(roomID).emit("user-left", {
      userID,
      message: `User ${userID} has left the room.`,
    });
    const size = io.sockets.adapter.rooms.get(roomID)?.size || 0;
    if (size === 0) roomQuizCache.delete(roomID);
  });
};



// async function fetchQuestions() {  
//   return [
//     { id: 1, q: "What is 2 + 2?", choices: ["3", "4", "5"], answer: 1 },
//     {
//       id: 2,
//       q: "Capital of France?",
//       choices: ["Berlin", "Paris", "Rome"],
//       answer: 1,
//     },
//   ];
// }
