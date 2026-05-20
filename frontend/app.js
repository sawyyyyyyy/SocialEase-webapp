(function () {
  'use strict';

  const API = {
    BASE: window.__API_BASE || 'http://localhost:8080/api/v1',
    request(method, path, body) {
      const headers = { 'Content-Type': 'application/json' };
      const token = LS.get('token');
      if (token) headers['Authorization'] = 'Bearer ' + token;
      return fetch(this.BASE + path, {
        method, headers,
        body: body ? JSON.stringify(body) : undefined
      }).then(async res => {
        if (res.status === 204) return null;
        let data;
        const text = await res.text();
        try { data = JSON.parse(text); } catch { data = text; }
        if (!res.ok) throw new Error(data?.message || data?.error || text || 'Request failed');
        return data;
      });
    },
    get(path) { return this.request('GET', path); },
    post(path, body) { return this.request('POST', path, body); },
    put(path, body) { return this.request('PUT', path, body); },
    del(path) { return this.request('DELETE', path); }
  };

  const LS = {
    get(k) { try { return JSON.parse(localStorage.getItem('se_' + k)); } catch { return null; } },
    set(k, v) { localStorage.setItem('se_' + k, JSON.stringify(v)); },
    remove(k) { localStorage.removeItem('se_' + k); }
  };

const App = {
    user: null, token: null,

    init() {
      this.token = LS.get('token');
      this.user = LS.get('user');
      const page = window.location.pathname.split('/').pop() || 'dashboard.html';
      const name = page.replace('.html', '');
      const protectedPages = ['dashboard', 'assessment', 'chat', 'scinario', 'analysis', 'settings', 'tip', 'support'];
      if (protectedPages.includes(name) && !this.token) { this.redirect('login.html'); return; }
      if ((name === 'login' || name === 'register') && this.token) { this.redirect('dashboard.html'); return; }
      this[name]?.();
      this.updateUserDisplay();
      this.initToast();
      const cy = document.getElementById('copyrightYear');
      if (cy) cy.textContent = new Date().getFullYear();
      document.addEventListener('click', (e) => {
        const el = e.target.closest('[data-scenario]');
        if (el) LS.set('currentScenario', el.dataset.scenario);
        const so = e.target.closest('[data-action="signout"]');
        if (so) { e.preventDefault(); this.logout(); }
        const tl = e.target.closest('.transition-link');
        if (tl) { e.preventDefault(); this.transitionTo(tl.getAttribute('href')); }
        const ni = e.target.closest('[data-icon="notifications"]');
        if (ni && ni.closest('a[href*="settings"]')) { e.preventDefault(); this.toggleNotifications(ni); }
      });
      document.addEventListener('click', (e) => {
        const nd = document.getElementById('notifDropdown');
        if (nd && !e.target.closest('#notifBtn, #notifDropdown')) nd.remove();
      });
    },

    toggleNotifications(btn) {
      const existing = document.getElementById('notifDropdown');
      if (existing) { existing.remove(); return; }
      while (btn.tagName !== 'BUTTON' && btn.tagName !== 'A') btn = btn.parentElement;
      btn.id = 'notifBtn';
      const rect = btn.getBoundingClientRect();
      const labels = { notifReminders: 'Practice Reminders', notifProgress: 'Progress Reports', notifTips: 'Daily Tips' };
      const div = document.createElement('div');
      div.id = 'notifDropdown';
      div.className = 'fixed z-50 bg-white rounded-xl shadow-2xl border border-blue-50 p-4 min-w-[260px]';
      div.style.top = (rect.bottom + 8) + 'px';
      div.style.right = (window.innerWidth - rect.right) + 'px';
      div.innerHTML = '<div class="flex items-center gap-2 mb-3 text-primary"><span class="material-symbols-outlined text-lg">notifications</span><span class="font-bold text-sm">Notifications</span></div>' +
        Object.keys(labels).map(k => {
          const on = LS.get(k) !== false;
          return '<label class="flex items-center gap-3 py-2 cursor-pointer hover:bg-surface-container-low rounded-lg px-2 -mx-2">' +
            '<input type="checkbox" ' + (on ? 'checked' : '') + ' class="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4" data-notif-key="' + k + '">' +
            '<span class="text-sm text-on-surface">' + labels[k] + '</span></label>';
        }).join('') +
        '<div class="border-t border-blue-50 mt-2 pt-2 text-center"><a href="settings.html" class="text-xs text-primary hover:underline">Manage in Settings</a></div>';
      document.body.appendChild(div);
      div.querySelectorAll('[data-notif-key]').forEach(cb => {
        cb.addEventListener('change', () => LS.set(cb.dataset.notifKey, cb.checked));
      });
    },

    transitionTo(url) {
      const card = document.querySelector('.glass-card, .animate-in');
      if (card) { card.classList.remove('animate-in'); card.classList.add('animate-out'); }
      setTimeout(() => { window.location.href = url; }, 220);
    },

    toast(msg, type) {
      const t = document.getElementById('toast');
      if (!t) return;
      t.textContent = msg;
      t.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-2xl font-button text-sm z-[999] transition-all duration-300 ' +
        (type === 'error' ? 'bg-error text-on-error' : type === 'success' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-white');
      t.style.opacity = '1';
      t.style.transform = 'translateX(-50%) translateY(0)';
      clearTimeout(t._hide);
      t._hide = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(10px)'; }, 3000);
    },

    initToast() {
      if (document.getElementById('toast')) return;
      const t = document.createElement('div');
      t.id = 'toast';
      t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);padding:0.75rem 1.5rem;border-radius:9999px;box-shadow:0 10px 40px rgba(0,0,0,0.2);z-index:999;font-size:0.875rem;font-weight:600;opacity:0;transition:all 0.3s;pointer-events:none;';
      document.body.appendChild(t);
    },

    qs(s, p) { return (p || document).querySelector(s); },
    qsa(s, p) { return Array.from((p || document).querySelectorAll(s)); },
    redirect(url) { window.location.href = url; },
    saveAuth(token, user) { LS.set('token', token); LS.set('user', user); this.token = token; this.user = user; },
    clearAuth() { LS.remove('token'); LS.remove('user'); this.token = null; this.user = null; },
    logout() { this.clearAuth(); this.redirect('login.html'); },

    updateUserDisplay() {
      const el = document.getElementById('userGreeting');
      if (el && this.user) {
        const h = new Date().getHours();
        const g = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
        el.textContent = 'Good ' + g + ', ' + (this.user.username || this.user.firstName || this.user.name || '');
      }
      const nameEl = document.getElementById('userNameDisplay');
      if (nameEl && this.user) {
        nameEl.textContent = this.user.username || this.user.firstName || '';
      }
      const avatar = document.getElementById('userAvatar');
      if (avatar && this.user) {
        const initial = ((this.user.username || '')[0] || '').toUpperCase();
        if (initial) { avatar.innerHTML = '<span class="text-sm font-bold">' + initial + '</span>'; }
      }
    },

    async login() {
      const form = document.getElementById('loginForm');
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        try {
          const data = await API.post('/auth/login', { email, password });
          this.saveAuth(data.token, data.user);
          this.toast('Welcome back!', 'success');
          setTimeout(() => this.redirect('dashboard.html'), 500);
        } catch (err) {
          if (errorEl) { errorEl.textContent = err.message || 'Invalid email or password'; errorEl.classList.remove('hidden'); }
          this.toast(err.message || 'Login failed', 'error');
        }
      });
    },

    async register() {
      const form = document.getElementById('registerForm');
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirm').value;
        const age = parseInt(document.getElementById('registerAge')?.value) || 18;
        const terms = document.getElementById('registerTerms')?.checked;
        const errorEl = document.getElementById('registerError');
        if (!terms) { this.toast('Please accept the terms', 'error'); return; }
        if (password !== confirm) { this.toast('Passwords do not match', 'error'); return; }
        if (password.length < 6) { this.toast('Password must be at least 6 characters', 'error'); return; }
        const parts = name.split(' ');
        const firstName = parts[0] || name;
        const lastName = parts.slice(1).join(' ') || 'User';
        const username = email.split('@')[0];
        try {
          const data = await API.post('/auth/register', { username, email, password, firstName, lastName, age });
          this.saveAuth(data.token, data.user);
          this.toast('Account created!', 'success');
          setTimeout(() => this.redirect('dashboard.html'), 500);
        } catch (err) {
          if (errorEl) { errorEl.textContent = err.message || 'Registration failed'; errorEl.classList.remove('hidden'); }
          this.toast(err.message || 'Registration failed', 'error');
        }
      });
    },

    async dashboard() {
      if (!this.token) { this.redirect('login.html'); return; }
      this.updateUserDisplay();
      const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const chart = document.getElementById('weeklyChart');
      const labels = document.getElementById('weeklyLabels');
      if (chart && labels) {
        chart.innerHTML = days.map(d => '<div class="flex-1 bg-primary-container/20 rounded-t-lg relative group cursor-pointer hover:bg-primary-container/40 transition-all block" style="height:8px" data-day="' + d + '"><div class="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded whitespace-nowrap">' + d + '</div></div>').join('');
        labels.innerHTML = days.map(d => '<span>' + d + '</span>').join('');
      }
      try {
        const content = await this.loadContent();
        const summary = await API.get('/progress/summary');
        const periodLabel = document.getElementById('dashboardPeriodLabel');
        if (periodLabel && content && content.research && content.research.durationMonths) {
          const days = content.research.durationMonths * 30;
          periodLabel.textContent = 'Last ' + days + ' Days';
        }
        try {
          const rec = await API.get('/recommendations');
          const top = Array.isArray(rec) ? rec[0] : null;
          const recTitle = document.getElementById('recTitle');
          const recDesc = document.getElementById('recDescription');
          const recDuration = document.getElementById('recDuration');
          if (top && top.exercise) {
            if (recTitle) recTitle.textContent = top.exercise.title || '';
            if (recDesc) recDesc.textContent = top.exercise.description || '';
            if (recDuration) recDuration.textContent = (top.exercise.durationMinutes || 0) + ' min';
          } else {
            if (recTitle) recTitle.textContent = 'No recommendations yet';
            if (recDesc) recDesc.textContent = 'Complete a practice session to get personalized recommendations.';
            if (recDuration) recDuration.textContent = '';
          }
        } catch (e) {
          const recTitle = document.getElementById('recTitle');
          const recDesc = document.getElementById('recDescription');
          const recDuration = document.getElementById('recDuration');
          if (recTitle) recTitle.textContent = 'Recommendations unavailable';
          if (recDesc) recDesc.textContent = 'Please try again later.';
          if (recDuration) recDuration.textContent = '';
        }
        const streakEl = document.getElementById('streakCount');
        if (streakEl) streakEl.textContent = (summary.currentStreak || 0) + ' Days';
        const challengesEl = document.getElementById('challengesCount');
        if (challengesEl) challengesEl.textContent = summary.completedExercises || 0;
        const sub = document.getElementById('dashboardSubtitle');
        if (sub) {
          sub.textContent = summary.completedExercises ? 'You\'ve completed ' + summary.completedExercises + ' exercise' + (summary.completedExercises !== 1 ? 's' : '') + ' this week. Keep going!' : 'Start your first exercise to begin tracking your progress.';
        }
        const recProgress = document.getElementById('recProgress');
        const recLabel = document.getElementById('recProgressLabel');
        if (recProgress && recLabel) {
          if (summary.totalExercises > 0) {
            const pct = Math.round(summary.completedExercises / summary.totalExercises * 100);
            recProgress.style.width = pct + '%';
            recLabel.textContent = 'OVERALL PROGRESS: ' + pct + '%';
          } else {
            recLabel.textContent = 'OVERALL PROGRESS: 0%';
          }
        }
        if (chart && summary.dailyScores) {
          chart.querySelectorAll('[data-day]').forEach((el, i) => {
            const score = summary.dailyScores[i] || 0;
            const maxScore = Math.max(...summary.dailyScores, 1);
            const pct = Math.max(8, (score / maxScore) * 100);
            el.style.height = pct + '%';
            if (score > 0) el.classList.add('bg-primary-container/60');
          });
        }
        try {
          const latest = await API.get('/assessments/latest');
          const scoreEl = document.querySelector('.confidence-score');
          if (scoreEl && latest) scoreEl.textContent = latest.score + '/40';
        } catch (e) { /* no assessments yet */ }
      } catch (e) { /* backend unavailable */ }
    },

    async assessment() {
      if (!this.token) { this.redirect('login.html'); return; }
      await this.loadAssessmentHistory();
      const viewBtn = document.getElementById('viewResults');
      if (!viewBtn) return;
      viewBtn.addEventListener('click', async () => {
        const responses = {};
        for (let i = 1; i <= 8; i++) {
          const selected = document.querySelector('input[name="q' + i + '"]:checked');
          if (!selected) { this.toast('Please answer all questions', 'error'); return; }
          responses['q' + i] = parseInt(selected.value);
        }
        try {
          const data = await API.post('/assessments', { responses: JSON.stringify(responses) });
          this.toast('Assessment saved! Score: ' + data.score + '/40', 'success');
          setTimeout(() => this.redirect('analysis.html'), 800);
        } catch (err) {
          this.toast(err.message || 'Failed to save assessment', 'error');
        }
      });
    },

    async loadAssessmentHistory() {
      const container = document.getElementById('assessmentHistory');
      if (!container) return;
      try {
        const assessments = await API.get('/assessments');
        if (assessments.length === 0) {
          container.innerHTML = '<p class="text-on-surface-variant text-sm">No assessments yet.</p>'; return;
        }
        const labels = { LOW: 'Low Anxiety', MODERATE: 'Mild Anxiety', HIGH: 'Moderate Anxiety', SEVERE: 'High Anxiety' };
        container.innerHTML = assessments.slice(0, 3).map(a => {
          const d = new Date(a.createdAt);
          return '<div class="p-3 bg-surface-container-high rounded-xl text-sm flex justify-between items-center">' +
            '<span>' + (labels[a.anxietyLevel] || a.anxietyLevel) + ' (' + a.score + '/40)</span>' +
            '<span class="text-on-surface-variant">' + d.toLocaleDateString() + '</span></div>';
        }).join('');
      } catch (e) {
        container.innerHTML = '<p class="text-on-surface-variant text-sm">Could not load history.</p>';
      }
    },

    chat() {
      if (!this.token) { this.redirect('login.html'); return; }
      const anxietyBar = document.getElementById('anxietyBar');
      const anxietyLabel = document.getElementById('anxietyLabel');
      const scenarios = {
        'coffee-shop': { title: 'Coffee Shop Interaction Simulation', intro: 'You: "Hi, I\'d like to order a latte, please."', followUp: 'Barista: "Sure, anything else?"', suggestions: ['Ask about the roast', 'Order a pastry too', 'Just pay and leave'], matchTitle: 'Coffee Shop Greeting' },
        'asking-directions': { title: 'Asking for Directions Simulation', intro: 'You: "Excuse me, do you know where the nearest subway station is?"', followUp: 'Stranger: "Sure, go straight two blocks and turn left."', suggestions: ['Ask for clarification', 'Thank them', 'Ask about landmarks'], matchTitle: 'Asking for Directions' },
        'returning-item': { title: 'Returning an Item Simulation', intro: 'You: "Hi, I\'d like to return this shirt I bought yesterday."', followUp: 'Clerk: "Of course, do you have the receipt?"', suggestions: ['Provide receipt', 'Explain the issue', 'Ask about exchange'], matchTitle: 'Returning an Item' },
        'job-interview': { title: 'Job Interview Simulation', intro: 'You: "Thank you for having me."', followUp: 'Interviewer: "Tell me about yourself."', suggestions: ['Highlight skills', 'Share experience', 'Ask about the role'], matchTitle: 'Job Interview' }
      };
      const key = LS.get('currentScenario') || 'coffee-shop';
      const s = scenarios[key] || scenarios['coffee-shop'];
      const list = document.getElementById('chatSessionList');
      if (list) {
        list.innerHTML = Object.entries(scenarios).map(([k, v]) => {
          const active = k === key;
          return '<a href="chat.html" data-scenario="' + k + '" class="block p-4 ' + (active ? 'bg-white dark:bg-slate-800 rounded-xl border border-primary/10 shadow-sm' : 'hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-xl') + ' cursor-pointer transition-all">' +
            '<div class="flex justify-between items-start mb-1"><h3 class="font-semibold text-on-surface">' + v.title.replace(' Simulation', '') + '</h3>' +
            (active ? '<span class="text-[10px] text-on-surface-variant">Active</span>' : '') + '</div>' +
            '<p class="text-xs text-on-surface-variant line-clamp-1">' + v.intro.replace('You: "', '').replace('"', '') + '</p></a>';
        }).join('');
      }
      const titleEl = document.getElementById('scenarioTitle');
      if (titleEl) titleEl.textContent = s.title;
      const sg = document.getElementById('sessionGreeting');
      if (sg) sg.innerHTML = '<p class="text-sm text-on-surface-variant mb-2">' + s.intro + '</p><p class="text-sm font-medium">' + s.followUp + '</p>';
      document.querySelectorAll('.chat-suggestion').forEach((btn, i) => {
        if (s.suggestions[i]) btn.textContent = s.suggestions[i];
        btn.onclick = () => { const inp = document.getElementById('chatInput'); if (inp) inp.value = btn.textContent; };
      });
      if (anxietyBar && anxietyLabel) {
        const base = Math.floor(Math.random() * 20) + 10;
        anxietyBar.style.width = base + '%';
        anxietyLabel.textContent = base >= 70 ? 'HIGH' : base >= 40 ? 'ELEVATED' : 'STABLE';
      }
      const sendBtn = document.getElementById('chatSend');
      const input = document.getElementById('chatInput');
      const messages = document.getElementById('chatMessages');
      const statusBadge = document.getElementById('chatStatusBadge');
      let chatExerciseId = null;
      API.get('/exercises').then(all => {
        const match = all.find(e => e.title === s.matchTitle);
        if (match) {
          chatExerciseId = match.id;
          API.post('/exercises/' + match.id + '/start').catch(() => {});
          if (statusBadge) statusBadge.innerHTML = '<span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>Active Session';
        } else if (statusBadge) {
          statusBadge.innerHTML = '<span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>Offline';
        }
      }).catch(() => { if (statusBadge) statusBadge.innerHTML = '<span class="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>Offline'; });
      const completeChatExercise = () => {
        if (chatExerciseId) {
          const current = parseInt(anxietyBar.style.width || '0') || 0;
          const score = Math.round(Math.max(10, 100 - current));
          API.post('/exercises/' + chatExerciseId + '/complete', { score, notes: 'Completed via chat' }).catch(() => {});
          chatExerciseId = null;
          if (statusBadge) statusBadge.innerHTML = '<span class="w-2 h-2 bg-slate-400 rounded-full mr-2"></span>Ended';
        }
      };
      const addMsg = (text, isUser) => {
        if (!messages) return;
        const div = document.createElement('div');
        div.className = 'flex ' + (isUser ? 'justify-end' : 'justify-start');
        div.innerHTML = '<div class="max-w-[75%] p-3 rounded-2xl ' + (isUser ? 'bg-primary text-on-primary rounded-br-sm' : 'bg-surface-container-high text-on-surface rounded-bl-sm') + ' text-sm">' + text + '</div>';
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
      };
      const send = () => {
        if (!input || !input.value.trim()) return;
        const msg = input.value.trim().toLowerCase();
        addMsg(input.value.trim(), true);
        input.value = '';
        let reply;
        if (/anxious|nervous|scared|worried|afraid|panic/.test(msg)) reply = "It's completely normal to feel that way. Take a deep breath — you're doing great just by trying.";
        else if (/help|stuck|confused|don't know|not sure|how should/.test(msg)) reply = "Try breaking it down into small steps. What feels like the most manageable thing to start with?";
        else if (/good|great|fine|okay|better|improved|wonderful/.test(msg)) reply = "That's wonderful progress! Every small step counts. How does that make you feel?";
        else if (/sorry|bad|terrible|awful|worse|fail|mess/.test(msg)) reply = "Be kind to yourself. Social situations take practice — you're learning and growing every day.";
        else if (/thanks|thank you/.test(msg)) reply = "You're very welcome! I'm here whenever you need to practice.";
        else if (/bye|goodbye|later|exit|done/.test(msg)) { reply = "Great session today! Remember to practice what you've learned. See you next time!"; completeChatExercise(); }
        else {
          const fallbacks = ["That's great! How does that make you feel?", "I understand. Take your time.", "That's a good way to handle it!", "How about trying a different approach?", "You're doing really well!", "That's perfectly normal. What would help right now?"];
          reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
        setTimeout(() => addMsg(reply, false), 1000);
        const anxietyBar = document.getElementById('anxietyBar');
        const anxietyLabel = document.getElementById('anxietyLabel');
        if (anxietyBar && anxietyLabel) {
          const bump = Math.floor(Math.random() * 12) + 6;
          const current = parseInt(anxietyBar.style.width || '0') || 0;
          const next = Math.min(100, current + bump);
          anxietyBar.style.width = next + '%';
          anxietyLabel.textContent = next >= 70 ? 'HIGH' : next >= 40 ? 'ELEVATED' : 'STABLE';
        }
      };
      if (sendBtn) sendBtn.onclick = send;
      if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
      const ep = document.getElementById('emojiPicker');
      if (ep) {
        const emojis = ['😊', '🙂', '😌', '😅', '🤔', '👍', '💪', '✨', '🌟', '❤️', '🧘', '🌿', '💬', '🤝', '🎯', '🌈', '🦋', '🌻'];
        ep.innerHTML = emojis.map(e => '<button type="button" class="text-xl p-1.5 hover:bg-surface-container-high rounded-lg transition-colors">' + e + '</button>').join('');
        ep.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { if (input) input.value += b.textContent; ep.classList.add('hidden'); }));
        const eb = document.getElementById('emojiBtn');
        if (eb) eb.addEventListener('click', (e) => { e.stopPropagation(); ep.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if (!ep.contains(e.target) && e.target !== eb) ep.classList.add('hidden'); });
      }
    },

    async scinario() {
      if (!this.token) { this.redirect('login.html'); return; }
      const content = await this.loadContent();
      const proTipEl = document.getElementById('scenarioProTip');
      if (proTipEl) {
        const tip = content && content.proTip ? content.proTip : "Take a deep breath — you're doing great just by trying.";
        proTipEl.textContent = '"' + tip + '"';
      }
      const anxietyBar = document.getElementById('anxietyBar');
      const anxietyLabel = document.getElementById('anxietyLabel');
      if (anxietyBar) anxietyBar.style.width = '0%';
      if (anxietyLabel) anxietyLabel.textContent = '--';
      const scenarios = {
        'coffee-shop': { title: 'Ordering Coffee', desc: 'Navigate a busy cafe environment and place an order.', difficulty: 'Easy', icon: 'coffee', matchTitle: 'Coffee Shop Greeting' },
        'asking-directions': { title: 'Asking for Directions', desc: 'Approaching a stranger to find your way in a city.', difficulty: 'Medium', icon: 'signpost', matchTitle: 'Asking for Directions' },
        'returning-item': { title: 'Returning an Item', desc: 'Handling a potential conflict at a retail store.', difficulty: 'Hard', icon: 'shopping_bag', matchTitle: 'Returning an Item' },
        'job-interview': { title: 'Job Interview', desc: 'Practice answering common questions with a calm tone.', difficulty: 'Hard', icon: 'work', matchTitle: 'Job Interview' },
      };
      const key = LS.get('currentScenario') || 'coffee-shop';
      const s = scenarios[key] || scenarios['coffee-shop'];
      const acTitle = document.getElementById('activeScenarioTitle');
      const acDesc = document.getElementById('activeScenarioDesc');
      const acDiff = document.getElementById('activeScenarioDifficulty');
      const acCard = document.getElementById('activeScenarioCard');
      if (acTitle) acTitle.textContent = s.title;
      if (acDesc) acDesc.textContent = s.desc;
      if (acDiff) acDiff.textContent = 'Difficulty: ' + s.difficulty;
      if (acCard) acCard.dataset.difficulty = s.difficulty.toLowerCase();
      const sal = document.getElementById('scenarioActiveLabel');
      if (sal) sal.textContent = s.title;
      const filterBtn = document.getElementById('filterBtn');
      const filterDropdown = document.getElementById('filterDropdown');
      if (filterBtn && filterDropdown) {
        filterBtn.addEventListener('click', (e) => { e.stopPropagation(); filterDropdown.classList.toggle('hidden'); });
        filterDropdown.querySelectorAll('[data-filter]').forEach(btn => {
          btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            document.querySelectorAll('[data-difficulty]').forEach(card => {
              card.classList.toggle('hidden', filter !== 'all' && card.dataset.difficulty !== filter);
            });
            filterDropdown.classList.add('hidden');
          });
        });
        document.addEventListener('click', () => filterDropdown.classList.add('hidden'));
      }
      document.querySelectorAll('[data-scenario]').forEach(el => {
        el.addEventListener('click', function () {
          document.querySelectorAll('[data-scenario]').forEach(c => { c.classList.remove('bg-white', 'border-primary', 'shadow-md'); c.classList.add('bg-transparent', 'border-transparent'); });
          this.classList.add('bg-white', 'border-primary', 'shadow-md');
          this.classList.remove('bg-transparent', 'border-transparent');
        });
      });
      const ac = document.getElementById('activeScenarioCard');
      if (ac) ac.addEventListener('click', () => { LS.set('currentScenario', key); this.redirect('chat.html'); });
      const vb = document.getElementById('voiceBtn');
      if (vb) vb.addEventListener('click', () => this.toast('Voice mode coming soon!'));
      const updateScenarioCard = (keyName, data) => {
        const card = document.querySelector('[data-scenario="' + keyName + '"]');
        if (!card || !data) return;
        const titleEl = card.querySelector('[data-field="title"]');
        const descEl = card.querySelector('[data-field="desc"]');
        const diffEl = card.querySelector('[data-field="difficulty"]');
        const durationEl = card.querySelector('[data-field="duration"]');
        if (titleEl) titleEl.textContent = data.title || '';
        if (descEl) descEl.textContent = data.desc || '';
        if (diffEl) diffEl.textContent = 'Difficulty: ' + (data.difficulty || '');
        if (durationEl) durationEl.textContent = (data.durationMinutes || 0) + ' min';
      };
      Object.keys(scenarios).forEach(k => updateScenarioCard(k, scenarios[k]));
      try {
        const exercises = await API.get('/exercises');
        const mapByTitle = new Map(exercises.map(ex => [ex.title, ex]));
        Object.keys(scenarios).forEach(k => {
          const sc = scenarios[k];
          const ex = mapByTitle.get(sc.matchTitle);
          if (!ex) return;
          updateScenarioCard(k, {
            title: ex.title,
            desc: ex.description,
            difficulty: ex.difficulty ? ex.difficulty.charAt(0) + ex.difficulty.slice(1).toLowerCase() : sc.difficulty,
            durationMinutes: ex.durationMinutes
          });
        });
      } catch (e) {}
      const hb = document.getElementById('hintBtn');
      try {
        const summary = await API.get('/progress/summary');
        const pp = document.getElementById('progressPercent');
        if (pp) pp.textContent = (summary.totalExercises > 0 ? Math.round(summary.completedExercises / summary.totalExercises * 100) : 0) + '%';
      } catch (e) {}
      if (hb) {
        const hints = ['Take a deep breath before responding.', 'Remember, it\'s okay to pause and think.', 'Start with a simple greeting.', 'Focus on the conversation, not your anxiety.', 'You\'ve got this!'];
        hb.addEventListener('click', () => this.toast(hints[Math.floor(Math.random() * hints.length)]));
      }
      document.querySelectorAll('.scenario-suggestion').forEach((btn, i) => {
        const suggestions = ['I\'d like a medium roast, please.', 'Can you tell me about the specials?', 'I\'ll have it with oat milk.'];
        if (suggestions[i]) btn.textContent = suggestions[i];
        btn.addEventListener('click', () => { const inp = document.getElementById('scenarioInput'); if (inp) inp.value = btn.textContent; });
      });
      const sendBtn = document.getElementById('scenarioSend');
      const input = document.getElementById('scenarioInput');
      const messages = document.getElementById('scenarioMessages');
      let currentExerciseId = null;
      API.get('/exercises').then(all => {
        const match = all.find(e => e.title === s.matchTitle);
        if (match) {
          currentExerciseId = match.id;
          API.post('/exercises/' + match.id + '/start').catch(() => {});
        }
      }).catch(() => {});
      const esBtn = document.querySelector('[data-action="end-session"]');
      if (esBtn) {
        esBtn.addEventListener('click', () => {
          if (currentExerciseId) {
            const current = parseInt(anxietyBar.style.width || '0') || 0;
            const score = Math.round(Math.max(10, 100 - current));
            API.post('/exercises/' + currentExerciseId + '/complete', { score, notes: 'Completed via practice session' }).catch(() => {});
          }
          window.location.href = 'dashboard.html';
        });
      }
      const addMsg = (text, isUser) => {
        if (!messages) return;
        const div = document.createElement('div');
        div.className = 'flex ' + (isUser ? 'justify-end' : 'justify-start') + ' mb-3';
        div.innerHTML = '<div class="' + (isUser ? 'chat-bubble-sent bg-primary text-on-primary' : 'chat-bubble-received bg-surface-container-high text-on-surface') + ' max-w-[75%] p-3 rounded-2xl text-sm">' + text + '</div>';
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
      };
      const endBtn = document.querySelector('[data-action="end-session"]');
      let sessionComplete = false;
      const updateLiveMetrics = () => {
        if (sessionComplete) return;
        if (anxietyBar && anxietyLabel) {
          const bump = Math.floor(Math.random() * 12) + 6;
          const current = parseInt(anxietyBar.style.width || '0') || 0;
          const next = Math.min(100, current + bump);
          anxietyBar.style.width = next + '%';
          anxietyLabel.textContent = next >= 70 ? 'HIGH' : next >= 40 ? 'ELEVATED' : 'STABLE';
        }
        const pp = document.getElementById('progressPercent');
        if (pp) {
          const cur = parseInt(pp.textContent || '0') || 0;
          const next = Math.min(100, cur + 10);
          pp.textContent = next + '%';
          if (next >= 100) {
            sessionComplete = true;
            if (endBtn) {
              endBtn.classList.remove('bg-surface-container-highest', 'text-on-surface-variant');
              endBtn.classList.add('bg-primary', 'text-on-primary', 'ring-2', 'ring-primary/40');
            }
            this.toast('Session complete! You can end the session.', 'success');
          }
        }
      };
      let userMsgCount = 0;
      const send = () => {
        if (!input || !input.value.trim()) return;
        userMsgCount++;
        addMsg(input.value.trim(), true);
        const msg = input.value.trim().toLowerCase();
        input.value = '';
        let reply;
        if (/latte|cappuccino|mocha|espresso|americano/.test(msg)) reply = 'Barista: "Great choice! That\'ll be $4.50."';
        else if (/muffin|cookie|pastry|cake|brownie|scone/.test(msg)) reply = 'Barista: "Sure! Would you like that warmed up?"';
        else if (/menu|special|recommend|suggestion/.test(msg)) reply = 'Barista: "Our seasonal special is a honey lavender latte — it\'s been really popular!"';
        else if (/thanks|thank you/.test(msg)) reply = 'Barista: "You\'re welcome! Have a great day!"';
        else if (/anxious|nervous|scared|worried/.test(msg)) reply = 'Barista: "Take your time, no rush at all. What can I get started for you?"';
        else if (/bye|goodbye|later|exit/.test(msg)) reply = 'Barista: "Thanks for coming in! See you next time."';
        else if (/hot|cold|size|large|small|medium/.test(msg)) reply = 'Barista: "Sure, any particular size? We have small, medium, and large."';
        else {
          const fallbacks = ['Barista: "Coming right up!"', 'Barista: "Anything else I can get for you?"', 'Barista: "We have a new seasonal flavor if you\'re interested."', 'Barista: "That\'s a great choice!"'];
          reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
        setTimeout(() => addMsg(reply, false), 800);
        updateLiveMetrics();
      };
      if (sendBtn) sendBtn.addEventListener('click', send);
      if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    },

    async analysis() {
      if (!this.token) { this.redirect('login.html'); return; }
      const content = await this.loadContent();
      const researchEl = document.getElementById('analysisResearch');
      if (researchEl && content && content.research) {
        const r = content.research;
        researchEl.textContent = 'Research shows that ' + r.minutesDaily + ' minutes of mindfulness daily can reduce social anxiety symptoms by up to ' + r.improvementPercent + '% over ' + r.durationMonths + ' months. You\'re doing great!';
      }
      const loadSummary = async () => {
        try {
          const summary = await API.get('/progress/summary');
          const streak = summary.currentStreak || 0;
          const totalSessions = summary.completedExercises || 0;
          const totalTime = summary.totalTimeMinutes || totalSessions * 15;
          el('analysisStreak', streak);
          el('analysisTime', totalTime + 'm');
          el('analysisSessions', totalSessions);
          el('analysisTitle', streak >= 7 ? 'On Fire!' : streak >= 3 ? 'Getting Steady' : streak >= 1 ? 'Nice Start!' : '');
          el('analysisRank', totalSessions > 0 ? 'Keep going! You\'ve completed ' + totalSessions + ' exercise' + (totalSessions !== 1 ? 's' : '') + '.' : '');
          const circle = document.getElementById('streakCircle');
          if (circle) {
            const max = 351.8;
            const pct = Math.min(streak / 30, 1);
            circle.style.strokeDashoffset = max - (max * pct);
          }
        } catch (e) {}
      };
      const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
      const loadAssessments = async () => {
        const hs = document.getElementById('analysisAssessmentHistory');
        if (!hs) return;
        try {
          const assessments = await API.get('/assessments');
          if (!assessments || assessments.length === 0) {
            hs.innerHTML = '<div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl"><div class="flex items-center gap-3"><span class="material-symbols-outlined text-primary" data-icon="calendar_month">calendar_month</span><div><p class="font-button text-sm text-on-surface">No assessments yet</p><p class="text-xs text-on-surface-variant"><a href="assessment.html" class="text-primary underline">Take the assessment</a> to see it here</p></div></div></div>';
          } else {
            const labels = { LOW: 'Low Anxiety', MODERATE: 'Mild Anxiety', HIGH: 'Moderate Anxiety', SEVERE: 'High Anxiety' };
            const colors = { LOW: 'emerald', MODERATE: 'amber', HIGH: 'orange', SEVERE: 'red' };
            hs.innerHTML = assessments.map(a => {
              const d = new Date(a.createdAt);
              const c = colors[a.anxietyLevel] || 'gray';
              return '<div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl"><div><span class="font-medium text-' + c + '-600">' + (labels[a.anxietyLevel] || a.anxietyLevel) + '</span><p class="text-xs text-on-surface-variant mt-0.5">Score: ' + a.score + '/40</p></div><span class="text-sm text-on-surface-variant">' + d.toLocaleDateString() + '</span></div>';
            }).join('');
          }
        } catch (e) {
          hs.innerHTML = '<div class="flex items-center justify-between p-4 bg-surface-container-low rounded-xl"><div class="flex items-center gap-3"><span class="material-symbols-outlined text-primary" data-icon="calendar_month">calendar_month</span><div><p class="font-button text-sm text-on-surface">Could not load history</p></div></div></div>';
        }
      };
      const loadActivity = async () => {
        const tbody = document.getElementById('activityHistoryBody');
        if (!tbody) return;
        try {
          const history = await API.get('/exercises/history');
          if (!history || history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-tertiary">No activity yet. <a href="scinario.html" class="text-primary underline">Start a practice</a></td></tr>';
          } else {
            const statusColors = { COMPLETED: 'emerald', IN_PROGRESS: 'amber', NOT_STARTED: 'slate' };
            const icons = { COFFEE_SHOP: 'local_cafe', JOB_INTERVIEW: 'badge', ASKING_DIRECTIONS: 'signpost', RETURNING_ITEM: 'assignment_return', SOCIAL_INTRO: 'group' };
            tbody.innerHTML = history.map(h => {
              const sc = statusColors[h.status] || 'slate';
              const d = h.completionDate ? new Date(h.completionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'In progress';
              const icon = icons[h.exerciseType] || 'play_circle';
              const gain = h.score ? '+' + h.score + '%' : '--';
              return '<tr class="hover:bg-surface-container-low transition-colors">' +
                '<td class="px-6 py-4"><div class="flex items-center gap-3"><div class="bg-primary-container/20 p-2 rounded-lg"><span class="material-symbols-outlined text-primary text-sm">' + icon + '</span></div><span class="font-medium text-on-surface">' + h.exerciseTitle + '</span></div></td>' +
                '<td class="px-6 py-4 text-body-md text-tertiary">' + d + '</td>' +
                '<td class="px-6 py-4 text-body-md text-tertiary">' + (h.durationMinutes || '--') + ' mins</td>' +
                '<td class="px-6 py-4"><span class="text-' + sc + '-600 font-medium">' + gain + '</span></td>' +
                '<td class="px-6 py-4"><span class="bg-' + sc + '-50 text-' + sc + '-700 px-3 py-1 rounded-full text-label-caps border border-' + sc + '-100">' + h.status.replace('_', ' ') + '</span></td></tr>';
            }).join('');
          }
        } catch (e) {
          tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-tertiary">Could not load activity history.</td></tr>';
        }
      };
      const loadChart = async () => {
        const svg = document.getElementById('trendChart');
        if (!svg) return;
        try {
          const history = await API.get('/exercises/history');
          const data = (history || []).filter(h => h.score != null).slice(-10);
          const points = data.length > 1 ? data.map((h, i) => ({ x: (i / (data.length - 1)) * 380 + 10, y: 80 - (h.score / 100) * 60 })) : [];
          if (points.length > 1) {
            let d = 'M' + points[0].x + ',' + points[0].y;
            for (let i = 1; i < points.length; i++) {
              const cx = (points[i - 1].x + points[i].x) / 2;
              d += ' Q' + cx + ',' + points[i - 1].y + ' ' + points[i].x + ',' + points[i].y;
            }
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d); path.setAttribute('fill', 'none'); path.setAttribute('stroke', '#445f8c');
            path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-width', '3');
            const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            area.setAttribute('d', d + ' V100 H0 Z'); area.setAttribute('fill', 'url(#gradient-blue)'); area.setAttribute('opacity', '0.1');
            svg.appendChild(area); svg.appendChild(path);
            const labels = ['','','','',''];
            const lx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            document.querySelector('.relative.h-64.w-full')?.insertAdjacentHTML('beforeend', '<div class="absolute bottom-[-24px] left-0 w-full flex justify-between text-label-caps text-tertiary-container"><span></span><span></span><span></span><span></span><span></span></div>');
          }
        } catch (e) {}
      };
      const loadAchievements = async () => {
        const list = document.getElementById('achievementsList');
        if (!list) return;
        const badges = [
          { icon: 'local_fire_department', label: 'First Practice', min: 1 },
          { icon: 'stars', label: '5 Sessions', min: 5 },
          { icon: 'emoji_events', label: '10 Sessions', min: 10 },
          { icon: 'military_tech', label: '25 Sessions', min: 25 },
          { icon: 'workspace_premium', label: '50 Sessions', min: 50 },
        ];
        try {
          const summary = await API.get('/progress/summary');
          const s = summary.completedExercises || 0;
          const earned = badges.filter(b => s >= b.min);
          const upcoming = badges.filter(b => s < b.min);
          const items = earned.map(b => '<div class="flex flex-col items-center gap-2 min-w-[90px] p-3 bg-primary-container/20 rounded-xl"><span class="material-symbols-outlined text-primary text-3xl">' + b.icon + '</span><span class="text-label-caps text-on-primary-container text-center">' + b.label + '</span></div>');
          if (upcoming.length > 0) {
            const n = upcoming[0];
            items.push('<div class="flex flex-col items-center gap-2 min-w-[90px] p-3 bg-surface-container-high rounded-xl opacity-50"><span class="material-symbols-outlined text-tertiary text-3xl">' + n.icon + '</span><span class="text-label-caps text-tertiary text-center">' + n.label + '</span></div>');
          }
          list.innerHTML = items.length > 0 ? items.join('') : '<p class="text-tertiary text-sm">Complete exercises to earn achievements.</p>';
        } catch (e) {
          list.innerHTML = '<p class="text-tertiary text-sm">Complete exercises to earn achievements.</p>';
        }
      };
      const wk = document.getElementById('periodWeekly');
      const mo = document.getElementById('periodMonthly');
      if (wk && mo) {
        const act = (el) => { [wk, mo].forEach(b => { b.classList.remove('bg-primary', 'text-on-primary', 'bg-primary-container/20', 'text-on-primary-container'); b.classList.add('bg-surface-container', 'text-tertiary'); }); el.classList.add('bg-primary-container/20', 'text-on-primary-container'); el.classList.remove('bg-surface-container', 'text-tertiary'); };
        wk.addEventListener('click', () => act(wk));
        mo.addEventListener('click', () => act(mo));
      }
      const streakBtn = document.getElementById('streakHistoryBtn');
      const streakModal = document.getElementById('streakModal');
      const streakClose = document.getElementById('streakModalClose');
      const streakList = document.getElementById('streakList');
      if (streakBtn && streakModal) {
        streakBtn.addEventListener('click', async () => {
          streakModal.classList.remove('hidden');
          if (streakList) {
            try {
              const history = await API.get('/exercises/history');
              const completed = (history || []).filter(h => h.status === 'COMPLETED' && h.completionDate);
              const grouped = {};
              completed.forEach(h => {
                const d = new Date(h.completionDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                if (!grouped[d]) grouped[d] = [];
                grouped[d].push(h);
              });
              const days = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
              if (days.length === 0) {
                streakList.innerHTML = '<p class="text-sm text-on-surface-variant">No completed exercises yet.</p>';
              } else {
                streakList.innerHTML = days.map(day =>
                  '<div class="p-3 rounded-lg bg-surface-container-low">' +
                    '<p class="text-xs font-semibold text-on-surface-variant mb-2">' + day + '</p>' +
                    grouped[day].map(h =>
                      '<div class="flex items-center justify-between py-1">' +
                        '<span class="text-sm text-on-surface">' + h.exerciseTitle + '</span>' +
                        '<span class="text-xs font-medium text-emerald-600">+' + (h.score || '--') + '%</span>' +
                      '</div>'
                    ).join('') +
                  '</div>'
                ).join('');
              }
            } catch (e) {
              if (streakList) streakList.innerHTML = '<p class="text-sm text-on-surface-variant">Failed to load history.</p>';
            }
          }
        });
      }
      if (streakClose && streakModal) {
        streakClose.addEventListener('click', () => streakModal.classList.add('hidden'));
        streakModal.addEventListener('click', (e) => { if (e.target === streakModal) streakModal.classList.add('hidden'); });
      }
      const reminderBtn = document.getElementById('setReminderBtn');
      const reminderModal = document.getElementById('reminderModal');
      const reminderInput = document.getElementById('reminderTimeInput');
      const reminderSave = document.getElementById('reminderSaveBtn');
      const reminderClose = document.getElementById('reminderModalClose');
      if (reminderBtn) {
        const savedTime = LS.get('reminderTime');
        if (savedTime) reminderBtn.textContent = 'Reminder: ' + savedTime;
        reminderBtn.addEventListener('click', () => {
          if (reminderInput && savedTime) reminderInput.value = savedTime;
          if (reminderModal) reminderModal.classList.remove('hidden');
        });
      }
      if (reminderSave && reminderBtn) {
        reminderSave.addEventListener('click', () => {
          const time = reminderInput?.value;
          if (time) {
            LS.set('reminderTime', time);
            reminderBtn.textContent = 'Reminder: ' + time;
            if (reminderModal) reminderModal.classList.add('hidden');
            this.toast('Daily reminder set for ' + time, 'success');
          }
        });
      }
      if (reminderClose && reminderModal) {
        reminderClose.addEventListener('click', () => reminderModal.classList.add('hidden'));
        reminderModal.addEventListener('click', (e) => { if (e.target === reminderModal) reminderModal.classList.add('hidden'); });
      }
      await Promise.all([loadSummary(), loadAssessments(), loadActivity(), loadChart(), loadAchievements()]);
    },

    async settings() {
      if (!this.token) { this.redirect('login.html'); return; }
      this.updateUserDisplay();
      try {
        const p = await API.get('/users/profile');
        const sv = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
        sv('settingsFirstName', p.firstName); sv('settingsLastName', p.lastName); sv('settingsEmail', p.email);
        sv('settingsUsername', p.username); sv('settingsAge', p.age);
      } catch (e) { /* use LS data */ }
      const saveBtn = document.getElementById('settingsSave');
      if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
          const gv = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
          const fn = gv('settingsFirstName'), ln = gv('settingsLastName');
          const un = gv('settingsUsername'), age = parseInt(gv('settingsAge')) || 18;
          if (!fn || !ln) { this.toast('Name fields are required', 'error'); return; }
          try {
            const updated = await API.put('/users/profile', { firstName: fn, lastName: ln, age, username: un });
            this.user = { ...this.user, ...updated, username: un || updated.username }; LS.set('user', this.user);
            this.updateUserDisplay(); this.toast('Profile updated!', 'success');
          } catch (err) { this.toast(err.message || 'Failed to update profile', 'error'); }
        });
      }
      const pwBtn = document.getElementById('settingsUpdatePw');
      if (pwBtn) {
        pwBtn.addEventListener('click', async () => {
          const cur = document.getElementById('settingsCurrentPw')?.value;
          const nw = document.getElementById('settingsNewPw')?.value;
          if (!cur || !nw) { this.toast('Fill in both password fields', 'error'); return; }
          if (nw.length < 6) { this.toast('New password must be at least 6 characters', 'error'); return; }
          try {
            await API.put('/users/password', { currentPassword: cur, newPassword: nw });
            this.toast('Password updated!', 'success');
            document.getElementById('settingsCurrentPw').value = '';
            document.getElementById('settingsNewPw').value = '';
          } catch (err) { this.toast(err.message || 'Failed to update password', 'error'); }
        });
      }
      const delBtn = document.getElementById('deleteAccount');
      if (delBtn) {
        delBtn.addEventListener('click', async () => {
          if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
          if (!confirm('This will permanently delete all your data. Continue?')) return;
          try {
            await API.del('/users/profile');
            this.clearAuth();
            this.toast('Account deleted', 'success');
            setTimeout(() => this.redirect('login.html'), 500);
          } catch (err) { this.toast(err.message || 'Failed to delete account', 'error'); }
        });
      }
      ['notifReminders', 'notifProgress', 'notifTips'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.checked = LS.get(id) !== false; el.addEventListener('change', () => LS.set(id, el.checked)); }
      });
    },

    async support() {
      const content = await this.loadContent();
      const tipEl = document.getElementById('supportPracticeTip');
      const respEl = document.getElementById('supportResponseTime');
      if (content && content.support) {
        const s = content.support;
        if (tipEl) tipEl.textContent = 'We recommend ' + s.recommendedDailyMin + '-' + s.recommendedDailyMax + ' minutes daily. Consistency matters more than duration. Even short sessions can build confidence over time.';
        if (respEl) respEl.textContent = 'Average response time: ' + s.averageResponseMinutes + ' minutes';
      }
      const form = document.getElementById('supportForm');
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const subject = document.getElementById('supportSubject')?.value.trim();
        const desc = document.getElementById('supportDescription')?.value.trim();
        if (!subject || !desc) { this.toast('Please fill in all fields', 'error'); return; }
        try {
          await API.post('/support', { subject, description: desc });
          this.toast('Report submitted. We\'ll review it soon.', 'success');
          form.reset();
        } catch (err) {
          this.toast(err.message || 'Failed to submit report', 'error');
        }
      });
    },

    async tip() {
      const content = await this.loadContent();
      const guideCount = document.getElementById('breathingGuidesCount');
      if (guideCount && content && content.guides) {
        guideCount.textContent = content.guides.breathingGuidesCount + ' Guides';
      }
      if (content && content.audioGuides) {
        document.querySelectorAll('[data-guide-duration]').forEach(el => {
          const idx = parseInt(el.getAttribute('data-guide-duration'));
          const guide = content.audioGuides[idx];
          if (!guide) return;
          const m = Math.floor(guide.durationSeconds / 60);
          const s = (guide.durationSeconds % 60).toString().padStart(2, '0');
          el.textContent = m + ':' + s;
        });
      }
      const modal = document.getElementById('audioModal');
      const audioTitle = document.getElementById('audioTitle');
      const audioDesc = document.getElementById('audioDesc');
      const audioProgress = document.getElementById('audioProgress');
      const audioCurrent = document.getElementById('audioCurrent');
      const audioTotal = document.getElementById('audioTotal');
      const audioPlay = document.getElementById('audioPlay');
      const audioClose = document.getElementById('audioClose');
      const audioSave = document.getElementById('audioSave');
      let playing = false;
      let timer = null;
      let duration = 0;
      let current = 0;
      const openModal = (guide) => {
        if (!modal || !guide) return;
        duration = guide.durationSeconds || 0;
        current = 0;
        if (audioTitle) audioTitle.textContent = guide.title || 'Audio Guide';
        if (audioDesc) audioDesc.textContent = 'A short guided session to help you reset and refocus.';
        if (audioTotal) {
          const m = Math.floor(duration / 60);
          const s = (duration % 60).toString().padStart(2, '0');
          audioTotal.textContent = m + ':' + s;
        }
        if (audioCurrent) audioCurrent.textContent = '0:00';
        if (audioProgress) audioProgress.style.width = '0%';
        if (audioPlay) audioPlay.textContent = 'Play';
        playing = false;
        modal.classList.remove('hidden');
      };
      const closeModal = () => {
        if (!modal) return;
        modal.classList.add('hidden');
        playing = false;
        if (timer) { clearInterval(timer); timer = null; }
      };
      const tick = () => {
        if (!playing) return;
        current = Math.min(duration, current + 1);
        const pct = duration ? Math.round((current / duration) * 100) : 0;
        if (audioProgress) audioProgress.style.width = pct + '%';
        if (audioCurrent) {
          const m = Math.floor(current / 60);
          const s = (current % 60).toString().padStart(2, '0');
          audioCurrent.textContent = m + ':' + s;
        }
        if (current >= duration) {
          playing = false;
          if (audioPlay) audioPlay.textContent = 'Replay';
          if (timer) { clearInterval(timer); timer = null; }
          this.toast('Guide complete. Nice work!', 'success');
        }
      };
      if (audioPlay) {
        audioPlay.addEventListener('click', () => {
          if (!duration) return;
          if (current >= duration) current = 0;
          playing = !playing;
          audioPlay.textContent = playing ? 'Pause' : 'Play';
          if (playing && !timer) timer = setInterval(tick, 1000);
          if (!playing && timer) { clearInterval(timer); timer = null; }
        });
      }
      if (audioClose) audioClose.addEventListener('click', closeModal);
      if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
      if (audioSave) {
        audioSave.addEventListener('click', () => {
          const saved = LS.get('savedGuides') || [];
          const title = audioTitle?.textContent || '';
          if (title && !saved.includes(title)) saved.push(title);
          LS.set('savedGuides', saved);
          this.toast('Saved to your tips', 'success');
        });
      }
      document.querySelectorAll('.audio-guide').forEach(el => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const idx = parseInt(el.getAttribute('data-guide-index'));
          const guide = content?.audioGuides?.[idx];
          openModal(guide || { title: 'Audio Guide', durationSeconds: 0 });
        });
      });
      document.querySelectorAll('.reading-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          const id = item.getAttribute('data-book-id');
          const panel = document.querySelector('.reading-details[data-book-id="' + id + '"]');
          if (panel) panel.classList.toggle('hidden');
        });
      });
      document.querySelectorAll('.save-reading').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = btn.closest('.reading-item');
          const title = card?.querySelector('.font-button')?.textContent || '';
          const saved = LS.get('savedReading') || [];
          if (title && !saved.includes(title)) saved.push(title);
          LS.set('savedReading', saved);
          this.toast('Saved to your reading list', 'success');
        });
      });
      const savedBtn = document.getElementById('savedTipsBtn');
      const savedModal = document.getElementById('savedTipsModal');
      const savedClose = document.getElementById('savedTipsClose');
      const savedList = document.getElementById('savedTipsList');
      if (savedBtn && savedModal) {
        savedBtn.addEventListener('click', () => {
          const reading = LS.get('savedReading') || [];
          const guides = LS.get('savedGuides') || [];
          if (savedList) {
            if (reading.length === 0 && guides.length === 0) {
              savedList.innerHTML = '<p class="text-sm text-on-surface-variant">No saved tips yet.</p>';
            } else {
              let html = '';
              if (reading.length > 0) {
                html += '<p class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Reading List</p>';
                html += reading.map((title, i) =>
                  '<div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-low mb-1">' +
                    '<span class="text-sm text-on-surface">' + title + '</span>' +
                    '<button class="text-xs text-primary hover:underline remove-saved-reading" data-index="' + i + '" type="button">Remove</button>' +
                  '</div>'
                ).join('');
              }
              if (guides.length > 0) {
                html += '<p class="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 mt-3">Audio Guides</p>';
                html += guides.map((title, i) =>
                  '<div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-low mb-1">' +
                    '<span class="text-sm text-on-surface">' + title + '</span>' +
                    '<button class="text-xs text-primary hover:underline remove-saved-guide" data-index="' + i + '" type="button">Remove</button>' +
                  '</div>'
                ).join('');
              }
              savedList.innerHTML = html;
              savedList.querySelectorAll('.remove-saved-reading').forEach(btn => {
                btn.addEventListener('click', () => {
                  const idx = parseInt(btn.dataset.index);
                  const arr = LS.get('savedReading') || [];
                  arr.splice(idx, 1);
                  LS.set('savedReading', arr);
                  savedBtn.click();
                });
              });
              savedList.querySelectorAll('.remove-saved-guide').forEach(btn => {
                btn.addEventListener('click', () => {
                  const idx = parseInt(btn.dataset.index);
                  const arr = LS.get('savedGuides') || [];
                  arr.splice(idx, 1);
                  LS.set('savedGuides', arr);
                  savedBtn.click();
                });
              });
            }
          }
          savedModal.classList.remove('hidden');
        });
      }
      if (savedClose && savedModal) {
        savedClose.addEventListener('click', () => savedModal.classList.add('hidden'));
        savedModal.addEventListener('click', (e) => { if (e.target === savedModal) savedModal.classList.add('hidden'); });
      }
      const suggestBtn = document.getElementById('suggestResourceBtn');
      const suggestModal = document.getElementById('suggestModal');
      const suggestClose = document.getElementById('suggestModalClose');
      const suggestTitle = document.getElementById('suggestTitle');
      const suggestUrl = document.getElementById('suggestUrl');
      const suggestDesc = document.getElementById('suggestDesc');
      const suggestSubmit = document.getElementById('suggestSubmitBtn');
      if (suggestBtn && suggestModal) {
        suggestBtn.addEventListener('click', () => suggestModal.classList.remove('hidden'));
      }
      if (suggestClose && suggestModal) {
        suggestClose.addEventListener('click', () => suggestModal.classList.add('hidden'));
        suggestModal.addEventListener('click', (e) => { if (e.target === suggestModal) suggestModal.classList.add('hidden'); });
      }
      if (suggestSubmit) {
        suggestSubmit.addEventListener('click', async () => {
          const title = suggestTitle?.value.trim();
          const desc = suggestDesc?.value.trim();
          if (!title) { this.toast('Please enter a resource title', 'error'); return; }
          const url = suggestUrl?.value.trim();
          const fullDesc = (url ? 'URL: ' + url + '\n' : '') + (desc || 'No description provided.');
          try {
            await API.post('/support', { subject: 'Resource Suggestion: ' + title, description: fullDesc });
            this.toast('Thanks for the suggestion!', 'success');
            if (suggestModal) suggestModal.classList.add('hidden');
            if (suggestTitle) suggestTitle.value = '';
            if (suggestUrl) suggestUrl.value = '';
            if (suggestDesc) suggestDesc.value = '';
          } catch (err) {
            this.toast(err.message || 'Failed to submit', 'error');
          }
        });
      }
      const si = document.getElementById('tipSearch');
      if (si) {
        si.addEventListener('input', () => {
          const q = si.value.toLowerCase().trim();
          document.querySelectorAll('.glass-card').forEach(c => {
            c.style.display = !q || c.textContent.toLowerCase().includes(q) ? '' : 'none';
          });
        });
      }
    },

    async loadContent() {
      try {
        return await API.get('/content');
      } catch (e) {
        return null;
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => App.init());
})();
