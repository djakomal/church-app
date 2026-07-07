const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const roles = db.prepare('SELECT * FROM roles ORDER BY level ASC').all();
  res.json(roles.map(r => ({ ...r, permissions: JSON.parse(r.permissions) })));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
  if (!role) return res.status(404).json({ error: 'Rôle non trouvé' });
  res.json({ ...role, permissions: JSON.parse(role.permissions) });
});

router.post('/', (req, res) => {
  const db = getDb();
  const { name, level, description, permissions } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom est requis' });
  const id = `role-${Date.now()}`;
  db.prepare(`INSERT INTO roles (id, name, level, description, permissions)
    VALUES (?, ?, ?, ?, ?)`).run(id, name, level || 0, description || '', JSON.stringify(permissions || []));
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
  res.status(201).json({ ...role, permissions: JSON.parse(role.permissions) });
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Rôle non trouvé' });
  const { name, level, description, permissions } = req.body;
  db.prepare(`UPDATE roles SET name=?, level=?, description=?, permissions=? WHERE id=?`).run(
    name || existing.name,
    level !== undefined ? level : existing.level,
    description !== undefined ? description : existing.description,
    permissions ? JSON.stringify(permissions) : existing.permissions,
    req.params.id
  );
  const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(req.params.id);
  res.json({ ...role, permissions: JSON.parse(role.permissions) });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM roles WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Rôle non trouvé' });
  res.json({ ok: true });
});

module.exports = router;
