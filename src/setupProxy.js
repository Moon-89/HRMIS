const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            // Target is the backend base (without /api suffix here because we keep it from the request)
            target: 'https://hrmis-api.devfamz.com',
            changeOrigin: true,
            secure: true,
            logLevel: 'debug',
            onProxyReq: (proxyReq, req, res) => {
                // Log to terminal for debugging
                console.log(`[LOCAL PROXY] ${req.method} ${req.path} -> https://hrmis-api.devfamz.com${req.path}`);
            }
        })
    );
};
