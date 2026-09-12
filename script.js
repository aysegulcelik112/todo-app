// DOM Elements
const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const clearAllButton = document.getElementById('clear-all-btn');
const prioritySelect = document.getElementById('priority-select');
const categorySelect = document.getElementById('category-select');
const deadlineInput = document.getElementById('deadline-input');
const repeatSelect = document.getElementById('repeat-select');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const filterButtons = document.querySelectorAll('.filter-btn');

// Modals
const themeBtn = document.getElementById('theme-btn');
const statsBtn = document.getElementById('stats-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');

const STORAGE_KEY = 'kodlama-ajandam-items';
const GAME_DATA_KEY = 'kodlama-ajandam-game';
let memoryTasks = [];
let currentFilter = 'all';
let searchQuery = '';
let categoryFilterValue = 'all';
let currentTheme = 'retro';

// Game Data
let gameData = {
  level: 1,
  xp: 0,
  streak: 0,
  lastCompletionDate: null,
  achievements: []
};

// Storage Functions
function readStorage() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        return JSON.parse(raw);
      }
    }
  } catch (error) {}
  return memoryTasks;
}

function writeStorage(tasks) {
  memoryTasks = tasks;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  } catch (error) {}
}

function loadGameData() {
  try {
    const data = localStorage.getItem(GAME_DATA_KEY);
    if (data) {
      gameData = JSON.parse(data);
    }
  } catch (error) {}
}

function saveGameData() {
  try {
    localStorage.setItem(GAME_DATA_KEY, JSON.stringify(gameData));
  } catch (error) {}
}

function loadTheme() {
  try {
    const theme = localStorage.getItem('theme');
    if (theme) {
      currentTheme = theme;
      document.body.className = `theme-${theme}`;
    }
  } catch (error) {}
}

function saveTheme(theme) {
  currentTheme = theme;
  document.body.className = `theme-${theme}`;
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {}
}

function loadTasks() {
  const storedTasks = readStorage();

  if (!Array.isArray(storedTasks)) {
    return [];
  }

  return storedTasks
    .filter((task) => task && typeof task.text === 'string')
    .map((task) => ({
      text: task.text.trim(),
      completed: Boolean(task.completed),
      priority: task.priority || 'medium',
      category: task.category || 'other',
      deadline: task.deadline || null,
      repeat: task.repeat || 'none',
      starred: Boolean(task.starred),
      note: task.note || '',
      createdAt: task.createdAt || Date.now(),
      id: task.id || Date.now() + Math.random()
    }))
    .filter((task) => task.text);
}

let tasks = loadTasks();
loadGameData();
loadTheme();

// Helper Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  return `${day}/${month}`;
}

