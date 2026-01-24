# Quick Fix - Network Error Solution

## Problem
Vercel pe deploy karne ke baad mobile/other browsers pe "Network Error" aa raha hai.

## Why?
- Frontend: Vercel pe hai ✅
- Backend: Localhost:4000 pe hai ❌ (sirf aapke computer pe)
- Mobile/Other devices localhost ko access nahi kar sakte

## Quick Solution (3 Steps)

### Step 1: Backend Alag Deploy Karein

```bash
# Backend folder banayein
cd ..
mkdir hrmis-backend
cd hrmis-backend

# Setup karein
npm init -y
npm install express cors

# Server file copy karein
copy ..\hrmis-frontend\server\mock-server.js index.js
```

### Step 2: Vercel.json Banayein

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [{"src": "index.js", "use": "@vercel/node"}],
  "routes": [{"src": "/(.*)", "dest": "index.js"}]
}
```

### Step 3: Deploy Karein

```bash
# Vercel CLI install (agar nahi hai)
npm i -g vercel

# Deploy
vercel --prod
```

Deployment ke baad aapko URL milega, e.g.:
`https://hrmis-backend-xyz.vercel.app`

### Step 4: Frontend Update Karein

Vercel dashboard mein jayein:
1. Frontend project select karein
2. Settings > Environment Variables
3. Add:
   - Name: `REACT_APP_API_URL`
   - Value: `https://hrmis-backend-xyz.vercel.app`
4. Redeploy: `vercel --prod`

## Test Karein

1. Mobile browser mein app open karein
2. Login try karein
3. Network error nahi aana chahiye ✅

## Alternative: Use Railway.app

Agar Vercel backend deploy nahi ho raha:

1. Railway.app pe account banayein
2. "New Project" > "Deploy from GitHub"
3. Backend repo select karein
4. Auto-deploy ho jayega
5. URL copy karke frontend environment variable mein paste karein

## Local Testing

Dono terminals mein:

**Terminal 1:**
```bash
cd hrmis-frontend
npm run mock-server
```

**Terminal 2:**
```bash
cd hrmis-frontend
npm start
```

Browser: `http://localhost:3000`

---

## Common Errors

### "Module not found: express"
```bash
npm install express cors
```

### "Cannot GET /"
Backend properly deploy nahi hua. Vercel logs check karein.

### Still Network Error?
Browser console (F12) mein check karein API URL kya hai:
```javascript
console.log(process.env.REACT_APP_API_URL)
```

---

## Files Modified

✅ `.env.development` - Local ke liye
✅ `.env.production` - Production ke liye  
✅ `server/mock-server.js` - Serverless support
✅ `vercel.json` - Vercel config

## Need Help?

1. Check browser console (F12)
2. Check Vercel deployment logs
3. Verify environment variables
4. Test API URL directly in browser
