# Deploy eBizzPro Backend to Render (Free)

## Step 1 — Edit your password in .env
Open `.env` and replace `<db_password>` with your actual MongoDB password:
```
MONGODB_URI=mongodb+srv://hriday:YOUR_ACTUAL_PASSWORD@cluster0.gz0pune.mongodb.net/ebizzpro?appName=Cluster0
```

## Step 2 — Create a free GitHub account
Go to https://github.com and sign up (if you don't have one)

## Step 3 — Upload backend to GitHub
1. Go to https://github.com/new
2. Repository name: `ebizzpro-backend`
3. Set to **Private** → click **Create repository**
4. Click **"uploading an existing file"**
5. Drag and drop these files:
   - `server.js`
   - `models.js`
   - `package.json`
   - `.gitignore`
   - `.env.example`
   ⚠️ Do NOT upload `.env` (it has your password)
6. Click **Commit changes**

## Step 4 — Deploy on Render
1. Go to https://render.com → Sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your `ebizzpro-backend` GitHub repo
4. Settings:
   - Name: `ebizzpro-backend`
   - Runtime: **Node**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: **Free**
5. Click **"Add Environment Variable"**:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://hriday:YOUR_ACTUAL_PASSWORD@cluster0.gz0pune.mongodb.net/ebizzpro?appName=Cluster0`
6. Click **"Create Web Service"**
7. Wait 2-3 minutes — Render builds and deploys
8. Copy your URL — looks like: `https://ebizzpro-backend.onrender.com`

## Step 5 — Update the app
1. Open `src/utils/mongodb.js` in your ebizzpro app
2. Replace the first line:
```js
export const API_URL = 'https://ebizzpro-backend.onrender.com'; // your Render URL
```

## Step 6 — Replace AppContext
Copy `AppContext_updated.js` → replace `src/context/AppContext.js` in your app

## Step 7 — Run the app
```bash
npx expo start
```

## Test the backend is working
Open your Render URL in a browser — you should see:
```json
{ "status": "eBizzPro API running" }
```
