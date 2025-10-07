import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  userId: {
    type: String,
    default: 'default-user'
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

export default mongoose.model('Progress', progressSchema);