const { Router } = require('express');
const bcrypt = require('bcryptjs');
const { requireAdmin } = require('./middleware');
const { getDb } = require('../database');

const router = Router();

router.get('/', requireAdmin, (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, name, email, role, permissions, status, phone, department, position, lastLogin, created_at, updated_at FROM users').all();
  res.json(users.map(u => ({ ...u, permissions: JSON.parse(u.permissions) })));
});

router.get('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, name, email, role, permissions, status, phone, department, position, lastLogin, created_at, updated_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  res.json({ ...user, permissions: JSON.parse(user.permissions) });
});

router.post('/', requireAdmin, (req, res) => {
  const db = getDb();
  const { name, email, password, role, status } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Nom et email requis' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });
  const id = `user-${Date.now()}`;
  const hashed = password ? bcrypt.hashSync(password, 10) : '';
  const userRole = role || 'viewer';
  const permissions = getPermissionsForRole(userRole);
  db.prepare(`INSERT INTO users (id, name, email, role, password, permissions, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, name, email.toLowerCase(), userRole, hashed, JSON.stringify(permissions), status || 'active');
  const user = db.prepare('SELECT id, name, email, role, permissions, status, created_at FROM users WHERE id = ?').get(id);
  user.permissions = JSON.parse(user.permissions);
  res.status(201).json(user);
});

router.put('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const { name, email, role, status, phone, department, position } = req.body;
  const roleChanged = role && role !== existing.role;
  const permissions = roleChanged ? getPermissionsForRole(role) : undefined;
  db.prepare(`UPDATE users SET name=?, email=?, role=?, status=?, phone=?, department=?, position=?,
    ${permissions ? 'permissions=?,' : ''} updated_at=datetime('now') WHERE id=?`).run(
    name || existing.name,
    email ? email.toLowerCase() : existing.email,
    role || existing.role,
    status || existing.status,
    phone !== undefined ? phone : existing.phone,
    department !== undefined ? department : existing.department,
    position !== undefined ? position : existing.position,
    ...(permissions ? [JSON.stringify(permissions)] : []),
    req.params.id
  );
  if (roleChanged) {
    const roleNames = { admin: 'Administrateur', editor: 'Éditeur', viewer: 'Visualiseur' };
    db.prepare(`INSERT INTO notifications (title, message, type, targetAudience, userId)
      VALUES (?, ?, ?, ?, ?)`).run(
      'Rôle mis à jour',
      `Votre rôle a été changé en "${roleNames[role] || role}"`,
      'success', 'all', req.params.id
    );
  }
  const user = db.prepare('SELECT id, name, email, role, permissions, status, phone, department, position, lastLogin, created_at, updated_at FROM users WHERE id = ?').get(req.params.id);
  res.json({ ...user, permissions: JSON.parse(user.permissions) });
});

router.delete('/:id', requireAdmin, (req, res) => {
  const db = getDb();
  if (req.params.id === 'admin-001' || req.params.id === req.userId) {
    return res.status(403).json({ error: 'Impossible de supprimer l\'administrateur principal' });
  }
  const result = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  res.json({ ok: true });
});

router.put('/:id/permissions', requireAdmin, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const currentPerms = JSON.parse(existing.permissions);
  const updated = { ...currentPerms, ...req.body };
  db.prepare('UPDATE users SET permissions=?, updated_at=datetime(\'now\') WHERE id=?').run(JSON.stringify(updated), req.params.id);
  res.json({ ok: true });
});

function getPermissionsForRole(role) {
  const viewer = {
    canManageUsers: false, canAssignRoles: false, canValidateCults: false,
    canAssignMusicians: false, canSendGlobalNotifications: false,
    canSendTargetedNotifications: false, canDeleteComments: false,
    canManageAllCults: false, canCreateCults: false, canEditCults: false,
    canSubmitCults: false, canManageSongs: false, canViewCults: true,
    canCreateLeaderCults: false, canEditLeaderCults: false,
    canSubmitLeaderCults: false, canSelectSongs: false,
    canViewMusicians: true, canViewProfile: true,
    canViewAssignedCults: true, canViewNotifications: true,
    canCommentOnNotifications: true
  };
  if (role === 'admin') return Object.fromEntries(Object.entries(viewer).map(([k]) => [k, true]));
  if (role === 'editor') return { ...viewer,
    canManageSongs: true,
    canCreateCults: true,
    canEditCults: true,
    canSubmitCults: true,
    canCreateLeaderCults: true,
    canEditLeaderCults: true,
    canSubmitLeaderCults: true,
    canSelectSongs: true,
    canAssignMusicians: true,
  };
  return viewer;
}

module.exports = router;
