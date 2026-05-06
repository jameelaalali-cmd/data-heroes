// ============================================================
//  DATA HEROES — Game Logic
// ============================================================

// ---- Game State ----
const state = {
  lang: 'en', hero: null,
  xp: 0, coins: 50, level: 1, streak: 1,
  classifyIdx: 0, classifyAnswered: false, classifyTimer: null,
  scenarioIdx: 0, scenarioAnswered: false, scenarioTimer: null,
  aiIdx: 0,       aiAnswered: false,       aiTimer: null,
  bossIdx: 0,     bossAnswered: false,     bossTimer: null, bossHP: 100,
  dqFixed: 0, totalErrors: 0,
  totalQuestions: 0, correctAnswers: 0, missionsCompleted: 0
};

// ============================================================
//  PARTICLES
// ============================================================
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let pts = [];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 50; i++) {
    pts.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      s: Math.random() * 2 + 0.5,
      a: Math.random() * 0.3 + 0.05
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,119,204,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================================
//  LANGUAGE
// ============================================================
function setLang(lang) {
  state.lang = lang;
  document.body.classList.toggle('rtl', lang === 'ar');
  document.getElementById('btn-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-ar').classList.toggle('active', lang === 'ar');
  document.querySelectorAll('[data-en]').forEach(el => {
    const v = el.getAttribute('data-' + lang) || el.getAttribute('data-en');
    if (v) el.textContent = v;
  });
}

function txt(en, ar) { return state.lang === 'ar' && ar ? ar : en; }

// ============================================================
//  HERO SELECTION
// ============================================================
function selectHero(idx, el) {
  document.querySelectorAll('.hero-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  state.hero = idx;
  const h = HEROES[idx];
  const btn = document.getElementById('start-btn');
  btn.disabled = false;
  btn.textContent = txt('BEGIN MISSION ', 'ابدأ المهمة ') + h.avatar;
}

// ============================================================
//  START GAME
// ============================================================
function startGame() {
  if (state.hero === null) return;
  document.getElementById('main-nav').style.display = 'flex';
  const h = HEROES[state.hero];
  document.getElementById('hud-avatar').textContent = h.avatar;
  document.getElementById('hud-name').textContent   = txt(h.name, h.nameAr);
  showScreen('dashboard');
}

// ============================================================
//  SCREEN NAVIGATION
// ============================================================
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const s = document.getElementById('screen-' + name);
  if (s) { s.classList.add('active'); s.scrollTop = 0; }

  if (name === 'classify')    initClassify();
  if (name === 'scenario')    initScenario();
  if (name === 'ai')          initAI();
  if (name === 'quality')     initQuality();
  if (name === 'boss')        initBoss();
  if (name === 'leaderboard') initLeaderboard();

  updateNav(name);
}

function updateNav(name) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const map = { dashboard: 'nav-home', classify: 'nav-play', leaderboard: 'nav-rank' };
  if (map[name]) document.getElementById(map[name]).classList.add('active');
}

// ============================================================
//  HELPERS
// ============================================================
function renderDots(id, total, current) {
  const d = document.getElementById(id);
  if (!d) return;
  d.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'pd' + (i === current ? ' active' : i < current ? ' done' : '');
    d.appendChild(dot);
  }
}

function startTimer(name, seconds, elId) {
  clearInterval(state[name + 'Timer']);
  let s = seconds;
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = s;
  state[name + 'Timer'] = setInterval(() => {
    s--;
    el.textContent = s;
    if (s <= 5) el.style.color = '#b91c1c';
    if (s <= 0) { clearInterval(state[name + 'Timer']); timeOut(name); }
  }, 1000);
}

function timeOut(name) {
  if (name === 'classify' && !state.classifyAnswered) checkClassify('__timeout__');
  if (name === 'scenario' && !state.scenarioAnswered) chooseScenario(-1);
  if (name === 'ai'       && !state.aiAnswered)       checkAI(-1);
  if (name === 'boss'     && !state.bossAnswered)     respondBoss(-1);
}

