import mongoose from 'mongoose';

const { Schema } = mongoose;

const JobSchema = new Schema(
  {
    company: {
      type: String,
      required: [true, 'Please provide company name'],
      maxlength: 100,
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Please provide position (job role)'],
      maxlength: 100,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Applied', 'OA', 'Interview', 'HR', 'Offer', 'Rejected', 'Selected'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Applied',
    },
    jobType: {
      type: String,
      enum: {
        values: ['full-time', 'part-time', 'internship', 'contract'],
        message: '{VALUE} is not a valid job type',
      },
      default: 'full-time',
    },
    workMode: {
      type: String,
      enum: {
        values: ['remote', 'on-site', 'hybrid'],
        message: '{VALUE} is not a valid work mode',
      },
      default: 'remote',
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    applicationDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: 2000,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user'],
      index: true, // Index for fast filtering by user
    },
  },
  { timestamps: true }
);

// Compounding index for querying and searching
JobSchema.index({ createdBy: 1, status: 1 });
JobSchema.index({ createdBy: 1, company: 'text', position: 'text' });

export default mongoose.model('Job', JobSchema);
