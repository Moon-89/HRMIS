const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const ADMIN_EMAIL = 'memona@hrmis.com';

// Mock DB - NOTE: This will reset on Vercel restart. 
// For permanent storage, you MUST connect a real Database (like MongoDB).
let users = [
    { id: 1, name: 'Memona Admin', email: 'memona@hrmis.com', role: 'Admin', password: 'password123' }
];
let leaves = [];
let tasks = [];

const isAdminEmail = (email) => {
    if (!email) return false;
    const normalized = email.toLowerCase().trim();
    return normalized === ADMIN_EMAIL || normalized === 'memona@hrmis';
};

const r = (path) => [`/api${path}`, path];

// Auth Middleware
app.use((req, res, next) => {
    const auth = req.headers.authorization || '';
    const match = auth.match(/mock-token-(\d+)/);
    if (match) {
        req.userId = match[1];
        const u = users.find(x => String(x.id) === String(req.userId));
        if (u) {
            req.user = u;
            req.userRole = isAdminEmail(u.email) ? 'Admin' : 'Employee';
        }
    }
    next();
});

// --- AUTH ROUTES ---
app.post(r('/auth/register'), (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const normalizedEmail = email.toLowerCase().trim();

    if (users.find(u => u.email === normalizedEmail)) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const role = isAdminEmail(normalizedEmail) ? 'Admin' : 'Employee';
    const user = { id: Date.now(), name, email: normalizedEmail, role, password };
    users.push(user);

    return res.status(201).json({
        accessToken: `mock-token-${user.id}`,
        refreshToken: `ref-token-${user.id}`,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
});

app.post(r('/auth/login'), (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();
    const u = users.find(x => x.email === normalizedEmail && x.password === password);

    if (!u) return res.status(401).json({ message: 'Invalid credentials' });

    return res.json({
        accessToken: `mock-token-${u.id}`,
        refreshToken: `ref-token-${u.id}`,
        user: { id: u.id, name: u.name, email: u.email, role: u.role }
    });
});

app.post(r('/auth/refresh'), (req, res) => {
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const userId = refreshToken.split('-')[2];
    const u = users.find(x => String(x.id) === String(userId));
    if (!u) return res.status(401).json({ message: 'Session expired' });

    return res.json({
        accessToken: `mock-token-${u.id}`,
        refreshToken: `ref-token-${u.id}`,
        user: { id: u.id, name: u.name, email: u.email, role: u.role }
    });
});

// --- USER ROUTES ---
app.get(r('/users'), (req, res) => {
    if (req.userRole !== 'Admin') return res.status(403).json({ message: 'Admin only' });
    return res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
});

app.get(r('/users/profile'), (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    return res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.userRole });
});

// --- LEAVE ROUTES ---
app.get(r('/leaves'), (req, res) => {
    const { userId } = req.query;
    let out = leaves;
    // Admin sees all, Employee sees only theirs
    if (req.userRole !== 'Admin') {
        out = leaves.filter(l => String(l.userId) === String(req.userId));
    } else if (userId) {
        out = leaves.filter(l => String(l.userId) === String(userId));
    }

    return res.json(out.map(l => {
        const u = users.find(x => x.id == l.userId);
        return { ...l, user: u ? { name: u.name, email: u.email } : null };
    }));
});

app.post(r('/leaves'), (req, res) => {
    const { startDate, endDate, reason } = req.body;
    const newLeave = {
        id: Date.now(),
        userId: req.userId,
        startDate,
        endDate,
        reason,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    leaves.push(newLeave);
    return res.status(201).json(newLeave);
});

app.put(r('/leaves/:id'), (req, res) => {
    const idx = leaves.findIndex(l => String(l.id) === String(req.params.id));
    if (idx === -1) return res.status(404).json({ message: 'Not found' });

    if (req.userRole !== 'Admin' && String(leaves[idx].userId) !== String(req.userId)) {
        return res.status(403).json({ message: 'Denied' });
    }

    leaves[idx] = { ...leaves[idx], ...req.body, updatedAt: new Date().toISOString() };
    return res.json(leaves[idx]);
});

// --- TASK ROUTES ---
app.get(r('/tasks'), (req, res) => {
    let out = tasks;
    if (req.userRole !== 'Admin') {
        out = tasks.filter(t => String(t.assignee) === String(req.userId));
    }
    return res.json(out);
});

app.post(r('/tasks'), (req, res) => {
    if (req.userRole !== 'Admin') return res.status(403).json({ message: 'Admin only' });
    const newTask = { ...req.body, id: Date.now(), createdAt: new Date().toISOString() };
    tasks.push(newTask);
    return res.status(201).json(newTask);
});

module.exports = app;
