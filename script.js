let tasks = [];
let currentUser = '';
let activeFilter = 'all';
let focusSeconds = 25 * 60;
let focusInterval = null;
let completedFocusSessions = 0;

const $ = (id) => document.getElementById(id);
const safeRead = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
};
const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('darkMode') === 'true';
  document.body.classList.toggle('dark', savedTheme);
  $('themeToggle').textContent = savedTheme ? '☀️' : '🌙';
  $('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const dark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', String(dark));
    $('themeToggle').textContent = dark ? '☀️' : '🌙';
  });
  $('addTaskBtn')?.addEventListener('click', addTask);
  $('taskInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
  $('searchInput')?.addEventListener('input', renderTasks);
  $('clearAllBtn')?.addEventListener('click', () => {
    if (tasks.length && confirm('Delete all tasks? This cannot be undone.')) { tasks = []; saveTasks(); }
  });
  $('allTasks')?.addEventListener('click', () => setFilter('all'));
  $('importantTasks')?.addEventListener('click', () => setFilter('important'));
  $('completedTasks')?.addEventListener('click', () => setFilter('completed'));
  $('overdueTasks')?.addEventListener('click', () => setFilter('overdue'));
  $('pendingTasks')?.addEventListener('click', () => setFilter('pending'));
  $('focusStart')?.addEventListener('click', startFocus);
  $('focusPause')?.addEventListener('click', pauseFocus);
  $('focusReset')?.addEventListener('click', resetFocus);
  if (localStorage.getItem('isLoggedIn') === 'true') {
    const user = localStorage.getItem('lastUser');
    if (user && (localStorage.getItem('user_' + user) || user === localStorage.getItem('username'))) openApp(user);
    else { localStorage.removeItem('isLoggedIn'); }
  }
  updateFocusDisplay();
});

