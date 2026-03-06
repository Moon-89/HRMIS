const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: process.env.REACT_APP_API_URL || 'https://hrmis-api.devfamz.com',
            changeOrigin: true,
            secure: true,
            logLevel: 'debug',
            onProxyReq: (proxyReq, req, res) => {
                console.log(`[LOCAL PROXY] ${req.method} ${req.url} -> ${process.env.REACT_APP_API_URL || 'https://hrmis-api.devfamz.com'}${req.url}`);
            }
        })
    );
};