function addXP(amount) {
  state.xp += amount;
  const need = state.level * 200;
  if (state.xp >= need) { state.level++; state.xp -= need; }
  document.getElementById('hud-xp').textContent    = state.xp;
  document.getElementById('hud-level').textContent = state.level;
  const pct = Math.min(100, Math.round((state.xp / (state.level * 200)) * 100));
  document.getElementById('main-xp-bar').style.width = pct + '%';
  document.getElementById('xp-pct').textContent      = state.xp + ' / ' + (state.level * 200) + ' XP';
}

function updateStats() {
  document.getElementById('stat-questions').textContent = state.totalQuestions;
  document.getElementById('stat-accuracy').textContent  =
    state.totalQuestions > 0 ? Math.round((state.correctAnswers / state.totalQuestions) * 100) + '%' : '0%';
  document.getElementById('stat-missions').textContent  = state.missionsCompleted;
}

function showReward(icon, title, xp, msg) {
  document.getElementById('reward-icon').textContent  = icon;
  document.getElementById('reward-title').textContent = title;
  document.getElementById('reward-xp-val').textContent = '+' + xp;
  document.getElementById('reward-msg').textContent   = msg;
  document.getElementById('reward-popup').classList.add('show');
  addXP(xp);
}

function closeReward() {
  document.getElementById('reward-popup').classList.remove('show');
}

// ============================================================
//  DATA CLASSIFICATION
// ============================================================
function initClassify() {
  state.classifyIdx = 0;
  state.classifyAnswered = false;
  renderDots('classify-dots', CLASSIFY_DATA.length, 0);
  loadClassifyItem();
}

function loadClassifyItem() {
  const item = CLASSIFY_DATA[state.classifyIdx % CLASSIFY_DATA.length];
  document.getElementById('classify-data-value').textContent = txt(item.valueEn, item.valueAr);
  document.getElementById('classify-context').textContent    = txt(item.contextEn, item.contextAr);
  document.getElementById('classify-feedback').className     = 'feedback-box';
  document.getElementById('risk-meter').style.display        = 'none';
  document.getElementById('classify-next').classList.remove('show');
  state.classifyAnswered = false;
  document.querySelectorAll('.classify-btn').forEach(b => {
    b.disabled = false;
    b.classList.remove('correct', 'wrong');
    b.style.boxShadow = '';
  });
  renderDots('classify-dots', CLASSIFY_DATA.length, state.classifyIdx);
  startTimer('classify', 30, 'classify-timer');
}

function checkClassify(choice) {
  if (state.classifyAnswered) return;
  state.classifyAnswered = true;
  clearInterval(state.classifyTimer);

  const item = CLASSIFY_DATA[state.classifyIdx % CLASSIFY_DATA.length];
  const ok   = (choice === item.correct);
  state.totalQuestions++;
  if (ok) state.correctAnswers++;

  const fb = document.getElementById('classify-feedback');
  fb.className = 'feedback-box show ' + (ok ? 'correct' : 'wrong');
  fb.innerHTML = (ok ? '✅ ' : '❌ ') + txt(item.explanationEn, item.explanationAr);

  const rm = document.getElementById('risk-meter');
  rm.style.display = 'flex';
  setTimeout(() => {
    document.getElementById('risk-fill').style.width      = item.risk + '%';
    document.getElementById('risk-fill').style.background =
      item.risk > 70 ? '#dc2626' : item.risk > 40 ? '#b8860b' : '#16a34a';
    document.getElementById('risk-pct').textContent = item.risk + '%';
  }, 50);

  document.querySelectorAll('.classify-btn').forEach(b => {
    b.disabled = true;
    if (b.getAttribute('data-class') === item.correct) b.style.boxShadow = '0 0 0 3px currentColor';
  });

  addXP(ok ? 50 : 10);
  document.getElementById('classify-next').classList.add('show');
  updateStats();
}

function nextClassify() {
  state.classifyIdx++;
  if (state.classifyIdx >= CLASSIFY_DATA.length) {
    state.missionsCompleted++;
    showReward('🎖️', txt('Mission Complete!', 'المهمة مكتملة!'), 100, txt('All items classified!', 'تم تصنيف جميع العناصر!'));
    updateStats();
    return;
  }
  loadClassifyItem();
}

// ============================================================
//  SCENARIOS
// ============================================================
function initScenario() {
  state.scenarioIdx = 0;
  state.scenarioAnswered = false;
  renderDots('scenario-dots', SCENARIOS.length, 0);
  loadScenario();
}

