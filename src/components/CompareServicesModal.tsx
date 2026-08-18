import React, { useState } from 'react';
import {
  X,
  Star,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRightLeft,
  Plus,
  Trash2,
  ChevronRight,
  Sparkles,
  IndianRupee,
  ShieldAlert,
} from 'lucide-react';
import { ServiceItem } from '../types';

interface CompareServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: ServiceItem[];
  allServices: ServiceItem[];
  onRemoveService: (serviceId: string) => void;
  onAddService: (service: ServiceItem) => void;
  onBookService: (service: ServiceItem, isUrgent: boolean) => void;
}

export const CompareServicesModal: React.FC<CompareServicesModalProps> = ({
  isOpen,
  onClose,
  compareList,
  allServices,
  onRemoveService,
  onAddService,
  onBookService,
}) => {
  const [isAddDropdownOpen, setIsAddDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen || compareList.length === 0) return null;

  // Available services not already in compare list
  const availableToAdd = allServices.filter(
    (s) => !compareList.some((c) => c.id === s.id) &&
      (searchTerm === '' ||
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.categoryId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between border-b border-slate-800 rounded-t-3xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Side-by-Side Service Comparison
                </h2>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-md border border-indigo-500/30">
                  {compareList.length} of 3 Selected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Compare upfront prices, inclusions, ratings, and warranties side-by-side
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareList.length < 3 && (
              <div className="relative">
                <button
                  onClick={() => setIsAddDropdownOpen(!isAddDropdownOpen)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Service</span>
                </button>

                {isAddDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-xl p-3 z-40 space-y-2">
                    <input
                      type="text"
                      placeholder="Search service to add..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-600"
                    />
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {availableToAdd.slice(0, 8).map((service) => (
                        <button
                          key={service.id}
                          onClick={() => {
                            onAddService(service);
                            setIsAddDropdownOpen(false);
                            setSearchTerm('');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-indigo-50 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="font-semibold text-slate-800 truncate pr-2">
                            {service.title}
                          </span>
                          <span className="text-indigo-600 font-bold shrink-0">
                            ₹{service.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white p-2 rounded-full transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table / Grid */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Top Cards Comparison Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {compareList.map((service) => (
              <div
                key={service.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-indigo-300 transition-all"
              >
                {/* Remove Button */}
                <button
                  onClick={() => onRemoveService(service.id)}
                  className="absolute top-3 right-3 bg-white/80 hover:bg-rose-50 text-slate-400 hover:text-rose-600 p-1.5 rounded-full border border-slate-200 transition-colors cursor-pointer z-10"
                  title="Remove from comparison"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3 bg-slate-200">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {service.discountPercent && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-md">
                        {service.discountPercent}% OFF
                      </div>
                    )}
                    {service.isUrgentAvailable && (
                      <div className="absolute bottom-2 left-2 bg-amber-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 fill-slate-950" />
                        <span>30-MIN SOS</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{service.title}</h3>
                  <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5 mb-3">{service.subtitle}</p>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-black text-slate-900">₹{service.price}</span>
                    {service.originalPrice && (
                      <span className="text-xs text-slate-400 line-through">₹{service.originalPrice}</span>
                    )}
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      GST Included
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <button
                    onClick={() => {
                      onClose();
                      onBookService(service, false);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    <span>Book Standard Slot</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {service.isUrgentAvailable && (
                    <button
                      onClick={() => {
                        onClose();
                        onBookService(service, true);
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Book 30-Min Emergency SOS</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Empty Slot Card if less than 3 */}
            {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
              <div
                key={`empty-slot-${idx}`}
                onClick={() => setIsAddDropdownOpen(true)}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-indigo-50/30 min-h-[260px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
                  <Plus className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700">Add Another Service</p>
                <p className="text-[11px] text-slate-400 max-w-[180px] mt-1">
                  Select another package to compare side-by-side
                </p>
              </div>
            ))}
          </div>

          {/* Detailed Matrix Comparison Rows */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {/* Section Header: Key Specifications */}
            <div className="bg-slate-100 px-4 py-2.5 font-extrabold text-xs text-slate-700 uppercase tracking-wider">
              1. Rating, Reviews & Time Duration
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
              {compareList.map((service) => (
                <div key={`spec-${service.id}`} className="p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Customer Rating:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/60">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {service.rating} / 5.0
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Verified Reviews:</span>
                    <span className="font-bold text-slate-800">{service.reviewCount.toLocaleString()} ratings</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Estimated Duration:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {service.durationMinutes} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">30-Min SOS Support:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md ${
                        service.isUrgentAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {service.isUrgentAvailable ? '✓ Supported' : 'Standard Only'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Section Header: Deliverables & Inclusions */}
            <div className="bg-slate-100 px-4 py-2.5 font-extrabold text-xs text-slate-700 uppercase tracking-wider border-t border-slate-200">
              2. What's Included (Scope of Work)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
              {compareList.map((service) => (
                <div key={`inc-${service.id}`} className="p-4 space-y-2 text-xs">
                  {service.includes.map((inc, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Section Header: Exclusions & Limitations */}
            <div className="bg-slate-100 px-4 py-2.5 font-extrabold text-xs text-slate-700 uppercase tracking-wider border-t border-slate-200">
              3. Excluded / Additional Costs
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
              {compareList.map((service) => (
                <div key={`exc-${service.id}`} className="p-4 space-y-2 text-xs">
                  {service.excludes && service.excludes.length > 0 ? (
                    service.excludes.map((exc, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-600">
                        <XCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic">No special exclusions listed</p>
                  )}
                </div>
              ))}
            </div>

            {/* Section Header: Warranty & Trust Guarantees */}
            <div className="bg-slate-100 px-4 py-2.5 font-extrabold text-xs text-slate-700 uppercase tracking-wider border-t border-slate-200">
              4. Warranty & Quality Assurance
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
              {compareList.map((service) => (
                <div key={`warr-${service.id}`} className="p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-[11px]">30-Day Free Rework Warranty</p>
                      <p className="text-[10px] text-emerald-700">Free revisits if issue reoccurs</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 p-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Background & police-verified technicians</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 p-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Contactless OTP start & end authentication</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 px-6 border-t border-slate-100 rounded-b-3xl flex items-center justify-between text-xs text-slate-500">
          <span>All prices are inclusive of GST and backed by UrgentLyfe safety standards.</span>
          <button
            onClick={onClose}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-xl transition-all cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
