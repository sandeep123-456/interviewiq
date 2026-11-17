const express = require('express');
const { z } = require('zod');

const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { generateQuestions, generateFollowUp } = require('../services/questions');
const { evaluateAnswer } = require('../services/evaluate');
const { nextLevel } = require('../lib/adaptive');

const router = express.Router();

// Is file ke SAARE routes ke liye login zaroori hai
router.use(requireAuth);

// Difficulty ke hisaab se interview kis level (1-10) se shuru hoga
const START_LEVEL = { EASY: 2, MEDIUM: 4, HARD: 7 };

const startSchema = z.object({
  role: z.string().min(2).max(80),
  type: z.enum(['TECHNICAL', 'HR', 'DSA', 'MIXED']).default('TECHNICAL'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  mode: z.enum(['TEXT', 'VOICE']).default('TEXT'),
  totalQuestions: z.number().int().min(3).max(15).default(5),
});

// POST /api/interviews  ->  naya interview shuru karo (1 credit lagta hai)
router.post('/', async (req, res, next) => {
  try {
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { role, type, difficulty, mode, totalQuestions } = parsed.data;
    const userId = req.user.userId;

    // STEP A: sasta pre-check. Credit nahi hai to AI ko bulane ka kharcha mat karo.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { creditBalance: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.creditBalance < 1) {
      return res.status(402).json({ error: 'Not enough credits. Buy credits to start an interview.' });
    }

    // STEP B: AI se pehla question. Ye DB transaction ke BAHAR hai, kyunki AI 10-30 second
    // le sakta hai, aur itni der transaction kholke rakhna database ko block kar deta hai.
    // Fayda: AI fail hua to credit kata hi nahi, refund ka jhanjhat nahi.
    const level = START_LEVEL[difficulty];
    const [first] = await generateQuestions({
      role: `${role} (${type} round)`,
      level,
      count: 1,
    });

    // STEP C: ek transaction me credit katna + interview banana + ledger entry.
    // Teeno saath me honge ya koi nahi.
    const result = await prisma.$transaction(async (tx) => {
      // IMPORTANT (double-spend rokna): "balance >= 1 hai to ghatao" ek hi atomic query me.
      // Agar 2 requests ek saath aayein aur balance sirf 1 ho, to ek hi ghata payegi,
      // dusri ka count 0 aayega. Pehle read karke phir update karte to dono pass ho jaate.
      const deducted = await tx.user.updateMany({
        where: { id: userId, creditBalance: { gte: 1 } },
        data: { creditBalance: { decrement: 1 } },
      });
      if (deducted.count === 0) {
        const err = new Error('Not enough credits');
        err.code = 'NO_CREDITS';
        throw err;
      }

      const interview = await tx.interview.create({
        data: {
          userId,
          role,
          type,
          difficulty,
          mode,
          totalQuestions,
          currentLevel: level,
          questions: {
            create: [
              { orderIndex: 1, kind: 'CONCEPT', text: first.text, topic: first.topic, level },
            ],
          },
        },
        include: { questions: true },
      });

      // Ledger entry: -1 credit. refId = interview ka id, to har interview ka kharcha traceable hai.
      await tx.creditTransaction.create({
        data: { userId, amount: -1, reason: 'INTERVIEW_START', refId: interview.id },
      });

      const updated = await tx.user.findUnique({
        where: { id: userId },
        select: { creditBalance: true },
      });

      return { interview, creditBalance: updated.creditBalance };
    });

    const q = result.interview.questions[0];
    res.status(201).json({
      interview: {
        id: result.interview.id,
        role: result.interview.role,
        difficulty: result.interview.difficulty,
        totalQuestions: result.interview.totalQuestions,
        currentLevel: result.interview.currentLevel,
      },
      question: { id: q.id, orderIndex: q.orderIndex, text: q.text, topic: q.topic },
      creditBalance: result.creditBalance,
    });
  } catch (err) {
    if (err.code === 'NO_CREDITS') {
      return res.status(402).json({ error: 'Not enough credits. Buy credits to start an interview.' });
    }
    next(err);
  }
});

// GET /api/interviews/:id  ->  ek interview, uske questions aur answers ke saath
router.get('/:id', async (req, res, next) => {
  try {
    // IMPORTANT: id ke saath userId bhi match karte hain. Isse koi user dusre ka
    // interview URL guess karke nahi dekh sakta. Ye security ka ek zaroori niyam hai.
    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, userId: req.user.userId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' }, include: { answer: true } },
      },
    });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    res.json({ interview });
  } catch (err) {
    next(err);
  }
});
const answerSchema = z.object({
  questionId: z.string().uuid(),
  text: z.string().trim().min(1, 'Answer cannot be empty').max(4000, 'Answer is too long'),
  source: z.enum(['TEXT', 'VOICE']).default('TEXT'),
  timeTakenSec: z.number().int().min(0).max(3600).optional(),
});