function isToday(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isThisWeek(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

function addXP(amount) {
  gameData.xp += amount;
  const maxXP = gameData.level * 100;
  
  if (gameData.xp >= maxXP) {
    gameData.level++;
    gameData.xp = gameData.xp - maxXP;
    showNotification(`🎉 Seviye Atladın! Artık ${gameData.level}. seviyesin!`);
  }
  
  saveGameData();
  updateGameUI();
}

function updateStreak() {
  const today = new Date().toDateString();
  const lastDate = gameData.lastCompletionDate;
  
  if (!lastDate) {
    gameData.streak = 1;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastDate === today) {
      // Already counted today
      return;
    } else if (lastDate === yesterday.toDateString()) {
      gameData.streak++;
    } else {
      gameData.streak = 1;
    }
  }
  
  gameData.lastCompletionDate = today;
  saveGameData();
  updateGameUI();
}

function updateGameUI() {
  document.getElementById('user-level').textContent = gameData.level;
  document.getElementById('current-xp').textContent = gameData.xp;
  
  const maxXP = gameData.level * 100;
  document.getElementById('max-xp').textContent = maxXP;
  
  const xpPercent = (gameData.xp / maxXP) * 100;
  document.getElementById('xp-fill').style.width = xpPercent + '%';
  
  document.getElementById('streak-count').textContent = gameData.streak;
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Create Todo Item
function createTodoItem(task) {
  const listItem = document.createElement('li');
  listItem.className = `todo-item priority-${task.priority}`;
  listItem.dataset.id = task.id;
  if (task.starred) listItem.classList.add('starred');

  const priorityBar = document.createElement('div');
  priorityBar.className = 'priority-bar';

  const label = document.createElement('label');
  label.className = 'todo-label';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked = task.completed;

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'todo-content-wrapper';

  const text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = task.text;

  if (task.completed) {
    text.classList.add('completed');
  }

  const metaInfo = document.createElement('div');
  metaInfo.className = 'todo-meta';

  const categoryBadge = document.createElement('span');
  categoryBadge.className = `category-badge category-${task.category}`;
  const categoryIcons = {
    work: '💼', personal: '🏠', shopping: '🛒', 
    health: '💪', learning: '📚', other: '📌'
  };
  const categoryNames = {
    work: 'İş', personal: 'Kişisel', shopping: 'Alışveriş',
    health: 'Sağlık', learning: 'Öğrenme', other: 'Diğer'
  };
  categoryBadge.textContent = categoryIcons[task.category] + ' ' + categoryNames[task.category];
  metaInfo.appendChild(categoryBadge);

  if (task.deadline) {
    const deadlineBadge = document.createElement('span');
    deadlineBadge.className = 'deadline-badge';
    const deadlineDate = new Date(task.deadline);
    const today = new Date();
    const isOverdue = deadlineDate < today && !task.completed;
    const isTodayDeadline = isToday(task.deadline);
    
    if (isOverdue) {
      deadlineBadge.classList.add('overdue');
      deadlineBadge.textContent = '⚠️ Geçti: ' + formatDate(task.deadline);
    } else if (isTodayDeadline) {
      deadlineBadge.classList.add('today');
      deadlineBadge.textContent = '📅 Bugün';
    } else {
      deadlineBadge.textContent = '📅 ' + formatDate(task.deadline);
    }
    metaInfo.appendChild(deadlineBadge);
  }

  if (task.repeat !== 'none') {
    const repeatBadge = document.createElement('span');
    repeatBadge.className = 'repeat-badge';
    const repeatTexts = { daily: '🔁 Günlük', weekly: '🔁 Haftalık', monthly: '🔁 Aylık' };
    repeatBadge.textContent = repeatTexts[task.repeat];
    metaInfo.appendChild(repeatBadge);
  }

  if (task.note) {
    const noteIcon = document.createElement('span');
    noteIcon.className = 'note-icon';
    noteIcon.textContent = '📝';
    noteIcon.title = 'Not var';
    metaInfo.appendChild(noteIcon);
  }

  contentWrapper.appendChild(text);
  contentWrapper.appendChild(metaInfo);

  if (task.note) {
    const noteSection = document.createElement('div');
    noteSection.className = 'task-note';
    noteSection.textContent = task.note;
    contentWrapper.appendChild(noteSection);
  }

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = task.text;

  const starButton = document.createElement('button');
  starButton.type = 'button';
  starButton.className = 'star-btn';
  starButton.innerHTML = task.starred ? '⭐' : '☆';
  starButton.title = task.starred ? 'Favorilerden Çıkar' : 'Favorilere Ekle';

  const noteButton = document.createElement('button');
  noteButton.type = 'button';
  noteButton.className = 'note-btn';
  noteButton.textContent = '📝';
  noteButton.title = 'Not Ekle/Düzenle';

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'edit-btn';
  editButton.textContent = 'Düzenle';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-btn';
  deleteButton.textContent = 'Sil';

  label.appendChild(checkbox);
  label.appendChild(contentWrapper);
  label.appendChild(editInput);

  listItem.appendChild(priorityBar);
  listItem.appendChild(label);
  listItem.appendChild(starButton);
  listItem.appendChild(noteButton);
  listItem.appendChild(editButton);
  listItem.appendChild(deleteButton);

  // Star functionality
  starButton.addEventListener('click', () => {
    task.starred = !task.starred;
    starButton.innerHTML = task.starred ? '⭐' : '☆';
    starButton.title = task.starred ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
    listItem.classList.toggle('starred');
    saveTasks();
    if (currentFilter === 'starred') renderTasks();
  });

  // Note functionality
  noteButton.addEventListener('click', () => {
    const note = prompt('Not ekle/düzenle:', task.note || '');
    if (note !== null) {
      task.note = note;
      saveTasks();
      renderTasks();
    }
  });

  // Checkbox
  checkbox.addEventListener('change', () => {
    task.completed = checkbox.checked;
    text.classList.toggle('completed', task.completed);
    
    if (task.completed) {
      addXP(10);
      updateStreak();
      showNotification('✅ Görev tamamlandı! +10 XP');
      
      if (task.repeat !== 'none') {
        handleRepeatTask(task);
      }
    }
    
    saveTasks();
    updateTaskCounter();
  });

  // Edit functionality
  const saveEdit = () => {
    const updatedValue = editInput.value.trim();
    if (updatedValue) {
      task.text = updatedValue;
      text.textContent = updatedValue;
    } else {
      editInput.value = task.text;
    }
    text.style.display = 'inline';
    contentWrapper.style.display = 'block';
    editInput.style.display = 'none';
    listItem.classList.remove('editing');
    editButton.textContent = 'Düzenle';
    saveTasks();
  };

  editButton.addEventListener('click', () => {
    if (listItem.classList.contains('editing')) {
      saveEdit();
    } else {
      listItem.classList.add('editing');
      editButton.textContent = 'Kaydet';
      text.style.display = 'none';
      contentWrapper.style.display = 'none';
      editInput.style.display = 'inline-block';
      editInput.focus();
    }
  });

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') {
      editInput.value = task.text;
      saveEdit();
    }
  });

  // Delete
  deleteButton.addEventListener('click', () => {
    const index = tasks.findIndex((t) => t.id === task.id);
    if (index !== -1) {
      tasks.splice(index, 1);
      saveTasks();
    }
    listItem.remove();
    updateTaskCounter();
  });

  return listItem;
}

