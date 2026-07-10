const { Router } = require('express');
const { getDb } = require('../database');
const { authenticate } = require('./middleware');

const router = Router();

router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const comms = db.prepare('SELECT * FROM communications ORDER BY created_at DESC LIMIT 50').all();
  res.json(comms);
});

router.post('/', authenticate, (req, res) => {
  const db = getDb();
  const { message, type, sent_at } = req.body;
  if (!message) return res.status(400).json({ error: 'Le message est requis' });
  const result = db.prepare('INSERT INTO communications (message, type, sent_at) VALUES (?, ?, ?)').run(message, type || 'info', sent_at || new Date().toISOString());
  const comm = db.prepare('SELECT * FROM communications WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(comm);
});

module.exports = router;
