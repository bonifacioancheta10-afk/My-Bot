const axios = require("axios");

let activeQuiz = {}; // para ma-track per threadID

module.exports.config = {
  name: "quiz",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "ChatGPT",
  description: "Play a multiple-choice quiz game",
  commandCategory: "games",
  usePrefix: true,
  usages: "/quiz",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  const { threadID } = event;

  try {
    const res = await axios.get("https://daikyu-api.up.railway.app/api/quiz?question=generate");
    const quiz = res.data;

    if (!quiz || !quiz.question) {
      return api.sendMessage("❌ Failed to fetch quiz question.", threadID);
    }

    // save active quiz
    activeQuiz[threadID] = {
      answer: quiz.answer.toUpperCase(),
      timeout: setTimeout(() => {
        if (activeQuiz[threadID]) {
          api.sendMessage(`⏰ Time’s up! The correct answer was: ${quiz.answer}`, threadID);
          delete activeQuiz[threadID];
        }
      }, 30000) // 30s limit
    };

    let message = `🧠 QUIZ TIME!\n\n❓ ${quiz.question}\n\n`;
    for (const [key, val] of Object.entries(quiz.choices)) {
      message += `${key}. ${val}\n`;
    }
    message += `\n⏳ You have 30 seconds!\n(Reply with A, B, C, or D)`;

    return api.sendMessage(message, threadID);
  } catch (e) {
    console.error("Quiz API Error:", e.message);
    return api.sendMessage("❌ Error fetching quiz question.", threadID);
  }
};

module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, body, senderID } = event;
  if (!body) return;

  if (activeQuiz[threadID]) {
    const choice = body.trim().toUpperCase();
    if (["A", "B", "C", "D"].includes(choice)) {
      const correct = activeQuiz[threadID].answer;

      clearTimeout(activeQuiz[threadID].timeout);
      if (choice === correct) {
        api.sendMessage(`✅ Correct! 🎉 (${choice})`, threadID);
      } else {
        api.sendMessage(`❌ Wrong! The correct answer was: ${correct}`, threadID);
      }
      delete activeQuiz[threadID];
    }
  }
};
