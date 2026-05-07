# eBizz Pro — Setup Guide

## 1. Install dependencies
```bash
cd ebizzpro
npm install
```

## 2. MongoDB Atlas Setup (5 minutes, free)

### A. Create a free cluster
1. Go to https://cloud.mongodb.com
2. Sign up / Log in
3. Click **"Build a Database"** → choose **M0 Free** → pick any region → click **Create**
4. Set a username + password → click **Create User**
5. Under "Where would you like to connect from?" → choose **"My Local Environment"** → Add IP `0.0.0.0/0` (allows all, good for dev) → click **Finish and Close**

### B. Enable the Data API
1. In the left sidebar click **"App Services"**
2. Click **"Create a new App"** → Link it to your cluster → name it `ebizzpro` → click **Create App**
3. In your new App → left sidebar → **"HTTPS Endpoints"** → click **"Enable Data API"**
4. Click **"API Keys"** → **"Create API Key"** → copy the key

### C. Get your App ID
- Look at the URL: `https://realm.mongodb.com/groups/.../apps/YOUR-APP-ID-HERE/...`
- Or find it in App Services → your app → App Settings

### D. Paste into the app
Open `src/utils/mongodb.js` and fill in:
```js
const ATLAS_APP_ID  = 'ebizzpro-xxxxx';   // your App ID
const ATLAS_API_KEY = 'xxxxxxxxxxxxxxxx';  // your API key
```

## 3. Run the app
```bash
# Start Expo
npx expo start

# Scan QR code with Expo Go app on your phone
# OR press 'a' for Android emulator
```

## 4. First launch flow
1. **Register** with name + email + password
2. **Enter your GSTIN** on the onboarding screen → state auto-detects
3. Start creating invoices, parties, and stock
4. All data syncs to MongoDB Atlas in real time

## App Features
- Email/password auth (stored in MongoDB)
- Invoices with auto CGST/SGST vs IGST detection
- Share invoice as PDF via WhatsApp, Email, Google Drive, or Print
- Party management with GSTIN state auto-detection
- Stock management with low-stock alerts
- Reports with GST breakdown (IGST / CGST / SGST)
- Pull-to-refresh syncs latest data from MongoDB

## File Structure
```
ebizzpro/
├── src/
│   ├── context/AppContext.js      ← State + MongoDB sync
│   ├── utils/
│   │   ├── mongodb.js             ← Atlas Data API calls
│   │   ├── gst.js                 ← GSTIN decode, CGST/SGST/IGST logic
│   │   └── invoiceShare.js        ← PDF generation + share sheet
│   ├── screens/                   ← All app screens
│   ├── components/                ← Reusable UI components
│   ├── navigation/AppNavigator.js ← Auth-aware navigation
│   └── theme/index.js             ← Colors, typography, spacing
└── SETUP.md
```
