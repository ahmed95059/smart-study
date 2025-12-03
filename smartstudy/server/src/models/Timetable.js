import mongoose from 'mongoose';

const CourseScheduleSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6 // 0 = Sunday, 6 = Saturday
  },
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial', 'seminar'],
    default: 'lecture'
  }
}, { _id: true });

const CourseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Course code cannot exceed 20 characters']
  },
  courseName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  instructor: {
    type: String,
    trim: true,
    maxlength: [100, 'Instructor name cannot exceed 100 characters']
  },
  schedule: [CourseScheduleSchema],
  color: {
    type: String,
    default: '#3B82F6'
  },
  credits: {
    type: Number,
    min: 0,
    max: 10
  }
}, { _id: true });

const TimetableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    trim: true,
    maxlength: [50, 'Semester cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  courses: [CourseSchema]
}, {
  timestamps: true
});

// Ensure only one active timetable per user
TimetableSchema.index({ userId: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

// Pre-save hook to deactivate other timetables when setting one as active
TimetableSchema.pre('save', async function(next) {
  if (this.isActive && this.isModified('isActive')) {
    await mongoose.model('Timetable').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

export default mongoose.model('Timetable', TimetableSchema);
