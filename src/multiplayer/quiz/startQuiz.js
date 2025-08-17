const roomQuizCache = require("./quizCache");
const fetchQuestions = require("./fetchQuestions");

async function startQuiz(io, roomID) {
  const room = io.sockets.adapter.rooms.get(roomID);
  if (!room) return;
 
  // استخراج أعضاء الغرفة
  const members = Array.from(room).map(id => {
    const socket = io.sockets.sockets.get(id);
    return socket?.user?.id;
  }).filter(Boolean);

  console.log(`Room ${roomID} members:`, members);

  // منع تكرار البدء
  const existing = roomQuizCache.get(roomID);
  if (existing?.started) return;

  // جلب الأسئلة
  const questions = existing?.questions || await fetchQuestions();

  // حفظ الحالة
  roomQuizCache.set(roomID, {
    started: true,
    questions,
    current: 0,
    answers: {}
  });

  // بدء الكويز
  io.to(roomID).emit("start-quiz", {
    roomID,
    totalRounds: questions.length,
  });

  setupListeners(io, roomID, room);
  nextRound(io, roomID);
}

// إعداد مستمع الإجابة
function setupListeners(io, roomID, room) {
  for (const socketId of room) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket && !socket._quizAnswerListener) {
      socket.on("answer", data => handleAnswer(io, roomID, socket.user.id, data));
      socket._quizAnswerListener = true;
    }
  }
}

// إرسال السؤال الحالي
function nextRound(io, roomID) {
  const cache = roomQuizCache.get(roomID);
  if (!cache) return;

  const { questions, current } = cache;

  if (current >= questions.length) {
    io.to(roomID).emit("quiz-finished");
    roomQuizCache.delete(roomID);
    return;
  }

  const question = questions[current];
  io.to(roomID).emit("start-round", {
    round: current + 1,
    question,
  });

  cache.answers = {};
}

// معالجة إجابات اللاعبين
function handleAnswer(io, roomID, userID, answer) {
  const cache = roomQuizCache.get(roomID);
  if (!cache || !userID) return;

  cache.answers[userID] = answer;

  const roomSize = io.sockets.adapter.rooms.get(roomID)?.size || 0;
  const totalAnswers = Object.keys(cache.answers).length;

  if (totalAnswers >= roomSize) {
    cache.current += 1;
    setTimeout(() => nextRound(io, roomID), 2000); // تأخير بسيط
  }
}

module.exports = {
  startQuiz,
  setupListeners,
  nextRound,
  handleAnswer,
};