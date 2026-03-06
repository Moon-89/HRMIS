const https = require('https');
const data = JSON.stringify({ email: 'memona@hrmis.com', password: 'password123' });
const req = https.request({
    hostname: 'hrmis-api.devfamz.com',
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
}, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('RESPONSE:', body);
    });
});
req.on('error', e => console.error('ERR:', e.message));
req.write(data);
req.end();
