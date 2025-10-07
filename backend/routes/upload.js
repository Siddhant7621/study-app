import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import Book from '../models/Book.js';
import { extractTextFromPDF } from '../services/pdfService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Upload PDF
router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract text from PDF
    const textContent = await extractTextFromPDF(req.file.path);

    // Save book to database
    const book = new Book({
      title: req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      textContent: textContent
    });

    await book.save();

    res.json({ 
      success: true, 
      book: {
        id: book._id,
        title: book.title,
        filename: book.filename,
        uploadDate: book.uploadDate
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ uploadDate: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

export default router;