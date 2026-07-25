// Point this at wherever your FastAPI app is running.
const API_BASE = 'http://127.0.0.1:8000';

const QUOTES = [
  '"Doing what you love is the cornerstone of having abundance in your life." — Wayne Dyer',
  '"The secret of getting ahead is getting started." — Mark Twain',
  '"Small daily improvements are the key to staggering long-term results." — Anonymous',
  '"Done is better than perfect." — Anonymous',
];

let todos = [];

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadTodos(){
  const list = document.getElementById('task-list');
  try {
    const res = await fetch(`${API_BASE}/todos`);
    if(!res.ok) throw new Error(`API returned ${res.status}`);
    todos = await res.json();
    render();
  } catch (err) {
    console.error(err);
    list.innerHTML = `<div class="empty-state">Can't reach the API — is uvicorn running at ${API_BASE}?</div>`;
    document.getElementById('remaining-text').textContent = 'Your remaining todos : —';
  }
}

function render(){
  const list = document.getElementById('task-list');
  const remaining = todos.filter(t => !t.completed).length;
  document.getElementById('remaining-text').textContent = `Your remaining todos : ${remaining}`;

  if (todos.length === 0){
    list.innerHTML = `<div class="empty-state">No tasks yet — add one above.</div>`;
    return;
  }

  list.innerHTML = '';
  todos.forEach(todo=>{
    const row = document.createElement('div');
    row.className = `task-row ${todo.completed ? 'completed' : ''}`;
    row.innerHTML = `
      <div class="checkbox" data-action="toggle">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      </div>
      <div class="task-text" data-action="toggle">${escapeHtml(todo.title)}</div>
      <button class="remove-btn" data-action="delete" aria-label="Delete task">✕</button>
    `;
    row.querySelectorAll('[data-action="toggle"]').forEach(el=>
      el.addEventListener('click', ()=> toggleTodo(todo))
    );
    row.querySelector('[data-action="delete"]').addEventListener('click', ()=> deleteTodo(todo));
    list.appendChild(row);
  });
}

async function addTodo(){
  const input = document.getElementById('add-input');
  const title = input.value.trim();
  if (!title) return;
  input.value = '';
  try {
    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title })
    });
    if(!res.ok) throw new Error(`API returned ${res.status}`);
    const newTodo = await res.json();
    todos.push(newTodo);
    render();
  } catch (err){
    console.error(err);
    alert('Could not add task — check the console and confirm the API is running.');
  }
}

async function toggleTodo(todo){
  const newStatus = !todo.completed;
  try {
    const res = await fetch(`${API_BASE}/todos/${todo.id}`, {
      method: 'PATCH',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ completed: newStatus })
    });
    if(!res.ok) throw new Error(`API returned ${res.status}`);
    todo.completed = newStatus;
    render();
  } catch (err){
    console.error(err);
    alert('Could not update task — check the console and confirm the API is running.');
  }
}

async function deleteTodo(todo){
  try {
    const res = await fetch(`${API_BASE}/todos/${todo.id}`, { method: 'DELETE' });
    if(!res.ok && res.status !== 204) throw new Error(`API returned ${res.status}`);
    todos = todos.filter(t => t.id !== todo.id);
    render();
  } catch (err){
    console.error(err);
    alert('Could not delete task — check the console and confirm the API is running.');
  }
}

document.getElementById('add-btn').addEventListener('click', addTodo);
document.getElementById('add-input').addEventListener('keydown', (e)=>{
  if (e.key === 'Enter') addTodo();
});

// Rotate the footer quote so it doesn't feel static on repeat visits
document.getElementById('quote').textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];

loadTodos();