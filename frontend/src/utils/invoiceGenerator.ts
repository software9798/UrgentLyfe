import { Booking, User } from '../types';

export function generateInvoiceHTML(booking: Booking, user?: User | null): string {
  const invoiceNo = `INV-UL-${booking.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-8)}`;
  const dateStr = new Date(booking.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = new Date(booking.createdAt || Date.now()).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const basePrice = Math.round(booking.totalAmount / 1.18);
  const totalGst = booking.totalAmount - basePrice;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;
  const customerName = user?.fullName || booking.userName || 'Valued Customer';
  const customerPhone = user?.phone || booking.userPhone || '+91 98765 43210';
  const customerEmail = user?.email || 'customer@urgentlyfe.com';
  const addressLine = `${booking.userAddress.line1}, ${booking.userAddress.locality}, ${booking.userAddress.city}${
    booking.userAddress.pincode ? ` - ${booking.userAddress.pincode}` : ''
  }`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GST Tax Invoice - ${invoiceNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: #f8fafc; color: #1e293b; padding: 32px 16px; font-size: 13px; line-height: 1.5; }
    .invoice-card { max-width: 800px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 28px 36px; display: flex; justify-content: space-between; align-items: center; }
    .logo-badge { background: #2563eb; color: #fff; font-weight: 900; font-size: 20px; padding: 6px 14px; border-radius: 10px; display: inline-block; margin-bottom: 6px; font-style: italic; }
    .company-title { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
    .company-sub { font-size: 11px; color: #94a3b8; }
    .invoice-tag { text-align: right; }
    .invoice-tag h1 { font-size: 22px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.5px; }
    .invoice-tag p { font-size: 12px; color: #cbd5e1; font-family: monospace; }
    
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 28px 36px; border-bottom: 1px solid #f1f5f9; background: #fafafa; }
    .meta-box h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 800; margin-bottom: 6px; }
    .meta-box p { font-size: 13px; color: #1e293b; font-weight: 600; }
    .meta-box .subtext { font-size: 12px; color: #64748b; font-weight: 400; }

    .table-container { padding: 28px 36px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #f1f5f9; padding: 12px 16px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 800; border-radius: 6px; }
    td { padding: 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: top; }
    .item-title { font-weight: 700; color: #0f172a; font-size: 14px; }
    .item-desc { font-size: 11px; color: #64748b; margin-top: 2px; }

    .summary-section { display: flex; justify-content: flex-end; padding: 0 36px 28px; }
    .summary-table { width: 320px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; }
    .summary-row.total { border-top: 2px solid #0f172a; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: 900; color: #0f172a; }

    .footer { background: #f8fafc; padding: 24px 36px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; }
    .footer-highlight { color: #10b981; font-weight: 700; }
    .print-btn-bar { max-width: 800px; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center; }
    .btn { background: #2563eb; color: #fff; border: none; padding: 10px 20px; font-size: 13px; font-weight: 700; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
    .btn:hover { background: #1d4ed8; }

    @media print {
      body { background: #fff; padding: 0; }
      .invoice-card { box-shadow: none; border: none; max-width: 100%; }
      .print-btn-bar { display: none !important; }
    }
  </style>
</head>
<body>

  <div class="print-btn-bar">
    <span style="font-weight: 700; color: #475569;">📄 UrgentLyfe Official GST Tax Invoice</span>
    <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="logo-badge">UL</div>
        <div class="company-title">UrgentLyfe Home Services Private Limited</div>
        <div class="company-sub">GSTIN: 29AAACU9821C1Z4 • SAC: 9987 (Maintenance & Repair Services)</div>
        <div class="company-sub">Regd Office: #104, Tech Innovation Hub, Indiranagar, Bengaluru, KA 560038</div>
      </div>
      <div class="invoice-tag">
        <h1>TAX INVOICE</h1>
        <p>${invoiceNo}</p>
        <p style="margin-top: 4px; font-size: 11px; color: #94a3b8;">Date: ${dateStr} • ${timeStr}</p>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h3>Billed To (Customer):</h3>
        <p>${customerName}</p>
        <div class="subtext">Phone: ${customerPhone}</div>
        <div class="subtext">Email: ${customerEmail}</div>
        <div class="subtext" style="margin-top: 4px;">Service Address: ${addressLine}</div>
      </div>
      <div class="meta-box">
        <h3>Booking & Payment Details:</h3>
        <p>Booking ID: <span style="font-family: monospace; color: #2563eb;">#${booking.id}</span></p>
        <div class="subtext">Order Type: <strong>${booking.isUrgent ? '30-Min Priority Emergency SOS' : 'Standard Scheduled Slot'}</strong></div>
        <div class="subtext">Service Status: <strong style="color: #10b981;">WORK COMPLETED & DELIVERED ✓</strong></div>
        <div class="subtext">Payment Method: <strong>${booking.paymentMethod === 'CASH' ? 'Cash On Delivery (COD)' : booking.paymentMethod || 'UPI / Online'}</strong></div>
        <div class="subtext">Payment Status: <strong style="color: #10b981;">${booking.paymentMethod === 'CASH' ? 'PAID VIA CASH ON DELIVERY' : 'PAID & VERIFIED'}</strong></div>
        <div class="subtext">Technician: <strong>${booking.partner?.name || 'Assigned Certified Partner'}</strong></div>
      </div>
    </div>

    ${booking.paymentMethod === 'CASH' ? `
    <div style="margin: 0 36px 16px; background: #ecfdf5; border: 1.5px dashed #10b981; border-radius: 12px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="background: #10b981; color: white; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold;">✓</span>
        <div>
          <p style="font-weight: 800; color: #065f46; font-size: 13px; margin: 0;">Cash on Delivery (COD) Payment Received & Work Delivered</p>
          <p style="color: #047857; font-size: 11px; margin: 0;">Amount of ₹${booking.totalAmount} collected and verified by technician (${booking.partner?.name || 'Authorized Partner'}).</p>
        </div>
      </div>
      <div style="background: #047857; color: white; font-weight: 900; font-size: 11px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
        PAID IN CASH ✓
      </div>
    </div>
    ` : `
    <div style="margin: 0 36px 16px; background: #eff6ff; border: 1.5px dashed #3b82f6; border-radius: 12px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="background: #3b82f6; color: white; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold;">✓</span>
        <div>
          <p style="font-weight: 800; color: #1e40af; font-size: 13px; margin: 0;">Online Payment Verified & Service Completed</p>
          <p style="color: #1d4ed8; font-size: 11px; margin: 0;">Transaction settled via ${booking.paymentMethod || 'UPI / Card'}. Service fulfilled by ${booking.partner?.name || 'UrgentLyfe Certified Partner'}.</p>
        </div>
      </div>
      <div style="background: #1d4ed8; color: white; font-weight: 900; font-size: 11px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
        COMPLETED & PAID ✓
      </div>
    </div>
    `}

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">Service Description</th>
            <th style="width: 15%;">SAC Code</th>
            <th style="width: 15%; text-align: center;">Warranty</th>
            <th style="width: 20%; text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-title">${booking.service.title}</div>
              <div class="item-desc">${booking.service.subtitle || booking.service.description}</div>
              ${booking.scheduledDate ? `<div class="item-desc">📅 Slot: ${booking.scheduledDate} (${booking.scheduledTimeSlot})</div>` : ''}
            </td>
            <td style="color: #64748b; font-family: monospace;">998721</td>
            <td style="text-align: center;"><span style="background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 12px; font-weight: 700; font-size: 11px;">30-Day Guarantee</span></td>
            <td style="text-align: right; font-weight: 700; font-size: 14px;">₹${basePrice}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="summary-section">
      <div class="summary-table">
        <div class="summary-row">
          <span>Taxable Value (Base Rate):</span>
          <span>₹${basePrice}</span>
        </div>
        <div class="summary-row">
          <span>CGST (9.0%):</span>
          <span>₹${cgst}</span>
        </div>
        <div class="summary-row">
          <span>SGST (9.0%):</span>
          <span>₹${sgst}</span>
        </div>
        <div class="summary-row">
          <span>Convenience & Safety Fee:</span>
          <span>₹0.00 (FREE)</span>
        </div>
        <div class="summary-row total">
          <span>Total Paid Amount:</span>
          <span>₹${booking.totalAmount}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Terms & Quality Assurance:</strong></p>
      <p>1. All work conducted under this invoice is backed by the <span class="footer-highlight">UrgentLyfe 30-Day Free Rework Guarantee</span>.</p>
      <p>2. 100% genuine parts & materials used. For emergency support, call 1800-URGENT-LYFE or reach support@urgentlyfe.com.</p>
      <p style="margin-top: 10px; font-size: 10px; color: #94a3b8; text-align: center;">This is a computer-generated tax invoice and requires no physical signature under Indian Information Technology Act.</p>
    </div>
  </div>

</body>
</html>`;
}

// Automatically downloads the invoice file to customer's machine
export function downloadInvoiceFile(booking: Booking, user?: User | null) {
  const htmlContent = generateInvoiceHTML(booking, user);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `UrgentLyfe_Tax_Invoice_${booking.id}.html`;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

// Opens the invoice preview in a new window/tab for instant printing or PDF saving
export function openInvoicePrintWindow(booking: Booking, user?: User | null) {
  const htmlContent = generateInvoiceHTML(booking, user);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // If popups are blocked in iframe, fallback to direct download
    downloadInvoiceFile(booking, user);
  }
}
