const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../../database');

const router = express.Router();

router.get('/', (req, res) => {
  const all = db.getHistory();
  const summary = all.map(({ fullResult, ...rest }) => rest);
  res.json(summary);
});

router.get('/:id', (req, res) => {
  const all = db.getHistory();
  const entry = all.find(e => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json(entry);
});

router.post('/', (req, res) => {
  const entry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    ...req.body,
  };
  db.addHistory(entry);
  res.status(201).json(entry);
});

router.delete('/', (req, res) => {
  db.clearHistory();
  res.json({ success: true });
});

module.exports = router;