function handleRepeatTask(task) {
  if (!task.deadline) return;
  
  const newTask = { ...task };
  newTask.id = Date.now() + Math.random();
  newTask.completed = false;
  
  const deadline = new Date(task.deadline);
  
  if (task.repeat === 'daily') {
    deadline.setDate(deadline.getDate() + 1);
  } else if (task.repeat === 'weekly') {
    deadline.setDate(deadline.getDate() + 7);
  } else if (task.repeat === 'monthly') {
    deadline.setMonth(deadline.getMonth() + 1);
  }
  
  newTask.deadline = deadline.toISOString().split('T')[0];
  tasks.push(newTask);
  saveTasks();
  renderTasks();
}

// Render Tasks
function renderTasks() {
  todoList.innerHTML = '';

  let filteredTasks = tasks.filter(task => {
    // Filter by status
    if (currentFilter === 'active' && task.completed) return false;
    if (currentFilter === 'completed' && !task.completed) return false;
    if (currentFilter === 'starred' && !task.starred) return false;
    if (currentFilter === 'today' && (!task.deadline || !isToday(task.deadline))) return false;
    if (currentFilter === 'week' && (!task.deadline || !isThisWeek(task.deadline))) return false;
    
    // Filter by category
    if (categoryFilterValue !== 'all' && task.category !== categoryFilterValue) return false;
    
    // Filter by search
    if (searchQuery && !task.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Sort: starred first, then by priority, then by deadline
  filteredTasks.sort((a, b) => {
    if (a.starred !== b.starred) return b.starred - a.starred;
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return 0;
  });

  filteredTasks.forEach((task) => {
    todoList.appendChild(createTodoItem(task));
  });

  updateTaskCounter();
}

function updateTaskCounter() {
  const totalCount = tasks.length;
  const completedCount = tasks.filter(task => task.completed).length;
  const pendingCount = totalCount - completedCount;

  document.getElementById('task-count').textContent = totalCount;
  document.getElementById('completed-count').textContent = completedCount;
  document.getElementById('pending-count').textContent = pendingCount;

  const counterNumber = document.getElementById('task-count');
  counterNumber.style.transform = 'scale(1.2)';
  setTimeout(() => {
    counterNumber.style.transform = 'scale(1)';
  }, 200);

  // Category stats
  updateCategoryStats();
}

function updateCategoryStats() {
  const categoryStats = document.getElementById('category-stats');
  categoryStats.innerHTML = '';
  
  const categories = ['work', 'personal', 'shopping', 'health', 'learning', 'other'];
  const categoryNames = {
    work: '💼 İş', personal: '🏠 Kişisel', shopping: '🛒 Alışveriş',
    health: '💪 Sağlık', learning: '📚 Öğrenme', other: '📌 Diğer'
  };
  
  categories.forEach(cat => {
    const count = tasks.filter(t => t.category === cat).length;
    if (count > 0) {
      const statItem = document.createElement('span');
      statItem.className = 'category-stat-item';
      statItem.innerHTML = `${categoryNames[cat]}: <strong>${count}</strong>`;
      categoryStats.appendChild(statItem);
    }
  });
}

function saveTasks() {
  writeStorage(tasks);
}

function addTodo() {
  const value = todoInput.value.trim();

  if (!value) {
    showErrorMessage('⚠ Lütfen bir görev yazın!');
    todoInput.focus();
    return;
  }

  const newTask = {
    text: value,
    completed: false,
    priority: prioritySelect.value,
    category: categorySelect.value,
    deadline: deadlineInput.value || null,
    repeat: repeatSelect.value,
    starred: false,
    note: '',
    createdAt: Date.now(),
    id: Date.now() + Math.random()
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  todoInput.value = '';
  deadlineInput.value = '';
  prioritySelect.value = 'medium';
  categorySelect.value = 'other';
  repeatSelect.value = 'none';
  todoInput.focus();
  
  showNotification('✨ Görev eklendi! +5 XP');
  addXP(5);
}

function showErrorMessage(message) {
  const existingError = document.querySelector('.error-message');
  if (existingError) existingError.remove();

  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;

  const form = document.querySelector('.todo-form');
  form.parentElement.insertBefore(errorDiv, form.nextSibling);

  todoInput.classList.add('error-shake');

  setTimeout(() => {
    errorDiv.style.opacity = '0';
    errorDiv.style.transform = 'translateY(-20px)';
    setTimeout(() => errorDiv.remove(), 300);
  }, 3000);

  setTimeout(() => todoInput.classList.remove('error-shake'), 500);
}

// Event Listeners
addButton.addEventListener('click', addTodo);

clearAllButton.addEventListener('click', () => {
  if (confirm('Tüm görevleri silmek istediğinize emin misiniz?')) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') addTodo();
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  renderTasks();
});

categoryFilter.addEventListener('change', (e) => {
  categoryFilterValue = e.target.value;
  renderTasks();
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    e.preventDefault();
    addTodo();
  }
  
  if (e.ctrlKey && e.key === '/') {
    e.preventDefault();
    searchInput.focus();
  }
  
  if (e.key === 'Escape') {
    closeAllModals();
  }
});

// Modal Functions
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.target.closest('.modal').style.display = 'none';
  });
});

