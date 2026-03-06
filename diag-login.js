const axios = require('axios');
axios.post('https://hrmis-api.devfamz.com/api/auth/login', { email: 'memona@hrmis.com', password: 'password123' })
    .then(r => {
        console.log('---SUCCESS---');
        console.log(JSON.stringify(r.data, null, 2));
    })
    .catch(e => {
        console.log('---ERROR---');
        console.log(e.response?.status);
        console.log(JSON.stringify(e.response?.data || e.message, null, 2));
    });
