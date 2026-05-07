const mongoose = require('mongoose');

// ── User ──────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name:            { type: String, required: true },
  email:           { type: String, required: true, unique: true, lowercase: true },
  password:        { type: String, required: true },
  businessProfile: { type: Object, default: null },
}, { timestamps: true });

// ── Party ─────────────────────────────────────────────────────────
const PartySchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  gstin:     String,
  phone:     String,
  email:     String,
  address:   String,
  stateCode: String,
  type:      { type: String, enum: ['B2B', 'B2C'], default: 'B2B' },
  status:    { type: String, enum: ['ACTIVE', 'INACTIVE', 'DRAFT'], default: 'ACTIVE' },
}, { timestamps: true });

// ── Stock ─────────────────────────────────────────────────────────
const StockSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:              { type: String, required: true },
  sku:               String,
  hsn:               String,
  quantity:          { type: Number, default: 0 },
  price:             { type: Number, required: true },
  gstRate:           { type: Number, default: 18 },
  lowStockThreshold: { type: Number, default: 10 },
}, { timestamps: true });

// ── Invoice ───────────────────────────────────────────────────────
const InvoiceSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNumber:   { type: String, required: true },
  type:            { type: String, enum: ['B2B', 'B2C'], default: 'B2B' },
  customerName:    { type: String, required: true },
  customerGstin:   String,
  customerPhone:   String,
  customerAddress: String,
  items: [{
    stockId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Stock' },
    name:     String,
    hsn:      String,
    qty:      Number,
    price:    Number,
    gstRate:  Number,
  }],
  subtotal:  { type: Number, default: 0 },
  gstAmount: { type: Number, default: 0 },
  cgst:      { type: Number, default: 0 },
  sgst:      { type: Number, default: 0 },
  igst:      { type: Number, default: 0 },
  isIgst:    { type: Boolean, default: false },
  total:     { type: Number, default: 0 },
  status:    { type: String, enum: ['PENDING', 'PAID', 'CANCELLED'], default: 'PENDING' },
  notes:     String,
  date:      { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { timestamps: true });

module.exports = {
  User:    mongoose.model('User',    UserSchema),
  Party:   mongoose.model('Party',   PartySchema),
  Stock:   mongoose.model('Stock',   StockSchema),
  Invoice: mongoose.model('Invoice', InvoiceSchema),
};
