const express = require('express');
const cors = require('cors');
const { sql } = require('@vercel/postgres');
const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

const ADMIN_EMAIL = 'memona@hrmis.com';

const isAdminEmail = (email) => {
    if (!email) return false;
    const normalized = email.toLowerCase().trim();
    return normalized === ADMIN_EMAIL || normalized === 'memona@hrmis';
};

const r = (path) => [`/api${path}`, path];

// --- DATABASE INITIALIZATION ---
const initDb = async () => {
    try {
        console.log("Initializing database tables...");
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL
            );
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS leaves (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                reason TEXT NOT NULL,
                status TEXT DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                priority TEXT,
                status TEXT,
                assignee INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Ensure Admin user exists
        await sql`
            INSERT INTO users (name, email, password, role)
            VALUES ('Memona Admin', 'memona@hrmis.com', 'password123', 'Admin')
            ON CONFLICT (email) DO NOTHING;
        `;

        console.log("Database initialized successfully");
    } catch (e) {
        console.error("Database initialization failed:", e);
    }
};

// --- AUTH MIDDLEWARE ---
app.use(async (req, res, next) => {
    const auth = req.headers.authorization || '';
    const match = auth.match(/mock-token-(\d+)/);

    req.userId = null;
    req.user = null;
    req.userRole = 'Guest';

    if (match) {
        const userIdFromToken = parseInt(match[1]);
        if (!isNaN(userIdFromToken)) {
            try {
                const { rows } = await sql`SELECT id, name, email, role FROM users WHERE id = ${userIdFromToken}`;
                if (rows.length > 0) {
                    const u = rows[0];
                    req.userId = u.id;
                    req.user = u;
                    req.userRole = isAdminEmail(u.email) ? 'Admin' : u.role;
                }
            } catch (e) {
                console.error("Auth middleware SQL error:", e.message);
            }
        }
    }
    next();
});

// Setup route to manually trigger DB init
app.get(r('/setup-db'), async (req, res) => {
    await initDb();
    res.json({ message: "Database setup attempted. Check Vercel logs." });
});

