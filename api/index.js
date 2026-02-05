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
        const adminEmail = 'memona@hrmis.com';
        await sql`
            INSERT INTO users (name, email, password, role)
            VALUES ('Memona Admin', ${adminEmail}, 'password123', 'Admin')
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
    if (match) {
        const userId = parseInt(match[1]);
        try {
            const { rows } = await sql`SELECT * FROM users WHERE id = ${userId}`;
            if (rows.length > 0) {
                const u = rows[0];
                req.userId = u.id;
                req.user = u;
                req.userRole = isAdminEmail(u.email) ? 'Admin' : u.role;
            }
        } catch (e) {
            console.error("Auth middleware error:", e);
        }
    }
    next();
});

// Setup route to manually trigger DB init if needed
app.get(r('/setup-db'), async (req, res) => {
    await initDb();
    res.json({ message: "Database setup attempted. Check logs." });
});

// --- AUTH ROUTES ---
app.post(r('/auth/register'), async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const normalizedEmail = email.toLowerCase().trim();

    try {
        const role = isAdminEmail(normalizedEmail) ? 'Admin' : 'Employee';
        const result = await sql`
            INSERT INTO users (name, email, password, role)
            VALUES (${name}, ${normalizedEmail}, ${password}, ${role})
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
        return res.status(500).json({ message: e.message });
    }
});

app.post(r('/auth/login'), async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    try {
        const { rows } = await sql`
            SELECT id, name, email, role, password 
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
        return res.status(500).json({ message: e.message });
    }
});

app.post(r('/auth/refresh'), async (req, res) => {
    const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    try {
        const userIdMatch = refreshToken.split('-')[2];
        const userId = parseInt(userIdMatch);

        const { rows } = await sql`SELECT id, name, email, role FROM users WHERE id = ${userId}`;
        if (rows.length === 0) return res.status(401).json({ message: 'Session expired' });

        const u = rows[0];
        return res.json({
            accessToken: `mock-token-${u.id}`,
            refreshToken: `ref-token-${u.id}`,
            user: u
        });
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

// --- USER ROUTES ---
app.get(r('/users'), async (req, res) => {
    if (req.userRole !== 'Admin') return res.status(403).json({ message: 'Admin only' });
    try {
        const { rows } = await sql`SELECT id, name, email, role FROM users`;
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
                    WHERE l.user_id = ${userId}
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
            id: l.id,
            userId: l.user_id,
            startDate: l.start_date,
            endDate: l.end_date,
            createdAt: l.created_at,
            updatedAt: l.updated_at,
            user: { name: l.user_name, email: l.user_email }
        })));
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
        const { rows } = await sql`SELECT * FROM leaves WHERE id = ${id}`;
        if (rows.length === 0) return res.status(404).json({ message: 'Not found' });

        const leave = rows[0];
        if (req.userRole !== 'Admin' && leave.user_id !== req.userId) {
            return res.status(403).json({ message: 'Denied' });
        }

        // Update fields if provided
        const newStatus = status || leave.status;
        const newStart = startDate || leave.start_date;
        const newEnd = endDate || leave.end_date;
        const newReason = reason || leave.reason;

        const updated = await sql`
            UPDATE leaves 
            SET status = ${newStatus}, start_date = ${newStart}, end_date = ${newEnd}, reason = ${newReason}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
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
        const { rows } = await sql`SELECT * FROM leaves WHERE id = ${id}`;
        if (rows.length === 0) return res.status(404).json({ message: 'Not found' });

        if (req.userRole !== 'Admin' && rows[0].user_id !== req.userId) {
            return res.status(403).json({ message: 'Denied' });
        }

        await sql`DELETE FROM leaves WHERE id = ${id}`;
        return res.json({ message: 'Deleted' });
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
            result = await sql`SELECT * FROM tasks WHERE assignee = ${req.userId} ORDER BY created_at DESC`;
        }
        return res.json(result.rows);
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

app.post(r('/tasks'), async (req, res) => {
    if (req.userRole !== 'Admin') return res.status(403).json({ message: 'Admin only' });
    const { title, description, priority, status, assignee } = req.body;

    try {
        const result = await sql`
            INSERT INTO tasks (title, description, priority, status, assignee)
            VALUES (${title}, ${description}, ${priority}, ${status || 'Todo'}, ${assignee})
            RETURNING *;
        `;
        return res.status(201).json(result.rows[0]);
    } catch (e) {
        return res.status(500).json({ message: e.message });
    }
});

module.exports = app;
