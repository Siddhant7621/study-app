import express from 'express';
import Book from '../models/Book.js';
import { ChatService } from '../services/chatService.js';

const router = express.Router();

router.post('/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const chatService = new ChatService(book.textContent);
    const answer = await chatService.askQuestion(question);

    res.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

export default router;