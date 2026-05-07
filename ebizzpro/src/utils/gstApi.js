export const fetchGstinDetails = async (gstin) => {
  const API_KEY = '0e8b19b1bae23bce24c77a5fa677fd1a';
  const BASE_URL = 'https://sheet.gstincheck.co.in/check';

  try {
    const response = await fetch(`${BASE_URL}/${API_KEY}/${gstin}`);
    const json = await response.json();
    
    if (json.flag) {
      return {
        success: true,
        data: {
          businessName: json.data.lgnm || json.data.tradeNam || 'Unknown',
          tradeName: json.data.tradeNam,
          gstin: json.data.gstin,
          registrationType: json.data.dty || 'Regular',
          state: json.data.pradr?.addr?.stcd || 'Unknown',
          address: json.data.pradr?.adr || 'Unknown',
          status: json.data.sts,
        }
      };
    } else {
      return { success: false, error: json.message || 'Invalid GSTIN' };
    }
  } catch (error) {
    return { success: false, error: 'Network error while checking GSTIN' };
  }
};
