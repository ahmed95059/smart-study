import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  start: {
    type: Date,
    required: [true, 'Start date is required']
  },
  end: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.start;
      },
      message: 'End date must be after start date'
    }
  },
  allDay: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['event', 'course'],
    default: 'event'
  },
  courseCode: {
    type: String,
    trim: true,
    maxlength: [20, 'Course code cannot exceed 20 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrence: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    daysOfWeek: [Number], // 0-6 for Sunday-Saturday
    endDate: Date
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
EventSchema.index({ userId: 1, start: 1 });
EventSchema.index({ userId: 1, type: 1 });
EventSchema.index({ userId: 1, courseCode: 1 });

export default mongoose.model('Event', EventSchema);
