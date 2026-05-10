/* =========================================
   WeCoLearn — App Logic
   =========================================
   Architecture notes for future backend:
   - All data-fetch functions are grouped and marked [API READY]
   - All form submissions are marked [API READY]
   - State is centralized in `AppState`
   ========================================= */

'use strict';

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
  messages: [],
  activeRoom: null,

  // [API READY] Replace with real authenticated user from backend session
  currentUser: {
    id: '1',
    name: 'Wiame Boumalik',
    avatar: 'WB',
    verified: true,
    role: 'Étudiante',
    school: 'Université Mohammed V',
    bio: "Future chercheuse en IA. Passionnée par l'éducation ouverte.",
  },

  // [API READY] Fetch rooms from GET /api/rooms
  rooms: [
    { id: 'cyber', title: 'Cyber Sécurité',          iconType: 'shieldAlert', color: 'emerald', users: 142, isPublic: true },
    { id: 'cloud', title: 'Cloud Computing',          iconType: 'fileText',   color: 'sky',     users: 89,  isPublic: true },
    { id: 'AI',    title: 'Intelligence Artificielle',iconType: 'users',      color: 'rose',    users: 215, isPublic: true },
  ],

  // [API READY] Fetch participants from GET /api/rooms/:id/participants
  participantsByRoom: {
    cyber: [{ id: '2', name: 'Hanan Boulghman',  avatar: 'HB', role: 'Étudiante Cyber',  school: 'MIT',      bio: 'Passionnée par la sécurité offensive.' }],
    cloud: [{ id: '3', name: 'Latifa Alioui',    avatar: 'LA', role: 'Architecte Cloud', school: 'Polytech', bio: 'Spécialiste infrastructure AWS.' }],
    AI:    [
      { id: '4', name: 'Yassine Karim', avatar: 'YK', role: 'Data Scientist', school: 'EMI', bio: 'Expert en Deep Learning.' },
      { id: '2', name: 'Hanan Boulghman', avatar: 'HB', role: 'Étudiante Cyber', school: 'MIT', bio: 'Passionnée par la sécurité offensive.' },
    ],
  },
};

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
    btn.addEventListener('click', () => {
      // [API READY] Replace with OAuth / NCI auth call before navigating
      navigate('dashboard');
      renderDashboard();
    });
  });
}

/* --------------------------------------------------
   DASHBOARD
   -------------------------------------------------- */
function renderDashboard() {
  const firstName = AppState.currentUser.name.split(' ')[0];
  const greetEl = document.getElementById('dash-greeting');
  if (greetEl) greetEl.textContent = `Bonjour, ${firstName} `;

  const avatarEl = document.getElementById('dash-user-avatar');
  if (avatarEl) avatarEl.textContent = AppState.currentUser.avatar;

  const nameEl = document.getElementById('dash-user-name');
  if (nameEl) nameEl.textContent = AppState.currentUser.name;

  renderRoomsGrid();
}

function renderRoomsGrid() {
  const grid = document.getElementById('rooms-grid');
  if (!grid) return;

  grid.innerHTML = '';
  AppState.rooms.forEach(room => {
    const card = createRoomCard(room);
    grid.appendChild(card);
  });
}

function createRoomCard(room) {
  const card = document.createElement('div');
  card.className = `room-card color-${room.color}`;
  card.dataset.roomId = room.id;

  const iconSvg = Icons[room.iconType] || Icons.bookOpen;

  card.innerHTML = `
    <div class="room-icon-wrap color-${room.color}">${iconSvg}</div>
    <div class="room-title">${room.title}</div>
    <div class="room-footer">
      <span class="room-online">
        <span class="pulse-dot"></span>
        ${room.users} en ligne
      </span>
      <span class="btn-join">Rejoindre →</span>
    </div>
  `;

  card.addEventListener('click', () => joinRoom(room));
  return card;
}

function initDashboard() {
  // Profile modal trigger
  const profileBtn = document.getElementById('dash-profile-btn');
  if (profileBtn) {
    profileBtn.addEventListener('click', () => openProfileModal(AppState.currentUser, true));
  }

  // Create room modal trigger
  const createBtn = document.getElementById('btn-create-room');
  if (createBtn) {
    createBtn.addEventListener('click', () => openCreateRoomModal());
  }
}

/* --------------------------------------------------
   ROOM
   -------------------------------------------------- */
