require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const { User, Party, Stock, Invoice } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

// ── DB connect ────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

// ── Health check ──────────────────────────────────────────────────
app.get('/', (req, res) => res.json({ status: 'eBizzPro API running' }));

// ─────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────

// Register
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password are required' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: 'Account already exists. Please login.' });
    const user = await User.create({ name, email, password });
    res.json({ _id: user._id, name: user.name, email: user.email, businessProfile: null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)             return res.status(404).json({ error: 'No account found. Please register.' });
    if (user.password !== password) return res.status(401).json({ error: 'Incorrect password.' });
    res.json({ _id: user._id, name: user.name, email: user.email, businessProfile: user.businessProfile });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update business profile
app.patch('/auth/profile/:userId', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { businessProfile: req.body },
      { new: true }
    );
    res.json({ businessProfile: user.businessProfile });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────────────────────────────

app.get('/invoices/:userId', async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/invoices', async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);

    // Deduct stock quantities
    if (req.body.items?.length) {
      await Promise.all(
        req.body.items
          .filter(i => i.stockId)
          .map(i => Stock.findByIdAndUpdate(i.stockId, { $inc: { quantity: -i.qty } }))
      );
    }
    res.json(invoice);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/invoices/:id/status', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(invoice);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/invoices/:id', async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────
// PARTIES
// ─────────────────────────────────────────────────────────────────

app.get('/parties/:userId', async (req, res) => {
  try {
    const parties = await Party.find({ userId: req.params.userId }).sort({ name: 1 });
    res.json(parties);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/parties', async (req, res) => {
  try {
    const party = await Party.create(req.body);
    res.json(party);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/parties/:id', async (req, res) => {
  try {
    const party = await Party.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(party);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/parties/:id', async (req, res) => {
  try {
    await Party.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────
// STOCK
// ─────────────────────────────────────────────────────────────────

app.get('/stock/:userId', async (req, res) => {
  try {
    const stock = await Stock.find({ userId: req.params.userId }).sort({ name: 1 });
    res.json(stock);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/stock', async (req, res) => {
  try {
    const item = await Stock.create(req.body);
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.patch('/stock/:id', async (req, res) => {
  try {
    const item = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/stock/:id', async (req, res) => {
  try {
    await Stock.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
