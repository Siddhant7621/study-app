import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import Book from '../models/Book.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user with populated uploaded and completed books
    const user = await User.findById(userId)
      .populate('uploadedBooks', '_id title')
      .populate('completedBooks', '_id title');
    
    // Get all progress documents for the user
    const progress = await Progress.find({ userId: userId });

    console.log('Fetched progress documents:', progress);
    

    // Calculate totals across all progress documents
    const totalMCQs = progress.reduce((sum, doc) => sum + (doc.totalMCQs || 0), 0);
    const correctMCQs = progress.reduce((sum, doc) => sum + (doc.correctMCQs || 0), 0);
    const correctMCQsPercentage = totalMCQs > 0 ? (correctMCQs / totalMCQs) * 100 : 0;

    // Calculate average score across all quizzes
    const totalQuizzes = progress.reduce((sum, doc) => sum + (doc.totalQuizzes || 0), 0);
    const totalScore = progress.reduce((sum, doc) => sum + (doc.totalScore || 0), 0);
    const overallAverageScore = totalQuizzes > 0 ? totalScore / totalQuizzes : 0;

    // Get unique strengths and weaknesses across all progress
    const allStrengths = [...new Set(progress.flatMap(doc => doc.strengths || []))];
    const allWeaknesses = [...new Set(progress.flatMap(doc => doc.weaknesses || []))];
    const allRecommendations = [...new Set(progress.flatMap(doc => doc.recommendations || []))];

    // Reshape the response
    const reshapedResponse = {
      userStats: {
        name: user.name,
        email: user.email,
        totalUploadedBooks: user.uploadedBooks.length,
        uploadedBooks: user.uploadedBooks.map(book => ({
          id: book._id,
          title: book.title
        })),
        totalCompletedBooks: user.completedBooks.length,
        completedBooks: user.completedBooks.map(book => ({
          id: book._id,
          title: book.title
        }))
      },
      quizPerformance: {
        totalQuizzes: totalQuizzes,
        totalMCQsAttempted: totalMCQs,
        correctMCQs: correctMCQs,
        correctMCQsPercentage: Math.round(correctMCQsPercentage * 100) / 100,
        overallAverageScore: Math.round(overallAverageScore * 100) / 100
      },
      learningInsights: {
        strengths: allStrengths,
        weaknesses: allWeaknesses,
        recommendations: allRecommendations
      },
      detailedProgress: progress.map(doc => ({
        bookId: doc.bookId?._id,
        bookTitle: doc.bookId?.title || 'Unknown Book',
        totalQuizzes: doc.totalQuizzes || 0,
        averageScore: Math.round((doc.averageScore || 0) * 100) / 100,
        mcqStats: {
          total: doc.totalMCQs || 0,
          correct: doc.correctMCQs || 0,
          percentage: doc.totalMCQs > 0 ? Math.round((doc.correctMCQs / doc.totalMCQs) * 100 * 100) / 100 : 0
        },
        lastActivity: doc.lastActivity,
        strengths: doc.strengths || [],
        weaknesses: doc.weaknesses || []
      }))
    };

    res.json(reshapedResponse);
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get progress for a specific book
router.get('/book/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    const progress = await Progress.findOne({ 
      user: req.user._id, 
      bookId: bookId 
    }).populate('bookId', 'title');
    
    if (!progress) {
      return res.status(404).json({ error: 'Progress not found for this book' });
    }

    const reshapedProgress = {
      bookId: progress.bookId._id,
      bookTitle: progress.bookId.title,
      totalQuizzes: progress.totalQuizzes,
      averageScore: Math.round(progress.averageScore * 100) / 100,
      mcqStats: {
        total: progress.totalMCQs,
        correct: progress.correctMCQs,
        percentage: progress.totalMCQs > 0 ? Math.round((progress.correctMCQs / progress.totalMCQs) * 100 * 100) / 100 : 0
      },
      strengths: progress.strengths,
      weaknesses: progress.weaknesses,
      recommendations: progress.recommendations,
      lastActivity: progress.lastActivity,
      lastAnalysis: progress.lastAnalysis
    };
    
    res.json(reshapedProgress);
  } catch (error) {
    console.error('Error fetching book progress:', error);
    res.status(500).json({ error: 'Failed to fetch book progress' });
  }
});

export default router;