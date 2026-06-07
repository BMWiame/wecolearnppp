/* =========================================
   WeCoLearn — App Logic (with backend)
   =========================================
   Backend: Node.js + Express + Socket.IO
   Base URL: http://localhost:3000
   ========================================= */

'use strict';

/* --------------------------------------------------
   SOCKET.IO — real-time connection
   (socket.io.js is served by the backend at /socket.io/socket.io.js)
   -------------------------------------------------- */
const socket = io();   // connects automatically to the same server

/* --------------------------------------------------
   ICONS (SVG strings used by JS-generated elements)
   -------------------------------------------------- */
const Icons = {
  shieldAlert: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  bookOpen: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  send: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  mic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  micOff: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  x: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  pencil: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
};

/* --------------------------------------------------
   STATE
   -------------------------------------------------- */
const AppState = {
  currentView: 'login',
  micOn: false,
  activeTab: 'notes',
  messages: [],          // local cache of chat messages for the active room
  activeRoom: null,

  // Filled after POST /api/users on login
  currentUser: {
    id: null,
    name: '',
    avatar: '',
    verified: false,
    role: '',
    school: '',
    bio: '',
  },

  // Filled by GET /api/rooms on dashboard load
  rooms: [],

  // Filled by GET /api/rooms/:id/participants when joining a room
  participantsByRoom: {},
};

/* --------------------------------------------------
   API HELPERS
   -------------------------------------------------- */

// Generic fetch wrapper — always sends/receives JSON
async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/* --------------------------------------------------
   VIEW ROUTER
   -------------------------------------------------- */
function navigate(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) target.classList.add('active');
  AppState.currentView = viewId;
  document.body.dataset.view = viewId;
}

/* --------------------------------------------------
   LOGIN
   -------------------------------------------------- */
function initLogin() {
  document.querySelectorAll('[data-action="login"]').forEach(btn => {
    btn.addEventListener('click', handleLogin);
  });
}

// Called by every auth button (LinkedIn, NFC, Carte étudiante)
// In index.html the buttons already collect the profile via collectProfile()
// and call applyProfileAndEnter(). This function is the fallback for
// buttons that use data-action="login" in app.js directly.
async function handleLogin() {
  // Profile is collected by index.html's collectProfile() + applyProfileAndEnter().
  // If that path isn't used, fall back to current user values already in AppState.
  if (!AppState.currentUser.id) {
    await registerUserWithBackend(AppState.currentUser);
  }
  navigate('dashboard');
  await renderDashboard();
}

// Sends profile to POST /api/users and stores returned id in AppState
async function registerUserWithBackend(profile) {
  try {
    const user = await api('POST', '/api/users', {
      name:   profile.name,
      avatar: profile.avatar,
      school: profile.school,
      role:   profile.role,
      bio:    profile.bio,
    });
    // Write every field back into AppState so the rest of the app uses the server's data
    Object.assign(AppState.currentUser, user);
    // Persist userId so page refreshes can skip re-registration
    localStorage.setItem('wcl_userId', user.id);
  } catch (e) {
    console.error('Login error:', e);
  }
}

/* --------------------------------------------------
   DASHBOARD
   -------------------------------------------------- */
async function renderDashboard() {
  // Update header UI
  const firstName = AppState.currentUser.name.split(' ')[0];
  const greetEl = document.getElementById('dash-greeting');
  if (greetEl) greetEl.textContent = `Bonjour, ${firstName} `;

  const avatarEl = document.getElementById('dash-user-avatar');
  if (avatarEl) avatarEl.textContent = AppState.currentUser.avatar;

  const nameEl = document.getElementById('dash-user-name');
  if (nameEl) nameEl.textContent = AppState.currentUser.name;

  // Fetch live rooms from backend
  try {
    const rooms = await api('GET', '/api/rooms');
    AppState.rooms = rooms;
  } catch (e) {
    console.error('Could not load rooms:', e);
    // Keep whatever rooms are already in AppState (empty array on first load)
  }

  renderRoomsGrid();
}

function renderRoomsGrid() {
  const grid = document.getElementById('rooms-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (!AppState.rooms.length) {
    grid.innerHTML = `<p style="color:rgba(255,255,255,0.35);font-size:0.85rem;">Aucune salle active pour l'instant.</p>`;
    return;
  }

  AppState.rooms.forEach(room => {
    const card = createRoomCard(room);
    grid.appendChild(card);
  });
}

