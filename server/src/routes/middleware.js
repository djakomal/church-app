const jwt = require('jsonwebtoken');
const { getDb } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'church-app-secret-key-change-in-production';

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token requis' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token requis' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    const db = getDb();
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(decoded.userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Accès refusé' });
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide' });
  }
}

module.exports = { authenticate, requireAdmin };
