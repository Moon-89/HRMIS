const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Development Proxy Configuration
 *
 * All requests to /api/* are proxied to the real backend:
 *   /api/auth/login  →  https://hrmis-api.devfamz.com/api/auth/login
 *   /api/tasks       →  https://hrmis-api.devfamz.com/api/tasks
 *   /api/leaves      →  https://hrmis-api.devfamz.com/api/leaves
 *   /api/users       →  https://hrmis-api.devfamz.com/api/users
 *
 * The /api prefix is KEPT because the real backend already has /api in its path.
 */
module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://hrmis-api.devfamz.com',
            changeOrigin: true,
            secure: true,
            // Do NOT rewrite — keep /api prefix as backend expects it
            // /api/auth/login  stays  /api/auth/login  at the target

            onProxyReq: (proxyReq, req) => {
                console.log(`🔄 DEV PROXY: ${req.method} ${req.path}  →  https://hrmis-api.devfamz.com${req.path}`);
            },
            onProxyRes: (proxyRes, req) => {
                console.log(`✅ PROXY RES: ${proxyRes.statusCode}  ${req.path}`);
                if (proxyRes.statusCode === 404) {
                    console.warn('⚠️  404 — endpoint not found on backend. Check API docs at https://hrmis-api.devfamz.com/api/documentation');
                }
            },
            onError: (err, req, res) => {
                console.error('❌ Proxy Error:', err.message);
                res.status(500).json({ error: 'Proxy error', message: err.message });
            },
        })
    );
};
