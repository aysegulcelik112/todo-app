const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const clearAllButton = document.getElementById('clear-all-btn');
const STORAGE_KEY = 'kodlama-ajandam-items';
let memoryTasks = [];

function readStorage() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw !== null) {
        return JSON.parse(raw);
      }
    }
  } catch (error) {
    // Storage may be blocked in some browser contexts.
  }

  return memoryTasks;
}

function writeStorage(tasks) {
  memoryTasks = tasks;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  } catch (error) {
    // Storage may be blocked in some browser contexts.
  }
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
      completed: Boolean(task.completed)
    }))
    .filter((task) => task.text);
}

let tasks = loadTasks();

function saveTasks() {
  writeStorage(tasks);
}

function createTodoItem(task) {
  const listItem = document.createElement('li');
  listItem.className = 'todo-item';

  const label = document.createElement('label');
  label.className = 'todo-label';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked = task.completed;

  const text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = task.text;

  if (task.completed) {
    text.classList.add('completed');
  }

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = task.text;
  editInput.setAttribute('aria-label', 'Görevi düzenle');

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'edit-btn';
  editButton.textContent = 'Düzenle';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-btn';
  deleteButton.textContent = 'Sil';

  label.appendChild(checkbox);
  label.appendChild(text);
  label.appendChild(editInput);

  listItem.appendChild(label);
  listItem.appendChild(editButton);
  listItem.appendChild(deleteButton);

  checkbox.addEventListener('change', () => {
    task.completed = checkbox.checked;
    text.classList.toggle('completed', task.completed);
    saveTasks();
  });

  const saveEdit = () => {
    const updatedValue = editInput.value.trim();

    if (updatedValue) {
      task.text = updatedValue;
      text.textContent = updatedValue;
    } else {
      editInput.value = task.text;
    }

    text.style.display = 'inline';
    editInput.style.display = 'none';
    listItem.classList.remove('editing');
    editButton.textContent = 'Düzenle';
    saveTasks();
  };

  const cancelEdit = () => {
    editInput.value = task.text;
    text.style.display = 'inline';
    editInput.style.display = 'none';
    listItem.classList.remove('editing');
    editButton.textContent = 'Düzenle';
  };

  editButton.addEventListener('click', () => {
    if (listItem.classList.contains('editing')) {
      saveEdit();
      return;
    }

    listItem.classList.add('editing');
    editButton.textContent = 'Kaydet';
    text.style.display = 'none';
    editInput.style.display = 'inline-block';
    editInput.focus();
    editInput.select();
  });

  deleteButton.addEventListener('click', () => {
    const taskIndex = tasks.findIndex((item) => item === task);

    if (taskIndex !== -1) {
      tasks.splice(taskIndex, 1);
      saveTasks();
    }

    listItem.remove();
  });

  editInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      saveEdit();
    }

    if (event.key === 'Escape') {
      cancelEdit();
    }
  });

  editInput.addEventListener('blur', () => {
    if (listItem.classList.contains('editing')) {
      saveEdit();
    }
  });

  return listItem;
}

function renderTasks() {
  todoList.innerHTML = '';

  tasks.forEach((task) => {
    todoList.appendChild(createTodoItem(task));
  });
}

function addTodo() {
  const value = todoInput.value.trim();

  if (!value) {
    showErrorMessage('⚠ Lütfen bir görev yazın!');
    todoInput.focus();
    return;
  }

  tasks.push({
    text: value,
    completed: false
  });

  saveTasks();
  renderTasks();

  todoInput.value = '';
  todoInput.focus();
}

function showErrorMessage(message) {
  // Mevcut uyarıyı kaldır
  const existingError = document.querySelector('.error-message');
  if (existingError) {
    existingError.remove();
  }

  // Yeni uyarı oluştur
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;

  // Form'dan sonra ekle
  const form = document.querySelector('.todo-form');
  form.parentElement.insertBefore(errorDiv, form.nextSibling);

  // Input'a hata stili ekle
  todoInput.classList.add('error-shake');

  // 3 saniye sonra kaldır
  setTimeout(() => {
    errorDiv.style.opacity = '0';
    errorDiv.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      errorDiv.remove();
    }, 300);
  }, 3000);

  // Shake animasyonunu kaldır
  setTimeout(() => {
    todoInput.classList.remove('error-shake');
  }, 500);
}

addButton.addEventListener('click', addTodo);

clearAllButton.addEventListener('click', () => {
  tasks = [];
  saveTasks();
  renderTasks();
});

todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTodo();
  }
});

renderTasks();
