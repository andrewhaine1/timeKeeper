const mongoose = require('mongoose');

const taskStatusSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TaskStatus', taskStatusSchema);
