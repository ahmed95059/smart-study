import mongoose from 'mongoose';

const AttachmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'pdf', 'doc', 'other'],
    default: 'other'
  },
  size: {
    type: Number // in bytes
  }
}, { _id: true });

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    default: '',
    maxlength: [50000, 'Content cannot exceed 50,000 characters']
  },
  relatedCourseCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Course code cannot exceed 20 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#FFFFFF'
  },
  folder: {
    type: String,
    trim: true,
    maxlength: [50, 'Folder name cannot exceed 50 characters']
  },
  attachments: [AttachmentSchema]
}, {
  timestamps: true
});

// Indexes for better query performance
NoteSchema.index({ userId: 1, updatedAt: -1 });
NoteSchema.index({ userId: 1, isPinned: -1 });
NoteSchema.index({ userId: 1, relatedCourseCode: 1 });
NoteSchema.index({ userId: 1, tags: 1 });

// Text index for search functionality
NoteSchema.index({ title: 'text', content: 'text' });

export default mongoose.model('Note', NoteSchema);
