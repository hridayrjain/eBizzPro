import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppContext = createContext();

const STORAGE_KEY = 'EBIZZ_PRO_DATA';

const initialState = {
  isLoggedIn: false,
  isOnboarded: false,
  businessProfile: null,
  invoices: [
    {
      id: 'INV-240901',
      type: 'B2B',
      customerName: 'Global Logistics Pvt Ltd',
      gstin: '27AACG1234F1Z1',
      phone: '',
      items: [
        { name: 'ProX Wireless Headphones', qty: 10, price: 4250, gstRate: 18, hsn: '8518' },
      ],
      subtotal: 42500,
      gstAmount: 7650,
      total: 50150,
      date: '2023-09-12',
      status: 'PAID',
      notes: '',
    },
    {
      id: 'INV-240902',
      type: 'B2C',
      customerName: 'Anish Sharma',
      gstin: '',
      phone: '+91 98765 43210',
      items: [
        { name: 'Nexus V3 Smartwatch', qty: 2, price: 8999, gstRate: 12, hsn: '9102' },
      ],
      subtotal: 17998,
      gstAmount: 2159.76,
      total: 20157.76,
      date: '2023-09-12',
      status: 'PAID',
      notes: '',
    },
    {
      id: 'INV-240903',
      type: 'B2B',
      customerName: 'Modern Retail Hub',
      gstin: '27BBBC0267E8ZZ4',
      phone: '',
      items: [
        { name: 'Studio Reference Monitors', qty: 3, price: 24500, gstRate: 28, hsn: '8518' },
      ],
      subtotal: 73500,
      gstAmount: 20580,
      total: 94080,
      date: '2023-09-11',
      status: 'PENDING',
      notes: '',
    },
    {
      id: 'INV-240904',
      type: 'B2B',
      customerName: 'Rajesh Exports Ltd.',
      gstin: '27AABCR1234F1Z5',
      phone: '',
      items: [
        { name: 'Minimalist Desk Lamp', qty: 20, price: 1450, gstRate: 5, hsn: '9405' },
      ],
      subtotal: 29000,
      gstAmount: 1450,
      total: 30450,
      date: '2023-09-10',
      status: 'PAID',
      notes: '',
    },
    {
      id: 'INV-240905',
      type: 'B2C',
      customerName: 'Mehta & Sons',
      gstin: '27AABCM5678G1E1',
      phone: '',
      items: [
        { name: 'ProX Wireless Headphones', qty: 5, price: 4250, gstRate: 18, hsn: '8518' },
      ],
      subtotal: 21250,
      gstAmount: 3825,
      total: 25075,
      date: '2023-09-09',
      status: 'PAID',
      notes: '',
    },
  ],
  parties: [
    { id: 'P001', name: 'Starlight Logistics Pvt Ltd', gstin: '27BCCDE1234F1Z1', phone: '+91 98765 11111', email: 'info@starlight.com', address: 'Mumbai, Maharashtra', status: 'ACTIVE', type: 'B2B' },
    { id: 'P002', name: 'Apex Hardware Solutions', gstin: '27AA8BC3344D2Z5', phone: '+91 98765 22222', email: 'contact@apex.com', address: 'Pune, Maharashtra', status: 'DRAFT', type: 'B2B' },
    { id: 'P003', name: 'Blue Horizon Exports', gstin: '27GGHI8988J1Z9', phone: '+91 98765 33333', email: 'export@bluehorizon.com', address: 'Delhi, NCR', status: 'ACTIVE', type: 'B2B' },
    { id: 'P004', name: 'Titanium Industries Ltd', gstin: '27KLMN5660I0Z0', phone: '+91 98765 44444', email: 'sales@titanium.com', address: 'Chennai, Tamil Nadu', status: 'ACTIVE', type: 'B2B' },
    { id: 'P005', name: 'Organic Textiles Co.', gstin: '27PPQQR1225I24', phone: '+91 98765 55555', email: 'hello@organic.com', address: 'Ahmedabad, Gujarat', status: 'ACTIVE', type: 'B2B' },
  ],
  stock: [
    { id: 'S001', name: 'ProX Wireless Headphones', sku: 'EB-AUD-992', hsn: '8518', quantity: 142, price: 4250, gstRate: 18, gstType: 'IGST', lowStockThreshold: 20 },
    { id: 'S002', name: 'Nexus V3 Smartwatch', sku: 'EB-WTC-011', hsn: '9102', quantity: 58, price: 8999, gstRate: 12, gstType: 'CGST/SGST', lowStockThreshold: 15 },
    { id: 'S003', name: 'Studio Reference Monitors', sku: 'EB-AUD-104', hsn: '8518', quantity: 4, price: 24500, gstRate: 28, gstType: 'IGST', lowStockThreshold: 10 },
    { id: 'S004', name: 'Minimalist Desk Lamp', sku: 'EB-UT-083', hsn: '9405', quantity: 310, price: 1450, gstRate: 5, gstType: 'CGST/SGST', lowStockThreshold: 25 },
    { id: 'S005', name: 'Ergonomic Office Chair', sku: 'EB-FN-201', hsn: '9401', quantity: 22, price: 15800, gstRate: 18, gstType: 'IGST', lowStockThreshold: 10 },
    { id: 'S006', name: 'USB-C Hub Pro', sku: 'EB-ACC-055', hsn: '8471', quantity: 230, price: 2999, gstRate: 18, gstType: 'CGST/SGST', lowStockThreshold: 30 },
  ],
  nextInvoiceNumber: 906,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };

    case 'LOGIN':
      return { ...state, isLoggedIn: true };

    case 'COMPLETE_ONBOARDING':
      return { ...state, isOnboarded: true, businessProfile: action.payload };

    case 'ADD_INVOICE': {
      const invoiceId = `INV-24${String(state.nextInvoiceNumber).padStart(4, '0')}`;
      const newInvoice = { ...action.payload, id: invoiceId, date: new Date().toISOString().split('T')[0] };
      // Reduce stock quantities
      const updatedStock = state.stock.map(item => {
        const invoiceItem = newInvoice.items.find(i => i.stockId === item.id);
        if (invoiceItem) {
          return { ...item, quantity: Math.max(0, item.quantity - invoiceItem.qty) };
        }
        return item;
      });
      return {
        ...state,
        invoices: [newInvoice, ...state.invoices],
        stock: updatedStock,
        nextInvoiceNumber: state.nextInvoiceNumber + 1,
      };
    }

    case 'UPDATE_INVOICE_STATUS':
      return {
        ...state,
        invoices: state.invoices.map(inv =>
          inv.id === action.payload.id ? { ...inv, status: action.payload.status } : inv
        ),
      };

    case 'ADD_PARTY':
      return {
        ...state,
        parties: [...state.parties, { ...action.payload, id: `P${String(state.parties.length + 1).padStart(3, '0')}` }],
      };

    case 'UPDATE_PARTY':
      return {
        ...state,
        parties: state.parties.map(p => p.id === action.payload.id ? action.payload : p),
      };

    case 'DELETE_PARTY':
      return {
        ...state,
        parties: state.parties.filter(p => p.id !== action.payload),
      };

    case 'ADD_STOCK':
      return {
        ...state,
        stock: [...state.stock, { ...action.payload, id: `S${String(state.stock.length + 1).padStart(3, '0')}` }],
      };

    case 'UPDATE_STOCK':
      return {
        ...state,
        stock: state.stock.map(s => s.id === action.payload.id ? action.payload : s),
      };

    case 'DELETE_STOCK':
      return {
        ...state,
        stock: state.stock.filter(s => s.id !== action.payload),
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (state.isLoggedIn) {
      saveData(state);
    }
  }, [state]);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: 'LOAD_DATA', payload: parsed });
      }
    } catch (e) {
      console.log('Error loading data:', e);
    }
  };

  const saveData = async (data) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.log('Error saving data:', e);
    }
  };

  // Computed values
  const getInvoiceStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);

    const monthlyInvoices = state.invoices.filter(i => i.date.startsWith(thisMonth));
    const todayInvoices = state.invoices.filter(i => i.date === today);

    const monthlyRevenue = monthlyInvoices.reduce((sum, i) => sum + i.total, 0);
    const todayRevenue = todayInvoices.reduce((sum, i) => sum + i.total, 0);
    const totalPending = state.invoices.filter(i => i.status === 'PENDING').length;

    return { monthlyRevenue, todayRevenue, todayBills: todayInvoices.length, totalPending, totalInvoices: state.invoices.length };
  };

  const getStockStats = () => {
    const totalValue = state.stock.reduce((sum, s) => sum + (s.quantity * s.price), 0);
    const activeSkus = state.stock.length;
    const lowStockItems = state.stock.filter(s => s.quantity <= s.lowStockThreshold);
    const avgGstRate = state.stock.length > 0
      ? (state.stock.reduce((sum, s) => sum + s.gstRate, 0) / state.stock.length).toFixed(1)
      : 0;

    return { totalValue, activeSkus, lowStockAlerts: lowStockItems.length, avgGstRate, lowStockItems };
  };

  const getGstSummary = () => {
    const totalGst = state.invoices.reduce((sum, i) => sum + i.gstAmount, 0);
    const b2bInvoices = state.invoices.filter(i => i.type === 'B2B');
    const igst = b2bInvoices.reduce((sum, i) => sum + i.gstAmount, 0);
    const remaining = totalGst - igst;
    return {
      totalGstCollected: totalGst,
      igst,
      cgst: remaining / 2,
      sgst: remaining / 2,
    };
  };

  const getTopCustomers = () => {
    const customerMap = {};
    state.invoices.forEach(inv => {
      if (!customerMap[inv.customerName]) {
        customerMap[inv.customerName] = { name: inv.customerName, revenue: 0, invoices: 0 };
      }
      customerMap[inv.customerName].revenue += inv.total;
      customerMap[inv.customerName].invoices += 1;
    });
    return Object.values(customerMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  };

  return (
    <AppContext.Provider value={{
      state,
      dispatch,
      getInvoiceStats,
      getStockStats,
      getGstSummary,
      getTopCustomers,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
