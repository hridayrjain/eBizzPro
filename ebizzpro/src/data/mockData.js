export const dashboardData = {
  monthlyRevenue: {
    amount: '4,28,450',
    change: '+16.2%',
    target: 73,
  },
  todayRevenue: {
    amount: '34,120',
    change: '-2.4% vs yesterday',
  },
  todayBills: {
    count: 28,
    label: 'Busy Day',
  },
};

export const recentInvoices = [
  {
    id: '302',
    number: '#302',
    company: 'Rajesh Exports Ltd.',
    gstin: '27AABCR1234F1Z5',
    amount: '12,450.00',
    time: '2:45 PM',
    status: 'PENDING',
    type: 'GST',
  },
  {
    id: '301',
    number: '#301',
    company: 'Mehta & Sons',
    gstin: '27AABCM5678G1E1',
    amount: '5,200.00',
    time: '1:12 PM',
    status: 'PAID',
    type: 'GST',
  },
  {
    id: '300',
    number: '#300',
    company: 'Om Logistics',
    gstin: '27PQRST1234A1Z9',
    amount: '18,900.00',
    time: '11:50 AM',
    status: 'PAID',
    type: 'GST',
  },
];

export const topCustomers = [
  { id: '1', initials: 'RE', name: 'Rajesh Exports', revenue: '₹1.2L', color: '#3B5BDB' },
  { id: '2', initials: 'MS', name: 'Mehta & Sons', revenue: '₹89K', color: '#7C3AED' },
];

export const parties = [
  {
    id: '1',
    name: 'Starlight Logistics Pvt Ltd',
    gstin: '27BCCDE1234F1Z1',
    status: 'ACTIVE',
    icon: 'truck-delivery',
    iconBg: '#EEF2FF',
    count: 12,
  },
  {
    id: '2',
    name: 'Apex Hardware Solutions',
    gstin: '27AA8BC3344D2Z5',
    status: 'DRAFT',
    icon: 'wrench',
    iconBg: '#FEF3C7',
    count: null,
  },
  {
    id: '3',
    name: 'Blue Horizon Exports',
    gstin: '27GGHI8988J1Z9',
    status: 'ACTIVE',
    icon: 'ship-wheel',
    iconBg: '#DBEAFE',
    count: null,
  },
  {
    id: '4',
    name: 'Titanium Industries Ltd',
    gstin: '27KLMN5660I0Z0',
    status: 'ACTIVE',
    icon: 'factory',
    iconBg: '#F3E8FF',
    count: null,
  },
  {
    id: '5',
    name: 'Organic Textiles Co.',
    gstin: '27PPQQR1225I24',
    status: 'ACTIVE',
    icon: 'leaf',
    iconBg: '#DCFCE7',
    count: null,
  },
];

export const stockItems = [
  {
    id: '1',
    name: 'ProX Wireless Headphones',
    sku: 'EB-AUD-992',
    hsn: '8518',
    quantity: 142,
    price: '4,250.00',
    priceType: 'EXCLUSIVE',
    gstRate: 18,
    gstType: 'IGST',
    isLowStock: false,
    image: null,
  },
  {
    id: '2',
    name: 'Nexus V3 Smartwatch',
    sku: 'EB-WTC-011',
    hsn: '9102',
    quantity: 58,
    price: '8,999.00',
    priceType: 'INCLUSIVE',
    gstRate: 12,
    gstType: 'CGST/SGST',
    isLowStock: false,
    image: null,
  },
  {
    id: '3',
    name: 'Studio Reference Monitors',
    sku: 'EB-AUD-104',
    hsn: '8518',
    quantity: 4,
    price: '24,500.00',
    priceType: 'EXCLUSIVE',
    gstRate: 28,
    gstType: 'IGST',
    isLowStock: true,
    image: null,
  },
  {
    id: '4',
    name: 'Minimalist Desk Lamp',
    sku: 'EB-UT-083',
    hsn: '9405',
    quantity: 310,
    price: '1,450.00',
    priceType: 'INCLUSIVE',
    gstRate: 5,
    gstType: 'CGST/SGST',
    isLowStock: false,
    image: null,
  },
];

export const stockSummary = {
  totalValue: '14,52,800',
  activeSkus: '1,248',
  lowStockAlerts: 24,
  avgGstRate: '18.2%',
};

export const invoicesList = [
  {
    id: '1',
    number: 'INV-240901',
    type: 'B2B GST',
    entity: 'Global Logistics Pvt Ltd',
    gstin: '27AACG1234F1Z1',
    date: 'Sep 12, 2023',
  },
  {
    id: '2',
    number: 'INV-240902',
    type: 'B2C',
    entity: 'Anish Sharma',
    phone: '+91 98765 43210',
    date: 'Sep 12, 2023',
  },
  {
    id: '3',
    number: 'INV-240903',
    type: 'B2B GST',
    entity: 'Modern Retail Hub',
    gstin: '27BBBC0267E8ZZ4',
    date: 'Sep 11, 2023',
  },
];

export const invoiceSummary = {
  totalBilled: '1,42,850',
  invoices: 24,
  pending: 3,
};

export const onboardingData = {
  businessName: 'Acme Industrial Solutions PVT LTD',
  registrationType: 'Regular GST Payer',
  stateJurisdiction: 'Maharashtra (27)',
  address: 'Plot 42, Industrial Area Phase II, MIDC, Andheri East, Mumbai, Maharashtra - 400069',
};

export const reportsData = {
  monthlyRevenue: [
    { month: 'Oct', amount: 280000 },
    { month: 'Nov', amount: 350000 },
    { month: 'Dec', amount: 310000 },
    { month: 'Jan', amount: 420000 },
    { month: 'Feb', amount: 390000 },
    { month: 'Mar', amount: 428450 },
  ],
  gstSummary: {
    totalGstCollected: '2,34,500',
    igst: '1,12,300',
    cgst: '61,100',
    sgst: '61,100',
    gstr1Status: 'Filed',
    gstr3bStatus: 'Pending',
  },
  topCategories: [
    { name: 'Electronics', percentage: 42, amount: '6,10,000' },
    { name: 'Industrial', percentage: 28, amount: '4,07,000' },
    { name: 'Home & Office', percentage: 18, amount: '2,61,500' },
    { name: 'Others', percentage: 12, amount: '1,74,300' },
  ],
  topCustomers: [
    { name: 'Rajesh Exports', amount: '1,20,000', invoices: 14 },
    { name: 'Mehta & Sons', amount: '89,000', invoices: 8 },
    { name: 'Global Logistics', amount: '76,500', invoices: 11 },
    { name: 'Om Logistics', amount: '54,200', invoices: 6 },
  ],
};
