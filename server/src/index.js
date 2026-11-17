// dotenv sabse pehle load hona chahiye, warna process.env.JWT_SECRET undefined milega
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interviews');

const app = express();

// CORS: browser me React app (port 5173) ko is API (port 4000) ko call karne ki permission deta hai.
// Iske bina browser request block kar dega.
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

// Request ki JSON body ko req.body me convert karta hai
app.use(express.json());

// Health check: deploy ke baad check karne ke liye ki server zinda hai
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
// Aage yahin interview, resume, payment wagairah ke routes judenge
app.use('/api/interviews', interviewRoutes);

// Koi unknown route
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Central error handler: kisi bhi route me next(err) hua to yahan aayega
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));