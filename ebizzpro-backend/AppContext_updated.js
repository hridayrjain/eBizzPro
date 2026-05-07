import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, invoiceAPI, partyAPI, stockAPI } from '../utils/mongodb';
import { generateInvoiceNumber } from '../utils/gst';

const AppContext = createContext();
const SESSION_KEY = 'EBIZZ_SESSION';

const initialState = {
  isLoggedIn: false,
  user:       null,
  invoices:   [],
  parties:    [],
  stock:      [],
  loading:    true,
  syncing:    false,
  error:      null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':  return { ...state, loading: action.payload };
    case 'SET_SYNCING':  return { ...state, syncing: action.payload };
    case 'SET_ERROR':    return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':  return { ...state, error: null };

    case 'LOGIN':
      return { ...state, isLoggedIn: true, user: action.payload, loading: false, error: null };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'UPDATE_PROFILE':
      return { ...state, user: { ...state.user, businessProfile: action.payload } };

    case 'SET_INVOICES': return { ...state, invoices: action.payload };
    case 'SET_PARTIES':  return { ...state, parties:  action.payload };
    case 'SET_STOCK':    return { ...state, stock:    action.payload };

    case 'ADD_INVOICE':
      return { ...state, invoices: [action.payload, ...state.invoices] };
    case 'UPDATE_INVOICE':
      return { ...state, invoices: state.invoices.map(i => i._id === action.payload._id ? action.payload : i) };
    case 'DELETE_INVOICE':
      return { ...state, invoices: state.invoices.filter(i => i._id !== action.payload) };

    case 'ADD_PARTY':
      return { ...state, parties: [...state.parties, action.payload] };
    case 'UPDATE_PARTY':
      return { ...state, parties: state.parties.map(p => p._id === action.payload._id ? action.payload : p) };
    case 'DELETE_PARTY':
      return { ...state, parties: state.parties.filter(p => p._id !== action.payload) };

    case 'ADD_STOCK':
      return { ...state, stock: [...state.stock, action.payload] };
    case 'UPDATE_STOCK':
      return { ...state, stock: state.stock.map(s => s._id === action.payload._id ? action.payload : s) };
    case 'DELETE_STOCK':
      return { ...state, stock: state.stock.filter(s => s._id !== action.payload) };
    case 'DEDUCT_STOCK':
      return {
        ...state,
        stock: state.stock.map(item => {
          const d = action.payload.find(x => x.stockId === item._id);
          return d ? { ...item, quantity: Math.max(0, item.quantity - d.qty) } : item;
        }),
      };

    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const userIdRef = useRef(null);

  // Restore session on launch
  useEffect(() => {
    (async () => {
      try {
        const session = await AsyncStorage.getItem(SESSION_KEY);
        if (session) {
          const user = JSON.parse(session);
          userIdRef.current = user._id;
          dispatch({ type: 'LOGIN', payload: user });
          await loadAllData(user._id);
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  const loadAllData = async (userId) => {
    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      const [invoices, parties, stock] = await Promise.all([
        invoiceAPI.getAll(userId),
        partyAPI.getAll(userId),
        stockAPI.getAll(userId),
      ]);
      dispatch({ type: 'SET_INVOICES', payload: invoices });
      dispatch({ type: 'SET_PARTIES',  payload: parties });
      dispatch({ type: 'SET_STOCK',    payload: stock });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync. Check your connection.' });
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  // ── Auth ────────────────────────────────────────────────────────
  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await authAPI.login(email, password);
      userIdRef.current = user._id;
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
      dispatch({ type: 'LOGIN', payload: user });
      await loadAllData(user._id);
    } catch (e) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw e;
    }
  };

  const register = async (name, email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await authAPI.register(name, email, password);
      userIdRef.current = user._id;
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
      dispatch({ type: 'LOGIN', payload: user });
    } catch (e) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw e;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    userIdRef.current = null;
    dispatch({ type: 'LOGOUT' });
  };

  const saveBusinessProfile = async (profile) => {
    await authAPI.updateProfile(userIdRef.current, profile);
    const updated = { ...state.user, businessProfile: profile };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    dispatch({ type: 'UPDATE_PROFILE', payload: profile });
  };

  // ── Invoices ────────────────────────────────────────────────────
  const addInvoice = async (data) => {
    const invoiceNumber = generateInvoiceNumber(state.invoices.length);
    const payload = {
      ...data,
      userId: userIdRef.current,
      invoiceNumber,
      date: new Date().toISOString().split('T')[0],
    };
    const invoice = await invoiceAPI.create(payload);
    dispatch({ type: 'ADD_INVOICE', payload: invoice });
    if (data.items?.length) {
      dispatch({ type: 'DEDUCT_STOCK', payload: data.items.map(i => ({ stockId: i.stockId, qty: i.qty })) });
    }
    return invoice;
  };

  const updateInvoiceStatus = async (id, status) => {
    const invoice = await invoiceAPI.updateStatus(id, status);
    dispatch({ type: 'UPDATE_INVOICE', payload: invoice });
  };

  const deleteInvoice = async (id) => {
    await invoiceAPI.delete(id);
    dispatch({ type: 'DELETE_INVOICE', payload: id });
  };

  // ── Parties ─────────────────────────────────────────────────────
  const addParty = async (data) => {
    const party = await partyAPI.create({ ...data, userId: userIdRef.current });
    dispatch({ type: 'ADD_PARTY', payload: party });
  };

  const updateParty = async (id, data) => {
    const party = await partyAPI.update(id, data);
    dispatch({ type: 'UPDATE_PARTY', payload: party });
  };

  const deleteParty = async (id) => {
    await partyAPI.delete(id);
    dispatch({ type: 'DELETE_PARTY', payload: id });
  };

  // ── Stock ───────────────────────────────────────────────────────
  const addStock = async (data) => {
    const item = await stockAPI.create({ ...data, userId: userIdRef.current });
    dispatch({ type: 'ADD_STOCK', payload: item });
  };

  const updateStock = async (id, data) => {
    const item = await stockAPI.update(id, data);
    dispatch({ type: 'UPDATE_STOCK', payload: item });
  };

  const deleteStock = async (id) => {
    await stockAPI.delete(id);
    dispatch({ type: 'DELETE_STOCK', payload: id });
  };

  // ── Computed stats ──────────────────────────────────────────────
  const getInvoiceStats = useCallback(() => {
    const today     = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthly   = state.invoices.filter(i => i.date?.startsWith(thisMonth));
    const todays    = state.invoices.filter(i => i.date === today);
    return {
      monthlyRevenue: monthly.reduce((s, i) => s + (i.total || 0), 0),
      todayRevenue:   todays.reduce((s, i)  => s + (i.total || 0), 0),
      todayBills:     todays.length,
      totalPending:   state.invoices.filter(i => i.status === 'PENDING').length,
      totalInvoices:  state.invoices.length,
    };
  }, [state.invoices]);

  const getStockStats = useCallback(() => {
    const low = state.stock.filter(s => s.quantity <= (s.lowStockThreshold || 10));
    return {
      totalValue:     state.stock.reduce((s, i) => s + i.quantity * i.price, 0),
      activeSkus:     state.stock.length,
      lowStockAlerts: low.length,
      lowStockItems:  low,
    };
  }, [state.stock]);

  const getGstSummary = useCallback(() => {
    const paid = state.invoices.filter(i => i.status === 'PAID');
    return {
      totalGstCollected: paid.reduce((s, i) => s + (i.gstAmount || 0), 0),
      igst: paid.reduce((s, i) => s + (i.igst || 0), 0),
      cgst: paid.reduce((s, i) => s + (i.cgst || 0), 0),
      sgst: paid.reduce((s, i) => s + (i.sgst || 0), 0),
    };
  }, [state.invoices]);

  const getTopCustomers = useCallback(() => {
    const map = {};
    state.invoices.forEach(inv => {
      if (!map[inv.customerName]) map[inv.customerName] = { name: inv.customerName, revenue: 0, invoices: 0 };
      map[inv.customerName].revenue  += inv.total || 0;
      map[inv.customerName].invoices += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [state.invoices]);

  return (
    <AppContext.Provider value={{
      state, dispatch,
      login, register, logout,
      saveBusinessProfile,
      addInvoice, updateInvoiceStatus, deleteInvoice,
      addParty, updateParty, deleteParty,
      addStock, updateStock, deleteStock,
      refreshData: () => loadAllData(userIdRef.current),
      getInvoiceStats, getStockStats, getGstSummary, getTopCustomers,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
