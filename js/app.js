/* ============================================================
   app.js — Daily To Do List
   All features: Greeting, Focus Timer, To-Do List, Quick Links
   Storage: localStorage only (no backend)
   ============================================================ */

'use strict';

/* ============================================================
   SECTION 0 — THEME TOGGLE
   Storage key: 'dts_theme'  ('dark' | 'light')
   ============================================================ */
const THEME_KEY    = 'dts_theme';
const themeToggle  = document.getElementById('theme-toggle');
const themeIcon    = document.getElementById('theme-icon');

/**
 * Applies the given theme to <html> and updates the icon.
 * @param {'dark'|'light'} theme
 */
function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeIcon.textContent = '☀️';
    themeToggle.setAttribute('aria-label', 'Switch to dark theme');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.textContent = '🌙';
    themeToggle.setAttribute('aria-label', 'Switch to light theme');
  }
}

/** Toggles between dark and light, then persists the choice. */
function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'dark';
  const next    = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

themeToggle.addEventListener('click', toggleTheme);

// Apply saved preference on load (default: dark)
applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

/* ============================================================
   SECTION 1 — GREETING NAME
   Storage key: 'dts_name'
   ============================================================ */
const NAME_KEY       = 'dts_name';
const greetingNameEl = document.getElementById('greeting-name');
const editNameBtn    = document.getElementById('edit-name-btn');
const nameModal      = document.getElementById('name-modal');
const nameInput      = document.getElementById('name-input');
const nameSaveBtn    = document.getElementById('name-save-btn');
const nameCancelBtn  = document.getElementById('name-cancel-btn');

/** Loads the saved name and renders it, or prompts on first visit. */
function initName() {
  const saved = localStorage.getItem(NAME_KEY);
  if (saved) {
    renderName(saved);
  } else {
    // First visit — open the modal automatically
    openNameModal();
  }
}

/**
 * Renders the name in the greeting row.
 * @param {string} name
 */
function renderName(name) {
  greetingNameEl.textContent = name || 'there';
}

/** Opens the name edit modal. */
function openNameModal() {
  const current = localStorage.getItem(NAME_KEY) || '';
  nameInput.value = current;
  nameModal.classList.add('open');
  // Small delay so the modal animation plays before focus
  setTimeout(() => nameInput.focus(), 50);
}

/** Saves the name and closes the modal. */
function saveName() {
  const name = nameInput.value.trim();
  if (!name) return;
  localStorage.setItem(NAME_KEY, name);
  renderName(name);
  closeNameModal();
}

/** Closes the name modal without saving. */
function closeNameModal() {
  // Only allow closing if a name is already saved (prevent skipping first-visit prompt)
  if (!localStorage.getItem(NAME_KEY)) return;
  nameModal.classList.remove('open');
}

editNameBtn.addEventListener('click', openNameModal);
nameSaveBtn.addEventListener('click', saveName);
nameCancelBtn.addEventListener('click', closeNameModal);

nameModal.addEventListener('click', e => {
  if (e.target === nameModal) closeNameModal();
});

nameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveName();
  if (e.key === 'Escape') closeNameModal();
});

// Init on load
initName();


/* ============================================================
   SECTION 2 — GREETING & CLOCK
   ============================================================ */
const greetingText = document.getElementById('greeting-text');
const greetingDate = document.getElementById('greeting-date');
const greetingTime = document.getElementById('greeting-time');

/**
 * Returns a greeting string based on the current hour.
 * @param {number} hour - 0-23
 * @returns {string}
 */
function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good Morning! ☀️';
  if (hour >= 12 && hour < 17) return 'Good Afternoon! 🌤️';
  if (hour >= 17 && hour < 21) return 'Good Evening! 🌇';
  return 'Good Night! 🌙';
}

/**
 * Formats a Date object into a readable date string.
 * e.g. "Saturday, August 1, 2026"
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
  });
}

/**
 * Formats a Date object into HH:MM:SS (24-hour).
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

/** Updates the greeting section every second. */
function updateClock() {
  const now = new Date();
  greetingTime.textContent = formatTime(now);
  greetingDate.textContent = formatDate(now);
  greetingText.textContent = getGreeting(now.getHours());
}

