/* ============================================
   Daybook — Life Dashboard
   ============================================ */

(() => {
  "use strict";

  const KEYS = {
    NAME: "daybook_name",
    TASKS: "daybook_tasks",
    LINKS: "daybook_links",
    DURATION: "daybook_duration",
  };

  /* =========================================================
     GREETING + CLOCK + CUSTOM NAME (Challenge: custom name)
     ========================================================= */
  const clockEl = document.getElementById("clock");
  const dateLineEl = document.getElementById("dateLine");
  const greetingLineEl = document.getElementById("greetingLine");
  const editNameBtn = document.getElementById("editNameBtn");

  function getGreetingWord(hour) {
    if (hour < 5) return "Good night";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour12: false });
    const date = now.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    clockEl.textContent = time;
    dateLineEl.textContent = date;

    const name = localStorage.getItem(KEYS.NAME);
    const greetingWord = getGreetingWord(now.getHours());
    greetingLineEl.textContent = name ? `${greetingWord}, ${name}` : greetingWord;
  }

  editNameBtn.addEventListener("click", () => {
    const current = localStorage.getItem(KEYS.NAME) || "";
    const entered = prompt("What should we call you?", current);
    if (entered === null) return;
    const trimmed = entered.trim();
    if (trimmed) {
      localStorage.setItem(KEYS.NAME, trimmed);
    } else {
      localStorage.removeItem(KEYS.NAME);
    }
    updateClock();
  });

  updateClock();
  setInterval(updateClock, 1000);

  /* =========================================================
     FOCUS TIMER (Challenge: change Pomodoro time)
     ========================================================= */
  const timerDisplay = document.getElementById("timerDisplay");
  const startBtn = document.getElementById("startBtn");
  const stopBtn = document.getElementById("stopBtn");
  const resetBtn = document.getElementById("resetBtn");
  const ringProgress = document.getElementById("ringProgress");
  const timerSettingsBtn = document.getElementById("timerSettingsBtn");
  const timerSettings = document.getElementById("timerSettings");
  const durationInput = document.getElementById("durationInput");
  const saveDurationBtn = document.getElementById("saveDurationBtn");

  const RING_CIRCUMFERENCE = 552.9; // 2 * PI * 88

  let durationMinutes = parseInt(localStorage.getItem(KEYS.DURATION), 10) || 25;
  let remainingSeconds = durationMinutes * 60;
  let totalSeconds = remainingSeconds;
  let timerInterval = null;
  let isRunning = false;

  durationInput.value = durationMinutes;

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function renderTimer() {
    timerDisplay.textContent = formatTime(remainingSeconds);
    const fraction = totalSeconds === 0 ? 0 : remainingSeconds / totalSeconds;
    ringProgress.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - fraction));
  }

  function tick() {
    if (remainingSeconds <= 0) {
      stopTimer();
      renderTimer();
      timerDisplay.textContent = "Done!";
      return;
    }
    remainingSeconds -= 1;
    renderTimer();
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    timerInterval = setInterval(tick, 1000);
  }

  function stopTimer() {
    isRunning = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    clearInterval(timerInterval);
    timerInterval = null;
  }

  function resetTimer() {
    stopTimer();
    remainingSeconds = durationMinutes * 60;
    totalSeconds = remainingSeconds;
    renderTimer();
  }

  startBtn.addEventListener("click", startTimer);
  stopBtn.addEventListener("click", stopTimer);
  resetBtn.addEventListener("click", resetTimer);

  timerSettingsBtn.addEventListener("click", () => {
    timerSettings.hidden = !timerSettings.hidden;
  });

  saveDurationBtn.addEventListener("click", () => {
    const value = parseInt(durationInput.value, 10);
    if (!value || value < 1 || value > 120) {
      alert("Enter a duration between 1 and 120 minutes.");
      return;
    }
    durationMinutes = value;
    localStorage.setItem(KEYS.DURATION, String(durationMinutes));
    timerSettings.hidden = true;
    resetTimer();
  });

  renderTimer();

  /* =========================================================
     TO-DO LIST (Challenge: prevent duplicate tasks)
     ========================================================= */
  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const taskEmpty = document.getElementById("taskEmpty");
  const taskCount = document.getElementById("taskCount");
  const taskHint = document.getElementById("taskHint");

  function loadTasks() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.TASKS)) || [];
    } catch {
      return [];
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  }

  let tasks = loadTasks();

  function renderTasks() {
    taskList.innerHTML = "";
    taskEmpty.hidden = tasks.length > 0;
    taskCount.textContent = String(tasks.filter((t) => !t.done).length);

    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item" + (task.done ? " done" : "");
      li.dataset.id = task.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "task-check";
      checkbox.checked = task.done;
      checkbox.addEventListener("change", () => toggleTask(task.id));

      const text = document.createElement("span");
      text.className = "task-text";
      text.textContent = task.text;
      text.contentEditable = "true";
      text.addEventListener("blur", () => editTask(task.id, text.textContent));
      text.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          text.blur();
        }
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "task-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteTask(task.id));

      li.append(checkbox, text, deleteBtn);
      taskList.appendChild(li);
    });
  }

  function isDuplicate(text, excludeId = null) {
    const normalized = text.trim().toLowerCase();
    return tasks.some(
      (t) => t.text.trim().toLowerCase() === normalized && t.id !== excludeId
    );
  }

  taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = taskInput.value.trim();
    if (!value) return;

    if (isDuplicate(value)) {
      taskHint.hidden = false;
      return;
    }
    taskHint.hidden = true;

    tasks.push({ id: crypto.randomUUID(), text: value, done: false });
    saveTasks(tasks);
    renderTasks();
    taskInput.value = "";
    taskInput.focus();
  });

  taskInput.addEventListener("input", () => {
    taskHint.hidden = true;
  });

  function toggleTask(id) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    saveTasks(tasks);
    renderTasks();
  }

  function editTask(id, newText) {
    const trimmed = newText.trim();
    if (!trimmed) {
      deleteTask(id);
      return;
    }
    if (isDuplicate(trimmed, id)) {
      renderTasks(); // revert to stored value, ignore the edit
      return;
    }
    tasks = tasks.map((t) => (t.id === id ? { ...t, text: trimmed } : t));
    saveTasks(tasks);
    renderTasks();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks(tasks);
    renderTasks();
  }

  renderTasks();

  /* =========================================================
     QUICK LINKS
     ========================================================= */
  const linkForm = document.getElementById("linkForm");
  const linkNameInput = document.getElementById("linkNameInput");
  const linkUrlInput = document.getElementById("linkUrlInput");
  const linkList = document.getElementById("linkList");
  const linkEmpty = document.getElementById("linkEmpty");

  function loadLinks() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.LINKS)) || [];
    } catch {
      return [];
    }
  }

  function saveLinks(links) {
    localStorage.setItem(KEYS.LINKS, JSON.stringify(links));
  }

  let links = loadLinks();

  function normalizeUrl(url) {
    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }

  function renderLinks() {
    linkList.innerHTML = "";
    linkEmpty.hidden = links.length > 0;

    links.forEach((link) => {
      const chip = document.createElement("div");
      chip.className = "chip";

      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = link.name;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.textContent = "✕";
      removeBtn.setAttribute("aria-label", `Remove ${link.name}`);
      removeBtn.addEventListener("click", () => {
        links = links.filter((l) => l.id !== link.id);
        saveLinks(links);
        renderLinks();
      });

      chip.append(a, removeBtn);
      linkList.appendChild(chip);
    });
  }

  linkForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();
    if (!name || !url) return;

    links.push({ id: crypto.randomUUID(), name, url: normalizeUrl(url) });
    saveLinks(links);
    renderLinks();
    linkNameInput.value = "";
    linkUrlInput.value = "";
    linkNameInput.focus();
  });

  renderLinks();
})();