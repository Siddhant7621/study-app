import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // Changed from String
    ref: 'User',
    required: true
  },
  totalQuizzes: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  weakAreas: [String],
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Compound index for unique user-book combination
progressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);