// ══════════════════════════════════════════════════
//  WeCoLearn — Backend with MySQL + Sequelize
//  Stack: Node.js + Express + Socket.IO + Sequelize
//  Run:   node server.js
// ══════════════════════════════════════════════════
require('dotenv').config();
const express      = require('express');
const http         = require('http');
const { Server }   = require('socket.io');
const path         = require('path');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(express.json());
app.use(express.static(path.join(__dirname)));


// ══════════════════════════════════════════════════
//  DATABASE CONNECTION
//  Fill in your MySQL credentials below.
//  Make sure you created the database first:
//    CREATE DATABASE wecolearn;
// ══════════════════════════════════════════════════
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  { host: process.env.DB_HOST, dialect: 'mysql', logging: false }
);


// ══════════════════════════════════════════════════
//  MODELS (= tables in MySQL)
//  Sequelize will auto-create the tables when the
//  server starts (sync({ alter: true }) below).
// ══════════════════════════════════════════════════

// ── users table ───────────────────────────────────
//  One row per registered user.
const User = sequelize.define('User', {
  id: {
    type:          DataTypes.UUID,
    defaultValue:  DataTypes.UUIDV4,   // auto-generated unique id
    primaryKey:    true,
  },
  name:   { type: DataTypes.STRING(100), allowNull: false },
  avatar: { type: DataTypes.STRING(4),   defaultValue: '?' },
  school: { type: DataTypes.STRING(120), defaultValue: '' },
  role:   { type: DataTypes.STRING(80),  defaultValue: '' },
  bio:    { type: DataTypes.TEXT,        defaultValue: '' },
}, { tableName: 'users', timestamps: true });   // timestamps adds createdAt + updatedAt


// ── logins table ──────────────────────────────────
//  One row every time a user logs in.
//  This is how you "keep track of each login".
const Login = sequelize.define('Login', {
  id:        { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId:    { type: DataTypes.UUID,    allowNull: false },   // FK → users.id
  userName:  { type: DataTypes.STRING,  allowNull: false },   // denormalized for easy display
  method:    { type: DataTypes.STRING(20), defaultValue: 'form' }, // 'linkedin','nfc','card','form'
  ipAddress: { type: DataTypes.STRING(45), defaultValue: '' },
}, { tableName: 'logins', timestamps: true, updatedAt: false }); // only createdAt needed


// ── rooms table ───────────────────────────────────
//  One row per study room ever created.
const Room = sequelize.define('Room', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:      { type: DataTypes.STRING(120), allowNull: false },
  createdBy: { type: DataTypes.UUID,   allowNull: true },    // FK → users.id
  color:     { type: DataTypes.STRING(20),  defaultValue: 'indigo' },
  iconType:  { type: DataTypes.STRING(30),  defaultValue: 'users' },
  isActive:  { type: DataTypes.BOOLEAN,     defaultValue: true },
}, { tableName: 'rooms', timestamps: true });


