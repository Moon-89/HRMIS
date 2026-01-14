const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Helper to check for admin emails
const isAdminEmail = (email) => {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return normalized === 'memona@hrmis.com' || normalized === 'memona@hrmis';
};

const nowTime = new Date();
const hoursAgo = (h) => new Date(nowTime.getTime() - h * 60 * 60 * 1000).toISOString();

// Seed initial users
let users = [
  { id: 1, name: 'Memona Admin', email: 'memona@hrmis.com', role: 'Admin', password: 'password123' }
];
let leaves = [
  { id: 1, userId: 1, startDate: '2026-01-15', endDate: '2026-01-18', reason: 'Family Visit', status: 'Pending', createdAt: hoursAgo(10), updatedAt: hoursAgo(10) },
];
let tasks = [
  { id: 1, title: 'Review Annual Reports', description: 'Check HR metrics', priority: 'High', status: 'InProgress', assignee: 1, createdAt: hoursAgo(24), updatedAt: hoursAgo(14) },
  { id: 3, title: 'Team Meeting Minutes', description: 'Draft summary', priority: 'Medium', status: 'Done', assignee: 1, createdAt: hoursAgo(4), updatedAt: hoursAgo(1) }
];

// Helpful GET for humans who open the URL in a browser
app.get('/auth/register', (req, res) => {
  return res.send('This endpoint accepts POST requests with JSON {name,email,password}. Use the frontend form or POST with curl/Postman.');
});

app.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
  const normalizedEmail = email.toLowerCase().trim();
  const exists = users.find(u => u.email.toLowerCase().trim() === normalizedEmail);
  if (exists) return res.status(409).json({ message: 'User already exists' });

  // Force Admin for Memona
  const role = isAdminEmail(normalizedEmail) ? 'Admin' : 'Employee';

  const user = { id: users.length + 1, name, email: normalizedEmail, role };
  users.push({ ...user, password });
  return res.status(201).json({ accessToken: `mock-token-${user.id}`, user });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const normalizedEmail = email.toLowerCase().trim();
  console.log(`Login Attempt - Email: [${normalizedEmail}], Password: [${password}]`);

  // Find user
  const u = users.find(x => x.email.toLowerCase().trim() === normalizedEmail);

  if (!u || u.password !== password) {
    // Special shortcut for Memona to ensure she is never blocked
    if (isAdminEmail(normalizedEmail) && password === 'password123') {
      const user = { id: 1, name: 'Memona', email: 'memona@hrmis.com', role: 'Admin' };
      return res.json({ accessToken: `mock-token-1`, user });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Force Admin for Memona
  const role = isAdminEmail(normalizedEmail) ? 'Admin' : u.role;
  const userData = { id: u.id, name: u.name, email: u.email, role: role };

  return res.json({ accessToken: `mock-token-${u.id}`, user: userData });
});

