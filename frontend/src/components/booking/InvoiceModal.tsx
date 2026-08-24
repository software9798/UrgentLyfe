import React from 'react';
import { X, Download, Printer, ShieldCheck, CheckCircle2, FileText, Calendar, CreditCard } from 'lucide-react';
import { Booking, User } from '../../types';
import { downloadInvoiceFile, openInvoicePrintWindow } from '../../utils/invoiceGenerator';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  user?: User | null;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  booking,
  user,
}) => {
  if (!isOpen || !booking) return null;

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
  const addressLine = `${booking.userAddress.line1}, ${booking.userAddress.locality}, ${booking.userAddress.city}${
    booking.userAddress.pincode ? ` - ${booking.userAddress.pincode}` : ''
  }`;

  const handleDownload = () => {
    downloadInvoiceFile(booking, user);
  };

  const handlePrint = () => {
    openInvoicePrintWindow(booking, user);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 flex flex-col">
        {/* Modal Top Bar */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black italic text-lg shadow-md">
              UL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">GST Tax Invoice</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md">
                  PAID ✓
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{invoiceNo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-blue-600/20"
              title="Download Invoice File"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-full transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable View */}
        <div className="p-6 space-y-6 text-slate-800 text-xs">
          {/* Company Details */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <p className="font-extrabold text-sm text-slate-900">UrgentLyfe Home Services Private Limited</p>
              <p className="text-[11px] text-slate-500 mt-0.5">GSTIN: 29AAACU9821C1Z4 • SAC: 9987</p>
              <p className="text-[11px] text-slate-500">Regd Office: #104, Tech Innovation Hub, Indiranagar, Bengaluru, KA 560038</p>
            </div>
            <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Invoice Date</span>
              <p className="font-bold text-slate-900">{dateStr}</p>
              <p className="text-[11px] text-slate-500">{timeStr}</p>
            </div>
          </div>

          {/* Cash on Delivery Payment Verified Banner */}
          {booking.paymentMethod === 'CASH' ? (
            <div className="bg-emerald-50 border-2 border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  💵
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-emerald-950 text-xs">Cash on Delivery (COD) Paid</span>
                    <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Payment of <strong className="text-emerald-950">₹{booking.totalAmount}</strong> collected in cash by technician ({booking.partner?.name || 'UrgentLyfe Partner'}). Zero balance remaining.
                  </p>
                </div>
              </div>
              <div className="hidden sm:block text-right shrink-0">
                <span className="inline-block border-2 border-emerald-600 text-emerald-800 font-mono font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider bg-white">
                  PAID IN CASH ✓
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border-2 border-blue-500/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                  💳
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-blue-950 text-xs">Online Payment Verified & Service Delivered</span>
                    <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                      PAID & VERIFIED
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Payment of <strong className="text-blue-950">₹{booking.totalAmount}</strong> settled via {booking.paymentMethod || 'UPI / Card'}. Service completed by {booking.partner?.name || 'UrgentLyfe Partner'}.
                  </p>
                </div>
              </div>
              <div className="hidden sm:block text-right shrink-0">
                <span className="inline-block border-2 border-blue-600 text-blue-800 font-mono font-black text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider bg-white">
                  COMPLETED & PAID ✓
                </span>
              </div>
            </div>
          )}

          {/* Billed To & Booking Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Customer Details</p>
              <p className="font-bold text-slate-900 text-xs">{customerName}</p>
              <p className="text-slate-600 text-[11px]">{customerPhone}</p>
              <p className="text-slate-600 text-[11px] mt-1">{addressLine}</p>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Order Summary</p>
              <p className="text-slate-700"><span className="font-semibold">Booking ID:</span> #{booking.id}</p>
              <p className="text-slate-700"><span className="font-semibold">Technician:</span> {booking.partner?.name || 'Certified UrgentLyfe Partner'}</p>
              <p className="text-slate-700">
                <span className="font-semibold">Payment Method:</span>{' '}
                {booking.paymentMethod === 'CASH' ? (
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Cash On Delivery (COD)
                  </span>
                ) : (
                  booking.paymentMethod || 'UPI / Online'
                )}
              </p>
              <p className="text-slate-700 flex items-center gap-1">
                <span className="font-semibold">Warranty:</span>
                <span className="text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.2 rounded text-[10px]">
                  30-Day Guarantee
                </span>
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3 pl-4">Service Description</th>
                  <th className="p-3 text-center">SAC</th>
                  <th className="p-3 text-right pr-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 pl-4">
                    <p className="font-bold text-slate-900 text-xs">{booking.service.title}</p>
                    <p className="text-slate-500 text-[11px]">{booking.service.subtitle || booking.service.description}</p>
                    {booking.isUrgent && (
                      <span className="inline-block mt-1 bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                        ⚡ 30-Min Emergency Express SOS
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center text-slate-500 font-mono text-[11px]">998721</td>
                  <td className="p-3 text-right pr-4 font-bold text-slate-900 text-xs">₹{basePrice}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-1.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span>Taxable Value:</span>
                <span className="font-semibold text-slate-800">₹{basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (9.0%):</span>
                <span className="font-semibold text-slate-800">₹{cgst}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (9.0%):</span>
                <span className="font-semibold text-slate-800">₹{sgst}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Convenience Fee:</span>
                <span>FREE</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-600">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Quality Guarantee Seal */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950 text-xs">UrgentLyfe 30-Day Free Rework Protection</p>
              <p className="text-[11px] text-emerald-800">
                If the problem persists or recurs within 30 days of service, our certified technician will inspect and repair it free of charge.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-100 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            Need help with this bill? Contact 24x7 Support at <span className="font-semibold text-slate-700">support@urgentlyfe.com</span>
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-md shadow-blue-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Download Tax Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
