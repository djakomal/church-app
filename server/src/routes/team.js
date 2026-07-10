const { Router } = require('express');
const { getDb } = require('../database');
const { authenticate } = require('./middleware');

const router = Router();

router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const members = db.prepare('SELECT * FROM team_members ORDER BY id ASC').all();
  res.json(members);
});

router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const m = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'Membre non trouvé' });
  res.json(m);
});

router.post('/', authenticate, (req, res) => {
  const db = getDb();
  const { name, role, phone, email, avatar_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom est requis' });
  const result = db.prepare(`INSERT INTO team_members (name, role, phone, email, avatar_url)
    VALUES (?, ?, ?, ?, ?)`).run(name, role || '', phone || '', email || '', avatar_url || '');
  const m = db.prepare('SELECT * FROM team_members WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(m);
});

router.put('/:id', authenticate, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Membre non trouvé' });
  const { name, role, phone, email, avatar_url } = req.body;
  db.prepare(`UPDATE team_members SET name=?, role=?, phone=?, email=?, avatar_url=?, updated_at=datetime('now') WHERE id=?`).run(
    name || existing.name,
    role !== undefined ? role : existing.role,
    phone !== undefined ? phone : existing.phone,
    email !== undefined ? email : existing.email,
    avatar_url !== undefined ? avatar_url : existing.avatar_url,
    req.params.id
  );
  const m = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  res.json(m);
});

router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Membre non trouvé' });
  res.json({ ok: true });
});

module.exports = router;
