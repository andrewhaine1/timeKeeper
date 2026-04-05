const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Comment = require('../models/Comment');

router.use(auth);

// Verify the task exists and belongs to the requesting user
async function resolveTask(req, res) {
  const task = await Task.findOne({ _id: req.params.taskId, owner: req.user._id });
  if (!task) {
    res.status(404).json({ message: 'Task not found' });
    return null;
  }
  return task;
}

// GET /api/tasks/:taskId/comments
router.get('/', async (req, res) => {
  try {
    if (!(await resolveTask(req, res))) return;
    const comments = await Comment.find({ task: req.params.taskId }).sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks/:taskId/comments
router.post('/', async (req, res) => {
  try {
    if (!(await resolveTask(req, res))) return;
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });

    const comment = await Comment.create({
      task: req.params.taskId,
      text: text.trim(),
      author: req.user._id,
      authorUsername: req.user.username,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/tasks/:taskId/comments/:commentId
router.put('/:commentId', async (req, res) => {
  try {
    if (!(await resolveTask(req, res))) return;
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });

    const comment = await Comment.findOneAndUpdate(
      { _id: req.params.commentId, task: req.params.taskId, author: req.user._id },
      { text: text.trim() },
      { new: true, runValidators: true }
    );
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/tasks/:taskId/comments/:commentId
router.delete('/:commentId', async (req, res) => {
  try {
    if (!(await resolveTask(req, res))) return;
    const comment = await Comment.findOneAndDelete({
      _id: req.params.commentId,
      task: req.params.taskId,
      author: req.user._id,
    });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