function createRoomCard(room) {
  const card = document.createElement('div');
  // Backend uses room.name; original frontend used room.title — support both
  const title    = room.title || room.name || 'Sans titre';
  const color    = room.color || 'indigo';
  const iconType = room.iconType || 'users';
  const users    = room.users ?? (room.members ? room.members.length : 0);

  card.className = `room-card color-${color}`;
  card.dataset.roomId = room.id;

  const iconSvg = Icons[iconType] || Icons.bookOpen;

  card.innerHTML = `
    <div class="room-icon-wrap color-${color}">${iconSvg}</div>
    <div class="room-title">${escapeHtml(title)}</div>
    <div class="room-footer">
      <span class="room-online">
        <span class="pulse-dot"></span>
        ${users} en ligne
      </span>
      <span class="btn-join">Rejoindre →</span>
    </div>
  `;

  card.addEventListener('click', () => joinRoom(room));
  return card;
}

function initDashboard() {
  const profileBtn = document.getElementById('dash-profile-btn');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => openProfileModal(AppState.currentUser, true));
  }

  const createBtn = document.getElementById('btn-create-room');
  if (createBtn) {
    createBtn.addEventListener('click', openCreateRoomModal);
  }

  // Socket: when another user creates a room, add it to the grid live
  socket.on('room:created', (room) => {
    // Avoid duplicates
    if (!AppState.rooms.find(r => r.id === room.id)) {
      AppState.rooms.unshift(room);
      renderRoomsGrid();
    }
  });

  // Socket: when a room is deleted, remove it from the grid live
  socket.on('room:deleted', ({ id }) => {
    AppState.rooms = AppState.rooms.filter(r => r.id !== id);
    renderRoomsGrid();
  });
}

/* --------------------------------------------------
   ROOM
   -------------------------------------------------- */
async function joinRoom(room) {
  AppState.activeRoom = room;
  AppState.messages   = [];
  AppState.micOn      = false;
  AppState.activeTab  = 'notes';

  // Tell the server we joined (for member tracking & receiving chat)
  socket.emit('room:join', {
    roomId: room.id,
    userId: AppState.currentUser.id,
  });

  // Fetch participants from backend
  try {
    const participants = await api('GET', `/api/rooms/${room.id}/participants`);
    AppState.participantsByRoom[room.id] = participants;
  } catch (e) {
    // Endpoint may not exist yet — fall back to empty list
    AppState.participantsByRoom[room.id] = AppState.participantsByRoom[room.id] || [];
  }

  // Fetch past chat messages
  try {
    const history = await api('GET', `/api/rooms/${room.id}/messages`);
    // Convert server format → AppState.messages format
    AppState.messages = history.map(m => ({
      id:        m.timestamp,
      text:      m.text,
      sender:    m.sender,
      timestamp: new Date(m.timestamp),
    }));
  } catch (e) {
    AppState.messages = [];
  }

  renderRoom(room);
  navigate('room');
}

