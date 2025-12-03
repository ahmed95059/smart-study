import mongoose from 'mongoose';

const PomodoroSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  relatedTaskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  relatedCourseCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Course code cannot exceed 20 characters']
  },
  sessionType: {
    type: String,
    enum: ['work', 'short-break', 'long-break'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1,
    max: 120
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, 'Note cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PomodoroSessionSchema.index({ userId: 1, startTime: -1 });
PomodoroSessionSchema.index({ userId: 1, sessionType: 1 });
PomodoroSessionSchema.index({ userId: 1, relatedTaskId: 1 });

export default mongoose.model('PomodoroSession', PomodoroSessionSchema);
