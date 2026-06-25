const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
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

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.sql', '.txt', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .sql, .txt, and .json files are allowed'));
    }
  },
});

/**
 * POST /api/upload
 * Upload a schema file
 */
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const filePath = req.file.path;
    const content = fs.readFileSync(filePath, 'utf-8');

    // Return the content to be analyzed
    res.json({
      filename: req.file.originalname,
      size: req.file.size,
      sql: content,
    });

    // Clean up file after reading
    fs.unlinkSync(filePath);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to read file', detail: err.message });
  }
});

module.exports = router;