function renderRoom(room) {
  // Room name & color dot
  const roomNameEl = document.getElementById('room-name');
  if (roomNameEl) {
    const title = room.title || room.name || 'Salle d\'étude';
    roomNameEl.innerHTML = `
      <span class="room-color-dot"></span>
      ${escapeHtml(title)}
    `;
  }

  const colorMap = { emerald: '#10b981', sky: '#0ea5e9', rose: '#f43f5e', indigo: '#4f46e5' };
  const dot = document.querySelector('#room-name .room-color-dot');
  if (dot) dot.style.background = colorMap[room.color] || '#4f46e5';

  // Header avatars
  const avatarsEl = document.getElementById('room-avatars');
  if (avatarsEl) {
    const participants = AppState.participantsByRoom[room.id] || [];
    avatarsEl.innerHTML = `
      <div class="avatar avatar-you" title="${escapeHtml(AppState.currentUser.name)}">${AppState.currentUser.avatar}</div>
      ${participants.map(p => `<div class="avatar avatar-peer" title="${escapeHtml(p.name)}">${p.avatar}</div>`).join('')}
    `;
  }

  // Video tiles (sidebar)
  const videosEl = document.getElementById('sidebar-videos');
  if (videosEl) {
    const participants = AppState.participantsByRoom[room.id] || [];
    videosEl.innerHTML = `
      <div class="video-tile" data-user-id="${AppState.currentUser.id}" data-action="open-profile-self">
        <span class="video-avatar-large">${AppState.currentUser.avatar}</span>
        <div class="video-label">Vous</div>
      </div>
      ${participants.map(p => `
        <div class="video-tile" data-user-id="${p.id}" data-action="open-profile-peer">
          <span class="video-avatar-large">${p.avatar}</span>
          <div class="video-label">${escapeHtml(p.name)}</div>
        </div>
      `).join('')}
    `;

    videosEl.querySelectorAll('[data-action="open-profile-self"]').forEach(el => {
      el.addEventListener('click', () => openProfileModal(AppState.currentUser, true));
    });

    videosEl.querySelectorAll('[data-action="open-profile-peer"]').forEach(el => {
      el.addEventListener('click', () => {
        const uid  = el.dataset.userId;
        const allP = Object.values(AppState.participantsByRoom).flat();
        const peer = allP.find(p => p.id === uid);
        if (peer) openProfileModal(peer, false);
      });
    });
  }

  switchTab('notes');
  renderChat();
  updateMicBtn();
}

function initRoom() {
  // Leave buttons
  document.querySelectorAll('[data-action="leave-room"]').forEach(btn => {
    btn.addEventListener('click', leaveRoom);
  });

  // Tab switchers
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Mic toggle
  const micBtn = document.getElementById('ctrl-mic');
  if (micBtn) micBtn.addEventListener('click', toggleMic);

  // Chat send
  const sendBtn   = document.getElementById('btn-send');
  const chatInput = document.getElementById('chat-input');
  if (sendBtn)    sendBtn.addEventListener('click', sendMessage);
  if (chatInput) {
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }

  // Receive real-time chat messages from other users in the room
  socket.on('chat:message', (msg) => {
    // Don't duplicate messages we sent ourselves (we already pushed them locally)
    const isDuplicate = AppState.messages.some(
      m => m.sender === msg.sender && m.text === msg.text && Math.abs(new Date(msg.timestamp) - m.timestamp) < 2000
    );
    if (!isDuplicate) {
      AppState.messages.push({
        id:        msg.timestamp,
        text:      msg.text,
        sender:    msg.sender,
        timestamp: new Date(msg.timestamp),
      });
      renderChat();
      scrollChatToBottom();
    }
  });
}

function leaveRoom() {
  if (AppState.activeRoom) {
    // Tell the server we're leaving
    socket.emit('room:leave', {
      roomId: AppState.activeRoom.id,
      userId: AppState.currentUser.id,
    });
  }
  AppState.activeRoom = null;
  navigate('dashboard');
}

function switchTab(tabName) {
  AppState.activeTab = tabName;
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('[data-tab-content]').forEach(pane => {
    pane.classList.toggle('active', pane.dataset.tabContent === tabName);
  });
}

function toggleMic() {
  AppState.micOn = !AppState.micOn;
  updateMicBtn();
  // Notify other participants of mic state change
  if (AppState.activeRoom) {
    socket.emit('mic-toggle', {
      roomId: AppState.activeRoom.id,
      userId: AppState.currentUser.id,
      on:     AppState.micOn,
    });
  }
}

function updateMicBtn() {
  const btn = document.getElementById('ctrl-mic');
  if (!btn) return;
  btn.classList.toggle('muted', !AppState.micOn);
  btn.innerHTML = AppState.micOn ? Icons.mic : Icons.micOff;
  btn.title = AppState.micOn ? 'Couper le micro' : 'Activer le micro';
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text || !AppState.activeRoom) return;

  // Optimistically add to local state so our message appears immediately
  const msg = {
    id:        Date.now(),
    text,
    sender:    AppState.currentUser.name,
    timestamp: new Date(),
  };
  AppState.messages.push(msg);
  input.value = '';

  // Send to backend via Socket.IO — server will broadcast to everyone in the room
  socket.emit('chat:send', {
    roomId: AppState.activeRoom.id,
    sender: AppState.currentUser.name,
    text,
  });

  renderChat();
  scrollChatToBottom();
}