document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});

// Theme Modal
themeBtn.addEventListener('click', () => openModal('theme-modal'));

document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    const theme = card.dataset.theme;
    saveTheme(theme);
    closeModal('theme-modal');
    showNotification(`🎨 Tema değiştirildi: ${card.textContent.trim()}`);
  });
});

// Stats Modal
statsBtn.addEventListener('click', () => {
  openModal('stats-modal');
  updateStatsModal();
});

function updateStatsModal() {
  // Productivity score
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const score = total > 0 ? Math.round((completed / total) * 100) : 0;
  document.getElementById('productivity-score').textContent = score;
  
  // Achievements
  const achievementsEl = document.getElementById('achievements');
  achievementsEl.innerHTML = '';
  
  const achievements = [
    { icon: '🌟', name: 'İlk Adım', desc: 'İlk görevini ekle', unlocked: tasks.length > 0 },
    { icon: '🏆', name: '10 Görev', desc: '10 görev tamamla', unlocked: tasks.filter(t => t.completed).length >= 10 },
    { icon: '🔥', name: '7 Gün Streak', desc: '7 gün üst üste görev tamamla', unlocked: gameData.streak >= 7 },
    { icon: '⭐', name: 'Organize', desc: '5 görevi favorilere ekle', unlocked: tasks.filter(t => t.starred).length >= 5 },
    { icon: '📚', name: 'Planlayıcı', desc: '10 göreve tarih ekle', unlocked: tasks.filter(t => t.deadline).length >= 10 },
    { icon: '🎯', name: 'Uzman', desc: '5. seviyeye ulaş', unlocked: gameData.level >= 5 }
  ];
  
  achievements.forEach(ach => {
    const achEl = document.createElement('div');
    achEl.className = `achievement ${ach.unlocked ? 'unlocked' : 'locked'}`;
    achEl.innerHTML = `
      <div class="ach-icon">${ach.icon}</div>
      <div class="ach-info">
        <div class="ach-name">${ach.name}</div>
        <div class="ach-desc">${ach.desc}</div>
      </div>
    `;
    achievementsEl.appendChild(achEl);
  });
  
  // Category chart
  const chartEl = document.getElementById('category-chart');
  chartEl.innerHTML = '';
  
  const categories = ['work', 'personal', 'shopping', 'health', 'learning', 'other'];
  const categoryNames = {
    work: 'İş', personal: 'Kişisel', shopping: 'Alışveriş',
    health: 'Sağlık', learning: 'Öğrenme', other: 'Diğer'
  };
  
  categories.forEach(cat => {
    const count = tasks.filter(t => t.category === cat).length;
    if (count > 0) {
      const percent = (count / tasks.length) * 100;
      const barEl = document.createElement('div');
      barEl.className = 'chart-bar';
      barEl.innerHTML = `
        <div class="chart-label">${categoryNames[cat]}</div>
        <div class="chart-bar-container">
          <div class="chart-bar-fill category-${cat}" style="width: ${percent}%"></div>
        </div>
        <div class="chart-value">${count}</div>
      `;
      chartEl.appendChild(barEl);
    }
  });
}

