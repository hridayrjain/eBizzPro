import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function numberToWords(num) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';
  const intPart = Math.floor(num);

  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  return convert(intPart) + ' Rupees Only';
}

export function generateInvoiceHTML(invoice, businessProfile) {
  const business = businessProfile || {
    businessName: 'Acme Industrial Solutions PVT LTD',
    gstin: '27AABCA1234F1Z5',
    address: 'Plot 42, Industrial Area Phase II, MIDC, Andheri East, Mumbai, Maharashtra - 400069',
    state: 'Maharashtra (27)',
  };

  const isB2B = invoice.type === 'B2B';
  const isInterState = invoice.isInterState;
  const invoiceDate = new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const itemRows = invoice.items.map((item, i) => {
    let isInclusive = item.isInclusive;
    let itemTotalRaw = item.qty * item.price;
    let taxable = isInclusive ? (itemTotalRaw / (1 + item.gstRate / 100)) : itemTotalRaw;
    let gstAmt = isInclusive ? (itemTotalRaw - taxable) : (taxable * item.gstRate / 100);
    let finalTotal = taxable + gstAmt;

    let gstCols = '';
    if (isB2B) {
      if (isInterState) {
        gstCols = `<td style="text-align:right">${formatCurrency(gstAmt)}<br><span style="font-size:9px;color:#666">IGST</span></td>`;
      } else {
        gstCols = `<td style="text-align:right">${formatCurrency(gstAmt/2)}<br><span style="font-size:9px;color:#666">CGST</span></td>
                   <td style="text-align:right">${formatCurrency(gstAmt/2)}<br><span style="font-size:9px;color:#666">SGST</span></td>`;
      }
    } else {
      gstCols = `<td style="text-align:right">${formatCurrency(gstAmt)}</td>`;
    }

    return `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${item.name}<br><span style="color:#666;font-size:11px">${item.hsn ? 'HSN: ' + item.hsn : ''}</span></td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">${formatCurrency(item.price)}<br><span style="font-size:9px;color:#666">${isInclusive?'(Inc)':'(Exc)'}</span></td>
        <td style="text-align:center">${item.gstRate}%</td>
        <td style="text-align:right">${formatCurrency(taxable)}</td>
        ${gstCols}
        <td style="text-align:right">${formatCurrency(finalTotal)}</td>
      </tr>
    `;
  }).join('');
  
  let gstHeaderCols = '';
  if (isB2B) {
    if (isInterState) {
      gstHeaderCols = `<th style="text-align:right">IGST Amt</th>`;
    } else {
      gstHeaderCols = `<th style="text-align:right">CGST Amt</th><th style="text-align:right">SGST Amt</th>`;
    }
  } else {
    gstHeaderCols = `<th style="text-align:right">GST</th>`;
  }


  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 30px; color: #1B2B5E; font-size: 13px; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1B2B5E; padding-bottom: 20px; margin-bottom: 20px; }
      .company-name { font-size: 22px; font-weight: 800; color: #1B2B5E; }
      .company-detail { color: #666; font-size: 11px; margin-top: 4px; }
      .invoice-title { font-size: 28px; font-weight: 800; color: #1B2B5E; text-align: right; }
      .invoice-meta { text-align: right; margin-top: 8px; }
      .invoice-meta span { display: block; font-size: 12px; color: #666; }
      .invoice-meta strong { color: #1B2B5E; }
      .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: 700; margin-top: 6px; }
      .badge-b2b { background: #EEF2FF; color: #1B2B5E; }
      .badge-b2c { background: #DCFCE7; color: #16A34A; }
      .badge-paid { background: #DCFCE7; color: #16A34A; }
      .badge-pending { background: #FFEDD5; color: #F97316; }
      .section { margin-bottom: 20px; }
      .section-title { font-size: 10px; font-weight: 700; color: #3B5BDB; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px; }
      .billing-grid { display: flex; justify-content: space-between; }
      .billing-box { width: 48%; background: #F8F9FC; padding: 15px; border-radius: 8px; }
      .billing-name { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
      .billing-detail { font-size: 11px; color: #666; line-height: 1.6; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th { background: #1B2B5E; color: white; padding: 10px 8px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
      td { padding: 10px 8px; border-bottom: 1px solid #E5E7EB; font-size: 12px; }
      tr:nth-child(even) { background: #F8F9FC; }
      .totals { margin-top: 20px; display: flex; justify-content: flex-end; }
      .totals-box { width: 300px; }
      .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
      .totals-row.grand { border-top: 2px solid #1B2B5E; padding-top: 10px; margin-top: 6px; font-size: 16px; font-weight: 800; }
      .words { margin-top: 15px; padding: 12px; background: #EEF2FF; border-radius: 8px; font-size: 12px; font-style: italic; }
      .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #E5E7EB; padding-top: 20px; }
      .footer-left { font-size: 11px; color: #666; }
      .stamp { width: 150px; text-align: center; }
      .stamp-line { border-top: 1px solid #1B2B5E; margin-top: 40px; padding-top: 8px; font-size: 11px; font-weight: 600; }
      .terms { margin-top: 20px; font-size: 10px; color: #999; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="company-name">${business.businessName}</div>
        <div class="company-detail">GSTIN: ${business.gstin}</div>
        <div class="company-detail">${business.address}</div>
        <div class="company-detail">State: ${business.state}</div>
      </div>
      <div>
        <div class="invoice-title">TAX INVOICE</div>
        <div class="invoice-meta">
          <span>Invoice No: <strong>${invoice.id}</strong></span>
          <span>Date: <strong>${invoiceDate}</strong></span>
          <span class="badge ${isB2B ? 'badge-b2b' : 'badge-b2c'}">${invoice.type}</span>
          <span class="badge ${invoice.status === 'PAID' ? 'badge-paid' : 'badge-pending'}" style="margin-left:4px">${invoice.status}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="billing-grid">
        <div class="billing-box">
          <div class="section-title">Bill From</div>
          <div class="billing-name">${business.businessName}</div>
          <div class="billing-detail">
            GSTIN: ${business.gstin}<br>
            ${business.address}
          </div>
        </div>
        <div class="billing-box">
          <div class="section-title">Bill To</div>
          <div class="billing-name">${invoice.customerName}</div>
          <div class="billing-detail">
            ${isB2B ? 'GSTIN: ' + invoice.gstin : 'Phone: ' + invoice.phone}<br>
            ${invoice.customerAddress || ''}
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Item Details</div>
      <table>
        <thead>
          <tr>
            <th style="width:40px">#</th>
            <th>Item Description</th>
            <th style="text-align:center">Qty</th>
            <th style="text-align:right">Unit Price</th>
            <th style="text-align:center">GST %</th>
            <th style="text-align:right">Taxable</th>
            ${gstHeaderCols}
            <th style="text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>
    </div>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row"><span>Subtotal (Taxable)</span><span>${formatCurrency(invoice.subtotal)}</span></div>
        <div class="totals-row"><span>GST</span><span>${formatCurrency(invoice.gstAmount)}</span></div>
        ${Math.abs(invoice.roundOffAmount || 0) > 0.001 ? `<div class="totals-row"><span>Round Off</span><span>${invoice.roundOffAmount > 0 ? '+' : ''}${formatCurrency(invoice.roundOffAmount)}</span></div>` : ''}
        <div class="totals-row grand"><span>Grand Total</span><span>${formatCurrency(invoice.total)}</span></div>
      </div>
    </div>

    <div class="words">
      <strong>Amount in words:</strong> ${numberToWords(invoice.total)}
    </div>

    <div class="footer">
      <div class="footer-left">
        <div>Payment Terms: Due on receipt</div>
        <div>Generated by eBizz Pro</div>
      </div>
      <div class="stamp">
        <div class="stamp-line">Authorized Signatory</div>
      </div>
    </div>

    <div class="terms">
      <strong>Terms & Conditions:</strong><br>
      1. Payment is due within 30 days of invoice date.<br>
      2. This is a computer-generated invoice and does not require a physical signature.<br>
      3. Subject to jurisdiction of ${business.state} courts only.
    </div>
  </body>
  </html>
  `;
}

export async function printInvoice(invoice, businessProfile) {
  try {
    const html = generateInvoiceHTML(invoice, businessProfile);
    await Print.printAsync({ html });
  } catch (error) {
    console.log('Print error:', error);
    throw error;
  }
}

export async function shareInvoice(invoice, businessProfile) {
  try {
    const html = generateInvoiceHTML(invoice, businessProfile);
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: `Invoice ${invoice.id}`,
      });
    }
  } catch (error) {
    console.log('Share error:', error);
    throw error;
  }
}

export function generateReportHTML(title, data, businessProfile) {
  const business = businessProfile || { businessName: 'Acme Industrial Solutions PVT LTD' };
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 30px; color: #1B2B5E; }
      h1 { font-size: 24px; margin-bottom: 4px; }
      h2 { font-size: 14px; color: #666; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #1B2B5E; color: white; padding: 10px; font-size: 11px; text-align: left; }
      td { padding: 10px; border-bottom: 1px solid #E5E7EB; font-size: 12px; }
      .total { font-weight: bold; background: #F8F9FC; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <h2>${business.businessName} — Generated ${new Date().toLocaleDateString('en-IN')}</h2>
    ${data}
  </body>
  </html>
  `;
}
