const { Router } = require('express');
const { getDb } = require('../database');

const router = Router();

router.get('/', (req, res) => {
  const db = getDb();
  const songs = db.prepare('SELECT * FROM songs ORDER BY id ASC').all();
  res.json(songs);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
  if (!song) return res.status(404).json({ error: 'Chant non trouvé' });
  res.json(song);
});

router.post('/', (req, res) => {
  const db = getDb();
  const { title, artist, key, tempo, duration, category, notes, lyrics } = req.body;
  if (!title) return res.status(400).json({ error: 'Le titre est requis' });
  const result = db.prepare(`INSERT INTO songs (title, artist, key, tempo, duration, category, notes, lyrics)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    title, artist || '', key || '', tempo || '', duration || '',
    category || '', notes || '', lyrics || ''
  );
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(song);
});

router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Chant non trouvé' });
  const { title, artist, key, tempo, duration, category, notes, lyrics } = req.body;
  db.prepare(`UPDATE songs SET title=?, artist=?, key=?, tempo=?, duration=?, category=?, notes=?, lyrics=?,
    updated_at=datetime('now') WHERE id=?`).run(
    title || existing.title, artist !== undefined ? artist : existing.artist,
    key !== undefined ? key : existing.key,
    tempo !== undefined ? tempo : existing.tempo,
    duration !== undefined ? duration : existing.duration,
    category !== undefined ? category : existing.category,
    notes !== undefined ? notes : existing.notes,
    lyrics !== undefined ? lyrics : existing.lyrics,
    req.params.id
  );
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
  res.json(song);
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Chant non trouvé' });
  res.json({ ok: true });
});

module.exports = router;
