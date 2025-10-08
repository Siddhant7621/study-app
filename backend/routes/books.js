import express from 'express';
import Book from '../models/Book.js';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ uploadDate: -1 });
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get single book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// Delete a book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book' });
  }
});

// Mark book as completed
// In backend/routes/books.js
// In backend/routes/books.js
router.patch('/:id/complete', authMiddleware, async (req, res) => {
  try {
    // Simply add book to user's completed books
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { completedBooks: req.params.id } }
    );

    res.json({ 
      message: 'Book marked as completed successfully'
    });
  } catch (error) {
    console.error('Book completion error:', error);
    res.status(500).json({ error: 'Failed to mark book as completed' });
  }
});

export default router;