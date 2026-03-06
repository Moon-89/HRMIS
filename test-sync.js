const { execSync } = require('child_process');
try {
    const output = execSync(`curl -s -k -X POST https://hrmis-api.devfamz.com/api/auth/login -H "Content-Type: application/json" -d "{\\"email\\":\\"memona@hrmis.com\\",\\"password\\":\\"password123\\"}"`);
    console.log('OUTPUT:', output.toString());
} catch (e) {
    console.log('ERROR STATUS:', e.status);
    console.log('ERROR:', e.stdout.toString(), e.stderr.toString());
}
