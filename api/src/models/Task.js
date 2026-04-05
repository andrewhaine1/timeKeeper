const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    shortDescription: { type: String, required: true, maxlength: 100 },
    description: { type: String },
    dueDate: { type: Date },
    status: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TaskStatus',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
