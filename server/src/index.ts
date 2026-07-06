import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { getDb } from './db';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'church-app-secret-key-2024';

app.use(cors());
app.use(express.json());

// --- Auth middleware ---
interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}

// ==================== AUTH ROUTES ====================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...userData } = user;
  userData.permissions = JSON.parse(userData.permissions || '{}');
  res.json({ token, user: userData });
});

app.post('/api/auth/register', (req: AuthRequest, res: Response) => {
  const { name, email, password, role, musicianType, instruments, voiceType } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const id = Date.now().toString();
  const basePermissions = { canManageWorship: false, canManageSongs: false, canManageTeam: false, canSendCommunications: false, canViewOnly: true, canValidateWorship: false, canAssignMusicians: false, canDeleteComments: false };
  const perms = role === 'admin'
    ? { ...basePermissions, canManageWorship: true, canManageSongs: true, canManageTeam: true, canSendCommunications: true, canViewOnly: false, canValidateWorship: true, canAssignMusicians: true, canDeleteComments: true }
    : basePermissions;

  db.prepare(
    `INSERT INTO users (id, name, email, password, role, musician_type, instruments, voice_type, permissions)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, name, email.toLowerCase(), password, role, musicianType || null, instruments ? JSON.stringify(instruments) : null, voiceType || null, JSON.stringify(perms));

  // Auto-create musician entry for editor/viewer
  if (role === 'viewer' || role === 'editor' || musicianType) {
    const type = musicianType || (role === 'viewer' ? 'instrumentiste' : 'chantre');
    db.prepare(
      `INSERT INTO musicians (name, email, type, voice_type, instruments)
       VALUES (?, ?, ?, ?, ?)`
    ).run(name, email.toLowerCase(), type, voiceType || null, instruments ? JSON.stringify(instruments) : null);
  }

  res.status(201).json({ message: 'User created' });
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userData } = user;
  userData.permissions = JSON.parse(userData.permissions || '{}');
  userData.instruments = userData.instruments ? JSON.parse(userData.instruments) : undefined;
  res.json(userData);
});

// ==================== USER MANAGEMENT ====================

app.get('/api/users', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as any[];
  const sanitized = users.map(({ password, ...u }) => ({
    ...u,
    permissions: JSON.parse(u.permissions || '{}'),
    instruments: u.instruments ? JSON.parse(u.instruments) : undefined,
  }));
  res.json(sanitized);
});

app.put('/api/users/:id/role', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const db = getDb();
  const basePermissions = { canManageWorship: false, canManageSongs: false, canManageTeam: false, canSendCommunications: false, canViewOnly: true, canValidateWorship: false, canAssignMusicians: false, canDeleteComments: false };
  const perms = role === 'admin'
    ? { ...basePermissions, canManageWorship: true, canManageSongs: true, canManageTeam: true, canSendCommunications: true, canViewOnly: false, canValidateWorship: true, canAssignMusicians: true, canDeleteComments: true }
    : basePermissions;
  db.prepare('UPDATE users SET role = ?, permissions = ?, updated_at = datetime(\'now\') WHERE id = ?').run(role, JSON.stringify(perms), id);
  res.json({ message: 'Role updated' });
});

app.put('/api/users/:id/permissions', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });
  const currentPerms = JSON.parse(user.permissions || '{}');
  const merged = { ...currentPerms, ...updates };
  db.prepare('UPDATE users SET permissions = ?, updated_at = datetime(\'now\') WHERE id = ?').run(JSON.stringify(merged), id);
  res.json({ message: 'Permissions updated' });
});

app.delete('/api/users/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM users WHERE id = ? AND role != \'admin\'').run(req.params.id);
  res.json({ message: 'User deleted' });
});

// ==================== WORSHIPS ====================

app.get('/api/worships', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const worships = db.prepare('SELECT * FROM worships ORDER BY date DESC, time DESC').all() as any[];
  const parsed = worships.map(w => ({
    ...w,
    songs: JSON.parse(w.songs || '[]'),
    musicians: JSON.parse(w.musicians || '[]'),
    assigned_musicians: JSON.parse(w.assigned_musicians || '[]'),
  }));
  res.json(parsed);
});

app.post('/api/worships', authenticateToken, (req: AuthRequest, res: Response) => {
  const { title, date, time, location, theme, preacher, description, songs, musicians, status, assignedMusicians } = req.body;
  if (!title || !date || !time) return res.status(400).json({ error: 'Title, date, time required' });
  const db = getDb();
  const result = db.prepare(
    `INSERT INTO worships (title, date, time, location, theme, preacher, description, songs, musicians, status, created_by, assigned_musicians)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    title, date, time, location || '', theme || '', preacher || '', description || '',
    JSON.stringify(songs || []), JSON.stringify(musicians || []),
    status || 'draft', req.userId,
    JSON.stringify(assignedMusicians || [])
  );
  res.status(201).json({ id: result.lastInsertRowid });
});

