import React from 'react';
import { Star, Clock, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { ServiceItem } from '../types';

interface ServiceCardProps {
  service: ServiceItem;
  onSelectService: (service: ServiceItem) => void;
  onBookUrgent: (service: ServiceItem) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onSelectService,
  onBookUrgent,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Image & Badges Container */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden shrink-0">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Discount Badge */}
        {service.discountPercent && (
          <div className="absolute top-3 left-3 bg-red-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
            {service.discountPercent}% OFF
          </div>
        )}

        {/* SOS Tag */}
        {service.isUrgentAvailable && (
          <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
            <Zap className="w-3 h-3 fill-slate-950" />
            <span>30 MIN SOS</span>
          </div>
        )}

        {/* Rating Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>{service.rating}</span>
          <span className="text-slate-300 font-normal text-[10px]">
            ({service.reviewCount})
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {service.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3">
            {service.subtitle}
          </p>

          {/* Key Inclusions */}
          <div className="space-y-1 mb-4">
            {service.includes.slice(0, 2).map((inc, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">{inc}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          {/* Service Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-slate-400" />
              {service.durationMinutes} mins
            </span>
            {service.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer Price & Booking CTA */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Starting from</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-black text-slate-900">
                  ₹{service.price}
                </span>
                {service.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{service.originalPrice}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {service.isUrgentAvailable && (
                <button
                  onClick={() => onBookUrgent(service)}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="30 Minute Express Dispatch"
                >
                  <Zap className="w-3 h-3 text-amber-600" />
                  <span>SOS</span>
                </button>
              )}

              <button
                onClick={() => onSelectService(service)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Book</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
