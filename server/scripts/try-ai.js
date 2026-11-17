require('dotenv').config();
const { generateQuestions } = require('../src/services/questions');

(async () => {
  const questions = await generateQuestions({
    role: 'Backend Developer (Node.js)',
    level: 4,
    count: 3,
  });
  console.log(JSON.stringify(questions, null, 2));
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});