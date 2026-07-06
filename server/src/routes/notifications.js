const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const notifications = db.prepare('SELECT * FROM notifications ORDER BY created_at DESC').all();
  res.json(notifications.map(parseNotif));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const n = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
  if (!n) return res.status(404).json({ error: 'Notification non trouvée' });
  res.json(parseNotif(n));
});

router.post('/', (req, res) => {
  const db = getDb();
  const { title, message, type, targetAudience, isScheduled, scheduledDate } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Titre et message requis' });
  const result = db.prepare(`INSERT INTO notifications (title, message, type, targetAudience, isScheduled, scheduledDate)
    VALUES (?, ?, ?, ?, ?, ?)`).run(
    title, message, type || 'info', targetAudience || 'all',
    isScheduled ? 1 : 0, scheduledDate || ''
  );
  const n = db.prepare('SELECT * FROM notifications WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(parseNotif(n));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Notification non trouvée' });
  const { title, message, type, targetAudience, isScheduled, scheduledDate, read } = req.body;
  db.prepare(`UPDATE notifications SET title=?, message=?, type=?, targetAudience=?,
    isScheduled=?, scheduledDate=?, read=?, updated_at=datetime('now') WHERE id=?`).run(
    title || existing.title, message || existing.message,
    type || existing.type, targetAudience || existing.targetAudience,
    isScheduled !== undefined ? (isScheduled ? 1 : 0) : existing.isScheduled,
    scheduledDate !== undefined ? scheduledDate : existing.scheduledDate,
    read !== undefined ? (read ? 1 : 0) : existing.read,
    req.params.id
  );
  const n = db.prepare('SELECT * FROM notifications WHERE id = ?').get(req.params.id);
  res.json(parseNotif(n));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Notification non trouvée' });
  res.json({ ok: true });
});

router.post('/:id/read', (req, res) => {
  const db = getDb();
  const result = db.prepare('UPDATE notifications SET read=1 WHERE id=?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Notification non trouvée' });
  res.json({ ok: true });
});

router.post('/read-all', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET read=1 WHERE read=0').run();
  res.json({ ok: true });
});

function parseNotif(n) {
  return { ...n, isScheduled: n.isScheduled === 1, read: n.read === 1 };
}

module.exports = router;
