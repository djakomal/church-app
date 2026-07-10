const { Router } = require('express');
const { getDb } = require('../database');
const { authenticate } = require('./middleware');

const router = Router();

router.get('/:userId', authenticate, (req, res) => {
  const db = getDb();
  const settings = db.prepare('SELECT * FROM user_settings WHERE userId = ?').get(req.params.userId);
  if (!settings) return res.json({ userId: req.params.userId, journeyStep: 0, progress: 0, visitedScreens: '[]', featureAccess: '{}', accessibilityEnabled: 0, fontSize: 16, theme: 'system' });
  res.json({
    ...settings,
    visitedScreens: JSON.parse(settings.visitedScreens),
    featureAccess: JSON.parse(settings.featureAccess),
    accessibilityEnabled: settings.accessibilityEnabled === 1
  });
});

router.put('/:userId', authenticate, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM user_settings WHERE userId = ?').get(req.params.userId);
  const { journeyStep, progress, visitedScreens, featureAccess, accessibilityEnabled, fontSize, theme } = req.body;
  if (existing) {
    db.prepare(`UPDATE user_settings SET journeyStep=?, progress=?, visitedScreens=?, featureAccess=?,
      accessibilityEnabled=?, fontSize=?, theme=? WHERE userId=?`).run(
      journeyStep !== undefined ? journeyStep : existing.journeyStep,
      progress !== undefined ? progress : existing.progress,
      visitedScreens ? JSON.stringify(visitedScreens) : existing.visitedScreens,
      featureAccess ? JSON.stringify(featureAccess) : existing.featureAccess,
      accessibilityEnabled !== undefined ? (accessibilityEnabled ? 1 : 0) : existing.accessibilityEnabled,
      fontSize !== undefined ? fontSize : existing.fontSize,
      theme || existing.theme,
      req.params.userId
    );
  } else {
    db.prepare(`INSERT INTO user_settings (userId, journeyStep, progress, visitedScreens, featureAccess, accessibilityEnabled, fontSize, theme)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      req.params.userId,
      journeyStep || 0,
      progress || 0,
      JSON.stringify(visitedScreens || []),
      JSON.stringify(featureAccess || {}),
      accessibilityEnabled ? 1 : 0,
      fontSize || 16,
      theme || 'system'
    );
  }
  const settings = db.prepare('SELECT * FROM user_settings WHERE userId = ?').get(req.params.userId);
  res.json({
    ...settings,
    visitedScreens: JSON.parse(settings.visitedScreens),
    featureAccess: JSON.parse(settings.featureAccess),
    accessibilityEnabled: settings.accessibilityEnabled === 1
  });
});

module.exports = router;
