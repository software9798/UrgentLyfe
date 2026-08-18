import React, { useState } from 'react';
import { Star, ShieldCheck, Zap, Award, Clock, CheckCircle2, UserCheck, ArrowUpDown, MapPin, Sparkles } from 'lucide-react';
import { ProviderTier, ServiceItem, Partner } from '../types';

export interface ProviderTierInfo {
  id: ProviderTier;
  title: string;
  ratingBadge: string;
  minRating: number;
  experienceText: string;
  badgeTag: string;
  badgeBg: string;
  priceMultiplier: number;
  durationMinutesOffset: number;
  description: string;
  isRecommended?: boolean;
}

export const PROVIDER_TIERS: ProviderTierInfo[] = [
  {
    id: 'JUNIOR',
    title: 'Junior Certified Technician',
    ratingBadge: '4.0★ - 4.4★',
    minRating: 4.0,
    experienceText: '1 - 3 Years Exp',
    badgeTag: 'Standard Saver',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
    priceMultiplier: 0.85,
    durationMinutesOffset: 15,
    description: 'Verified background-checked technicians for routine maintenance & simple fixes.',
  },
  {
    id: 'INTERMEDIATE',
    title: 'Senior Verified Expert',
    ratingBadge: '4.5★ - 4.7★',
    minRating: 4.5,
    experienceText: '3 - 6 Years Exp',
    badgeTag: 'Most Popular',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    priceMultiplier: 1.0,
    durationMinutesOffset: 0,
    description: 'High customer satisfaction, quick turnaround, and 100% genuine replacement parts.',
    isRecommended: true,
  },
  {
    id: 'ADVANCED',
    title: 'Master Pro Specialist',
    ratingBadge: '4.8★ - 5.0★',
    minRating: 4.8,
    experienceText: '7+ Years Exp',
    badgeTag: 'VIP Master',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    priceMultiplier: 1.2,
    durationMinutesOffset: -10,
    description: 'Top 5% rated master technicians for complex fault diagnostics & zero-defect guarantee.',
  },
];

interface ProviderTierSelectorProps {
  service: ServiceItem;
  selectedTier: ProviderTier;
  onSelectTier: (tier: ProviderTier) => void;
  availablePartners?: Partner[];
  onSelectPartner?: (partner: Partner) => void;
  selectedPartnerId?: string;
  selectedCityName?: string;
}

