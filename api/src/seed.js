const TaskStatus = require('./models/TaskStatus');

const statuses = [
  { name: 'New', order: 1 },
  { name: 'In Progress', order: 2 },
  { name: 'Completed', order: 3 },
  { name: 'Closed', order: 4 },
];

async function seedTaskStatuses() {
  for (const status of statuses) {
    await TaskStatus.findOneAndUpdate(
      { name: status.name },
      { $setOnInsert: status },
      { upsert: true, new: true }
    );
  }
  console.log('Task statuses seeded');
}

module.exports = { seedTaskStatuses };
