const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const members = db.prepare('SELECT * FROM team_members ORDER BY id ASC').all();
  res.json(members);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const m = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'Membre non trouvé' });
  res.json(m);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, role, phone, email } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom est requis' });
  const result = db.prepare(`INSERT INTO team_members (name, role, phone, email)
    VALUES (?, ?, ?, ?)`).run(name, role || '', phone || '', email || '');
  const m = db.prepare('SELECT * FROM team_members WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(m);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Membre non trouvé' });
  const { name, role, phone, email } = req.body;
  db.prepare(`UPDATE team_members SET name=?, role=?, phone=?, email=?, updated_at=datetime('now') WHERE id=?`).run(
    name || existing.name,
    role !== undefined ? role : existing.role,
    phone !== undefined ? phone : existing.phone,
    email !== undefined ? email : existing.email,
    req.params.id
  );
  const m = db.prepare('SELECT * FROM team_members WHERE id = ?').get(req.params.id);
  res.json(m);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Membre non trouvé' });
  res.json({ ok: true });
});

module.exports = router;
