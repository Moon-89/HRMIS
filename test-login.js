fetch('https://hrmis-api.devfamz.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'memona@hrmis.com', password: 'password' })
})
    .then(r => r.text().then(t => console.log('STATUS:', r.status, 'BODY:', t)))
    .catch(console.error);
