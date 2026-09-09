const todoInput = document.getElementById('todo-input');
const addButton = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');

function createTodoItem(value) {
  const listItem = document.createElement('li');
  listItem.className = 'todo-item';

  const label = document.createElement('label');
  label.className = 'todo-label';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';

  const text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = value;

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = value;
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
    text.classList.toggle('completed', checkbox.checked);
  });

  const saveEdit = () => {
    const updatedValue = editInput.value.trim();

    if (updatedValue) {
      text.textContent = updatedValue;
      text.style.display = 'inline';
      editInput.style.display = 'none';
      listItem.classList.remove('editing');
      editButton.textContent = 'Düzenle';
      return;
    }

    editInput.value = text.textContent;
    text.style.display = 'inline';
    editInput.style.display = 'none';
    listItem.classList.remove('editing');
    editButton.textContent = 'Düzenle';
  };

  const cancelEdit = () => {
    editInput.value = text.textContent;
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

function addTodo() {
  const value = todoInput.value.trim();

  if (!value) {
    todoInput.focus();
    return;
  }

  const listItem = createTodoItem(value);
  todoList.appendChild(listItem);

  todoInput.value = '';
  todoInput.focus();
}

addButton.addEventListener('click', addTodo);

todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTodo();
  }
});
