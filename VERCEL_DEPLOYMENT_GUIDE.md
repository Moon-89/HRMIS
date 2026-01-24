# HRMIS Vercel Deployment Guide

## Problem: Network Error on Vercel Deployment

Jab aap apna app Vercel pe deploy karte hain, to login karne pe "Network Error" aata hai kyunki:
- Frontend Vercel pe hai (e.g., https://your-app.vercel.app)
- Backend abhi bhi localhost:4000 pe hai (sirf aapke computer pe accessible)
- Mobile ya doosre devices localhost ko access nahi kar sakte

## Solution Options

### Option 1: Backend Ko Bhi Vercel Pe Deploy Karein (RECOMMENDED)

#### Step 1: Backend Project Alag Banayein

```bash
# Naya folder banayein backend ke liye
mkdir hrmis-backend
cd hrmis-backend

# Package.json banayein
npm init -y

# Dependencies install karein
npm install express cors
```

#### Step 2: Mock Server Ko Copy Karein

```bash
# Server file ko copy karein
copy ..\hrmis-frontend\server\mock-server.js index.js
```

#### Step 3: Package.json Update Karein

```json
{
  "name": "hrmis-backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "cors": "^2.8.5"
  }
}
```

#### Step 4: Vercel Pe Deploy Karein

```bash
# Vercel CLI install karein (agar nahi hai)
npm i -g vercel

# Backend deploy karein
vercel

# Production deploy
vercel --prod
```

#### Step 5: Frontend Environment Variable Update Karein

Vercel dashboard mein jayein aur environment variable add karein:
- Variable: `REACT_APP_API_URL`
- Value: `https://your-backend-url.vercel.app` (jo backend deploy hone ke baad mila)

Phir frontend ko redeploy karein:
```bash
vercel --prod
```

---

### Option 2: Single Vercel Project (Frontend + Backend Together)

Current setup already configured hai. Bas ye steps follow karein:

#### Step 1: Vercel Environment Variable Set Karein

Vercel dashboard mein:
1. Project Settings > Environment Variables
2. Add new variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-app-name.vercel.app`
   - Environment: Production

#### Step 2: Redeploy

```bash
vercel --prod
```

---

### Option 3: Use a Free Backend Service

Agar Vercel pe backend deploy karna mushkil lag raha hai, to ye free services use kar sakte hain:

1. **Railway.app** - Easy backend deployment
2. **Render.com** - Free tier available
3. **Fly.io** - Good for Node.js apps

---

## Quick Fix for Testing (Temporary)

Agar abhi sirf test karna hai locally:

### Terminal 1 - Backend
```bash
cd hrmis-frontend
npm run mock-server
```

### Terminal 2 - Frontend
```bash
npm start
```

Phir browser mein `http://localhost:3000` open karein.

---

## Files Created/Modified

1. ✅ `.env.development` - Local development ke liye
2. ✅ `.env.production` - Production deployment ke liye
3. ✅ `vercel.json` - Vercel configuration
4. ✅ `server/mock-server.js` - Updated for serverless deployment

---

## Important Notes

⚠️ **CORS Issue**: Agar alag-alag domains se API call kar rahe hain, to CORS already configured hai mock-server mein:
```javascript
app.use(cors({ origin: true, credentials: true }));
```

⚠️ **Environment Variables**: Vercel pe deploy karne se pehle environment variables set karna zaroori hai.

⚠️ **Data Persistence**: Mock server in-memory data use karta hai, to restart karne pe data reset ho jayega. Production ke liye real database use karein (MongoDB, PostgreSQL, etc.)

---

## Troubleshooting

### Network Error Still Coming?

1. Browser console check karein (F12)
2. Network tab mein dekho API call kahan ja rahi hai
3. Verify karein ki environment variable sahi set hai:
   ```javascript
   console.log('API URL:', process.env.REACT_APP_API_URL);
   ```

### CORS Error?

Backend mein CORS already enabled hai, but agar phir bhi issue hai:
```javascript
app.use(cors({ 
  origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true 
}));
```

### 404 on API Routes?

Vercel.json check karein aur ensure karein routes properly configured hain.

---

## Next Steps

1. Backend ko alag project mein deploy karein (Recommended)
2. Frontend environment variable update karein
3. Test karein mobile browser pe
4. Production database setup karein (optional)

---

## Contact & Support

Agar koi issue aaye to:
1. Browser console check karein
2. Vercel deployment logs check karein
3. Network tab mein API calls dekho