function joinRoom(room) {
  AppState.activeRoom = room;
  AppState.messages = [];
  AppState.micOn = false;
  AppState.activeTab = 'notes';

  renderRoom(room);
  navigate('room');
}

function renderRoom(room) {
  // Room name & color dot
  const roomNameEl = document.getElementById('room-name');
  if (roomNameEl) {
    roomNameEl.innerHTML = `
      <span class="room-color-dot" style="background:var(--${room.color === 'emerald' ? 'emerald' : room.color === 'sky' ? 'sky' : room.color === 'rose' ? 'rose' : 'indigo'})"></span>
      ${room.title}
    `;
  }

  // Color dot (use CSS color var by color name mapping)
  const colorMap = { emerald: '#10b981', sky: '#0ea5e9', rose: '#f43f5e', indigo: '#4f46e5' };
  const dot = document.querySelector('#room-name .room-color-dot');
  if (dot) dot.style.background = colorMap[room.color] || '#4f46e5';

  // Avatars in header
  const avatarsEl = document.getElementById('room-avatars');
  if (avatarsEl) {
    const participants = AppState.participantsByRoom[room.id] || [];
    avatarsEl.innerHTML = `
      <div class="avatar avatar-you" title="${AppState.currentUser.name}">${AppState.currentUser.avatar}</div>
      ${participants.map(p => `<div class="avatar avatar-peer" title="${p.name}">${p.avatar}</div>`).join('')}
    `;
  }

  // Video tiles
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
          <div class="video-label">${p.name}</div>
        </div>
      `).join('')}
    `;

    // Bind profile openers
    videosEl.querySelectorAll('[data-action="open-profile-self"]').forEach(el => {
      el.addEventListener('click', () => openProfileModal(AppState.currentUser, true));
    });

    videosEl.querySelectorAll('[data-action="open-profile-peer"]').forEach(el => {
      el.addEventListener('click', () => {
        const uid = el.dataset.userId;
        const allP = Object.values(AppState.participantsByRoom).flat();
        const peer = allP.find(p => p.id === uid);
        if (peer) openProfileModal(peer, false);
      });
    });
  }

  // Reset tab
  switchTab('notes');
  renderChat();
  updateMicBtn();
}

function initRoom() {
  // Leave buttons
  document.querySelectorAll('[data-action="leave-room"]').forEach(btn => {
    btn.addEventListener('click', leaveRoom);
  });

  // Tabs
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Mic toggle
  const micBtn = document.getElementById('ctrl-mic');
  if (micBtn) micBtn.addEventListener('click', toggleMic);

  // Chat send
  const sendBtn = document.getElementById('btn-send');
  const chatInput = document.getElementById('chat-input');
  if (sendBtn) sendBtn.addEventListener('click', sendMessage);
  if (chatInput) {
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }
}

function leaveRoom() {
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
  // [API READY] Emit socket event: socket.emit('mic-toggle', { on: AppState.micOn })
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
  if (!text) return;

  const msg = {
    id: Date.now(),
    text,
    sender: AppState.currentUser.name,
    timestamp: new Date(),
  };

  AppState.messages.push(msg);
  input.value = '';

  // [API READY] socket.emit('chat-message', { roomId: AppState.activeRoom.id, text })

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
  document.getElementById('profile-modal-name').textContent = userData.name;
  document.getElementById('profile-modal-school').textContent = userData.school || '—';
  document.getElementById('profile-modal-bio').textContent = userData.bio
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
  const overlay = document.getElementById('modal-profile');
  if (closeBtn) closeBtn.addEventListener('click', closeProfileModal);
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeProfileModal(); });
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

function submitCreateRoom() {
  const input = document.getElementById('create-room-input');
  if (!input) return;
  const title = input.value.trim();
  if (!title) return;

  // [API READY] POST /api/rooms { title, isPublic: true }
  // Then push the returned room into AppState.rooms

  const newRoom = {
    id: `room_${Date.now()}`,
    title,
    iconType: 'users',
    color: 'indigo',
    users: 1,
    isPublic: true,
  };

  AppState.rooms.unshift(newRoom);
  renderRoomsGrid();
  closeCreateRoomModal();
}

function initCreateRoomModal() {
  const closeBtn = document.getElementById('create-modal-close');
  const overlay  = document.getElementById('modal-create');
  const form     = document.getElementById('create-room-form');

  if (closeBtn) closeBtn.addEventListener('click', closeCreateRoomModal);
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeCreateRoomModal(); });
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

  // Start at login
  navigate('login');
});
