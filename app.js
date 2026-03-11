/* ============================================================
   English Kids – Shared Application Logic v2.0
   ============================================================ */

// ── Sound Effects (Web Audio API) ──
const SFX = {
  ctx: null,
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },
  play(type) {
    try {
      this.init();
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = 0.15;

      if (type === 'correct') {
        osc.frequency.setValueAtTime(523, ctx.currentTime);       // C5
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2); // G5
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(150, ctx.currentTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'flip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.1);
      } else if (type === 'match') {
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'win') {
        [523, 659, 784, 1047].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          g.gain.value = 0.12;
          o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
          o.start(ctx.currentTime + i * 0.15);
          o.stop(ctx.currentTime + i * 0.15 + 0.3);
        });
      }
    } catch(e) { /* Audio not supported */ }
  }
};

// ── Speech Synthesis (Online TTS) ──
let currentAudio = null;
let repeatTimeout = null;

function speak(text) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  if (repeatTimeout) {
    clearTimeout(repeatTimeout);
    repeatTimeout = null;
  }
  
  // Google Translate APIs aggressively block cross-origin requests, resulting in ERR_BLOCKED_BY_ORB errors.
  // Instead, we use Youdao's dictionary API which provides high-quality Oxford British English (type=1) safely.
  const encodedText = encodeURIComponent(text);
  const url = `https://dict.youdao.com/dictvoice?audio=${encodedText}&type=1`;
  
  currentAudio = new Audio(url);
  let playCount = 1;
  const maxPlays = 3; // Lặp lại để nghe tổng cộng 3 lần

  currentAudio.play().catch(e => console.error('Audio playback failed:', e));
  
  currentAudio.onended = () => {
    if (playCount < maxPlays) {
      playCount++;
      repeatTimeout = setTimeout(() => {
        currentAudio.currentTime = 0;
        currentAudio.play().catch(e => console.error('Audio replay failed:', e));
      }, 1000); // Cách nhau 1s
    } else {
      currentAudio.onended = null;
    }
  };
}

// ── Dark Mode ──
function initDarkMode() {
  const saved = localStorage.getItem('ekids_dark');
  if (saved === 'true') document.body.classList.add('dark-mode');
  updateDarkToggleIcon();
}
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('ekids_dark', document.body.classList.contains('dark-mode'));
  updateDarkToggleIcon();
}
function updateDarkToggleIcon() {
  const btn = document.getElementById('dark-toggle');
  if (btn) btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
}

// ── Floating Sparkles ──
function initSparkles() {
  const container = document.querySelector('.sparkles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = (Math.random() * 100 + 20) + '%';
    s.style.setProperty('--dur', (Math.random() * 4 + 3) + 's');
    s.style.setProperty('--delay', (Math.random() * 6) + 's');
    s.style.width = (Math.random() * 4 + 3) + 'px';
    s.style.height = s.style.width;
    container.appendChild(s);
  }
}

// ── Tab Switching ──
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.toggle('active', sec.id === target);
      });
    });
  });
}

// ── Confetti ──
function launchConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  const colors = ['#6c5ce7', '#fd79a8', '#00cec9', '#fdcb6e', '#55efc4', '#fab1a0', '#a29bfe'];
  for (let i = 0; i < 100; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty('--fall-duration', (Math.random() * 2 + 1.5) + 's');
    piece.style.animationDelay = Math.random() * 1.5 + 's';
    piece.style.transform = `rotateZ(${Math.random() * 360}deg)`;
    piece.style.width = (Math.random() * 8 + 6) + 'px';
    piece.style.height = (Math.random() * 8 + 6) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
  }
  setTimeout(() => container.remove(), 4500);
}

// ── Shuffle Utility ──
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Score Storage ──
function getScore(topic) {
  return parseInt(localStorage.getItem(`ekids_${topic}_best`) || '0', 10);
}
function saveScore(topic, score) {
  const prev = getScore(topic);
  if (score > prev) localStorage.setItem(`ekids_${topic}_best`, score);
}
function getTopicTotal(topic) {
  return parseInt(localStorage.getItem(`ekids_${topic}_total`) || '10', 10);
}
function saveTopicTotal(topic, total) {
  localStorage.setItem(`ekids_${topic}_total`, total);
}

