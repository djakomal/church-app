const { Router } = require('express');
const { getDb } = require('../database');
const { authenticate } = require('./middleware');

const router = Router();

router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const permissions = db.prepare('SELECT * FROM permissions ORDER BY id ASC').all();
  res.json(permissions);
});

router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const perm = db.prepare('SELECT * FROM permissions WHERE id = ?').get(req.params.id);
  if (!perm) return res.status(404).json({ error: 'Permission non trouvée' });
  res.json(perm);
});

router.post('/', authenticate, (req, res) => {
  const db = getDb();
  const { name, description, category } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom est requis' });
  const id = `permission-${Date.now()}`;
  db.prepare(`INSERT INTO permissions (id, name, description, category)
    VALUES (?, ?, ?, ?)`).run(id, name, description || '', category || 'general');
  const perm = db.prepare('SELECT * FROM permissions WHERE id = ?').get(id);
  res.status(201).json(perm);
});

router.put('/:id', authenticate, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM permissions WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Permission non trouvée' });
  const { name, description, category } = req.body;
  db.prepare(`UPDATE permissions SET name=?, description=?, category=? WHERE id=?`).run(
    name || existing.name,
    description !== undefined ? description : existing.description,
    category !== undefined ? category : existing.category,
    req.params.id
  );
  const perm = db.prepare('SELECT * FROM permissions WHERE id = ?').get(req.params.id);
  res.json(perm);
});

router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM permissions WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Permission non trouvée' });
  res.json({ ok: true });
});

module.exports = router;
