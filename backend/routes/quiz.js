import express from 'express';
import Book from '../models/Book.js';
import Quiz from '../models/Quiz.js';
import { QuizService } from '../services/quizService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
const quizService = new QuizService();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Generate quiz for a book
// In backend/routes/quiz.js
// In backend/routes/quiz.js
router.post('/generate/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if book has text content
    if (!book.textContent || book.textContent.trim().length < 50) {
      return res.status(400).json({ 
        error: 'Book content is too short or empty. Please upload a book with sufficient text content.' 
      });
    }

    const quiz = await quizService.generateQuiz(bookId, book.textContent);
    res.json(quiz);
  } catch (error) {
    console.error('Quiz generation error:', error.message);
    
    // Return specific error messages based on the error
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('rate limit') || errorMessage.includes('overloaded')) {
      return res.status(503).json({ 
        error: 'AI service is currently overloaded. Please try again in a few moments.' 
      });
    } else if (errorMessage.includes('authentication') || errorMessage.includes('api key')) {
      return res.status(500).json({ 
        error: 'AI service configuration error. Please contact support.' 
      });
    } else if (errorMessage.includes('timeout')) {
      return res.status(504).json({ 
        error: 'AI service request timeout. Please try again.' 
      });
    } else if (errorMessage.includes('empty') || errorMessage.includes('invalid format')) {
      return res.status(500).json({ 
        error: 'AI service returned an unexpected response. Please try generating the quiz again.' 
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to generate quiz. Please try again.' 
      });
    }
  }
});

// Submit quiz answers
router.post('/submit/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id;  // Get userId from authenticated user

    const result = await quizService.evaluateQuiz(quizId, answers, userId);
    res.json(result);
  } catch (error) {
    console.error('Quiz evaluation error:', error);
    res.status(500).json({ error: 'Failed to evaluate quiz' });
  }
});

// Get quiz by ID
router.get('/:quizId', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// Get all quizzes for a book
router.get('/book/:bookId', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ bookId: req.params.bookId }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

export default router;