// POST /api/interviews/:id/answers  ->  ek question ka answer do, score + agla question pao
router.post('/:id/answers', async (req, res, next) => {
  try {
    const parsed = answerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { questionId, text, source, timeTakenSec } = parsed.data;
    const userId = req.user.userId;

    // Ownership check: id ke saath userId bhi match (dusre ka interview nahi chhoo sakte)
    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, userId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' }, include: { answer: true } },
      },
    });
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    if (interview.status !== 'IN_PROGRESS') {
      return res.status(409).json({ error: 'This interview is already finished' });
    }

    const question = interview.questions.find((q) => q.id === questionId);
    if (!question) return res.status(404).json({ error: 'Question not found in this interview' });
    if (question.answer) return res.status(409).json({ error: 'This question is already answered' });

    // STEP A: AI se answer ka score (DB transaction ke bahar, kyunki AI slow hai)
    const evaluation = await evaluateAnswer({
      role: interview.role,
      topic: question.topic,
      level: question.level,
      question: question.text,
      answer: text,
    });

    const answeredBefore = interview.questions.filter((q) => q.answer).length;
    const isLast = answeredBefore + 1 >= interview.totalQuestions;
    const newLevel = nextLevel(interview.currentLevel, evaluation.score);
    const roleForAI = `${interview.role} (${interview.type} round)`;

    // STEP B: agar interview baaki hai to agla question taiyar karo
    let nextData = null;
    if (!isLast) {
      // Follow-up tab, jab answer adhoora ho. Follow-up ke jawab par dobara follow-up nahi,
      // warna interview ek hi sawaal me atak jayega.
      const wantFollowUp = evaluation.needsFollowUp && question.kind !== 'FOLLOW_UP';

      if (wantFollowUp) {
        const followText = await generateFollowUp({
          role: roleForAI,
          level: question.level,
          question: question.text,
          answer: text,
        });
        nextData = {
          kind: 'FOLLOW_UP',
          text: followText,
          topic: question.topic,
          level: question.level,
          parentId: question.id,
        };
      } else {
        const [q] = await generateQuestions({
          role: roleForAI,
          level: newLevel,
          count: 1,
          avoid: interview.questions.map((x) => x.text),
        });
        nextData = { kind: 'CONCEPT', text: q.text, topic: q.topic, level: newLevel };
      }
    }

    // STEP C: sab database changes ek transaction me. Ya to sab hon, ya koi nahi.
    const result = await prisma.$transaction(async (tx) => {
      await tx.answer.create({
        data: {
          questionId,
          text,
          source,
          timeTakenSec,
          score: evaluation.score,
          feedback: {
            correctness: evaluation.correctness,
            clarity: evaluation.clarity,
            depth: evaluation.depth,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements,
            idealAnswer: evaluation.idealAnswer,
          },
        },
      });

      // Weak topic tracking: is topic me attempts +1 aur total score jodo.
      // Average = totalScore / attempts. upsert = nahi hai to bana do, hai to badha do.
      await tx.topicStat.upsert({
        where: { userId_topic: { userId, topic: question.topic } },
        create: { userId, topic: question.topic, attempts: 1, totalScore: evaluation.score },
        update: { attempts: { increment: 1 }, totalScore: { increment: evaluation.score } },
      });

      if (isLast) {
        const agg = await tx.answer.aggregate({
          where: { question: { interviewId: interview.id } },
          _avg: { score: true },
        });
        const overallScore = Math.round((agg._avg.score ?? 0) * 10) / 10;

        await tx.interview.update({
          where: { id: interview.id },
          data: { status: 'COMPLETED', completedAt: new Date(), overallScore, currentLevel: newLevel },
        });
        return { nextQuestion: null, overallScore };
      }

      await tx.interview.update({
        where: { id: interview.id },
        data: { currentLevel: newLevel },
      });
      const nextQuestion = await tx.question.create({
        data: { interviewId: interview.id, orderIndex: interview.questions.length + 1, ...nextData },
      });
      return { nextQuestion, overallScore: null };
    });

    res.status(201).json({
      evaluation: {
        score: evaluation.score,
        correctness: evaluation.correctness,
        clarity: evaluation.clarity,
        depth: evaluation.depth,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        idealAnswer: evaluation.idealAnswer,
      },
      newLevel,
      isComplete: isLast,
      overallScore: result.overallScore,
      nextQuestion: result.nextQuestion
        ? {
            id: result.nextQuestion.id,
            orderIndex: result.nextQuestion.orderIndex,
            kind: result.nextQuestion.kind,
            text: result.nextQuestion.text,
            topic: result.nextQuestion.topic,
          }
        : null,
    });
  } catch (err) {
    // Ek hi question ka answer 2 baar ek saath aaye to Answer.questionId unique hone se P2002 aata hai
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'This question is already answered' });
    }
    next(err);
  }
});
module.exports = router;