// ── Stars Display ──
function starsHTML(score, total) {
  const pct = score / total;
  let stars = 1;
  if (pct >= 0.9) stars = 3;
  else if (pct >= 0.6) stars = 2;
  return '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
}
function getStarCount(topic) {
  const score = getScore(topic);
  const total = getTopicTotal(topic);
  if (total === 0) return 0;
  const pct = score / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (score > 0) return 1;
  return 0;
}

// ── All Topics List ──
const ALL_TOPICS = ['numbers', 'body', 'clothes', 'hobbies', 'toys', 'colors', 'birthday', 'summer', 'family', 'feelings', 'school', 'months', 'days', 'seasons', 'weather'];

// ── Navigation Menu Data ──
const NAV_ITEMS = [
  { path: 'numbers.html', emoji: '🔢', text: 'Numbers' },
  { path: 'body.html', emoji: '🧍', text: 'Body' },
  { path: 'clothes.html', emoji: '👕', text: 'Clothes' },
  { path: 'hobbies.html', emoji: '⚽', text: 'Hobbies' },
  { path: 'toys.html', emoji: '🧸', text: 'Toys' },
  { path: 'colors.html', emoji: '🎨', text: 'Colours' },
  { path: 'birthday.html', emoji: '🎂', text: 'Birthday' },
  { path: 'summer.html', emoji: '☀️', text: 'Summer' },
  { path: 'family.html', emoji: '👨‍👩‍👧‍👦', text: 'Family' },
  { path: 'feelings.html', emoji: '😊', text: 'Feelings' },
  { path: 'school.html', emoji: '🏫', text: 'School' },
  { path: 'months.html', emoji: '📅', text: 'Months' },
  { path: 'days.html', emoji: '📆', text: 'Days' },
  { path: 'seasons.html', emoji: '🌸', text: 'Seasons' },
  { path: 'weather.html', emoji: '☀️', text: 'Weather' }
];

function renderNavigation() {
  const navContainer = document.getElementById('main-nav');
  if (!navContainer) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';

  navContainer.innerHTML = NAV_ITEMS.map(item => {
    const isActive = currentPath === item.path ? 'class="active"' : '';
    return `<a href="${item.path}" ${isActive}>${item.emoji} ${item.text}</a>`;
  }).join('');
}

// ── Badge System ──
const BADGES = [
  { id: 'first_quiz',    icon: '🎯', name: 'First Quiz',     condition: () => ALL_TOPICS.some(t => getScore(t) > 0) },
  { id: 'word_learner',  icon: '📚', name: 'Word Learner',   condition: () => (localStorage.getItem('ekids_cards_clicked') || 0) >= 10 },
  { id: 'streak_3',      icon: '🔥', name: '3 Streak',       condition: () => (parseInt(localStorage.getItem('ekids_best_streak') || '0', 10)) >= 3 },
  { id: 'memory_master', icon: '🧠', name: 'Memory Pro',     condition: () => localStorage.getItem('ekids_memory_win') === 'true' },
  { id: 'perfect',       icon: '💯', name: 'Perfect Score',  condition: () => {
    return ALL_TOPICS.some(t => { const s = getScore(t); const tot = getTopicTotal(t); return tot > 0 && s === tot; });
  }},
  { id: 'all_topics',    icon: '🏆', name: 'All Topics',     condition: () => ALL_TOPICS.every(t => getScore(t) > 0) },
];

function unlockBadge(id) {
  localStorage.setItem(`ekids_badge_${id}`, 'true');
}
function isBadgeUnlocked(id) {
  return localStorage.getItem(`ekids_badge_${id}`) === 'true';
}
function checkBadges() {
  BADGES.forEach(b => {
    if (!isBadgeUnlocked(b.id) && b.condition()) {
      unlockBadge(b.id);
    }
  });
}
function renderBadges(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  checkBadges();
  container.innerHTML = BADGES.map(b => {
    const unlocked = isBadgeUnlocked(b.id);
    return `<div class="badge ${unlocked ? 'unlocked' : 'locked'}" title="${b.name}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
    </div>`;
  }).join('');
}

// ── Progress Ring SVG ──
function progressRingSVG(percent, cssClass = '') {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return `<svg class="progress-ring ${cssClass}" viewBox="0 0 44 44">
    <circle class="ring-bg" cx="22" cy="22" r="${r}"/>
    <circle class="ring-fill" cx="22" cy="22" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${offset}"/>
  </svg>`;
}

