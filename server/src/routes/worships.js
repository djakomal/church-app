const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const worships = db.prepare('SELECT * FROM worships ORDER BY date DESC, time DESC').all();
  res.json(worships.map(parseWorship));
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const worship = db.prepare('SELECT * FROM worships WHERE id = ?').get(req.params.id);
  if (!worship) return res.status(404).json({ error: 'Culte non trouvé' });
  res.json(parseWorship(worship));
});

router.post('/', (req, res) => {
  const db = getDb();
  const { title, date, time, location, theme, preacher, description, status } = req.body;
  if (!title || !date) return res.status(400).json({ error: 'Titre et date requis' });
  const result = db.prepare(`INSERT INTO worships (title, date, time, location, theme, preacher, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    title, date, time || '', location || '', theme || '',
    preacher || '', description || '', status || 'draft'
  );
  const worship = db.prepare('SELECT * FROM worships WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(parseWorship(worship));
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM worships WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Culte non trouvé' });
  const { title, date, time, location, theme, preacher, description, status, songs, musicians } = req.body;
  db.prepare(`UPDATE worships SET title=?, date=?, time=?, location=?, theme=?, preacher=?,
    description=?, status=?, songs=?, musicians=?, updated_at=datetime('now') WHERE id=?`).run(
    title || existing.title, date || existing.date,
    time !== undefined ? time : existing.time,
    location !== undefined ? location : existing.location,
    theme !== undefined ? theme : existing.theme,
    preacher !== undefined ? preacher : existing.preacher,
    description !== undefined ? description : existing.description,
    status || existing.status,
    songs ? JSON.stringify(songs) : existing.songs,
    musicians ? JSON.stringify(musicians) : existing.musicians,
    req.params.id
  );
  const worship = db.prepare('SELECT * FROM worships WHERE id = ?').get(req.params.id);
  res.json(parseWorship(worship));
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM worships WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Culte non trouvé' });
  res.json({ ok: true });
});

function parseWorship(w) {
  return {
    ...w,
    songs: typeof w.songs === 'string' ? JSON.parse(w.songs) : w.songs,
    musicians: typeof w.musicians === 'string' ? JSON.parse(w.musicians) : w.musicians,
    isScheduled: w.isScheduled === 1,
    read: w.read === 1,
  };
}

module.exports = router;
