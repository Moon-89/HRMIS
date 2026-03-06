const axios = require('axios');

async function testLogin() {
    try {
        const resForm = await axios.post('https://hrmis-api.devfamz.com/api/auth/login', new URLSearchParams({ email: 'memona@hrmis.com', password: 'password123' }), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        console.log('Form Success:', resForm.status);
    } catch (err) {
        console.log('Form Error:', err.response?.status, err.response?.data);
    }

    try {
        const resJson = await axios.post('https://hrmis-api.devfamz.com/api/auth/login', { email: 'memona@hrmis.com', password: 'password123' }, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Json Success:', resJson.status);
    } catch (err) {
        console.log('Json Error:', err.response?.status, err.response?.data);
    }
}

testLogin();