// USERS endpoints
app.get('/users', (req, res) => {
  const { q, role } = req.query;
  let out = users.slice();
  if (q) {
    const ql = q.toLowerCase();
    out = out.filter(u => (u.name && u.name.toLowerCase().includes(ql)) || (u.email && u.email.toLowerCase().includes(ql)));
  }
  if (role) out = out.filter(u => u.role === role);
  return res.json(out.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
});

app.post('/users', (req, res) => {
  console.log('POST /users', req.body);
  const { name, email, password, role } = req.body;
  if (!email || !name) return res.status(400).json({ message: 'Name and email required' });
  const exists = users.find(u => u.email === email);
  if (exists) return res.status(409).json({ message: 'User already exists' });
  const id = users.length + 1;
  const u = { id, name, email, role: role || 'Employee', password: password || 'pass' };
  users.push(u);
  return res.status(201).json({ id: u.id, name: u.name, email: u.email, role: u.role });
});

app.get('/users/:id', (req, res) => {
  const u = users.find(x => String(x.id) === String(req.params.id));
  if (!u) return res.status(404).json({ message: 'Not found' });
  return res.json({ id: u.id, name: u.name, email: u.email, role: u.role });
});

app.put('/users/:id', (req, res) => {
  console.log('PUT /users/:id', req.params.id, req.body);
  const idx = users.findIndex(x => String(x.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  users[idx] = { ...users[idx], ...req.body };
  return res.json({ id: users[idx].id, name: users[idx].name, email: users[idx].email, role: users[idx].role });
});

app.delete('/users/:id', (req, res) => {
  console.log('DELETE /users/:id', req.params.id);
  const idx = users.findIndex(x => String(x.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  users.splice(idx, 1);
  return res.json({ message: 'Deleted' });
});

app.get('/users/email/:email', (req, res) => {
  const u = users.find(x => x.email === req.params.email);
  if (!u) return res.status(404).json({ message: 'Not found' });
  return res.json({ id: u.id, name: u.name, email: u.email, role: u.role });
});

// profile endpoint: extracts ID from token
app.get('/users/profile', (req, res) => {
  const auth = req.headers.authorization || '';
  const match = auth.match(/mock-token-(\d+)/);
  if (!match) return res.status(401).json({ message: 'Unauthorized' });
  const userId = match[1];
  const u = users.find(x => String(x.id) === String(userId));
  if (!u) return res.status(404).json({ message: 'User not found' });

  // Force Admin for Memona
  const role = isAdminEmail(u.email) ? 'Admin' : u.role;
  return res.json({ id: u.id, name: u.name, email: u.email, role: role });
});

app.post('/auth/refresh', (req, res) => {
  const auth = req.headers.authorization || '';
  const match = auth.match(/mock-token-(\d+)/);
  if (!match) return res.status(401).json({ message: 'Missing token' });
  const userId = match[1];
  const u = users.find(x => String(x.id) === String(userId));
  if (!u) return res.status(401).json({ message: 'Invalid user' });

  const role = isAdminEmail(u.email) ? 'Admin' : u.role;
  const userData = { id: u.id, name: u.name, email: u.email, role: role };

  return res.json({ accessToken: `mock-token-${u.id}`, user: userData });
});

app.post('/auth/logout', (req, res) => {
  return res.json({ message: 'Logged out' });
});

app.get('/leaves', (req, res) => {
  const { status, userId } = req.query;
  let out = leaves.slice();
  if (status) out = out.filter(l => l.status === status);
  if (userId) out = out.filter(l => String(l.userId) === String(userId));

  // Attach user details for admin/manager view
  const results = out.map(l => {
    const u = users.find(x => String(x.id) === String(l.userId));
    return { ...l, user: u ? { name: u.name, email: u.email } : null };
  });

  return res.json(results);
});

app.post('/leaves', (req, res) => {
  console.log('POST /leaves', req.body);
  const { startDate, endDate, reason } = req.body;
  if (!startDate || !endDate || !reason) return res.status(400).json({ message: 'Missing fields' });
  const id = leaves.length + 1;
  const now = new Date().toISOString();
  // Allow client to provide `userId` (frontend includes current user's id).
  const newLeave = { id, userId: req.body.userId || 1, startDate, endDate, reason, status: 'Pending', createdAt: now, updatedAt: now };
  leaves.push(newLeave);
  return res.status(201).json(newLeave);
});

app.get('/leaves/:id', (req, res) => {
  const l = leaves.find(x => String(x.id) === String(req.params.id));
  if (!l) return res.status(404).json({ message: 'Not found' });
  const u = users.find(x => String(x.id) === String(l.userId));
  return res.json({ ...l, user: u ? { name: u.name, email: u.email } : null });
});

// app.put('/leaves/:id', (req, res) => {
//   console.log('PUT /leaves/:id', req.params.id, req.body);
//   const idx = leaves.findIndex(x => String(x.id) === String(req.params.id));
//   if (idx === -1) return res.status(404).json({ message: 'Not found' });
//   // merge fields
//   leaves[idx] = { ...leaves[idx], ...req.body, updatedAt: new Date().toISOString() };
//   return res.json(leaves[idx]);
// });
app.put('/leaves/:id', (req, res) => {
  console.log('PUT /leaves/:id', req.params.id, req.body);
  const idx = leaves.findIndex(x => String(x.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Not found' });

  const leave = leaves[idx];
  const userIdFromClient = req.body.userId;

  // ✅ Only allow if the user is the owner of the leave
  if (String(leave.userId) !== String(userIdFromClient)) {
    return res.status(403).json({ message: 'Access Denied: You can only edit your own leave.' });
  }

  // merge fields
  leaves[idx] = { ...leave, ...req.body, updatedAt: new Date().toISOString() };
  return res.json(leaves[idx]);
});




app.delete('/leaves/:id', (req, res) => {
  console.log('DELETE /leaves/:id', req.params.id);
  const idx = leaves.findIndex(x => String(x.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  leaves.splice(idx, 1);
  return res.json({ message: 'Deleted' });
});

// GET leaves for a specific user and optional status
function sendUserLeaves(req, res, statusParam) {
  const id = req.params.id;
  let out = leaves.filter(l => String(l.userId) === String(id));
  if (statusParam) {
    const normalized = statusParam[0].toUpperCase() + statusParam.slice(1).toLowerCase();
    out = out.filter(l => l.status === normalized);
  }
  return res.json(out);
}

app.get('/leaves/user/:id', (req, res) => {
  return sendUserLeaves(req, res, null);
});

app.get('/leaves/user/:id/:status', (req, res) => {
  return sendUserLeaves(req, res, req.params.status);
});

// TASKS endpoints (in-memory)
app.get('/tasks', (req, res) => {
  const { status, assignee } = req.query;
  let out = tasks.slice();
  if (status) out = out.filter(t => t.status === status);
  if (assignee) out = out.filter(t => String(t.assignee) === String(assignee));
  return res.json(out);
});

app.post('/tasks', (req, res) => {
  console.log('POST /tasks', req.body);
  const { title, description, priority, status: st, assignee } = req.body;
  if (!title) return res.status(400).json({ message: 'Title required' });
  const id = tasks.length + 1;
  const now = new Date().toISOString();
  const t = { id, title, description: description || '', priority: priority || 'Medium', status: st || 'Todo', assignee: assignee || null, createdAt: now, updatedAt: now };
  tasks.push(t);
  return res.status(201).json(t);
});

app.get('/tasks/:id', (req, res) => {
  const t = tasks.find(x => String(x.id) === String(req.params.id));
  if (!t) return res.status(404).json({ message: 'Not found' });
  return res.json(t);
});

app.put('/tasks/:id', (req, res) => {
  console.log('PUT /tasks/:id', req.params.id, req.body);
  const idx = tasks.findIndex(x => String(x.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  tasks[idx] = { ...tasks[idx], ...req.body, updatedAt: new Date().toISOString() };
  return res.json(tasks[idx]);
});

app.delete('/tasks/:id', (req, res) => {
  console.log('DELETE /tasks/:id', req.params.id);
  const idx = tasks.findIndex(x => String(x.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  tasks.splice(idx, 1);
  return res.json({ message: 'Deleted' });
});

const port = 4000;
app.listen(port, () => console.log(`Mock server listening on http://localhost:${port}`));

// Helpful root page to show available endpoints and current data
app.get('/', (req, res) => {
  res.send(`
    <html><body>
      <h2>Mock Server Running</h2>
      <p>Available endpoints:</p>
      <ul>
        <li>POST /auth/register</li>
        <li>POST /auth/login</li>
        <li>POST /auth/refresh</li>
        <li>POST /auth/logout</li>
        <li>GET /leaves</li>
        <li>POST /leaves</li>
        <li>GET /leaves/:id</li>
        <li>PUT /leaves/:id</li>
        <li>DELETE /leaves/:id</li>
        <li>GET /leaves/user/:id[/status]</li>
      </ul>
      <h3>In-memory leaves</h3>
      <pre>${JSON.stringify(leaves, null, 2)}</pre>
    </body></html>
  `);
});