app.put('/api/worships/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { title, date, time, location, theme, preacher, description, songs, musicians, status, assignedMusicians } = req.body;
  const db = getDb();
  db.prepare(
    `UPDATE worships SET title=?, date=?, time=?, location=?, theme=?, preacher=?, description=?,
     songs=?, musicians=?, status=?, assigned_musicians=?, updated_at=datetime('now') WHERE id=?`
  ).run(
    title, date, time, location || '', theme || '', preacher || '', description || '',
    JSON.stringify(songs || []), JSON.stringify(musicians || []),
    status || 'draft', JSON.stringify(assignedMusicians || []), req.params.id
  );
  res.json({ message: 'Updated' });
});

app.delete('/api/worships/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM worships WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ==================== MUSICIANS ====================

app.get('/api/musicians', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const musicians = db.prepare('SELECT * FROM musicians ORDER BY name ASC').all() as any[];
  const parsed = musicians.map(m => ({
    ...m,
    instruments: m.instruments ? JSON.parse(m.instruments) : [],
    availability: m.availability ? JSON.parse(m.availability) : [],
  }));
  res.json(parsed);
});

app.post('/api/musicians', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, email, phone, type, voiceType, instruments, availability, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = getDb();
  const result = db.prepare(
    `INSERT INTO musicians (name, email, phone, type, voice_type, instruments, availability, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(name, email || '', phone || '', type || 'instrumentiste', voiceType || null,
    instruments ? JSON.stringify(instruments) : null,
    availability ? JSON.stringify(availability) : null, notes || '');
  res.status(201).json({ id: result.lastInsertRowid });
});

app.put('/api/musicians/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, email, phone, type, voiceType, instruments, availability, notes } = req.body;
  const db = getDb();
  db.prepare(
    `UPDATE musicians SET name=?, email=?, phone=?, type=?, voice_type=?, instruments=?, availability=?, notes=?, updated_at=datetime('now') WHERE id=?`
  ).run(name, email || '', phone || '', type || 'instrumentiste', voiceType || null,
    instruments ? JSON.stringify(instruments) : null,
    availability ? JSON.stringify(availability) : null, notes || '', req.params.id);
  res.json({ message: 'Updated' });
});

app.delete('/api/musicians/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM musicians WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ==================== SONGS ====================

app.get('/api/songs', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM songs ORDER BY title ASC').all());
});

app.post('/api/songs', authenticateToken, (req: AuthRequest, res: Response) => {
  const { title, artist, key, tempo, duration, category, notes, lyrics } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const db = getDb();
  const result = db.prepare(
    `INSERT INTO songs (title, artist, key, tempo, duration, category, notes, lyrics)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(title, artist || '', key || '', tempo || '', duration || '', category || '', notes || '', lyrics || '');
  res.status(201).json({ id: result.lastInsertRowid });
});

app.put('/api/songs/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { title, artist, key, tempo, duration, category, notes, lyrics } = req.body;
  const db = getDb();
  db.prepare(
    `UPDATE songs SET title=?, artist=?, key=?, tempo=?, duration=?, category=?, notes=?, lyrics=?, updated_at=datetime('now') WHERE id=?`
  ).run(title, artist || '', key || '', tempo || '', duration || '', category || '', notes || '', lyrics || '', req.params.id);
  res.json({ message: 'Updated' });
});

app.delete('/api/songs/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ==================== TEAM MEMBERS ====================

app.get('/api/team-members', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM team_members ORDER BY name ASC').all());
});

app.post('/api/team-members', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, role, phone, email, avatar_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const db = getDb();
  const result = db.prepare(
    `INSERT INTO team_members (name, role, phone, email, avatar_url) VALUES (?, ?, ?, ?, ?)`
  ).run(name, role || '', phone || '', email || '', avatar_url || '');
  res.status(201).json({ id: result.lastInsertRowid });
});