// Initialise immediately then update every second
updateClock();
setInterval(updateClock, 1000);


/* ============================================================
   SECTION 3 — FOCUS TIMER (25 minutes)
   ============================================================ */
const TIMER_DURATION = 25 * 60; // seconds

const timerDisplay  = document.getElementById('timer-display');
const timerLabel    = document.getElementById('timer-label');
const btnStart      = document.getElementById('timer-start');
const btnStop       = document.getElementById('timer-stop');
const btnReset      = document.getElementById('timer-reset');

let timerRemaining  = TIMER_DURATION;
let timerInterval   = null;
let timerRunning    = false;

/**
 * Converts seconds to MM:SS string.
 * @param {number} totalSeconds
 * @returns {string}
 */
function secondsToMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Renders the current timer value and state classes. */
function renderTimer() {
  timerDisplay.textContent = secondsToMMSS(timerRemaining);
  timerDisplay.classList.toggle('running',  timerRunning && timerRemaining > 0);
  timerDisplay.classList.toggle('finished', timerRemaining === 0);
}

/** Starts or resumes the countdown. */
function startTimer() {
  if (timerRunning || timerRemaining === 0) return;

  timerRunning = true;
  timerLabel.textContent = 'Focus mode — stay on task!';
  renderTimer();

  timerInterval = setInterval(() => {
    timerRemaining--;
    renderTimer();

    if (timerRemaining === 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerLabel.textContent = '🎉 Session complete! Take a break.';
    }
  }, 1000);
}

/** Pauses the countdown. */
function stopTimer() {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning = false;
  timerLabel.textContent = 'Paused. Resume whenever you\'re ready.';
  renderTimer();
}

/** Resets the countdown to 25:00. */
function resetTimer() {
  clearInterval(timerInterval);
  timerRunning    = false;
  timerRemaining  = TIMER_DURATION;
  timerLabel.textContent = 'Ready to focus?';
  renderTimer();
}

btnStart.addEventListener('click', startTimer);
btnStop.addEventListener('click',  stopTimer);
btnReset.addEventListener('click', resetTimer);

// Initial render
renderTimer();


/* ============================================================
   SECTION 4 — TO-DO LIST
   Storage key: 'dts_tasks'
   Task shape: { id, text, done, createdAt }
   ============================================================ */
const TASKS_KEY = 'dts_tasks';

const todoInput    = document.getElementById('todo-input');
const todoAddBtn   = document.getElementById('todo-add-btn');
const todoListEl   = document.getElementById('todo-list');
const todoEmpty    = document.getElementById('todo-empty');
const todoCount    = document.getElementById('todo-count');
const filterBtns   = document.querySelectorAll('.filter-btn');

// Edit modal elements
const editModal     = document.getElementById('edit-modal');
const editInput     = document.getElementById('edit-input');
const editSaveBtn   = document.getElementById('edit-save-btn');
const editCancelBtn = document.getElementById('edit-cancel-btn');

let tasks       = [];
let activeFilter = 'all';
let editingId    = null;

// ---- Storage helpers ----

/** Loads tasks from localStorage. */
function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
  } catch {
    tasks = [];
  }
}

/** Persists tasks to localStorage. */
function saveTasks() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

// ---- CRUD ----

/**
 * Briefly shakes an input element to signal an error.
 * @param {HTMLInputElement} input
 */
function shakeInput(input) {
  input.classList.remove('input-shake');
  // Force reflow so the animation restarts if triggered twice quickly
  void input.offsetWidth;
  input.classList.add('input-shake');
}

/**
 * Shows a temporary error message below an input, then removes it.
 * @param {HTMLInputElement} input
 * @param {string} message
 */
function showInputError(input, message) {
  // Remove any existing error tooltip on this input
  const existing = input.parentElement.querySelector('.input-error-msg');
  if (existing) existing.remove();

  const msg = document.createElement('span');
  msg.className   = 'input-error-msg';
  msg.textContent = message;
  input.parentElement.appendChild(msg);

  // Auto-remove after 2.5 seconds
  setTimeout(() => msg.remove(), 2500);
}

