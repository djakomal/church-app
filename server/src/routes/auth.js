const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { getDb } = require('../database');

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'church-app-secret-key-change-in-production';

// In-memory OTP store
const otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

async function sendOTPEmail(email, code) {
  const transporter = createTransporter();
  if (transporter) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Church App" <noreply@church.app>',
      to: email,
      subject: 'Votre code de vérification',
      html: `<p>Votre code de vérification est : <strong>${code}</strong></p><p>Ce code expire dans 5 minutes.</p>`,
    });
  }
  console.log(`[OTP] Code for ${email}: ${code}`);
}

const ADMIN_PERMISSIONS = {
  canManageUsers: true, canAssignRoles: true, canValidateCults: true,
  canAssignMusicians: true, canSendGlobalNotifications: true,
  canSendTargetedNotifications: true, canDeleteComments: true,
  canManageAllCults: true, canCreateCults: true, canEditCults: true,
  canSubmitCults: true, canManageSongs: true, canViewCults: true,
  canCreateLeaderCults: true, canEditLeaderCults: true,
  canSubmitLeaderCults: true, canSelectSongs: true,
  canViewMusicians: true, canViewProfile: true,
  canViewAssignedCults: true, canViewNotifications: true,
  canCommentOnNotifications: true
};

const VIEWER_PERMISSIONS = {
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

const EDITOR_PERMISSIONS = { ...VIEWER_PERMISSIONS };

function getPermissionsForRole(role) {
  switch (role) {
    case 'admin': return ADMIN_PERMISSIONS;
    case 'editor': return EDITOR_PERMISSIONS;
    default: return VIEWER_PERMISSIONS;
  }
}

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis' });

  const existing = getDb().prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });

  const code = generateOTP();
  otpStore[email.toLowerCase()] = {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
    used: false,
  };

  try {
    await sendOTPEmail(email, code);
  } catch (err) {
    console.error('[OTP] Failed to send email:', err.message);
  }

  res.json({ ok: true, devCode: process.env.NODE_ENV !== 'production' ? code : undefined });
});

router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email et code requis' });

  const record = otpStore[email.toLowerCase()];
  if (!record) return res.status(400).json({ error: 'Aucun code envoyé' });
  if (record.used) return res.status(400).json({ error: 'Code déjà utilisé' });
  if (Date.now() > record.expiresAt) {
    delete otpStore[email.toLowerCase()];
    return res.status(400).json({ error: 'Code expiré' });
  }
  if (record.code !== otp) return res.status(400).json({ error: 'Code incorrect' });

  record.used = true;
  setTimeout(() => delete otpStore[email.toLowerCase()], 60 * 1000);
  res.json({ ok: true });
});

router.post('/register', (req, res) => {
  const db = getDb();
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nom, email et mot de passe requis' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });

  const hashed = bcrypt.hashSync(password, 10);
  const userRole = role || 'viewer';
  const id = `user-${Date.now()}`;
  const permissions = getPermissionsForRole(userRole);

  db.prepare(`INSERT INTO users (id, name, email, role, password, permissions, status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')`).run(id, name, email.toLowerCase(), userRole, hashed, JSON.stringify(permissions));

  const user = db.prepare('SELECT id, name, email, role, permissions, status, created_at FROM users WHERE id = ?').get(id);
  user.permissions = JSON.parse(user.permissions);
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ user, token });
});

router.post('/login', (req, res) => {
  const db = getDb();
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  db.prepare('UPDATE users SET lastLogin=datetime(\'now\') WHERE id=?').run(user.id);
  const { password: _, ...userData } = user;
  userData.permissions = JSON.parse(userData.permissions);
  res.json({ user: userData, token });
});

router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token requis' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const { password: _, ...userData } = user;
    userData.permissions = JSON.parse(userData.permissions);
    res.json(userData);
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
});

router.put('/password', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token requis' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    const { currentPassword, newPassword } = req.body;
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    }
    const hashed = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password=? WHERE id=?').run(hashed, decoded.userId);
    res.json({ ok: true });
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
});

router.put('/profile', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token requis' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const db = getDb();
    const { name, email } = req.body;
    db.prepare('UPDATE users SET name=?, email=?, updated_at=datetime(\'now\') WHERE id=?')
      .run(name, email.toLowerCase(), decoded.userId);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    const { password: _, ...userData } = user;
    userData.permissions = JSON.parse(userData.permissions);
    res.json(userData);
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
});

module.exports = router;
