const https = require('https');

/**
 * Robust Vercel Serverless Proxy
 * Maps  /api/xxx  →  https://hrmis-api.devfamz.com/api/xxx
 */
module.exports = async (req, res) => {
    const targetUrl = `https://hrmis-api.devfamz.com${req.url}`;

    // Headers to forward
    const headers = { ...req.headers };
    delete headers.host;
    delete headers.connection;

    const options = {
        method: req.method,
        headers: {
            ...headers,
            'host': 'hrmis-api.devfamz.com'
        }
    };

    // Helper function for the proxy request
    const proxyRequest = () => {
        return new Promise((resolve, reject) => {
            const proxyReq = https.request(targetUrl, options, (proxyRes) => {
                res.status(proxyRes.statusCode);

                // Forward headers from backend to browser (except CORS which we handle here)
                Object.entries(proxyRes.headers).forEach(([key, value]) => {
                    if (!key.toLowerCase().startsWith('access-control-')) {
                        res.setHeader(key, value);
                    }
                });

                // Add standard CORS headers for safety
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

                proxyRes.pipe(res, { end: true });
                proxyRes.on('end', resolve);
            });

            proxyReq.on('error', (err) => {
                console.error('Proxy Request Error:', err);
                reject(err);
            });

            // Forward the body if it's a POST/PUT request
            if (req.method !== 'GET' && req.method !== 'HEAD') {
                req.pipe(proxyReq, { end: true });
            } else {
                proxyReq.end();
            }
        });
    };

    try {
        await proxyRequest();
    } catch (err) {
        res.status(500).json({ error: 'Internal Proxy Error', message: err.message });
    }
};