app.put('/api/team-members/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, role, phone, email, avatar_url } = req.body;
  const db = getDb();
  db.prepare(
    `UPDATE team_members SET name=?, role=?, phone=?, email=?, avatar_url=?, updated_at=datetime('now') WHERE id=?`
  ).run(name, role || '', phone || '', email || '', avatar_url || '', req.params.id);
  res.json({ message: 'Updated' });
});

app.delete('/api/team-members/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM team_members WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ==================== COMMUNICATIONS ====================

app.get('/api/communications', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const comms = db.prepare('SELECT * FROM communications ORDER BY sent_at DESC LIMIT 50').all();
  res.json(comms);
});

app.post('/api/communications', authenticateToken, (req: AuthRequest, res: Response) => {
  const { message, type, sent_at } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  const db = getDb();
  const result = db.prepare(
    `INSERT INTO communications (message, type, sent_at) VALUES (?, ?, ?)`
  ).run(message, type || 'info', sent_at || new Date().toISOString());
  res.status(201).json({ id: result.lastInsertRowid });
});

// ==================== NOTIFICATIONS ====================

app.get('/api/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const notifications = db.prepare('SELECT * FROM notifications ORDER BY sent_at DESC').all() as any[];
  const parsed = notifications.map(n => ({ ...n, is_scheduled: !!n.is_scheduled, read: !!n.read }));
  res.json(parsed);
});

app.post('/api/notifications', authenticateToken, (req: AuthRequest, res: Response) => {
  const { title, message, type, targetAudience, isScheduled, scheduledDate, sent_at } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Title and message required' });
  const db = getDb();
  const result = db.prepare(
    `INSERT INTO notifications (title, message, type, target_audience, is_scheduled, scheduled_date, sent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(title, message, type || 'info', targetAudience || 'all', isScheduled ? 1 : 0, scheduledDate || null, sent_at || new Date().toISOString());
  res.status(201).json({ id: result.lastInsertRowid });
});

app.put('/api/notifications/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET read = 1, updated_at = datetime(\'now\') WHERE id = ?').run(req.params.id);
  res.json({ message: 'Marked as read' });
});

app.put('/api/notifications/read-all', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET read = 1, updated_at = datetime(\'now\')').run();
  res.json({ message: 'All marked as read' });
});

app.delete('/api/notifications/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM comments WHERE notification_id = ?').run(req.params.id);
  db.prepare('DELETE FROM notifications WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ==================== COMMENTS ====================

app.get('/api/comments', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const { notificationId } = req.query;
  let comments;
  if (notificationId) {
    comments = db.prepare('SELECT * FROM comments WHERE notification_id = ? ORDER BY created_at DESC').all(notificationId);
  } else {
    comments = db.prepare('SELECT * FROM comments ORDER BY created_at DESC').all();
  }
  res.json(comments);
});

app.post('/api/comments', authenticateToken, (req: AuthRequest, res: Response) => {
  const { notificationId, content } = req.body;
  if (!notificationId || !content) return res.status(400).json({ error: 'notificationId and content required' });
  const db = getDb();
  const user = db.prepare('SELECT name, role FROM users WHERE id = ?').get(req.userId) as any;
  const result = db.prepare(
    `INSERT INTO comments (notification_id, user_id, user_name, user_role, content)
     VALUES (?, ?, ?, ?, ?)`
  ).run(notificationId, req.userId, user?.name || 'Inconnu', user?.role || '', content);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.delete('/api/comments/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// ==================== USER PREFERENCES ====================

app.get('/api/preferences/:key', authenticateToken, (req: AuthRequest, res: Response) => {
  const db = getDb();
  const pref = db.prepare('SELECT pref_value FROM user_preferences WHERE user_id = ? AND pref_key = ?').get(req.userId, req.params.key) as any;
  res.json({ value: pref ? pref.pref_value : null });
});

app.put('/api/preferences/:key', authenticateToken, (req: AuthRequest, res: Response) => {
  const { value } = req.body;
  const db = getDb();
  db.prepare(
    `INSERT INTO user_preferences (user_id, pref_key, pref_value) VALUES (?, ?, ?)
     ON CONFLICT(user_id, pref_key) DO UPDATE SET pref_value = ?`
  ).run(req.userId, req.params.key, value, value);
  res.json({ message: 'Saved' });
});

// ==================== START ====================

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
