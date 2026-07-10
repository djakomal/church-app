const { Router } = require('express');
const { getDb } = require('../database');
const { authenticate } = require('./middleware');

const router = Router();

router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const musicians = db.prepare('SELECT * FROM musicians ORDER BY id ASC').all();
  res.json(musicians.map(parseMusician));
});

router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const m = db.prepare('SELECT * FROM musicians WHERE id = ?').get(req.params.id);
  if (!m) return res.status(404).json({ error: 'Musicien non trouvé' });
  res.json(parseMusician(m));
});

router.post('/', authenticate, (req, res) => {
  const db = getDb();
  const { name, email, phone, type, voiceType, instruments, availability, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom est requis' });
  const result = db.prepare(`INSERT INTO musicians (name, email, phone, type, voiceType, instruments, availability, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    name, email || '', phone || '', type || 'chantre',
    voiceType || '',
    instruments ? JSON.stringify(instruments) : '[]',
    availability ? JSON.stringify(availability) : '[]',
    notes || ''
  );
  const m = db.prepare('SELECT * FROM musicians WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(parseMusician(m));
});

router.put('/:id', authenticate, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM musicians WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Musicien non trouvé' });
  const { name, email, phone, type, voiceType, instruments, availability, notes } = req.body;
  db.prepare(`UPDATE musicians SET name=?, email=?, phone=?, type=?, voiceType=?, instruments=?,
    availability=?, notes=?, updated_at=datetime('now') WHERE id=?`).run(
    name || existing.name,
    email !== undefined ? email : existing.email,
    phone !== undefined ? phone : existing.phone,
    type || existing.type,
    voiceType !== undefined ? voiceType : existing.voiceType,
    instruments ? JSON.stringify(instruments) : existing.instruments,
    availability ? JSON.stringify(availability) : existing.availability,
    notes !== undefined ? notes : existing.notes,
    req.params.id
  );
  const m = db.prepare('SELECT * FROM musicians WHERE id = ?').get(req.params.id);
  res.json(parseMusician(m));
});

router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM musicians WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Musicien non trouvé' });
  res.json({ ok: true });
});

function parseMusician(m) {
  return {
    ...m,
    instruments: typeof m.instruments === 'string' ? JSON.parse(m.instruments) : m.instruments,
    availability: typeof m.availability === 'string' ? JSON.parse(m.availability) : m.availability,
  };
}

module.exports = router;