function loadScenario() {
  const sc = SCENARIOS[state.scenarioIdx % SCENARIOS.length];
  document.getElementById('scenario-text').textContent     = txt(sc.textEn, sc.textAr);
  document.getElementById('scenario-feedback').className   = 'feedback-box';
  document.getElementById('scenario-impacts').style.display = 'none';
  document.getElementById('scenario-next').classList.remove('show');
  state.scenarioAnswered = false;

  const list = document.getElementById('scenario-choices');
  list.innerHTML = '';
  sc.choices.forEach((c, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `<span class="choice-icon">${c.icon}</span><span>${txt(c.textEn, c.textAr)}</span>`;
    btn.onclick = () => chooseScenario(i);
    list.appendChild(btn);
  });

  renderDots('scenario-dots', SCENARIOS.length, state.scenarioIdx);
  startTimer('scenario', 45, 'scenario-timer');
}

function chooseScenario(idx) {
  if (state.scenarioAnswered) return;
  state.scenarioAnswered = true;
  clearInterval(state.scenarioTimer);

  const sc   = SCENARIOS[state.scenarioIdx % SCENARIOS.length];
  const c    = idx >= 0 ? sc.choices[idx] : sc.choices[0];
  const ok   = idx >= 0 && c.isCorrect;
  state.totalQuestions++;
  if (ok) state.correctAnswers++;

  const fb = document.getElementById('scenario-feedback');
  fb.className = 'feedback-box show ' + (ok ? 'correct' : 'wrong');
  fb.innerHTML = (ok ? '✅ ' : '❌ ') + txt(sc.explanationEn, sc.explanationAr);

  const vals = idx >= 0 ? c : { compliance: -20, risk: 80, governance: -20 };
  document.getElementById('scenario-impacts').style.display = 'grid';
  const setImpact = (id, val) => {
    document.getElementById(id).textContent = (val >= 0 ? '+' : '') + val + '%';
    document.getElementById(id).style.color = val >= 0 ? '#15803d' : '#b91c1c';
  };
  setImpact('imp-compliance', vals.compliance);
  document.getElementById('imp-risk').textContent = vals.risk + '%';
  document.getElementById('imp-risk').style.color = vals.risk < 30 ? '#15803d' : vals.risk < 60 ? '#92400e' : '#b91c1c';
  setImpact('imp-gov', vals.governance);

  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
  addXP(ok ? 75 : 15);
  document.getElementById('scenario-next').classList.add('show');
  updateStats();
}

function nextScenario() {
  state.scenarioIdx++;
  if (state.scenarioIdx >= SCENARIOS.length) {
    state.missionsCompleted++;
    showReward('⚔️', txt('Scenarios Complete!', 'السيناريوهات مكتملة!'), 150, txt('Great governance decisions!', 'قرارات حوكمة ممتازة!'));
    updateStats();
    return;
  }
  loadScenario();
}

// ============================================================
//  AI AWARENESS
// ============================================================
function initAI() {
  state.aiIdx = 0;
  state.aiAnswered = false;
  renderDots('ai-dots', AI_QUESTIONS.length, 0);
  loadAI();
}

function loadAI() {
  const q = AI_QUESTIONS[state.aiIdx];
  document.getElementById('ai-q-num').textContent  =
    (state.lang === 'ar' ? 'سؤال ' : 'QUESTION ') + (state.aiIdx + 1) + ' / ' + AI_QUESTIONS.length;
  document.getElementById('ai-q-text').textContent = txt(q.qEn, q.qAr);

  const opts = document.getElementById('ai-options');
  opts.innerHTML = '';
  (state.lang === 'ar' ? q.optionsAr : q.options).forEach((o, i) => {
    const btn = document.createElement('button');
    btn.className = 'ai-opt';
    btn.textContent = o;
    btn.onclick = () => checkAI(i);
    opts.appendChild(btn);
  });

  document.getElementById('ai-feedback').className = 'feedback-box';
  document.getElementById('ai-next').classList.remove('show');
  state.aiAnswered = false;
  renderDots('ai-dots', AI_QUESTIONS.length, state.aiIdx);
  startTimer('ai', 40, 'ai-timer');
}