// Export/Import
exportBtn.addEventListener('click', () => openModal('export-modal'));
importBtn.addEventListener('click', () => openModal('import-modal'));

document.getElementById('export-json').addEventListener('click', () => {
  const data = JSON.stringify({ tasks, gameData }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kodlama-ajandam-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification('📄 JSON dosyası indirildi!');
  closeModal('export-modal');
});

document.getElementById('export-csv').addEventListener('click', () => {
  let csv = 'Görev,Öncelik,Kategori,Durum,Tarih\n';
  tasks.forEach(t => {
    csv += `"${t.text}","${t.priority}","${t.category}","${t.completed ? 'Tamamlandı' : 'Bekliyor'}","${t.deadline || '-'}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kodlama-ajandam-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showNotification('📊 CSV dosyası indirildi!');
  closeModal('export-modal');
});

document.getElementById('export-print').addEventListener('click', () => {
  window.print();
  closeModal('export-modal');
});

document.getElementById('import-json').addEventListener('click', () => {
  document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.tasks) {
          tasks = [...tasks, ...data.tasks];
          saveTasks();
          renderTasks();
        }
        if (data.gameData) {
          gameData = data.gameData;
          saveGameData();
          updateGameUI();
        }
        showNotification('✅ Veriler başarıyla içe aktarıldı!');
        closeModal('import-modal');
      } catch (error) {
        alert('Hata: Geçersiz dosya formatı!');
      }
    };
    reader.readAsText(file);
  }
});

// Initialize
renderTasks();
updateGameUI();
