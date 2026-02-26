/**
 * Vercel Serverless Proxy Function
 *
 * IMPORTANT: This file MUST exist in the /api folder so Vercel routes all
 * /api/* requests here. We then forward each request to the real backend.
 *
 * Flow:
 *   Browser → /api/auth/login
 *   Vercel  → this function (api/index.js)
 *   Here    → https://hrmis-api.devfamz.com/api/auth/login  (real backend)
 *
 * This avoids CORS completely because the browser talks to same-origin (/api)
 * and this serverless function forwards to the real backend server-side.
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const BACKEND_BASE = 'https://hrmis-api.devfamz.com';

module.exports = async (req, res) => {
    // Build target URL:  /api/xxx  →  https://hrmis-api.devfamz.com/api/xxx
    const targetPath = req.url || '/';
    const targetUrl = `${BACKEND_BASE}/api${targetPath.replace(/^\/api/, '')}`;

    console.log(`[PROXY] ${req.method} ${req.url}  →  ${targetUrl}`);

    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    try {
        const parsed = new URL(targetUrl);
        const useHttps = parsed.protocol === 'https:';
        const options = {
            hostname: parsed.hostname,
            port: parsed.port || (useHttps ? 443 : 80),
            path: parsed.pathname + (parsed.search || ''),
            method: req.method,
            headers: {
                ...req.headers,
                host: parsed.hostname, // override host header
            },
        };

        // Remove headers that can cause issues
        delete options.headers['content-length']; // will be recalculated

        await new Promise((resolve, reject) => {
            const transport = useHttps ? https : http;
            const proxyReq = transport.request(options, (proxyRes) => {
                res.status(proxyRes.statusCode);

                // Forward response headers (except cors ones we already set)
                Object.entries(proxyRes.headers).forEach(([key, value]) => {
                    if (!key.toLowerCase().startsWith('access-control-')) {
                        res.setHeader(key, value);
                    }
                });

                proxyRes.pipe(res, { end: true });
                proxyRes.on('end', resolve);
                proxyRes.on('error', reject);
            });

            proxyReq.on('error', reject);

            // Forward request body
            if (req.body) {
                const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(body));
                proxyReq.write(body);
            } else {
                req.pipe(proxyReq, { end: true });
            }

            proxyReq.end();
        });
    } catch (err) {
        console.error('[PROXY ERROR]', err.message);
        res.status(502).json({ error: 'Proxy error', message: err.message });
    }
};
