const express = require('express');
const cors = require('cors');
const { sql } = require('@vercel/postgres');
const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const ADMIN_EMAIL = 'memona@hrmis.com';

const isAdmin = (u) => {
    if (!u || !u.email) return false;
    const email = u.email.toLowerCase().trim();
    return email === ADMIN_EMAIL || email.includes('memona@hrmis') || u.role === 'Admin';
};

const r = (path) => [`/api${path}`, path];

// --- AUTH MIDDLEWARE ---
app.use(async (req, res, next) => {
    const auth = req.headers.authorization || '';
    const match = auth.match(/mock-token-(\d+)/);

    req.userId = null;
    req.user = null;
    req.userRole = 'Guest';

    if (match) {
        const uid = parseInt(match[1]);
        if (!isNaN(uid)) {
            try {
                const { rows } = await sql`SELECT id, email, role, name FROM users WHERE id = ${uid}`;
                if (rows.length > 0) {
                    req.userId = rows[0].id;
                    req.user = rows[0];
                    req.userRole = isAdmin(rows[0]) ? 'Admin' : rows[0].role;
                }
            } catch (e) { console.error("Auth Error:", e.message); }
        }
    }
    next();
});

// --- SETUP ROUTE ---
app.get(r('/setup-db'), async (req, res) => {
    try {
        await sql`CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, role TEXT);`;
        await sql`CREATE TABLE IF NOT EXISTS leaves (id SERIAL PRIMARY KEY, user_id INTEGER, start_date TEXT, end_date TEXT, reason TEXT, status TEXT DEFAULT 'Pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;
        await sql`CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title TEXT, description TEXT, priority TEXT, status TEXT, assignee INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);`;
        await sql`INSERT INTO users (name, email, password, role) VALUES ('Memona Admin', 'memona@hrmis.com', 'password123', 'Admin') ON CONFLICT (email) DO NOTHING;`;
        res.json({ message: "Database Ready" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- AUTH ---
app.post(r('/auth/login'), async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await sql`SELECT id, name, email, role FROM users WHERE email = ${email?.toLowerCase().trim()} AND password = ${password}`;
        if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
        const u = rows[0];
        const role = isAdmin(u) ? 'Admin' : u.role;
        res.json({ accessToken: `mock-token-${u.id}`, refreshToken: `ref-token-${u.id}`, user: { ...u, role } });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post(r('/auth/refresh'), async (req, res) => {
    const rf = req.body.refreshToken || '';
    const parts = rf.split('-');
    const uid = parts.length >= 3 ? parseInt(parts[2]) : NaN;

    if (isNaN(uid)) return res.status(401).json({ message: 'Invalid session format' });

    try {
        const { rows } = await sql`SELECT id, name, email, role FROM users WHERE id = ${uid}`;
        if (rows.length === 0) return res.status(401).json({ message: 'Session expired' });
        const u = rows[0];
        const role = isAdmin(u) ? 'Admin' : u.role;
        res.json({ accessToken: `mock-token-${u.id}`, refreshToken: `ref-token-${u.id}`, user: { ...u, role } });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- TASKS ---
app.get(r('/tasks'), async (req, res) => {
    try {
        let q;
        if (req.userRole === 'Admin') {
            q = await sql`SELECT * FROM tasks ORDER BY id DESC`;
        } else {
            q = await sql`SELECT * FROM tasks WHERE assignee = ${req.userId} ORDER BY id DESC`;
        }
        res.json(q.rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get(r('/tasks/:id'), async (req, res) => {
    try {
        const tid = parseInt(req.params.id);
        if (isNaN(tid)) return res.status(400).json({ message: 'Invalid task ID' });

        const { rows } = await sql`SELECT * FROM tasks WHERE id = ${tid}`;
        if (rows.length === 0) return res.status(404).json({ message: 'Task not found' });

        // Admin sees all, User sees only theirs
        if (req.userRole !== 'Admin' && rows[0].assignee !== req.userId) {
            return res.status(403).json({ message: 'Access Denied' });
        }
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post(r('/tasks'), async (req, res) => {
    if (req.userRole !== 'Admin') return res.status(403).json({ message: 'Only Admin can create tasks' });
    const { title, description, priority, status, assignee } = req.body;
    try {
        const aid = assignee ? parseInt(assignee) : null;
        const q = await sql`INSERT INTO tasks (title, description, priority, status, assignee) VALUES (${title}, ${description || ''}, ${priority || 'Medium'}, ${status || 'Todo'}, ${aid}) RETURNING *`;
        res.status(201).json(q.rows[0]);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.put(r('/tasks/:id'), async (req, res) => {
    const tid = parseInt(req.params.id);
    if (isNaN(tid)) return res.status(400).json({ message: 'Invalid ID' });

    // Only Admin or the Assignee can update
    const { title, description, priority, status, assignee } = req.body;
    try {
        const check = await sql`SELECT assignee FROM tasks WHERE id = ${tid}`;
        if (check.rows.length === 0) return res.status(404).json({ message: 'Task not found' });

        if (req.userRole !== 'Admin' && check.rows[0].assignee !== req.userId) {
            return res.status(403).json({ message: 'Access Denied' });
        }

        const aid = assignee ? parseInt(assignee) : check.rows[0].assignee;
        const q = await sql`UPDATE tasks SET title=${title || ''}, description=${description || ''}, priority=${priority || 'Medium'}, status=${status || 'Todo'}, assignee=${aid}, updated_at=NOW() WHERE id=${tid} RETURNING *`;
        res.json(q.rows[0]);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.delete(r('/tasks/:id'), async (req, res) => {
    if (req.userRole !== 'Admin') return res.status(403).json({ message: 'Only Admin can delete tasks' });
    try {
        const tid = parseInt(req.params.id);
        await sql`DELETE FROM tasks WHERE id = ${tid}`;
        res.json({ message: 'Task deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- OTHERS ---
app.get(r('/users'), async (req, res) => {
    if (req.userRole !== 'Admin') return res.status(403).json({ message: 'Admin only access' });
    try {
        const { rows } = await sql`SELECT id, name, email, role FROM users ORDER BY name ASC`;
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post(r('/auth/register'), async (req, res) => {
    const { name, email, password } = req.body;
    const role = isAdmin({ email }) ? 'Admin' : 'Employee';
    try {
        const q = await sql`INSERT INTO users (name, email, password, role) VALUES (${name}, ${email.toLowerCase().trim()}, ${password}, ${role}) ON CONFLICT (email) DO NOTHING RETURNING id, name, email, role`;
        if (q.rows.length === 0) return res.status(409).json({ message: 'User already exists' });
        const u = q.rows[0];
        res.status(201).json({ accessToken: `mock-token-${u.id}`, refreshToken: `ref-token-${u.id}`, user: u });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get(r('/leaves'), async (req, res) => {
    try {
        let q;
        if (req.userRole === 'Admin') q = await sql`SELECT l.*, u.name as user_name FROM leaves l LEFT JOIN users u ON l.user_id = u.id ORDER BY l.id DESC`;
        else q = await sql`SELECT l.*, u.name as user_name FROM leaves l LEFT JOIN users u ON l.user_id = u.id WHERE l.user_id = ${req.userId} ORDER BY l.id DESC`;
        res.json(q.rows.map(r => ({ ...r, userId: r.user_id, startDate: r.start_date, endDate: r.end_date, user: { name: r.user_name } })));
    } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = app;
