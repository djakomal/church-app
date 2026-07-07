const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const features = db.prepare('SELECT * FROM features ORDER BY id ASC').all();
  res.json(features.map(f => ({ ...f, isEnabled: f.isEnabled === 1 })));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM features WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Fonctionnalité non trouvée' });
  const { name, description, requiredRole, isEnabled } = req.body;
  db.prepare(`UPDATE features SET name=?, description=?, requiredRole=?, isEnabled=? WHERE id=?`).run(
    name || existing.name,
    description !== undefined ? description : existing.description,
    requiredRole || existing.requiredRole,
    isEnabled !== undefined ? (isEnabled ? 1 : 0) : existing.isEnabled,
    req.params.id
  );
  const feature = db.prepare('SELECT * FROM features WHERE id = ?').get(req.params.id);
  res.json({ ...feature, isEnabled: feature.isEnabled === 1 });
});

module.exports = router;
