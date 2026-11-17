const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Naye user ko itne free credits milte hain (3 free interviews)
const SIGNUP_CREDITS = 3;

// Zod: user ka input hamesha validate karo, kabhi trust mat karo.
const registerSchema = z.object({
  name: z.string().min(2, 'Your name is too short'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Token me sirf userId aur role. 30 din baad expire.
function makeToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// Frontend ko bhejne wala safe user object (passwordHash kabhi nahi jata)
function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    creditBalance: user.creditBalance,
  };
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'This email is already registered' });
    }

    // password ka hash (10 = hash banane me kitni mehnat lage)
    const passwordHash = await bcrypt.hash(password, 10);

    // $transaction: andar ke dono kaam ya to saath me hon ge, ya dono nahi.
    // User ban gaya par credit entry fail hui, aisa kabhi nahi hoga.
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, passwordHash, creditBalance: SIGNUP_CREDITS },
      });

      // Ledger entry: signup bonus. refId = userId, to ek user ko bonus ek hi baar milega
      // (CreditTransaction me @@unique([reason, refId]) hai).
      await tx.creditTransaction.create({
        data: {
          userId: newUser.id,
          amount: SIGNUP_CREDITS,
          reason: 'SIGNUP_BONUS',
          refId: newUser.id,
        },
      });

      return newUser;
    });

    res.status(201).json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) {
    next(err); // central error handler (index.js) ko chala jayega
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });

    // SECURITY: "email nahi mila" aur "password galat" ka same message,
    // taaki attacker ye na jaan paye ki kaun si email registered hai.
    const ok = user && (await bcrypt.compare(password, user.passwordHash));
    if (!ok) {
      return res.status(401).json({ error: 'Wrong email or password' });
    }

    res.json({ token: makeToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me  ->  token se pata lagao kaun logged in hai (frontend refresh pe kaam aayega)
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;