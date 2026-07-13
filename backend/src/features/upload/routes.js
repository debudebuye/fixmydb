const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { sendSuccess, sendError } = require('../../shared/middleware/response');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const ALLOWED_MIMES = ['application/sql', 'text/plain', 'application/json', 'text/x-sql', 'application/x-sql'];

function looksLikeText(buf) {
  if (buf.length === 0) return false;
  for (let i = 0; i < Math.min(buf.length, 512); i++) {
    const b = buf[i];
    if (b === 0 || b === 0xFF) return false;
  }
  return true;
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.sql', '.txt', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Only .sql, .txt, and .json files are allowed'));
    }
    if (file.mimetype && !ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  },
});

router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, 'NO_FILE', 'No file uploaded');
    }

    const results = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const buf = await fs.promises.readFile(file.path);
        if (!looksLikeText(buf)) {
          errors.push({ filename: file.originalname, error: 'File contains binary content' });
        } else {
          results.push({
            filename: file.originalname,
            size: file.size,
            sql: buf.toString('utf-8'),
          });
        }
      } catch {
        errors.push({ filename: file.originalname, error: 'Failed to read file' });
      } finally {
        try { await fs.promises.unlink(file.path); } catch { /* already cleaned up */ }
      }
    }

    if (results.length === 0) {
      return sendError(res, 400, 'NO_VALID_FILES', errors.length ? errors.map(e => e.error).join('; ') : 'No valid files uploaded');
    }

    const combinedSql = results.map(r => r.sql).join('\n\n');

    sendSuccess(res, {
      files: results.map(r => ({ filename: r.filename, size: r.size })),
      sql: combinedSql,
      fileCount: results.length,
      errorCount: errors.length,
    });
  } catch {
    sendError(res, 500, 'UPLOAD_FAILED', 'Failed to process upload');
  }
});

module.exports = router;