function checkAI(idx) {
  if (state.aiAnswered) return;
  state.aiAnswered = true;
  clearInterval(state.aiTimer);

  const q  = AI_QUESTIONS[state.aiIdx];
  const ok = (idx === q.correct);
  state.totalQuestions++;
  if (ok) state.correctAnswers++;

  document.querySelectorAll('.ai-opt').forEach((o, i) => {
    o.disabled = true;
    if (i === q.correct)          o.classList.add('correct');
    else if (i === idx && !ok)    o.classList.add('wrong');
  });

  const fb = document.getElementById('ai-feedback');
  fb.className = 'feedback-box show ' + (ok ? 'correct' : 'wrong');
  fb.innerHTML = (ok ? '✅ ' : '❌ ') + txt(q.explanationEn, q.explanationAr);

  addXP(ok ? 60 : 10);
  document.getElementById('ai-next').classList.add('show');
  updateStats();
}

function nextAI() {
  state.aiIdx++;
  if (state.aiIdx >= AI_QUESTIONS.length) {
    state.missionsCompleted++;
    showReward('🤖', txt('AI Expert!', 'خبير الذكاء الاصطناعي!'), 200, txt('Responsible AI mastered!', 'تم إتقان الذكاء الاصطناعي المسؤول!'));
    updateStats();
    return;
  }
  loadAI();
}

