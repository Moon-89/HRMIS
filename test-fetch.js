fetch('https://hrmis-api.devfamz.com/api/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: 'memona@hrmis.com', password: 'password123' })
})
    .then(res => res.text().then(text => ({ status: res.status, text })))
    .then(console.log)
    .catch(console.error);
