import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    desc: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low', 'urgent'],
      default: 'medium',
    },
    date: {
      type: String,
    },
    status: {
      type: String,
      enum: ['in-progress', 'pending', 'completed'],
      default: 'in-progress',
    },
    bookmarked: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
