const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    // Proxy API requests to external backend
    // Note: If external API uses /auth/login instead of /api/auth/login,
    // we need to adjust the pathRewrite

    app.use(
        '/api',
        createProxyMiddleware({
            target: 'https://hrmis-api.devfamz.com',
            changeOrigin: true,
            secure: true,

            // Keep /api prefix because backend likely requires it (Example: /api/auth/login)
            pathRewrite: {},

            onProxyReq: (proxyReq, req, res) => {
                // Log to see exactly what URL is being requested
                console.log(`🔄 Proxy: ${req.method} ${req.path} -> https://hrmis-api.devfamz.com${req.path}`);
            },
            onProxyRes: (proxyRes, req, res) => {
                console.log('✅ Proxy Response:', proxyRes.statusCode, req.path);
                if (proxyRes.statusCode === 404) {
                    console.warn('⚠️  404 Error - Endpoint not found on external API');
                }
            },
            onError: (err, req, res) => {
                console.error('❌ Proxy Error:', err.message);
                res.status(500).json({ error: 'Proxy error', message: err.message });
            }
        })
    );
};