function renderChat() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  if (!AppState.messages.length) {
    container.innerHTML = `<div class="chat-empty">Aucun message pour l'instant</div>`;
    return;
  }

  container.innerHTML = AppState.messages.map(m => `
    <div class="chat-msg">
      <div class="chat-msg-sender">${escapeHtml(m.sender)}</div>
      <div class="chat-msg-text">${escapeHtml(m.text)}</div>
    </div>
  `).join('');
}

function scrollChatToBottom() {
  const container = document.getElementById('chat-messages');
  if (container) container.scrollTop = container.scrollHeight;
}

/* --------------------------------------------------
   PROFILE MODAL
   -------------------------------------------------- */
function openProfileModal(userData, isOwnProfile) {
  const overlay = document.getElementById('modal-profile');
  if (!overlay) return;

  document.getElementById('profile-modal-avatar').textContent = userData.avatar;
  document.getElementById('profile-modal-name').textContent   = userData.name;
  document.getElementById('profile-modal-school').textContent = userData.school || '—';
  document.getElementById('profile-modal-bio').textContent    = userData.bio
    ? `"${userData.bio}"`
    : 'Aucune biographie.';

  overlay.classList.add('open');
}

function closeProfileModal() {
  const overlay = document.getElementById('modal-profile');
  if (overlay) overlay.classList.remove('open');
}

function initProfileModal() {
  const closeBtn = document.getElementById('profile-modal-close');
  const overlay  = document.getElementById('modal-profile');
  if (closeBtn) closeBtn.addEventListener('click', closeProfileModal);
  if (overlay)  overlay.addEventListener('click', e => { if (e.target === overlay) closeProfileModal(); });
}

/* --------------------------------------------------
   CREATE ROOM MODAL
   -------------------------------------------------- */
function openCreateRoomModal() {
  const overlay = document.getElementById('modal-create');
  if (overlay) overlay.classList.add('open');
  setTimeout(() => {
    const input = document.getElementById('create-room-input');
    if (input) input.focus();
  }, 50);
}

function closeCreateRoomModal() {
  const overlay = document.getElementById('modal-create');
  if (overlay) {
    overlay.classList.remove('open');
    const input = document.getElementById('create-room-input');
    if (input) input.value = '';
  }
}

async function submitCreateRoom() {
  const input = document.getElementById('create-room-input');
  if (!input) return;
  const title = input.value.trim();
  if (!title) return;

  try {
    // POST to backend — server also broadcasts 'room:created' via socket to all clients
    const newRoom = await api('POST', '/api/rooms', {
      name:      title,
      createdBy: AppState.currentUser.id,
    });

    // Give the room display-friendly defaults if the backend doesn't return them
    newRoom.title    = newRoom.title    || newRoom.name;
    newRoom.iconType = newRoom.iconType || 'users';
    newRoom.color    = newRoom.color    || 'indigo';
    newRoom.users    = newRoom.users    ?? 1;

    // socket 'room:created' event (from initDashboard) will add it to the grid,
    // but add it now locally in case the socket event arrives slightly late
    if (!AppState.rooms.find(r => r.id === newRoom.id)) {
      AppState.rooms.unshift(newRoom);
      renderRoomsGrid();
    }
  } catch (e) {
    console.error('Could not create room:', e);
    alert('Erreur lors de la création de la salle. Veuillez réessayer.');
  }

  closeCreateRoomModal();
}

function initCreateRoomModal() {
  const closeBtn = document.getElementById('create-modal-close');
  const overlay  = document.getElementById('modal-create');
  const form     = document.getElementById('create-room-form');

  if (closeBtn) closeBtn.addEventListener('click', closeCreateRoomModal);
  if (overlay)  overlay.addEventListener('click', e => { if (e.target === overlay) closeCreateRoomModal(); });
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      submitCreateRoom();
    });
  }
}

/* --------------------------------------------------
   UTILS
   -------------------------------------------------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* --------------------------------------------------
   BOOT
   -------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initDashboard();
  initRoom();
  initProfileModal();
  initCreateRoomModal();

  navigate('login');
});