// root endpoint to check if healthy
app.get(r('/health'), (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// --- AUTH ROUTES ---
app.post(r('/auth/register'), async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const normalizedEmail = email.toLowerCase().trim();

    try {
        const role = isAdminEmail(normalizedEmail) ? 'Admin' : 'Employee';
        const result = await sql`
            INSERT INTO users (name, email, password, role)
            VALUES (${name || 'New User'}, ${normalizedEmail}, ${password}, ${role})
            ON CONFLICT (email) DO NOTHING
            RETURNING id, name, email, role;
        `;

        if (result.rows.length === 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        const user = result.rows[0];
        return res.status(201).json({
            accessToken: `mock-token-${user.id}`,
            refreshToken: `ref-token-${user.id}`,
            user: user
        });
    } catch (e) {
        console.error("Register Error:", e);
        return res.status(500).json({ message: "Server error during registration" });
    }
});

app.post(r('/auth/login'), async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const normalizedEmail = email?.toLowerCase().trim();

    try {
        const { rows } = await sql`
            SELECT id, name, email, role 
            FROM users 
            WHERE email = ${normalizedEmail} AND password = ${password}
        `;

        if (rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const u = rows[0];
        return res.json({
            accessToken: `mock-token-${u.id}`,
            refreshToken: `ref-token-${u.id}`,
            user: { id: u.id, name: u.name, email: u.email, role: u.role }
        });
    } catch (e) {
        console.error("Login Error:", e);
        return res.status(500).json({ message: "Server error during login" });
    }
});

app.post(r('/auth/refresh'), async (req, res) => {
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken || typeof refreshToken !== 'string') {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        const parts = refreshToken.split('-');
        const userId = parseInt(parts[2]);

        if (isNaN(userId)) return res.status(401).json({ message: 'Invalid token format' });

        const { rows } = await sql`SELECT id, name, email, role FROM users WHERE id = ${userId}`;
        if (rows.length === 0) return res.status(401).json({ message: 'User not found or session expired' });

        const u = rows[0];
        return res.json({
            accessToken: `mock-token-${u.id}`,
            refreshToken: `ref-token-${u.id}`,
            user: { id: u.id, name: u.name, email: u.email, role: u.role }
        });
    } catch (e) {
        console.error("Refresh Error:", e);
        return res.status(500).json({ message: "Server error during session refresh" });
    }
});

app.post(r('/auth/logout'), (req, res) => {
    res.json({ message: "Logged out successfully" });
});

// --- USER ROUTES ---
app.get(r('/users'), async (req, res) => {
    if (req.userRole !== 'Admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const { rows } = await sql`SELECT id, name, email, role FROM users ORDER BY name ASC`;
        return res.json(rows);
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

app.get(r('/users/profile'), async (req, res) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    return res.json({ id: req.user.id, name: req.user.name, email: req.user.email, role: req.userRole });
});

// --- LEAVE ROUTES ---
app.get(r('/leaves'), async (req, res) => {
    const { userId } = req.query;
    try {
        let result;
        if (req.userRole === 'Admin') {
            if (userId) {
                result = await sql`
                    SELECT l.*, u.name as user_name, u.email as user_email 
                    FROM leaves l 
                    JOIN users u ON l.user_id = u.id 
                    WHERE l.user_id = ${parseInt(userId)}
                    ORDER BY l.created_at DESC
                `;
            } else {
                result = await sql`
                    SELECT l.*, u.name as user_name, u.email as user_email 
                    FROM leaves l 
                    JOIN users u ON l.user_id = u.id 
                    ORDER BY l.created_at DESC
                `;
            }
        } else {
            if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
            result = await sql`
                SELECT l.*, u.name as user_name, u.email as user_email 
                FROM leaves l 
                JOIN users u ON l.user_id = u.id 
                WHERE l.user_id = ${req.userId}
                ORDER BY l.created_at DESC
            `;
        }

        return res.json(result.rows.map(l => ({
            ...l,
            userId: l.user_id,
            startDate: l.start_date,
            endDate: l.end_date,
            createdAt: l.created_at,
            updatedAt: l.updated_at,
            user: { name: l.user_name, email: l.user_email }
        })));
    } catch (e) {
        console.error("Fetch Leaves Error:", e);
        return res.status(500).json({ message: e.message });
    }
});

app.get(r('/leaves/:id'), async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await sql`
            SELECT l.*, u.name as user_name, u.email as user_email 
            FROM leaves l 
            JOIN users u ON l.user_id = u.id 
            WHERE l.id = ${parseInt(id)}
        `;
        if (rows.length === 0) return res.status(404).json({ message: 'Leave request not found' });

        const l = rows[0];
        if (req.userRole !== 'Admin' && l.user_id !== req.userId) {
            return res.status(403).json({ message: 'Permission denied' });
        }

        return res.json({
            ...l,
            userId: l.user_id,
            startDate: l.start_date,
            endDate: l.end_date,
            user: { name: l.user_name, email: l.user_email }
        });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

app.post(r('/leaves'), async (req, res) => {
    const { startDate, endDate, reason } = req.body;
    if (!req.userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const result = await sql`
            INSERT INTO leaves (user_id, start_date, end_date, reason, status)
            VALUES (${req.userId}, ${startDate}, ${endDate}, ${reason}, 'Pending')
            RETURNING *;
        `;
        return res.status(201).json(result.rows[0]);
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

app.put(r('/leaves/:id'), async (req, res) => {
    const { id } = req.params;
    const { status, startDate, endDate, reason } = req.body;

    try {
        const { rows } = await sql`SELECT * FROM leaves WHERE id = ${parseInt(id)}`;
        if (rows.length === 0) return res.status(404).json({ message: 'Not found' });

        const leave = rows[0];
        if (req.userRole !== 'Admin' && leave.user_id !== req.userId) {
            return res.status(403).json({ message: 'Denied' });
        }

        const updated = await sql`
            UPDATE leaves 
            SET status = ${status || leave.status}, 
                start_date = ${startDate || leave.start_date}, 
                end_date = ${endDate || leave.end_date}, 
                reason = ${reason || leave.reason}, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${parseInt(id)}
            RETURNING *;
        `;
        return res.json(updated.rows[0]);
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

app.delete(r('/leaves/:id'), async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await sql`SELECT user_id FROM leaves WHERE id = ${parseInt(id)}`;
        if (rows.length === 0) return res.status(404).json({ message: 'Not found' });

        if (req.userRole !== 'Admin' && rows[0].user_id !== req.userId) {
            return res.status(403).json({ message: 'Denied' });
        }

        await sql`DELETE FROM leaves WHERE id = ${parseInt(id)}`;
        return res.json({ message: 'Deleted successfully' });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

// --- TASK ROUTES ---
app.get(r('/tasks'), async (req, res) => {
    try {
        let result;
        if (req.userRole === 'Admin') {
            result = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
        } else {
            if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
            result = await sql`SELECT * FROM tasks WHERE assignee = ${req.userId} ORDER BY created_at DESC`;
        }
        return res.json(result.rows);
    } catch (e) {
        console.error("Fetch Tasks Error:", e);
        return res.status(500).json({ message: e.message });
    }
});

app.get(r('/tasks/:id'), async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await sql`SELECT * FROM tasks WHERE id = ${parseInt(id)}`;
        if (rows.length === 0) return res.status(404).json({ message: 'Task not found' });

        const task = rows[0];
        if (req.userRole !== 'Admin' && task.assignee !== req.userId) {
            return res.status(403).json({ message: 'Access denied' });
        }
        return res.json(task);
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

app.post(r('/tasks'), async (req, res) => {
    if (req.userRole !== 'Admin') return res.status(403).json({ message: 'Admin access required to create tasks' });
    const { title, description, priority, status, assignee } = req.body;

    try {
        const result = await sql`
            INSERT INTO tasks (title, description, priority, status, assignee)
            VALUES (${title}, ${description || ''}, ${priority || 'Medium'}, ${status || 'Todo'}, ${assignee ? parseInt(assignee) : null})
            RETURNING *;
        `;
        return res.status(201).json(result.rows[0]);
    } catch (e) {
        console.error("Create Task Error:", e);
        return res.status(500).json({ message: e.message });
    }
});

app.put(r('/tasks/:id'), async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, status, assignee } = req.body;

    try {
        const { rows } = await sql`SELECT * FROM tasks WHERE id = ${parseInt(id)}`;
        if (rows.length === 0) return res.status(404).json({ message: 'Task not found' });

        const task = rows[0];
        if (req.userRole !== 'Admin' && task.assignee !== req.userId) {
            return res.status(403).json({ message: 'Denied' });
        }

        const updated = await sql`
            UPDATE tasks 
            SET title = ${title || task.title}, 
                description = ${description || task.description}, 
                priority = ${priority || task.priority}, 
                status = ${status || task.status}, 
                assignee = ${assignee ? parseInt(assignee) : task.assignee},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${parseInt(id)}
            RETURNING *;
        `;
        return res.json(updated.rows[0]);
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

app.delete(r('/tasks/:id'), async (req, res) => {
    if (req.userRole !== 'Admin') return res.status(403).json({ message: 'Admin access required to delete tasks' });
    const { id } = req.params;
    try {
        const result = await sql`DELETE FROM tasks WHERE id = ${parseInt(id)}`;
        return res.json({ message: 'Task deleted successfully' });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

module.exports = app;
