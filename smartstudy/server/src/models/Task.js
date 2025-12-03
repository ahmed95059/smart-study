import mongoose from 'mongoose';

const SubtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Subtask title cannot exceed 200 characters']
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  done: {
    type: Boolean,
    default: false,
    index: true
  },
  due: {
    type: Date,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  relatedCourseCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Course code cannot exceed 20 characters']
  },
  relatedEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  subtasks: [SubtaskSchema],
  pomodoroCount: {
    type: Number,
    default: 0,
    min: 0
  },
  order: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
TaskSchema.index({ userId: 1, done: 1 });
TaskSchema.index({ userId: 1, due: 1 });
TaskSchema.index({ userId: 1, priority: 1 });

export default mongoose.model('Task', TaskSchema);
