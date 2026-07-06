const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const comms = db.prepare('SELECT * FROM communications ORDER BY created_at DESC LIMIT 50').all();
  res.json(comms);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { message, type } = req.body;
  if (!message) return res.status(400).json({ error: 'Le message est requis' });
  const result = db.prepare('INSERT INTO communications (message, type) VALUES (?, ?)').run(message, type || 'info');
  const comm = db.prepare('SELECT * FROM communications WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(comm);
});

module.exports = router;
