import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables FIRST
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically - FIXED
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, path) => {
    // Set proper headers for PDF files
    if (path.endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
    }
  }
}));

// Debug route to check file listing
app.get('/api/debug/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir);
    res.json({ 
      uploadsDirectory: uploadsDir,
      files: files,
      totalFiles: files.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug route to check specific file
app.get('/api/debug/file/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      res.json({
        filename: filename,
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        path: filePath
      });
    } else {
      res.status(404).json({
        filename: filename,
        exists: false,
        error: 'File not found'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import routes
import uploadRoutes from './routes/upload.js';
import bookRoutes from './routes/books.js';
import quizRoutes from './routes/quiz.js';
import chatRoutes from './routes/chat.js';
import youtubeRoutes from './routes/youtube.js';
import authRoutes from './routes/auth.js';

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/auth', authRoutes);


// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Study Assistant API is running',
    uploadsDir: uploadsDir
  });
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/study-assistant';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Study Assistant API: http://localhost:${PORT}/api/health`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});