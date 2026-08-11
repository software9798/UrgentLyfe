import React from 'react';
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
} from 'lucide-react';
import { Booking } from '../types';

interface LiveTrackingModalProps {
  booking: Booking | null;
  onClose: () => void;
  onCancelBooking: (id: string) => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({
  booking,
  onClose,
  onCancelBooking,
}) => {
  if (!booking) return null;

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

          {/* Address & Payment Info */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Service Location:</span>
              <span className="font-semibold text-slate-900 text-right">
                {booking.userAddress.line1}, {booking.userAddress.locality}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Bill (GST Incl.):</span>
              <span className="font-bold text-emerald-600">₹{booking.totalAmount}</span>
            </div>
          </div>

          {/* Cancel Order Option */}
          {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
            <div className="pt-2 text-center">
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
