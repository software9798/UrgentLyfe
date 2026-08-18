import React, { useState } from 'react';
import {
  X,
  Star,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  ThumbsUp,
  Tag,
  Sparkles,
  ArrowRightLeft,
  Check,
} from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onProceedBooking: (service: ServiceItem, isUrgent: boolean) => void;
  onOpenAIDoctorForCategory: (categoryName: string) => void;
  isComparing?: boolean;
  onToggleCompare?: (service: ServiceItem) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onProceedBooking,
  onOpenAIDoctorForCategory,
  isComparing = false,
  onToggleCompare,
}) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header Image */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-900">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Action buttons: Compare & Close */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(service)}
                className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
                  isComparing
                    ? 'bg-indigo-600 text-white ring-1 ring-white/60'
                    : 'bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-700'
                }`}
              >
                {isComparing ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>In Compare</span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-300" />
                    <span>Add to Compare</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className="bg-slate-900/70 text-white p-2 rounded-full hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Title on Image */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                30-Day Guarantee
              </span>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold">
                <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>{service.rating}</span>
                <span className="text-slate-300 text-[10px]">({service.reviewCount} reviews)</span>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{service.title}</h2>
            <p className="text-xs text-slate-300 mt-1">{service.subtitle}</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* AI Doctor Recommendation Banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-amber-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-amber-300 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Unsure if this fixes your exact issue?</p>
                <p className="text-[11px] text-slate-500">Run Gemini AI Diagnostic test with photo/description</p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAIDoctorForCategory(service.title);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all"
            >
              Test with AI
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Package Overview</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{service.description}</p>
          </div>

          {/* Provider Rating Tiers Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Provider Rating & Charges Options</span>
              </h4>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Choose Tier on Booking
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white border border-slate-200 p-2.5 rounded-lg text-center">
                <p className="font-extrabold text-slate-900 text-[11px]">Junior (4.0-4.4★)</p>
                <p className="text-xs font-black text-slate-700 mt-0.5">₹{service.price}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">Standard ~50m</p>
              </div>
              <div className="bg-blue-50/80 border border-blue-300 p-2.5 rounded-lg text-center relative">
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full">
                  MOST POPULAR
                </span>
                <p className="font-extrabold text-blue-900 text-[11px]">Senior (4.5-4.7★)</p>
                <p className="text-xs font-black text-blue-700 mt-0.5">₹{Math.round(service.price * 1.15)}</p>
                <p className="text-[9px] text-blue-600 mt-0.5">Recommended ~35m</p>
              </div>
              <div className="bg-amber-50/80 border border-amber-300 p-2.5 rounded-lg text-center">
                <p className="font-extrabold text-amber-900 text-[11px]">Master (4.8-5.0★)</p>
                <p className="text-xs font-black text-amber-800 mt-0.5">₹{Math.round(service.price * 1.35)}</p>
                <p className="text-[9px] text-amber-700 mt-0.5">Express ~20m</p>
              </div>
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4">
              <h4 className="text-xs font-bold text-emerald-900 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>What's Included</span>
              </h4>
              <ul className="space-y-2">
                {service.includes.map((inc, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-slate-400" />
                <span>What's Excluded</span>
              </h4>
              <ul className="space-y-2">
                {service.excludes.map((exc, i) => (
                  <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Price & Guarantee Card */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Upfront Transparent Pricing</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black">₹{service.price}</span>
                {service.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">₹{service.originalPrice}</span>
                )}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                  + 18% GST
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1 justify-end">
                <ShieldCheck className="w-4 h-4" /> 30-Day Warranty
              </p>
              <p className="text-[10px] text-slate-400">Free rework if not satisfied</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={() => onProceedBooking(service, false)}
            className="flex-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Schedule Slot</span>
          </button>

          {service.isUrgentAvailable && (
            <button
              onClick={() => onProceedBooking(service, true)}
              className="flex-1 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-200 animate-bounce" />
              <span>Emergency 30-Min SOS (+₹{service.urgentFee})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
