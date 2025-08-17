const quizCache = require("./quizCache");
const fetchQuestions = require("./api");

module.exports = (client) => {
  // بدء اللعبة
  client.on("start_the_game", async () => {
    console.log("start_the_game");
    try {
      const questions = await fetchQuestions();

      quizCache.set(client.id, {
        questions,
        currentIndex: 0,
        answers: [],
        timeoutId: null,
      });

      askQuestion(client);
    } catch (err) {
      client.emit("error", { message: "Failed to fetch questions" });
    }
  });

  // استقبال الإجابة
  client.on("answer", (data) => {
    handleAnswer(client, data);
  });

  // إنهاء اللعبة
  client.on("end_the_game", () => {
    console.log("Clearing cache for client:", client.id);
    clearClientCache(client.id);
  });
};

function askQuestion(client) {
  const cache = quizCache.get(client.id);
  if (!cache) return;

  const { currentIndex, questions } = cache;
  if (currentIndex >= questions.length) {
    endGame(client, cache.answers);
    return;
  }

  const { questionText, options } = questions[currentIndex];

  client.emit("question", { questionText, options });

  cache.currentIndex += 1;
  quizCache.set(client.id, cache);
}

function handleAnswer(client, data) {
  const cache = quizCache.get(client.id);
  if (!cache) return;

  const questionIndex = cache.currentIndex - 1;
  const question = cache.questions[questionIndex];
  const correctAnswerIndex = question.correctAnswerIndex;
  const answer = data.answer;

  cache.answers.push({ questionIndex, answer, correctAnswerIndex });
  client.emit("Corrected_answer", correctAnswerIndex);

  cache.timeoutId = setTimeout(() => {
    askQuestion(client);
  }, 1000);

  quizCache.set(client.id, cache);
}

function endGame(client, answers) {
  const score = answers.reduce((acc, { answer, correctAnswerIndex }) => {
    return acc + (answer === correctAnswerIndex ? 1 : 0);
  }, 0);

  client.emit("end", {
    score,
    total: answers.length,
  });

  clearClientCache(client.id);
}


function clearClientCache(clientId) {
  const cache = quizCache.get(clientId);
  if (cache?.timeoutId) clearTimeout(cache.timeoutId);
  quizCache.delete(clientId);
}