function signup() {
  const username = $('username').value.trim();
  const password = $('password').value;
  if (username.length < 3 || password.length < 4) { alert('Use a username with at least 3 characters and a password with at least 4 characters.'); return; }
  if (localStorage.getItem('user_' + username)) { alert('That username already exists. Please log in.'); return; }
  // Demo-only local account storage; this is not secure production authentication.
  localStorage.setItem('user_' + username, JSON.stringify({ password }));
  openApp(username);
  alert('Account created! Your tasks are saved in this browser.');
}
function login() {
  const username = $('username').value.trim();
  const password = $('password').value;
  const account = safeRead('user_' + username, null);
  // Backward compatibility with the original single-user localStorage format.
  const legacy = username === localStorage.getItem('username') && password === localStorage.getItem('password');
  if ((account && account.password === password) || legacy) openApp(username);
  else alert('Invalid username or password. If you are new, choose Sign Up.');
}
function openApp(username) {
  currentUser = username;
  $('auth-section').style.display = 'none';
  $('app-section').style.display = 'grid';
  tasks = safeRead('tasks_' + currentUser, []);
  if (!Array.isArray(tasks)) tasks = [];
  completedFocusSessions = Number(localStorage.getItem('focusSessions_' + currentUser) || 0);
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('lastUser', currentUser);
  setGreeting(); renderTasks(); updateFocusDisplay();
}
function logout() { pauseFocus(); localStorage.removeItem('isLoggedIn'); location.reload(); }
function setGreeting() {
  const hour = new Date().getHours();
  const msg = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  $('greeting').textContent = `${msg}, ${currentUser} 👋`;
}
function addTask() {
  const text = $('taskInput').value.trim();
  const date = $('dueDate').value;
  const priority = $('prioritySelect').value;
  if (!text) { alert('Please enter a task name.'); $('taskInput').focus(); return; }
  if (date && date < new Date().toISOString().slice(0, 10)) {
    if (!confirm('This date is in the past. Add it as an overdue task?')) return;
  }
  tasks.push({ id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())), text, date, completed: false, priority, important: priority === 'high', createdAt: new Date().toISOString() });
  $('taskInput').value = ''; $('dueDate').value = '';
  saveTasks(); $('taskInput').focus();
}
function saveTasks() {
  if (!currentUser) return;
  localStorage.setItem('tasks_' + currentUser, JSON.stringify(tasks));
  renderTasks();
}
function setFilter(filter) { activeFilter = filter; renderTasks(); }
function taskStatus(task) {
  if (task.completed) return 'Completed';
  if (!task.date) return 'No deadline';
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(task.date + 'T00:00:00');
  if (due < today) return 'Overdue';
  if (due.getTime() === today.getTime()) return 'Due today';
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (due.getTime() === tomorrow.getTime()) return 'Due tomorrow';
  return 'Upcoming';
}
function renderTasks() {
  const list = $('taskList'); if (!list) return;
  const query = ($('searchInput')?.value || '').toLowerCase().trim();
  const filtered = tasks.map((task, index) => ({task, index})).filter(({task}) => {
    const status = taskStatus(task);
    const matchesQuery = task.text.toLowerCase().includes(query);
    const matchesFilter = activeFilter === 'all' ||
      (activeFilter === 'important' && (task.important || task.priority === 'high')) ||
      (activeFilter === 'completed' && task.completed) ||
      (activeFilter === 'pending' && !task.completed) ||
      (activeFilter === 'overdue' && status === 'Overdue');
    return matchesQuery && matchesFilter;
  }).sort((a,b) => {
    const rank = s => s === 'Overdue' ? 0 : s === 'Due today' ? 1 : s === 'Due tomorrow' ? 2 : 3;
    return rank(taskStatus(a.task)) - rank(taskStatus(b.task));
  });
  list.innerHTML = '';
  $('emptyMsg').style.display = filtered.length ? 'none' : 'block';
  $('emptyMsg').textContent = tasks.length ? 'No tasks match this view. Try another filter. ✨' : 'No Tasks Yet 🚀 Add your first task above.';
  filtered.forEach(({task, index}) => {
    const li = document.createElement('li');
    const status = taskStatus(task);
    li.className = `task-card ${task.priority || 'medium'} ${status === 'Overdue' ? 'is-overdue' : status === 'Due today' ? 'is-due-today' : ''}`;
    li.innerHTML = `<div class="task-row"><div class="left"><label class="check-container" aria-label="Mark task complete"><input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})"></label></div><div class="center"><strong class="${task.completed ? 'completed' : ''}">${escapeHTML(task.text)}</strong><small>📅 ${task.date ? escapeHTML(task.date) : 'No deadline'}</small><span class="badge ${escapeHTML(task.priority || 'medium')}">${escapeHTML(task.priority || 'medium')} priority</span><span class="status-pill ${status.toLowerCase().replaceAll(' ', '-')}">${status === 'Overdue' ? '⚠️ ' : status === 'Due today' ? '⏰ ' : ''}${status}</span></div><div class="right"><button class="important-btn ${task.important ? 'active' : ''}" onclick="toggleImportant(${index})" aria-label="Toggle important">${task.important ? '★' : '☆'}</button><button onclick="editTask(${index})">Edit</button><button class="delete-btn" onclick="deleteTask(${index})">Delete</button><button class="focus-task-btn" onclick="selectFocusTask(${index})">Focus</button></div></div>`;
    list.appendChild(li);
  });
  updateStats(); updateUpcoming();
}
function toggleTask(index) { tasks[index].completed = !tasks[index].completed; saveTasks(); }
function editTask(index) {
  const value = prompt('Edit task name:', tasks[index].text);
  if (value === null) return;
  if (!value.trim()) { alert('Task name cannot be empty.'); return; }
  tasks[index].text = value.trim(); saveTasks();
}
function deleteTask(index) { if (confirm('Delete this task?')) { tasks.splice(index, 1); saveTasks(); } }
function toggleImportant(index) { tasks[index].important = !tasks[index].important; saveTasks(); }
function updateStats() {
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  $('total').textContent = tasks.length; $('pending').textContent = pending; $('completed').textContent = completed;
  $('circleTotal').textContent = `${completed}/${tasks.length}`;
  document.querySelector('.circle').style.setProperty('--progress', `${tasks.length ? completed / tasks.length * 360 : 0}deg`);
  $('allCount').textContent = tasks.length;
  $('importantCount').textContent = tasks.filter(t => t.important || t.priority === 'high').length;
  $('completedCount').textContent = completed;
  $('overdueCount').textContent = tasks.filter(t => taskStatus(t) === 'Overdue').length;
  $('pendingCount').textContent = pending;
  $('focusSessionsCount').textContent = completedFocusSessions;
}
function updateUpcoming() {
  const list = $('upcomingList');
  const upcoming = tasks.filter(t => t.date && !t.completed).sort((a,b) => a.date.localeCompare(b.date)).slice(0,4);
  list.innerHTML = upcoming.length ? '' : '<li>No upcoming tasks — enjoy the breathing room! 🌱</li>';
  upcoming.forEach(task => {
    const li = document.createElement('li');
    const status = taskStatus(task);
    li.innerHTML = `<strong>${escapeHTML(task.text)}</strong><br><small>📅 ${escapeHTML(task.date)} · ${escapeHTML(task.priority)} priority</small><br><span class="status-pill ${status.toLowerCase().replaceAll(' ', '-')}">${status}</span>`;
    list.appendChild(li);
  });
}
function searchTask() { renderTasks(); }
function selectFocusTask(index) { $('focusTaskName').textContent = tasks[index].text; $('focusCard').scrollIntoView({behavior:'smooth', block:'center'}); }
function updateFocusDisplay() { const m = String(Math.floor(focusSeconds / 60)).padStart(2,'0'); const s = String(focusSeconds % 60).padStart(2,'0'); $('focusTime').textContent = `${m}:${s}`; }
function startFocus() {
  if (focusInterval) return;
  $('focusStart').disabled = true;
  focusInterval = setInterval(() => {
    if (focusSeconds > 0) { focusSeconds--; updateFocusDisplay(); }
    if (focusSeconds === 0) { pauseFocus(); completedFocusSessions++; if (currentUser) localStorage.setItem('focusSessions_' + currentUser, String(completedFocusSessions)); updateStats(); alert('Focus session complete! Take a short break. 🎉'); }
  }, 1000);
}
function pauseFocus() { if (focusInterval) clearInterval(focusInterval); focusInterval = null; if ($('focusStart')) $('focusStart').disabled = false; }
function resetFocus() { pauseFocus(); focusSeconds = 25 * 60; updateFocusDisplay(); }
