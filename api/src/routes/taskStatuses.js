const router = require('express').Router();
const auth = require('../middleware/auth');
const TaskStatus = require('../models/TaskStatus');

router.use(auth);

router.get('/', async (_req, res) => {
  try {
    const statuses = await TaskStatus.find().sort({ order: 1 });
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
