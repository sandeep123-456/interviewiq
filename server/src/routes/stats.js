const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/stats/summary  ->  dashboard ke upar ke numbers
router.get('/summary', async (req, res, next) => {
  try {
    const agg = await prisma.interview.aggregate({
      where: { userId: req.user.userId, status: 'COMPLETED' },
      _count: { _all: true },
      _avg: { overallScore: true },
      _max: { overallScore: true },
    });

    const round = (n) => (n == null ? null : Math.round(n * 10) / 10);
    res.json({
      completedInterviews: agg._count._all,
      averageScore: round(agg._avg.overallScore),
      bestScore: round(agg._max.overallScore),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/stats/topics  ->  har topic ki average, sabse kamzor pehle
router.get('/topics', async (req, res, next) => {
  try {
    const rows = await prisma.topicStat.findMany({
      where: { userId: req.user.userId },
    });

    // average = totalScore / attempts (ledger jaisa idea: total aur count rakhte hain, average nikalte hain)
    const topics = rows
      .map((r) => ({
        topic: r.topic,
        attempts: r.attempts,
        avgScore: r.attempts ? Math.round((r.totalScore / r.attempts) * 10) / 10 : 0,
      }))
      .sort((a, b) => a.avgScore - b.avgScore); // kamzor topic sabse upar

    res.json({ topics, weakest: topics.slice(0, 3) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;