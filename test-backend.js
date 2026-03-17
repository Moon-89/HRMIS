const https = require('https');

https.get('https://hrmis-api.devfamz.com/api/documentation', (res) => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('BODY:', data.substring(0, 200)));
}).on('error', (e) => {
    console.error('ERROR:', e.message);
});
