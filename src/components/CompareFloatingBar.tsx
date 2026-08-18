import React from 'react';
import { ArrowRightLeft, X, Sparkles, Zap, ChevronRight, Trash2 } from 'lucide-react';
import { ServiceItem } from '../types';

interface CompareFloatingBarProps {
  compareList: ServiceItem[];
  onRemoveFromCompare: (serviceId: string) => void;
  onClearCompare: () => void;
  onOpenCompareModal: () => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  compareList,
  onRemoveFromCompare,
  onClearCompare,
  onOpenCompareModal,
}) => {
  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl animate-in slide-in-from-bottom-6 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Summary Title & Badges */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">Compare Services</span>
              <span className="bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[10px] font-black px-2 py-0.5 rounded-md">
                {compareList.length} / 3 Selected
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {compareList.length === 1
                ? 'Select 1 or 2 more services to compare side-by-side'
                : 'Compare prices, inclusions, ratings & warranties side-by-side'}
            </p>
          </div>
        </div>

        {/* Middle: Service Thumbnails Chips */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          {compareList.map((service) => (
            <div
              key={service.id}
              className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 shrink-0 text-xs group"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-6 h-6 rounded-lg object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="max-w-[110px] sm:max-w-[130px] truncate">
                <p className="font-semibold text-slate-200 truncate">{service.title}</p>
                <p className="text-[10px] text-amber-400 font-bold">₹{service.price}</p>
              </div>
              <button
                onClick={() => onRemoveFromCompare(service.id)}
                className="text-slate-400 hover:text-rose-400 p-0.5 rounded-md transition-colors cursor-pointer"
                title="Remove from compare"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {/* Empty slot placeholder if less than 3 */}
          {Array.from({ length: 3 - compareList.length }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="border border-dashed border-slate-700 rounded-xl px-3 py-2 text-[11px] text-slate-500 shrink-0 hidden md:flex items-center gap-1.5"
            >
              <span className="text-slate-600 font-bold">+</span>
              <span>Select Service</span>
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onClearCompare}
            className="text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            title="Clear all selected"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            onClick={onOpenCompareModal}
            disabled={compareList.length < 2}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
              compareList.length >= 2
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <span>{compareList.length < 2 ? 'Select 1 More' : 'Compare Now'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
