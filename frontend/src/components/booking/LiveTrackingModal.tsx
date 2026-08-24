import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  KeyRound,
  AlertTriangle,
  Zap,
  Download,
  FileText,
  Compass,
} from 'lucide-react';
import { Booking } from '../../types';
import { downloadInvoiceFile } from '../../utils/invoiceGenerator';
import { getGoogleMapsDirectionsUrl } from '../../utils/directionsHelper';

interface LiveTrackingModalProps {
  booking: Booking | null;
  onClose: () => void;
  onCancelBooking: (id: string) => void;
  onOpenPostServiceFeedback?: (booking: Booking) => void;
  onViewInvoice?: (booking: Booking) => void;
  onBookingUpdated?: (updatedBooking: Booking) => void;
  onOpenDirections?: (booking: Booking) => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  booking,
  onClose,
  onCancelBooking,
  onOpenPostServiceFeedback,
  onViewInvoice,
  onBookingUpdated,
  onOpenDirections,
}) => {
  if (!booking) return null;

  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  const handleDownloadInvoice = (targetBooking = booking) => {
    if (targetBooking.status !== 'COMPLETED') {
      alert('Official GST Tax Invoice will be generated once service work is completed by technician.');
      return;
    }
    downloadInvoiceFile(targetBooking);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleCompleteOnlineService = async () => {
    setIsProcessingPayment(true);
    try {
      const updatedBooking: Booking = {
        ...booking,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        updatedAt: new Date().toISOString(),
      };

      if (onBookingUpdated) {
        onBookingUpdated(updatedBooking);
      }

      setPaymentSuccessMsg(`✓ Service work marked as completed! Generating your official GST invoice...`);

      setTimeout(() => {
        setIsProcessingPayment(false);
        if (onViewInvoice) {
          onViewInvoice(updatedBooking);
        }
      }, 900);
    } catch (err) {
      console.error('Failed to complete service:', err);
      setIsProcessingPayment(false);
    }
  };

  const handleCompleteCashPayment = async () => {
    setIsProcessingPayment(true);
    try {
      // Update booking status to completed and payment to PAID
      const updatedBooking: Booking = {
        ...booking,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        paymentMethod: 'CASH',
        updatedAt: new Date().toISOString(),
      };

      if (onBookingUpdated) {
        onBookingUpdated(updatedBooking);
      }

      setPaymentSuccessMsg(`💵 Cash payment of ₹${booking.totalAmount} confirmed! Opening GST invoice...`);
      
      setTimeout(() => {
        setIsProcessingPayment(false);
        if (onViewInvoice) {
          onViewInvoice(updatedBooking);
        }
      }, 900);
    } catch (err) {
      console.error('Failed to complete cash payment:', err);
      setIsProcessingPayment(false);
    }
  };

  const partner = booking.partner;

  const steps = [
    { key: 'CONFIRMED', label: 'Order Confirmed' },
    { key: 'PARTNER_ASSIGNED', label: 'Partner Assigned' },
    { key: 'PARTNER_EN_ROUTE', label: 'Partner En Route' },
    { key: 'WORK_IN_PROGRESS', label: 'Work Started' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === booking.status);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 fill-slate-950" />
              LIVE DISPATCH
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {booking.id}</span>
          </div>
          <h2 className="text-lg font-black text-white mt-1">{booking.service.title}</h2>
          <p className="text-xs text-slate-300">
            {booking.isUrgent ? '30-Minute Emergency SOS Priority Order' : `Scheduled Slot: ${booking.scheduledTimeSlot}`}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* OTP Code Card */}
          {booking.otpCode && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900 flex items-center gap-1">
                  <KeyRound className="w-4 h-4 text-amber-600" /> Start Work OTP
                </p>
                <p className="text-[11px] text-amber-800">Share this code with technician upon arrival</p>
              </div>
              <div className="bg-white border-2 border-amber-400 px-3.5 py-1.5 rounded-xl font-mono text-xl font-black text-slate-900 tracking-widest shadow-xs">
                {booking.otpCode}
              </div>
            </div>
          )}

          {/* Assigned Partner Profile Card */}
          {partner && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={partner.avatar}
                  alt={partner.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-600 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900">{partner.name}</h3>
                    {partner.verified && (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {partner.rating}★ ({partner.totalJobs} jobs done) • {partner.badge || 'Verified Expert'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${partner.phone}`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Call Partner"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Visual Map Simulation */}
          <div className="relative h-44 w-full bg-slate-200 rounded-xl overflow-hidden border border-slate-300">
            {/* Map background image grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100" />

            {/* Destination Pin */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-indigo-600 text-white p-1.5 rounded-full shadow-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-white text-slate-800 px-1.5 py-0.5 rounded shadow-xs mt-1">
                Your Home
              </span>
            </div>

            {/* Moving Partner Pin */}
            <div className="absolute top-1/2 left-12 -translate-y-1/2 flex flex-col items-center animate-pulse">
              <div className="bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg">
                <Navigation className="w-5 h-5 fill-slate-950" />
              </div>
              <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded shadow-xs mt-1">
                Technician ({booking.etaMinutes || 12} min away)
              </span>
            </div>
          </div>

          {/* One-Click Directions Bar */}
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-white">One-Click GPS Navigation</p>
                <p className="text-[10px] text-blue-200">
                  {booking.userAddress.locality}, {booking.userAddress.city}
                </p>
              </div>
            </div>

            <button
              id="live-tracking-directions-btn"
              onClick={() => {
                if (onOpenDirections) {
                  onOpenDirections(booking);
                } else {
                  window.open(getGoogleMapsDirectionsUrl(booking.userAddress), '_blank');
                }
              }}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl flex items-center gap-1 transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
            >
              <span>Open Directions</span>
              <Navigation className="w-3.5 h-3.5 fill-slate-950" />
            </button>
          </div>

          {/* Status Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live Status Progress</h4>
            <div className="space-y-2">
              {steps.map((step, idx) => {
                const isPassed = idx <= (currentStepIndex >= 0 ? currentStepIndex : 1);
                return (
                  <div key={step.key} className="flex items-center gap-3 text-xs">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        isPassed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={isPassed ? 'font-bold text-slate-900' : 'text-slate-400'}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cash on Delivery (COD) Payment Section */}
          {booking.paymentMethod === 'CASH' && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💵</span>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                      Cash On Delivery (COD) Payment
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      {booking.status === 'COMPLETED' || booking.paymentStatus === 'PAID'
                        ? 'Payment completed and verified'
                        : 'Hand cash to technician upon job completion'}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-black text-emerald-900 bg-white border border-emerald-300 px-2.5 py-1 rounded-xl text-sm shadow-xs">
                  ₹{booking.totalAmount}
                </span>
              </div>

              {booking.status === 'COMPLETED' || booking.paymentStatus === 'PAID' ? (
                <div className="bg-white border border-emerald-300 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-emerald-950">Cash Received: ₹{booking.totalAmount}</p>
                      <p className="text-[10px] text-emerald-700 font-medium">GST Tax Invoice Ready & Verified</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onViewInvoice) onViewInvoice(booking);
                      else handleDownloadInvoice();
                    }}
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Tax Invoice</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    disabled={isProcessingPayment}
                    onClick={handleCompleteCashPayment}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25"
                  >
                    {isProcessingPayment ? (
                      <span>Processing Payment & Generating Invoice...</span>
                    ) : (
                      <>
                        <span>💵 Pay ₹{booking.totalAmount} Cash & Complete Work</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-emerald-700 text-center font-medium">
                    🔒 GST Tax Invoice is strictly generated & released after cash payment and work completion.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Online / Digital Payment Section */}
          {booking.paymentMethod !== 'CASH' && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-indigo-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💳</span>
                  <div>
                    <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                      Digital / Online Payment ({booking.paymentMethod || 'UPI/Card'})
                    </h4>
                    <p className="text-[11px] text-indigo-800">
                      {booking.status === 'COMPLETED'
                        ? 'Service completed • Final GST Tax Invoice Issued'
                        : 'Paid in Advance • Invoice unlocks upon service completion'}
                    </p>
                  </div>
                </div>
                <span className="font-mono font-black text-indigo-950 bg-white border border-indigo-200 px-2.5 py-1 rounded-xl text-sm shadow-xs">
                  ₹{booking.totalAmount}
                </span>
              </div>

              {booking.status === 'COMPLETED' ? (
                <div className="bg-white border border-indigo-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-slate-900">Work Completed & Verified</p>
                      <p className="text-[10px] text-emerald-700 font-medium">Official GST Tax Invoice Generated</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onViewInvoice) onViewInvoice(booking);
                      else handleDownloadInvoice();
                    }}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Tax Invoice</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-white/80 border border-indigo-100 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="text-[11px] text-slate-700">
                        Technician is working on your service. Invoice will unlock once job is complete.
                      </span>
                    </div>
                  </div>
                  <button
                    disabled={isProcessingPayment}
                    onClick={handleCompleteOnlineService}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20"
                  >
                    {isProcessingPayment ? (
                      <span>Sealing Job & Generating Tax Invoice...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Service Complete & Generate Invoice</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    🔒 Compliant with GST invoicing rules: Tax invoices are issued after service delivery.
                  </p>
                </div>
              )}
            </div>
          )}

          {paymentSuccessMsg && (
            <div className="bg-emerald-500 text-white text-xs font-bold p-3 rounded-xl flex items-center gap-2 shadow-md animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{paymentSuccessMsg}</span>
            </div>
          )}

          {/* Address & Payment Info */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Service Location:</span>
              <span className="font-semibold text-slate-900 text-right">
                {booking.userAddress.line1}, {booking.userAddress.locality}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
              <span>Total Bill (GST Incl.):</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-600">₹{booking.totalAmount}</span>
                {booking.status === 'COMPLETED' ? (
                  <button
                    onClick={() => {
                      if (onViewInvoice) {
                        onViewInvoice(booking);
                      } else {
                        handleDownloadInvoice();
                      }
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>GST Tax Invoice</span>
                  </button>
                ) : (
                  <div
                    className="bg-slate-200/80 text-slate-500 border border-slate-300 px-2.5 py-1.5 rounded-lg font-semibold text-[11px] flex items-center gap-1"
                    title="Invoice will be available after work is completed"
                  >
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Invoice on Completion</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {downloadSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Tax Invoice downloaded to your device!</span>
            </div>
          )}

          {/* Post-Service Feedback Button */}
          {onOpenPostServiceFeedback && (
            <div className="pt-2">
              <button
                onClick={() => {
                  onOpenPostServiceFeedback(booking);
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🌟 Give Rating, Work Photo & AI Voice Review</span>
              </button>
            </div>
          )}

          {/* Cancel Order Option */}
          {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
            <div className="pt-1 text-center">
              <button
                onClick={() => onCancelBooking(booking.id)}
                className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