/**
 * Adds a new task.
 * @param {string} text
 */
function addTask(text) {
  text = text.trim();
  if (!text) return;

  // Reject duplicates (case-insensitive comparison)
  const isDuplicate = tasks.some(
    t => t.text.toLowerCase() === text.toLowerCase()
  );

  if (isDuplicate) {
    shakeInput(todoInput);
    showInputError(todoInput, 'Task already exists!');
    return;
  }

  tasks.push({
    id:        Date.now(),
    text,
    done:      false,
    createdAt: new Date().toISOString(),
  });

  saveTasks();
  renderTasks();
}

/**
 * Toggles the done state of a task.
 * @param {number} id
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  renderTasks();
}

/**
 * Deletes a task by id.
 * @param {number} id
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

/**
 * Opens the edit modal for a task.
 * @param {number} id
 */
function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;
  editInput.value = task.text;
  editModal.classList.add('open');
  editInput.focus();
}

/** Saves the edited task text. */
function saveEdit() {
  const text = editInput.value.trim();
  if (!text) return;

  const task = tasks.find(t => t.id === editingId);
  if (task) {
    task.text = text;
    saveTasks();
    renderTasks();
  }

  closeEditModal();
}

/** Closes the edit modal without saving. */
function closeEditModal() {
  editModal.classList.remove('open');
  editingId = null;
  editInput.value = '';
}

// ---- Render ----

/** Returns tasks filtered by the active filter tab. */
function getFilteredTasks() {
  if (activeFilter === 'active') return tasks.filter(t => !t.done);
  if (activeFilter === 'done')   return tasks.filter(t =>  t.done);
  return tasks;
}

/**
 * Creates a single <li> element for a task.
 * @param {object} task
 * @returns {HTMLLIElement}
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `todo-item${task.done ? ' done' : ''}`;
  li.dataset.id = task.id;

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type      = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked   = task.done;
  checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'not done' : 'done'}`);
  checkbox.addEventListener('change', () => toggleTask(task.id));

  // Text
  const span = document.createElement('span');
  span.className   = 'todo-text';
  span.textContent = task.text;

  // Actions wrapper
  const actions = document.createElement('div');
  actions.className = 'todo-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn-icon edit';
  editBtn.textContent = '✏️';
  editBtn.setAttribute('aria-label', `Edit task: ${task.text}`);
  editBtn.addEventListener('click', () => openEditModal(task.id));

  const delBtn = document.createElement('button');
  delBtn.className = 'btn-icon delete';
  delBtn.textContent = '🗑️';
  delBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
  delBtn.addEventListener('click', () => deleteTask(task.id));

  actions.appendChild(editBtn);
  actions.appendChild(delBtn);

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(actions);

  return li;
}

/** Re-renders the full task list. */
function renderTasks() {
  const filtered = getFilteredTasks();

  todoListEl.innerHTML = '';

  if (filtered.length === 0) {
    todoEmpty.style.display = 'block';
    todoCount.textContent   = '';
  } else {
    todoEmpty.style.display = 'none';
    filtered.forEach(task => todoListEl.appendChild(createTaskElement(task)));

    const doneCount   = tasks.filter(t => t.done).length;
    const totalCount  = tasks.length;
    todoCount.textContent = `${doneCount} / ${totalCount} completed`;
  }
}

// ---- Event Listeners (To-Do) ----

todoAddBtn.addEventListener('click', () => {
  addTask(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

todoInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addTask(todoInput.value);
    todoInput.value = '';
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderTasks();
  });
});

editSaveBtn.addEventListener('click', saveEdit);
editCancelBtn.addEventListener('click', closeEditModal);

// Close modal on overlay click
editModal.addEventListener('click', e => {
  if (e.target === editModal) closeEditModal();
});

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && editModal.classList.contains('open')) closeEditModal();
});

// Save on Enter inside edit input
editInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') saveEdit();
});

// ---- Init tasks ----
loadTasks();
renderTasks();