// ── room_members table ────────────────────────────
//  Who is currently inside each room.
const RoomMember = sequelize.define('RoomMember', {
  id:     { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  roomId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
}, { tableName: 'room_members', timestamps: true, updatedAt: false });


// ── messages table ────────────────────────────────
//  Every chat message ever sent.
const Message = sequelize.define('Message', {
  id:     { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  roomId: { type: DataTypes.UUID,   allowNull: false },
  userId: { type: DataTypes.UUID,   allowNull: true },
  sender: { type: DataTypes.STRING(100), allowNull: false },
  text:   { type: DataTypes.TEXT,        allowNull: false },
}, { tableName: 'messages', timestamps: true, updatedAt: false });


// ── reports table ─────────────────────────────────
//  Every submitted report.
const Report = sequelize.define('Report', {
  id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  reportedBy:   { type: DataTypes.UUID,   allowNull: true },   // FK → users.id
  targetUserId: { type: DataTypes.UUID,   allowNull: true },   // FK → users.id
  reason:       { type: DataTypes.STRING(80), allowNull: false },
  details:      { type: DataTypes.TEXT,       defaultValue: '' },
  status:       { type: DataTypes.ENUM('pending','reviewed','dismissed'), defaultValue: 'pending' },
}, { tableName: 'reports', timestamps: true, updatedAt: false });


// ══════════════════════════════════════════════════
//  SYNC — creates / updates tables automatically
//  alter:true  = safe update (won't delete data)
// ══════════════════════════════════════════════════
async function initDB() {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synced (users, logins, rooms, room_members, messages, reports)');
  } catch (err) {
    console.error('❌ Database error:', err.message);
    console.error('   Check DB_USER / DB_PASS / DB_NAME / DB_HOST and that MySQL is running.');
    process.exit(1);
  }
}


// ══════════════════════════════════════════════════
//  REST API ROUTES
// ══════════════════════════════════════════════════

// ── POST /api/users ───────────────────────────────
//  Register a new user.  Records a login row too.
//  Body: { name, avatar, school, role, bio, method }
app.post('/api/users', async (req, res) => {
  try {
    const { name, avatar, school, role, bio, method } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    // Create user row
    const user = await User.create({
      name,
      avatar: avatar || (name[0] + (name.split(' ')[1]?.[0] || '')).toUpperCase(),
      school: school || '',
      role:   role   || '',
      bio:    bio    || '',
    });

    // Record this login — every login gets its own row
    await Login.create({
      userId:    user.id,
      userName:  user.name,
      method:    method || 'form',
      ipAddress: req.ip || '',
    });

    res.json({ id: user.id, name: user.name, avatar: user.avatar, school: user.school, role: user.role, bio: user.bio });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── PATCH /api/users/:id ──────────────────────────
//  Update profile.
//  Body: { name?, school?, role?, bio? }
app.patch('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, school, role, bio } = req.body;
    if (name)   { user.name = name; user.avatar = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
    if (school !== undefined) user.school = school;
    if (role   !== undefined) user.role   = role;
    if (bio    !== undefined) user.bio    = bio;

    await user.save();
    res.json({ id: user.id, name: user.name, avatar: user.avatar, school: user.school, role: user.role, bio: user.bio });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/rooms ────────────────────────────────
//  All active rooms with live member count.
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where:   { isActive: true },
      order:   [['createdAt', 'DESC']],
    });

    // Count members per room
    const memberCounts = await RoomMember.findAll({
      attributes: ['roomId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['roomId'],
    });
    const countMap = {};
    memberCounts.forEach(m => { countMap[m.roomId] = parseInt(m.dataValues.count); });

    res.json(rooms.map(r => ({
      id:        r.id,
      name:      r.name,
      title:     r.name,
      color:     r.color,
      iconType:  r.iconType,
      users:     countMap[r.id] || 0,
      createdBy: r.createdBy,
      createdAt: r.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/rooms ───────────────────────────────
//  Create a room.
//  Body: { name, createdBy }
app.post('/api/rooms', async (req, res) => {
  try {
    const { name, createdBy } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const room = await Room.create({ name, createdBy: createdBy || null });

    const payload = {
      id:        room.id,
      name:      room.name,
      title:     room.name,
      color:     room.color,
      iconType:  room.iconType,
      users:     0,
      createdBy: room.createdBy,
      createdAt: room.createdAt,
    };

    io.emit('room:created', payload);   // push to all connected browsers
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/rooms/:id ─────────────────────────
//  Mark room inactive (keeps history).
app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    room.isActive = false;
    await room.save();

    await RoomMember.destroy({ where: { roomId: req.params.id } });
    io.emit('room:deleted', { id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/rooms/:id/messages ───────────────────
//  Last 100 messages for a room.
app.get('/api/rooms/:id/messages', async (req, res) => {
  try {
    const messages = await Message.findAll({
      where: { roomId: req.params.id },
      order: [['createdAt', 'ASC']],
      limit: 100,
    });
    res.json(messages.map(m => ({ sender: m.sender, text: m.text, timestamp: m.createdAt })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/rooms/:id/participants ───────────────
//  Users currently in a room.
app.get('/api/rooms/:id/participants', async (req, res) => {
  try {
    const members = await RoomMember.findAll({ where: { roomId: req.params.id } });
    const userIds = members.map(m => m.userId);
    const users   = await User.findAll({ where: { id: userIds } });
    res.json(users.map(u => ({ id: u.id, name: u.name, avatar: u.avatar, school: u.school, role: u.role, bio: u.bio })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/reports ─────────────────────────────
//  Submit a report.
//  Body: { targetUserId, reason, details, reportedBy }
app.post('/api/reports', async (req, res) => {
  try {
    const { targetUserId, reason, details, reportedBy } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason is required' });

    const report = await Report.create({ targetUserId, reason, details: details || '', reportedBy });
    console.log(`[REPORT #${report.id}] by ${reportedBy} → reason: ${reason}`);
    res.json({ success: true, reportId: report.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/logins ─────────────────────────
//  View all login history (useful for you to check in MySQL Workbench too).
app.get('/api/admin/logins', async (req, res) => {
  try {
    const logins = await Login.findAll({ order: [['createdAt', 'DESC']], limit: 200 });
    res.json(logins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/reports ────────────────────────
//  View all submitted reports.
app.get('/api/admin/reports', async (req, res) => {
  try {
    const reports = await Report.findAll({ order: [['createdAt', 'DESC']] });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ══════════════════════════════════════════════════
//  SOCKET.IO — Real-time chat
// ══════════════════════════════════════════════════
io.on('connection', (socket) => {
  console.log('[Socket] connected:', socket.id);

  // Join room — insert into room_members table
  socket.on('room:join', async ({ roomId, userId }) => {
    socket.join(roomId);
    try {
      // $addToSet equivalent: only insert if not already there
      const already = await RoomMember.findOne({ where: { roomId, userId } });
      if (!already) await RoomMember.create({ roomId, userId });
      const members = await RoomMember.findAll({ where: { roomId } });
      io.to(roomId).emit('room:members', members.map(m => m.userId));
    } catch (err) {
      console.error('room:join error:', err.message);
    }
  });

  // Chat message — save to messages table then broadcast
  socket.on('chat:send', async ({ roomId, userId, sender, text }) => {
    try {
      const msg = await Message.create({ roomId, userId: userId || null, sender, text });
      io.to(roomId).emit('chat:message', { sender: msg.sender, text: msg.text, timestamp: msg.createdAt });
    } catch (err) {
      console.error('chat:send error:', err.message);
    }
  });

  // Leave room — remove from room_members table
  socket.on('room:leave', async ({ roomId, userId }) => {
    socket.leave(roomId);
    try {
      await RoomMember.destroy({ where: { roomId, userId } });
      const members = await RoomMember.findAll({ where: { roomId } });
      io.to(roomId).emit('room:members', members.map(m => m.userId));
    } catch (err) {
      console.error('room:leave error:', err.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('[Socket] disconnected:', socket.id);
  });
});


// ══════════════════════════════════════════════════
//  START
// ══════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;

initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 WeCoLearn running at http://localhost:${PORT}\n`);
  });
});
