const { Router } = require('express');
const { getDb } = require('../database');
const { authenticate } = require('./middleware');

const router = Router();

router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const { discussionId } = req.query;
  let messages;
  if (discussionId) {
    messages = db.prepare('SELECT * FROM messages WHERE discussionId = ? ORDER BY created_at ASC').all(discussionId);
  } else {
    messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
  }
  res.json(messages.map(m => ({ ...m, isOwnMessage: m.isOwnMessage === 1 })));
});

router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
  if (!msg) return res.status(404).json({ error: 'Message non trouvé' });
  res.json({ ...msg, isOwnMessage: msg.isOwnMessage === 1 });
});

router.post('/', authenticate, (req, res) => {
  const db = getDb();
  const { discussionId, message, senderName, userId } = req.body;
  if (!message) return res.status(400).json({ error: 'Le message est requis' });
  if (!discussionId) return res.status(400).json({ error: 'discussionId requis' });
  const result = db.prepare(`INSERT INTO messages (discussionId, message, senderName, userId, isOwnMessage)
    VALUES (?, ?, ?, ?, ?)`).run(
    discussionId, message, senderName || '', userId || '', 1
  );
  const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...msg, isOwnMessage: msg.isOwnMessage === 1 });
});

router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Message non trouvé' });
  res.json({ ok: true });
});

module.exports = router;