// Track card clicks for badge
function trackCardClick() {
  const count = parseInt(localStorage.getItem('ekids_cards_clicked') || '0', 10) + 1;
  localStorage.setItem('ekids_cards_clicked', count);
}

// ── Quiz Engine ──
class QuizEngine {
  constructor({ containerId, questions, topic, onComplete }) {
    this.container = document.getElementById(containerId);
    this.questions = shuffle(questions);
    this.topic = topic;
    this.onComplete = onComplete;
    this.current = 0;
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.render();
  }

  render() {
    if (this.current >= this.questions.length) {
      this.showResults();
      return;
    }
    const q = this.questions[this.current];
    const progress = ((this.current) / this.questions.length * 100).toFixed(0);
    const streakHTML = this.streak >= 2 ? `<div class="streak-badge">🔥 ${this.streak} streak!</div>` : '';

    this.container.innerHTML = `
      <div class="quiz-container">
        <div class="score-bar">
          <span>Question ${this.current + 1} / ${this.questions.length}</span>
          <span class="stars">${starsHTML(this.score, this.current || 1)}</span>
        </div>
        <div class="progress-bar-outer">
          <div class="progress-bar-inner" style="width:${progress}%"></div>
        </div>
        ${streakHTML}
        <h3>${q.prompt}</h3>
        <div class="quiz-question">${q.question}</div>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-option" data-index="${i}" id="quiz-opt-${i}">${opt}</button>
          `).join('')}
        </div>
      </div>
    `;

    this.container.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => this.answer(btn, q));
    });
  }

  answer(btn, q) {
    const idx = parseInt(btn.dataset.index);
    const correct = idx === q.correct;

    this.container.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);

    if (correct) {
      btn.classList.add('correct');
      this.score++;
      this.streak++;
      if (this.streak > this.bestStreak) this.bestStreak = this.streak;
      SFX.play('correct');
      speak('Great job!');
    } else {
      btn.classList.add('wrong');
      this.streak = 0;
      this.container.querySelector(`[data-index="${q.correct}"]`).classList.add('correct');
      SFX.play('wrong');
      speak('Try again next time!');
    }

    setTimeout(() => {
      this.current++;
      this.render();
    }, 1200);
  }

  showResults() {
    const total = this.questions.length;
    saveScore(this.topic, this.score);
    saveTopicTotal(this.topic, total);

    // Save best streak
    const prevStreak = parseInt(localStorage.getItem('ekids_best_streak') || '0', 10);
    if (this.bestStreak > prevStreak) localStorage.setItem('ekids_best_streak', this.bestStreak);

    checkBadges();

    const pct = Math.round(this.score / total * 100);
    let message = '';
    let trophy = '🏆';
    if (pct >= 90) { message = 'Amazing! You\'re a superstar! 🌟'; launchConfetti(); SFX.play('win'); }
    else if (pct >= 70) { message = 'Great work! Keep it up! 💪'; trophy = '🎉'; SFX.play('match'); }
    else if (pct >= 50) { message = 'Good try! Practice more! 📚'; trophy = '👍'; }
    else { message = 'Keep practicing, you\'ll get better! 💪'; trophy = '📖'; }

    const streakMsg = this.bestStreak >= 3 ? `<p style="font-size:.95rem;margin-bottom:12px">🔥 Best streak: <strong>${this.bestStreak}</strong> in a row!</p>` : '';

    this.container.innerHTML = `
      <div class="results">
        <div class="trophy">${trophy}</div>
        <h2>You scored ${this.score} / ${total}!</h2>
        <p>${message}</p>
        ${streakMsg}
        <div class="score-bar"><span class="stars" style="font-size:2rem">${starsHTML(this.score, total)}</span></div>
        <button class="btn" onclick="location.reload()">🔄 Try Again</button>
        <a href="index.html" class="btn secondary">🏠 Home</a>
      </div>
    `;
    if (this.onComplete) this.onComplete(this.score, total);
  }
}

// ── Matching Game Engine ──
class MatchGame {
  constructor({ containerId, pairs, topic }) {
    this.container = document.getElementById(containerId);
    this.pairs = pairs;
    this.topic = topic;
    this.selected = null;
    this.matched = 0;
    this.render();
  }

  render() {
    const lefts = shuffle(this.pairs.map((p, i) => ({ text: p.left, pairId: i, side: 'left' })));
    const rights = shuffle(this.pairs.map((p, i) => ({ text: p.right, pairId: i, side: 'right' })));
    const combined = shuffle([...lefts, ...rights]);

    this.container.innerHTML = `
      <h3 style="text-align:center;margin-bottom:16px;font-size:1.2rem;">Match the pairs! Tap one, then tap its match 🎯</h3>
      <div class="score-bar"><span>Matched: <strong id="match-count">0</strong> / ${this.pairs.length}</span></div>
      <div class="match-game" id="match-grid">
        ${combined.map((item, i) => `
          <div class="match-card" data-pair="${item.pairId}" data-side="${item.side}" data-index="${i}" id="mc-${i}">
            ${item.text}
          </div>
        `).join('')}
      </div>
    `;

    this.container.querySelectorAll('.match-card').forEach(card => {
      card.addEventListener('click', () => this.select(card));
    });
  }

  select(card) {
    if (card.classList.contains('matched')) return;

    if (!this.selected) {
      card.classList.add('selected');
      this.selected = card;
      SFX.play('flip');
      return;
    }

    if (this.selected === card) {
      card.classList.remove('selected');
      this.selected = null;
      return;
    }

    const pairA = this.selected.dataset.pair;
    const sideA = this.selected.dataset.side;
    const pairB = card.dataset.pair;
    const sideB = card.dataset.side;

    if (pairA === pairB && sideA !== sideB) {
      this.selected.classList.remove('selected');
      this.selected.classList.add('matched');
      card.classList.add('matched');
      this.matched++;
      document.getElementById('match-count').textContent = this.matched;
      SFX.play('match');

      if (this.matched === this.pairs.length) {
        setTimeout(() => {
          launchConfetti();
          SFX.play('win');
          speak('You matched them all! Wonderful!');
        }, 400);
      }
    } else {
      this.selected.classList.remove('selected');
      card.classList.add('wrong');
      this.selected.classList.add('wrong');
      const prev = this.selected;
      SFX.play('wrong');
      setTimeout(() => {
        card.classList.remove('wrong');
        prev.classList.remove('wrong');
      }, 500);
    }
    this.selected = null;
  }
}

// ── Memory Flip Card Game ──
class MemoryGame {
  constructor({ containerId, pairs, topic }) {
    this.container = document.getElementById(containerId);
    this.pairs = pairs.slice(0, 6); // 6 pairs = 12 cards
    this.topic = topic;
    this.flipped = [];
    this.matched = 0;
    this.moves = 0;
    this.locked = false;
    this.startTime = null;
    this.timerInterval = null;
    this.render();
  }

  render() {
    // Create card data: each pair has an emoji card and a word card
    const cards = [];
    this.pairs.forEach((p, i) => {
      cards.push({ id: i, type: 'emoji', display: p.emoji || p.left, pairId: i });
      cards.push({ id: i + this.pairs.length, type: 'word', display: p.word || p.right, pairId: i });
    });
    const shuffled = shuffle(cards);

    this.container.innerHTML = `
      <h3 style="text-align:center;margin-bottom:16px;font-size:1.2rem;">Flip cards to find matching pairs! 🧠</h3>
      <div class="memory-stats">
        <span>🎯 Moves: <strong id="mem-moves">0</strong></span>
        <span>⏱️ Time: <strong id="mem-timer">0:00</strong></span>
        <span>✅ Found: <strong id="mem-found">0</strong>/${this.pairs.length}</span>
      </div>
      <div class="memory-game" id="mem-grid">
        ${shuffled.map((c, i) => `
          <div class="memory-card" data-pair="${c.pairId}" data-type="${c.type}" data-idx="${i}" id="mem-${i}">
            <div class="memory-card-inner">
              <div class="memory-card-back">❓</div>
              <div class="memory-card-front">
                <span class="${c.type === 'emoji' ? 'mem-emoji' : 'mem-text'}">${c.display}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.container.querySelectorAll('.memory-card').forEach(card => {
      card.addEventListener('click', () => this.flip(card));
    });
  }

  flip(card) {
    if (this.locked) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    // Start timer on first flip
    if (!this.startTime) {
      this.startTime = Date.now();
      this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }

    card.classList.add('flipped');
    SFX.play('flip');
    this.flipped.push(card);

    if (this.flipped.length === 2) {
      this.moves++;
      document.getElementById('mem-moves').textContent = this.moves;
      this.locked = true;

      const [a, b] = this.flipped;
      const pairA = a.dataset.pair;
      const pairB = b.dataset.pair;
      const typeA = a.dataset.type;
      const typeB = b.dataset.type;

      if (pairA === pairB && typeA !== typeB) {
        // Match!
        setTimeout(() => {
          a.classList.add('matched');
          b.classList.add('matched');
          this.matched++;
          document.getElementById('mem-found').textContent = this.matched;
          SFX.play('match');

          if (this.matched === this.pairs.length) {
            clearInterval(this.timerInterval);
            localStorage.setItem('ekids_memory_win', 'true');
            checkBadges();
            setTimeout(() => {
              launchConfetti();
              SFX.play('win');
              speak('Amazing memory! You found them all!');
              this.showWin();
            }, 500);
          }

          this.flipped = [];
          this.locked = false;
        }, 500);
      } else {
        // No match
        SFX.play('wrong');
        setTimeout(() => {
          a.classList.remove('flipped');
          b.classList.remove('flipped');
          this.flipped = [];
          this.locked = false;
        }, 800);
      }
    }
  }

  updateTimer() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const el = document.getElementById('mem-timer');
    if (el) el.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  showWin() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const rating = this.moves <= this.pairs.length + 2 ? '🌟🌟🌟' :
                   this.moves <= this.pairs.length * 2 ? '🌟🌟' : '🌟';

    this.container.innerHTML = `
      <div class="results">
        <div class="trophy">🧠</div>
        <h2>Memory Master!</h2>
        <p>You found all pairs in <strong>${this.moves}</strong> moves and <strong>${mins}:${secs.toString().padStart(2, '0')}</strong>!</p>
        <div class="score-bar"><span class="stars" style="font-size:2rem">${rating}</span></div>
        <button class="btn" onclick="location.reload()">🔄 Play Again</button>
        <a href="index.html" class="btn secondary">🏠 Home</a>
      </div>
    `;
  }
}

// ── Init on DOM ready ──
document.addEventListener('DOMContentLoaded', () => {
  initDarkMode();
  initTabs();
  initSparkles();

  // Render badges if on home page
  renderBadges('badges-grid');

  // Render navigation menu dynamically
  renderNavigation();

  // Render progress on home page topic cards
  updateHomeProgress();
});

// ── Home Page Progress ──
function updateHomeProgress() {
  const topics = [
    { key: 'numbers', cardId: 'card-numbers' },
    { key: 'body',    cardId: 'card-body' },
    { key: 'clothes', cardId: 'card-clothes' },
    { key: 'hobbies', cardId: 'card-hobbies' },
    { key: 'toys',    cardId: 'card-toys' },
    { key: 'colors',  cardId: 'card-colors' },
    { key: 'birthday',cardId: 'card-birthday' },
    { key: 'summer',  cardId: 'card-summer' },
    { key: 'family',  cardId: 'card-family' },
    { key: 'feelings',cardId: 'card-feelings' },
    { key: 'school',  cardId: 'card-school' },
    { key: 'months',  cardId: 'card-months' },
    { key: 'days',    cardId: 'card-days' },
    { key: 'seasons', cardId: 'card-seasons' },
    { key: 'weather', cardId: 'card-weather' },
  ];

  let totalStars = 0;

  topics.forEach(t => {
    const card = document.getElementById(t.cardId);
    if (!card) return;

    const score = getScore(t.key);
    const total = getTopicTotal(t.key);
    const stars = getStarCount(t.key);
    totalStars += stars;
    const pct = total > 0 ? Math.round(score / total * 100) : 0;

    const progressEl = card.querySelector('.card-progress');
    if (progressEl) {
      progressEl.innerHTML = `
        ${progressRingSVG(pct)}
        <div>
          <div class="progress-stars">${score > 0 ? starsHTML(score, total) : '☆☆☆'}</div>
          <div class="progress-text">${score > 0 ? `Best: ${score}/${total}` : 'Not started'}</div>
        </div>
      `;
    }
  });

  // Update total stars (15 topics × 3 stars = 45)
  const starsEl = document.getElementById('total-stars');
  if (starsEl) starsEl.textContent = `${totalStars} / 45`;
}
