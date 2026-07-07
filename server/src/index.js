require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const { getDb } = require('./database');

const songsRouter = require('./routes/songs');
const worshipsRouter = require('./routes/worships');
const musiciansRouter = require('./routes/musicians');
const teamRouter = require('./routes/team');
const notificationsRouter = require('./routes/notifications');
const commentsRouter = require('./routes/comments');
const communicationsRouter = require('./routes/communications');
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const rolesRouter = require('./routes/roles');
const permissionsRouter = require('./routes/permissions');
const messagesRouter = require('./routes/messages');
const discussionsRouter = require('./routes/discussions');
const attendanceRouter = require('./routes/attendance');
const userSettingsRouter = require('./routes/userSettings');
const featuresRouter = require('./routes/features');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database on startup
getDb();

app.use('/api/songs', songsRouter);
app.use('/api/worships', worshipsRouter);
app.use('/api/musicians', musiciansRouter);
app.use('/api/team', teamRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/communications', communicationsRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/discussions', discussionsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/user-settings', userSettingsRouter);
app.use('/api/features', featuresRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[API] Serveur démarré sur http://localhost:${PORT}`);
});