/* ============================================================
   SECTION 5 — QUICK LINKS
   Storage key: 'dts_links'
   Link shape: { id, name, url }
   ============================================================ */
const LINKS_KEY = 'dts_links';

const linkNameInput = document.getElementById('link-name-input');
const linkUrlInput  = document.getElementById('link-url-input');
const linkAddBtn    = document.getElementById('link-add-btn');
const linksGrid     = document.getElementById('links-grid');
const linksEmpty    = document.getElementById('links-empty');

let links = [];

// ---- Storage helpers ----

/** Loads links from localStorage. */
function loadLinks() {
  try {
    links = JSON.parse(localStorage.getItem(LINKS_KEY)) || [];
  } catch {
    links = [];
  }

  // Seed default links if storage is empty
  if (links.length === 0) {
    links = [
      { id: 1, name: 'Google',   url: 'https://www.google.com' },
      { id: 2, name: 'YouTube',  url: 'https://www.youtube.com' },
      { id: 3, name: 'GitHub',   url: 'https://github.com' },
    ];
    saveLinks();
  }
}

/** Persists links to localStorage. */
function saveLinks() {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

// ---- CRUD ----

/**
 * Adds a new quick link.
 * @param {string} name
 * @param {string} url
 */
function addLink(name, url) {
  name = name.trim();
  url  = url.trim();

  if (!name || !url) {
    alert('Please enter both a label and a URL.');
    return;
  }

  // Prepend https:// if the user forgot the protocol
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  try {
    new URL(url); // validate URL format
  } catch {
    alert('Please enter a valid URL (e.g. https://example.com).');
    return;
  }

  links.push({ id: Date.now(), name, url });
  saveLinks();
  renderLinks();
}

/**
 * Deletes a quick link by id.
 * @param {number} id
 */
function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

// ---- Render ----

/**
 * Builds the favicon URL for a given site URL.
 * Uses Google's favicon service as a reliable fallback.
 * @param {string} url
 * @returns {string}
 */
function faviconUrl(url) {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?sz=32&domain=${origin}`;
  } catch {
    return '';
  }
}

/**
 * Creates a single link item element.
 * @param {object} link
 * @returns {HTMLDivElement}
 */
function createLinkElement(link) {
  const wrapper = document.createElement('div');
  wrapper.className = 'link-item';

  // The anchor button
  const anchor = document.createElement('a');
  anchor.href      = link.url;
  anchor.target    = '_blank';
  anchor.rel       = 'noopener noreferrer';
  anchor.className = 'link-btn';
  anchor.setAttribute('aria-label', `Open ${link.name}`);

  const favicon = document.createElement('img');
  favicon.src       = faviconUrl(link.url);
  favicon.alt       = '';
  favicon.className = 'link-favicon';
  favicon.width     = 16;
  favicon.height    = 16;
  // Hide broken favicon images gracefully
  favicon.addEventListener('error', () => { favicon.style.display = 'none'; });

  const nameSpan = document.createElement('span');
  nameSpan.textContent = link.name;

  anchor.appendChild(favicon);
  anchor.appendChild(nameSpan);

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.className   = 'link-delete-btn';
  delBtn.textContent = '✕';
  delBtn.setAttribute('aria-label', `Remove link: ${link.name}`);
  delBtn.addEventListener('click', () => deleteLink(link.id));

  wrapper.appendChild(anchor);
  wrapper.appendChild(delBtn);

  return wrapper;
}

/** Re-renders all quick links. */
function renderLinks() {
  linksGrid.innerHTML = '';

  if (links.length === 0) {
    linksEmpty.style.display = 'block';
  } else {
    linksEmpty.style.display = 'none';
    links.forEach(link => linksGrid.appendChild(createLinkElement(link)));
  }
}

// ---- Event Listeners (Links) ----

linkAddBtn.addEventListener('click', () => {
  addLink(linkNameInput.value, linkUrlInput.value);
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
});

linkUrlInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addLink(linkNameInput.value, linkUrlInput.value);
    linkNameInput.value = '';
    linkUrlInput.value  = '';
  }
});

// ---- Init links ----
loadLinks();
renderLinks();
