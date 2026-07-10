const { Router } = require('express');
const { getDb } = require('../database');
const { authenticate } = require('./middleware');

const router = Router();

router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const discussions = db.prepare('SELECT * FROM discussions ORDER BY category ASC, title ASC').all();
  res.json(discussions.map(d => ({ ...d, hasNewMessages: d.hasNewMessages === 1, hasUrgentAlert: d.hasUrgentAlert === 1 })));
});

router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const disc = db.prepare('SELECT * FROM discussions WHERE id = ?').get(req.params.id);
  if (!disc) return res.status(404).json({ error: 'Discussion non trouvée' });
  res.json({ ...disc, hasNewMessages: disc.hasNewMessages === 1, hasUrgentAlert: disc.hasUrgentAlert === 1 });
});

router.post('/', authenticate, (req, res) => {
  const db = getDb();
  const { id, title, category, icon } = req.body;
  if (!id || !title) return res.status(400).json({ error: 'id et titre requis' });
  db.prepare(`INSERT INTO discussions (id, title, category, icon) VALUES (?, ?, ?, ?)`).run(
    id, title, category || 'general', icon || 'chatbubble'
  );
  const disc = db.prepare('SELECT * FROM discussions WHERE id = ?').get(id);
  res.status(201).json(disc);
});

router.put('/:id', authenticate, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM discussions WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Discussion non trouvée' });
  const { title, category, icon, hasNewMessages, hasUrgentAlert } = req.body;
  db.prepare(`UPDATE discussions SET title=?, category=?, icon=?, hasNewMessages=?, hasUrgentAlert=? WHERE id=?`).run(
    title || existing.title,
    category || existing.category,
    icon || existing.icon,
    hasNewMessages !== undefined ? (hasNewMessages ? 1 : 0) : existing.hasNewMessages,
    hasUrgentAlert !== undefined ? (hasUrgentAlert ? 1 : 0) : existing.hasUrgentAlert,
    req.params.id
  );
  const disc = db.prepare('SELECT * FROM discussions WHERE id = ?').get(req.params.id);
  res.json({ ...disc, hasNewMessages: disc.hasNewMessages === 1, hasUrgentAlert: disc.hasUrgentAlert === 1 });
});

router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM discussions WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Discussion non trouvée' });
  res.json({ ok: true });
});

module.exports = router;
