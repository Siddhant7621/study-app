import express from 'express';
import Book from '../models/Book.js';
import Quiz from '../models/Quiz.js';
import { QuizService } from '../services/quizService.js';

const router = express.Router();
const quizService = new QuizService();

// Generate quiz for a book
router.post('/generate/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const quiz = await quizService.generateQuiz(bookId, book.textContent);
    res.json(quiz);
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// Submit quiz answers
router.post('/submit/:quizId', async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    const result = await quizService.evaluateQuiz(quizId, answers);
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