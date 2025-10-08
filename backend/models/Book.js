import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  textContent: {
    type: String,
    required: true
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  feedbacks: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    feedback: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Add index for better performance
bookSchema.index({ uploadedBy: 1, uploadDate: -1 });
bookSchema.index({ title: 'text', textContent: 'text' });

// Index for feedbacks queries
bookSchema.index({ 'feedbacks.user': 1 });
bookSchema.index({ 'feedbacks.createdAt': -1 });

const Book = mongoose.model('Book', bookSchema);

export default Book;