const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const { worshipId, userId } = req.query;
  let records;
  if (worshipId && userId) {
    records = db.prepare('SELECT * FROM attendance WHERE worshipId = ? AND userId = ?').all(worshipId, userId);
  } else if (worshipId) {
    records = db.prepare('SELECT * FROM attendance WHERE worshipId = ? ORDER BY created_at DESC').all(worshipId);
  } else if (userId) {
    records = db.prepare('SELECT * FROM attendance WHERE userId = ? ORDER BY created_at DESC').all(userId);
  } else {
    records = db.prepare('SELECT * FROM attendance ORDER BY created_at DESC').all();
  }
  res.json(records.map(r => ({ ...r, confirmed: r.confirmed === 1 })));
});

router.post('/', (req, res) => {
  const db = getDb();
  const { worshipId, userId, userName, confirmed } = req.body;
  if (!worshipId || !userId) return res.status(400).json({ error: 'worshipId et userId requis' });
  const existing = db.prepare('SELECT * FROM attendance WHERE worshipId = ? AND userId = ?').get(worshipId, userId);
  if (existing) {
    db.prepare('UPDATE attendance SET confirmed=?, userName=? WHERE id=?').run(
      confirmed ? 1 : 0, userName || existing.userName, existing.id
    );
    const record = db.prepare('SELECT * FROM attendance WHERE id = ?').get(existing.id);
    return res.json({ ...record, confirmed: record.confirmed === 1 });
  }
  const result = db.prepare(`INSERT INTO attendance (worshipId, userId, userName, confirmed)
    VALUES (?, ?, ?, ?)`).run(worshipId, userId, userName || '', confirmed ? 1 : 0);
  const record = db.prepare('SELECT * FROM attendance WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...record, confirmed: record.confirmed === 1 });
});

router.get('/stats', (req, res) => {
  const db = getDb();
  const total = db.prepare('SELECT COUNT(*) as count FROM attendance').get();
  const confirmed = db.prepare('SELECT COUNT(*) as count FROM attendance WHERE confirmed = 1').get();
  res.json({ total: total.count, confirmed: confirmed.count });
});

module.exports = router;