// ============================================================
//  DATA QUALITY
// ============================================================
function initQuality() {
  state.dqFixed = 0;
  let tot = 0;
  const tbody = document.getElementById('dq-tbody');
  tbody.innerHTML = '';

  DQ_DATA.forEach(row => {
    const tr = document.createElement('tr');
    ['id', 'name', 'emirate', 'gpa', 'email'].forEach(field => {
      const td     = document.createElement('td');
      const isErr  = row.errors.includes(field);
      if (isErr) {
        tot++;
        td.className = 'error-cell';
        td.title     = txt('Click to fix this error', 'انقر لإصلاح الخطأ');
        td.onclick   = () => fixCell(td);
      }
      td.textContent = row[field] || txt('(missing)', '(مفقود)');
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  state.totalErrors = tot;
  updateDQMeters();
  document.getElementById('errors-left').textContent = txt('Fix ' + tot + ' errors!', 'أصلح ' + tot + ' أخطاء!');
}

function fixCell(td) {
  td.className = 'fixed-cell';
  td.onclick   = null;
  state.dqFixed++;
  const rem = state.totalErrors - state.dqFixed;
  document.getElementById('errors-left').textContent =
    rem > 0 ? txt(rem + ' errors left', rem + ' أخطاء متبقية') : txt('All fixed! 🎉', 'تم الإصلاح! 🎉');
  addXP(20);
  updateDQMeters();
  updateStats();
  if (rem === 0) {
    state.missionsCompleted++;
    showReward('⭐', txt('Data Quality Master!', 'سيد جودة البيانات!'), 150, txt('All errors fixed!', 'تم إصلاح جميع الأخطاء!'));
  }
}

function updateDQMeters() {
  const pct   = Math.round(30 + (state.dqFixed / Math.max(1, state.totalErrors)) * 70);
  const trust = Math.round(45 + (state.dqFixed / Math.max(1, state.totalErrors)) * 55);

  const qFill = document.getElementById('dq-quality-fill');
  qFill.style.width      = pct + '%';
  qFill.style.background = pct > 70 ? 'linear-gradient(90deg,#16a34a,#0077cc)' : 'linear-gradient(90deg,#dc2626,#ea580c)';
  document.getElementById('dq-quality-pct').textContent = pct;

  const tFill = document.getElementById('dq-trust-fill');
  tFill.style.width      = trust + '%';
  tFill.style.background = trust > 70 ? 'linear-gradient(90deg,#16a34a,#0077cc)' : 'linear-gradient(90deg,#ea580c,#b8860b)';
  document.getElementById('dq-trust-pct').textContent = trust;
}

// ============================================================
//  BOSS BATTLE
// ============================================================
function initBoss() {
  state.bossIdx      = 0;
  state.bossAnswered = false;
  state.bossHP       = 100;
  document.getElementById('boss-hp-fill').style.width = '100%';
  loadBoss();
}

function loadBoss() {
  const b = BOSS_BATTLES[state.bossIdx % BOSS_BATTLES.length];
  document.getElementById('boss-name').textContent          = txt(b.nameEn, b.nameAr);
  document.getElementById('boss-incident-text').textContent = txt(b.incidentEn, b.incidentAr);
  document.getElementById('boss-feedback').className        = 'feedback-box';
  document.getElementById('boss-next').classList.remove('show');
  state.bossAnswered = false;

  const resp = document.getElementById('boss-responses');
  resp.innerHTML = '';
  b.responses.forEach((r, i) => {
    const btn = document.createElement('button');
    btn.className = 'boss-btn';
    btn.innerHTML = `<span class="choice-icon">${r.icon}</span><span>${txt(r.textEn, r.textAr)}</span>`;
    btn.onclick   = () => respondBoss(i);
    resp.appendChild(btn);
  });

  startTimer('boss', 15, 'boss-timer');
}

function respondBoss(idx) {
  if (state.bossAnswered) return;
  state.bossAnswered = true;
  clearInterval(state.bossTimer);

  const b  = BOSS_BATTLES[state.bossIdx % BOSS_BATTLES.length];
  const r  = idx >= 0 ? b.responses[idx] : b.responses[0];
  const ok = idx >= 0 && r.isCorrect;
  state.totalQuestions++;
  if (ok) state.correctAnswers++;

  state.bossHP = ok ? Math.max(0, state.bossHP - 50) : Math.min(100, state.bossHP + 20);
  document.getElementById('boss-hp-fill').style.width = state.bossHP + '%';

  document.querySelectorAll('.boss-btn').forEach(b => b.disabled = true);

  const fb = document.getElementById('boss-feedback');
  fb.className = 'feedback-box show ' + (ok ? 'correct' : 'wrong');
  fb.innerHTML = (ok ? '✅ ' : '❌ ') + (r.explanationEn
    ? txt(r.explanationEn, r.explanationAr)
    : txt(ok ? 'Correct response!' : 'Wrong — this makes things worse!', ok ? 'استجابة صحيحة!' : 'خاطئ!'));

  addXP(ok ? 100 : 5);
  document.getElementById('boss-next').classList.add('show');
  updateStats();
}

function nextBoss() {
  state.bossIdx++;
  if (state.bossHP <= 0) {
    state.missionsCompleted++;
    showReward('💀', txt('Boss Defeated!', 'تم هزيمة الزعيم!'), 250, txt('Cyber threat eliminated!', 'تم القضاء على التهديد!'));
    state.bossHP = 100;
    document.getElementById('boss-hp-fill').style.width = '100%';
    updateStats();
    return;
  }
  loadBoss();
}

// ============================================================
//  LEADERBOARD
// ============================================================
function initLeaderboard() {
  LEADERBOARD_DATA[LEADERBOARD_DATA.length - 1].score = state.xp;
  LEADERBOARD_DATA[LEADERBOARD_DATA.length - 1].hero  =
    state.hero !== null ? HEROES[state.hero].avatar : '❓';
  renderLeaderboard([...LEADERBOARD_DATA].sort((a, b) => b.score - a.score));
}

function setLBTab(el) {
  document.querySelectorAll('.lb-tab-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderLeaderboard([...LEADERBOARD_DATA].sort((a, b) => b.score - a.score));
}

function renderLeaderboard(data) {
  const list = document.getElementById('lb-list');
  list.innerHTML = '';
  data.forEach((p, i) => {
    const cls = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const li  = document.createElement('div');
    li.className = 'lb-item ' + cls;
    li.innerHTML = `
      <div class="lb-rank ${cls}">${i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}</div>
      <div class="lb-avatar">${p.hero}</div>
      <div class="lb-info">
        <div class="lb-name">${txt(p.name, p.nameAr)}</div>
        <div class="lb-uni">${txt(p.uni, p.uniAr)}</div>
      </div>
      <div style="text-align:right">
        <div class="lb-score">${p.score.toLocaleString()}</div>
        <span class="lb-badge">XP</span>
      </div>`;
    list.appendChild(li);
  });
}

// ============================================================
//  INIT
// ============================================================
setLang('en');
