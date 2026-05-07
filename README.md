# eBizz Pro

eBizz Pro is a GST-focused billing and business dashboard built with React Native and Expo, with an optional Express/MongoDB backend for persistent data storage.

The app helps small businesses create B2B and B2C invoices, manage stock, maintain customer/party records, track GST amounts, and view business reports from a mobile-first interface.

## Features

- Mobile-first dashboard for revenue, recent activity, stock alerts, and top customers
- B2B and B2C invoice creation flows
- GSTIN verification support through `src/utils/gstApi.js`
- GST-aware invoice summary with subtotal, tax amount, round-off, and grand total
- Stock ledger with SKU, HSN, GST rate, quantity, price, and low-stock alerts
- Party/customer management with GSTIN, phone, email, address, and status
- Reports for revenue, GST summary, filing status, and customer performance
- PDF invoice/report generation and sharing through Expo modules
- Optional backend API using Express, Mongoose, and MongoDB Atlas

## Tech Stack

### Frontend

- React Native
- Expo
- React Navigation
- Expo Linear Gradient
- Expo Print and Sharing
- AsyncStorage

### Backend

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- dotenv
- CORS

## Project Structure

```text
project/
|-- ebizzpro/                 # React Native / Expo mobile app
|   |-- App.js
|   |-- app.json
|   |-- package.json
|   |-- SETUP.md
|   `-- src/
|       |-- components/       # Reusable UI components
|       |-- context/          # App state and computed helpers
|       |-- data/             # Mock/sample data
|       |-- navigation/       # Bottom tab and stack navigation
|       |-- screens/          # App screens
|       |-- theme/            # Colors, typography, spacing
|       `-- utils/            # GST API, invoice/report generation, API helpers
|
`-- ebizzpro-backend/         # Express/MongoDB backend
    |-- server.js             # API routes and server startup
    |-- models.js             # Mongoose models
    |-- mongodb_app.js
    |-- package.json
    |-- .env.example
    `-- DEPLOY.md
```

## Prerequisites

- Node.js
- npm
- Expo tooling
- Expo Go app on your phone, or an Android/iOS emulator
- MongoDB Atlas account, if using the backend

## Frontend Setup

```bash
cd ebizzpro
npm install
npm start
```

After Expo starts:

- Scan the QR code with Expo Go, or
- Press `a` to open Android emulator, or
- Press `w` to open the web build if supported by your environment

## Backend Setup

```bash
cd ebizzpro-backend
npm install
```

Create a `.env` file from the example:

```bash
copy .env.example .env
```

Update `.env` with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ebizzpro?appName=Cluster0
PORT=3000
```

Run the backend:

```bash
npm run dev
```

Or run it in production mode:

```bash
npm start
```

Health check:

```text
GET http://localhost:3000/
```

Expected response:

```json
{ "status": "eBizzPro API running" }
```

## Backend API Overview

### Auth

- `POST /auth/register` - create user account
- `POST /auth/login` - login user
- `PATCH /auth/profile/:userId` - update business profile

### Invoices

- `GET /invoices/:userId` - list user invoices
- `POST /invoices` - create invoice
- `PATCH /invoices/:id/status` - update invoice status
- `DELETE /invoices/:id` - delete invoice

### Parties

- `GET /parties/:userId` - list parties
- `POST /parties` - create party
- `PATCH /parties/:id` - update party
- `DELETE /parties/:id` - delete party

### Stock

- `GET /stock/:userId` - list stock items
- `POST /stock` - create stock item
- `PATCH /stock/:id` - update stock item
- `DELETE /stock/:id` - delete stock item

## Main Frontend Screens

- `HomeScreen.js` - dashboard with financial performance, recent invoices, stock alerts, and top customers
- `InvoicesScreen.js` - billing engine with B2B/B2C flows, invoice filters, and recent invoice list
- `CreateInvoiceScreen.js` - customer details, stock item selection, GST calculation, and invoice generation
- `StockScreen.js` - inventory ledger, SKU search, GST badges, and low-stock tracking
- `PartiesScreen.js` - party/customer list, GSTIN search, invoice count, and revenue summary
- `ReportsScreen.js` - revenue, GST, filing, and customer reporting
- `OnboardingScreen.js` - GSTIN-based business onboarding
- `LoginScreen.js` - user login flow

## GSTIN API

GSTIN lookup is implemented in:

```text
ebizzpro/src/utils/gstApi.js
```

For production, do not keep API keys hardcoded in the mobile app. Move secrets to a backend service or environment-protected API layer so keys are not exposed in the client bundle.

## Deployment

Backend deployment instructions are available in:

```text
ebizzpro-backend/DEPLOY.md
```

Typical Render settings:

- Build command: `npm install`
- Start command: `node server.js`
- Environment variable: `MONGODB_URI`

## Security Notes

- Do not commit `.env` files.
- Do not commit database passwords or API keys.
- Rotate any API key that has already been committed or shared.
- The current backend stores passwords as plain text. Before production use, add password hashing with a library such as `bcrypt`.
- Restrict MongoDB Atlas network access for production instead of allowing all IPs.

## Useful Commands

Frontend:

```bash
cd ebizzpro
npm install
npm start
```

Backend:

```bash
cd ebizzpro-backend
npm install
npm run dev
```

## License

No license file is currently included. Add one before publishing or sharing the project publicly.