export const ProviderTierSelector: React.FC<ProviderTierSelectorProps> = ({
  service,
  selectedTier,
  onSelectTier,
  availablePartners = [],
  onSelectPartner,
  selectedPartnerId,
  selectedCityName = 'Your Location',
}) => {
  const [selectionMode, setSelectionMode] = useState<'tier' | 'individual_rating'>('individual_rating');
  const [sortBy, setSortBy] = useState<'rating' | 'jobs' | 'experience'>('rating');

  // Filter partners relevant to category if categoryIds available
  const relevantPartners = availablePartners.filter(
    (p) => !service.categoryId || p.categoryIds?.includes(service.categoryId) || true
  );

  // Sorted partners by rating or criteria
  const sortedPartners = [...relevantPartners].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'jobs') return b.totalJobs - a.totalJobs;
    if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
    return b.rating - a.rating;
  });

  // Helper to filter partners by tier rating
  const getPartnersForTier = (tier: ProviderTier) => {
    if (!availablePartners || availablePartners.length === 0) return [];
    return availablePartners.filter((p) => {
      if (tier === 'JUNIOR') return p.rating >= 4.0 && p.rating < 4.5;
      if (tier === 'INTERMEDIATE') return p.rating >= 4.5 && p.rating < 4.8;
      if (tier === 'ADVANCED') return p.rating >= 4.8;
      return true;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setSelectionMode('individual_rating')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            selectionMode === 'individual_rating'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Choose Provider by Rating ({sortedPartners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectionMode('tier')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
            selectionMode === 'tier'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Choose by Rating Tier Level</span>
        </button>
      </div>

      {/* MODE 1: CHOOSE INDIVIDUAL PROVIDER BY RATING */}
      {selectionMode === 'individual_rating' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>Service Providers in <strong className="text-indigo-600">{selectedCityName}</strong></span>
            </span>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-bold text-slate-700">
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold focus:outline-none text-indigo-600 cursor-pointer"
              >
                <option value="rating">Highest Rating (5.0★ → 4.0★)</option>
                <option value="jobs">Most Jobs Completed</option>
                <option value="experience">Most Years Experience</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {sortedPartners.map((partner) => {
              const isSelected = selectedPartnerId === partner.id;

              return (
                <div
                  key={partner.id}
                  onClick={() => onSelectPartner && onSelectPartner(partner)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {partner.name}
                        </h4>
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <Star className="w-3 h-3 fill-slate-950" />
                          {partner.rating.toFixed(2)}★
                        </span>
                      </div>

                      <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {partner.experienceYears} Yrs Exp • {partner.totalJobs}+ Jobs Completed
                      </p>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {partner.skills.slice(0, 2).map((skill, idx) => (
                          <span
                            key={idx}
                            className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${
                              isSelected
                                ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className={`font-semibold ${isSelected ? 'text-indigo-300' : 'text-slate-500'}`}>
                      {partner.badge || 'Verified Technician'}
                    </span>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded-xl font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selected Technician
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" /> Choose Provider
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 2: CHOOSE BY TIER LEVEL */}
      {selectionMode === 'tier' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PROVIDER_TIERS.map((tierInfo) => {
            const isSelected = selectedTier === tierInfo.id;
            const calculatedPrice = Math.round(service.price * tierInfo.priceMultiplier);
            const calculatedDuration = Math.max(15, service.durationMinutes + tierInfo.durationMinutesOffset);
            const tierPartners = getPartnersForTier(tierInfo.id);
            const topPartner = tierPartners[0];

            return (
              <div
                key={tierInfo.id}
                onClick={() => onSelectTier(tierInfo.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-blue-500 shadow-xl ring-2 ring-blue-500/30'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Badge */}
                {tierInfo.isRecommended && (
                  <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-xs flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-slate-950" />
                    RECOMMENDED
                  </div>
                )}

                <div>
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-md border uppercase ${
                          isSelected
                            ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                            : tierInfo.badgeBg
                        }`}
                      >
                        {tierInfo.badgeTag}
                      </span>
                      <h4 className={`text-sm font-black mt-1.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {tierInfo.title}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400 flex items-center gap-0.5 justify-end">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {tierInfo.ratingBadge}
                      </span>
                      <span className={`text-[10px] block ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        {tierInfo.experienceText}
                      </span>
                    </div>
                  </div>

                  <p className={`text-[11px] leading-relaxed mb-3 ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                    {tierInfo.description}
                  </p>

                  {/* Price & Duration */}
                  <div
                    className={`p-2.5 rounded-xl flex items-center justify-between text-xs font-bold mb-3 ${
                      isSelected ? 'bg-slate-800 border border-slate-700' : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] block font-normal ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        Total Charge
                      </span>
                      <span className="text-sm font-black text-amber-400">₹{calculatedPrice}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] block font-normal ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                        Estimated Time
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        <Clock className="w-3 h-3 text-blue-400" />
                        {calculatedDuration} mins
                      </span>
                    </div>
                  </div>

                  {/* Matching Partner Preview */}
                  {topPartner && (
                    <div
                      className={`p-2 rounded-xl text-[11px] flex items-center gap-2 ${
                        isSelected ? 'bg-blue-950/40 border border-blue-800/50' : 'bg-blue-50/60 border border-blue-100'
                      }`}
                    >
                      <img
                        src={topPartner.avatar}
                        alt={topPartner.name}
                        className="w-7 h-7 rounded-full object-cover border border-amber-400 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold truncate text-[11px] ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {topPartner.name}
                        </p>
                        <p className={`text-[9px] ${isSelected ? 'text-slate-400' : 'text-slate-500'}`}>
                          {topPartner.totalJobs}+ jobs • {topPartner.rating}★ Rating
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  )}
                </div>

                {/* Selection indicator */}
                <div className="mt-3 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px]">
                  <span className={isSelected ? 'text-blue-300 font-bold' : 'text-slate-500 font-medium'}>
                    {isSelected ? '✓ Tier Selected' : 'Click to Select Tier'}
                  </span>
                  {isSelected && (
                    <span className="text-emerald-400 text-[10px] font-extrabold flex items-center gap-0.5">
                      <Zap className="w-3 h-3" /> Auto-Assigned
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
