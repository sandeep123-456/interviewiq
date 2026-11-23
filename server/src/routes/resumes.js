const express = require('express');
const multer = require('multer');
// Seedha lib wali file: pdf-parse ka main file import par ek test PDF padhne ki koshish karta hai
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');
const { parseResume } = require('../services/resume');

const router = express.Router();
router.use(requireAuth);

const MAX_RESUMES = 5;

// File disk pe nahi, sirf memory me aati hai. Max 3 MB.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 } });

function handleUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File is too large. Maximum size is 3 MB.' });
    }
    return res.status(400).json({ error: 'Upload failed. Try again.' });
  });
}

// POST /api/resumes  (form-data, field name: file)
router.post('/', handleUpload, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'Attach a PDF file.' });

    // Naam .pdf ho sakta hai par andar kuch aur. Asli PDF "%PDF-" se shuru hoti hai.
    if (file.buffer.subarray(0, 5).toString() !== '%PDF-') {
      return res.status(400).json({ error: 'Only PDF files are supported.' });
    }

    const count = await prisma.resume.count({ where: { userId } });
    if (count >= MAX_RESUMES) {
      return res.status(409).json({ error: `You can keep up to ${MAX_RESUMES} resumes. Delete one first.` });
    }

    let rawText;
    try {
      const data = await pdfParse(file.buffer);
      rawText = (data.text || '').replace(/\u0000/g, '').trim(); // Postgres text me NUL byte nahi chalta
    } catch {
      return res.status(422).json({ error: 'Could not read this PDF.' });
    }
    if (rawText.length < 100) {
      return res.status(422).json({
        error: 'No readable text found. Scanned or image-only PDFs are not supported. Export it from Word or Google Docs.',
      });
    }
    rawText = rawText.slice(0, 20000);

    // AI se structured data. Ye DB ke bahar hai (slow ho sakta hai).
    const parsedData = await parseResume(rawText);

    const resume = await prisma.resume.create({
      data: { userId, fileName: file.originalname.slice(0, 120), rawText, parsedData },
    });

    res.status(201).json({
      resume: { id: resume.id, fileName: resume.fileName, createdAt: resume.createdAt, parsed: parsedData },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/resumes  -> meri resumes
router.get('/', async (req, res, next) => {
  try {
    const rows = await prisma.resume.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: MAX_RESUMES,
      select: { id: true, fileName: true, createdAt: true, parsedData: true },
    });
    res.json({
      resumes: rows.map((r) => ({
        id: r.id,
        fileName: r.fileName,
        createdAt: r.createdAt,
        parsed: r.parsedData,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/resumes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    // id ke saath userId bhi: dusre ka resume nahi hata sakte
    const out = await prisma.resume.deleteMany({
      where: { id: req.params.id, userId: req.user.userId },
    });
    if (out.count === 0) return res.status(404).json({ error: 'Resume not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;