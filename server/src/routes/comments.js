const { Router } = require('express');
const { getDb } = require('../database');
const { authenticate } = require('./middleware');

const router = Router();

router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const comments = db.prepare('SELECT * FROM comments ORDER BY created_at ASC').all();
  res.json(comments);
});

router.get('/by-notification/:notificationId', authenticate, (req, res) => {
  const db = getDb();
  const comments = db.prepare('SELECT * FROM comments WHERE notificationId = ? ORDER BY created_at ASC')
    .all(req.params.notificationId);
  res.json(comments);
});

router.post('/', authenticate, (req, res) => {
  const db = getDb();
  const { notificationId, userId, userName, userRole, content } = req.body;
  if (!notificationId || !userId || !content) {
    return res.status(400).json({ error: 'notificationId, userId et content requis' });
  }
  const result = db.prepare(`INSERT INTO comments (notificationId, userId, userName, userRole, content)
    VALUES (?, ?, ?, ?, ?)`).run(notificationId, userId, userName || '', userRole || '', content);
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(comment);
});

router.put('/:id', authenticate, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Commentaire non trouvé' });
  const { content } = req.body;
  db.prepare('UPDATE comments SET content=?, updated_at=datetime(\'now\') WHERE id=?').run(content, req.params.id);
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
  res.json(comment);
});

router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Commentaire non trouvé' });
  res.json({ ok: true });
});

router.delete('/by-notification/:notificationId', authenticate, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM comments WHERE notificationId = ?').run(req.params.notificationId);
  res.json({ ok: true });
});

module.exports = router;
