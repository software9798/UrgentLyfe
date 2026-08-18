import React, { useState } from 'react';
import { MapPin, Navigation, Search, Check, AlertCircle, Building2, Zap, ShieldCheck } from 'lucide-react';
import { City } from '../types';
import { detectGPSLocation } from '../utils/geoService';

interface LocationBarSectionProps {
  cities: City[];
  selectedCity: City;
  onSelectCity: (city: City) => void;
  selectedLocality: string;
  onSelectLocality: (locality: string) => void;
  onAddCustomCity?: (city: City) => void;
}

export const LocationBarSection: React.FC<LocationBarSectionProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  selectedLocality,
  onSelectLocality,
  onAddCustomCity,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectSuccessMessage, setDetectSuccessMessage] = useState<string | null>(null);
  const [detectErrorMessage, setDetectErrorMessage] = useState<string | null>(null);

  // Handle GPS location auto-detection with real reverse geocoding
  const handleDetectGPS = async () => {
    setIsDetecting(true);
    setDetectSuccessMessage(null);
    setDetectErrorMessage(null);

    try {
      const result = await detectGPSLocation(cities);
      
      // If a new city was detected outside the existing list
      if (result.isNewCity && onAddCustomCity) {
        onAddCustomCity(result.city);
      }
      
      onSelectCity(result.city);
      onSelectLocality(result.locality);

      setDetectSuccessMessage(
        `📍 Location detected: ${result.locality}, ${result.city.name}${result.city.state ? ` (${result.city.state})` : ''}`
      );
      setTimeout(() => setDetectSuccessMessage(null), 6000);
    } catch (err: any) {
      setDetectErrorMessage(
        err.message || 'Could not detect your GPS location. Please select your city manually from the list below.'
      );
      setTimeout(() => setDetectErrorMessage(null), 6000);
    } finally {
      setIsDetecting(false);
    }
  };

  // Filter cities or localities based on search term
  const searchLower = searchTerm.toLowerCase().trim();
  const matchedLocalities: { city: City; locality: string }[] = [];

  if (searchLower) {
    cities.forEach((c) => {
      c.localities.forEach((loc) => {
        if (loc.toLowerCase().includes(searchLower) || c.name.toLowerCase().includes(searchLower)) {
          matchedLocalities.push({ city: c, locality: loc });
        }
      });
    });
  }

  return (
    <div className="mx-4 sm:mx-6 lg:mx-8 my-6 bg-white rounded-3xl border border-slate-200/80 shadow-lg p-5 sm:p-7 relative overflow-hidden">
      {/* Background Accent Gradient */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Info & Title */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold px-3 py-1 rounded-full mb-3">
            <MapPin className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
            <span>LOCATION-WISE SERVICE COVERAGE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            Select Service Location in <span className="text-blue-600 italic">{selectedCity.name}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            We dispatch 30-min Express SOS technicians based on your exact locality. Search your city or area below to check live technician availability.
          </p>
        </div>

        {/* GPS Detect & Quick Search Bar */}
        <div className="flex-1 max-w-lg w-full space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search area (e.g., Indiranagar, Bandra, Gurugram)..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* GPS Auto-Detect Button */}
            <button
              onClick={handleDetectGPS}
              disabled={isDetecting}
              className="w-full sm:w-auto shrink-0 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-70"
            >
              <Navigation className={`w-3.5 h-3.5 text-amber-400 ${isDetecting ? 'animate-spin' : ''}`} />
              <span>{isDetecting ? 'Detecting...' : 'Detect GPS'}</span>
            </button>
          </div>

          {/* Search Autocomplete Dropdown */}
          {searchLower && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-2 max-h-48 overflow-y-auto space-y-1 z-20 relative">
              {matchedLocalities.length > 0 ? (
                matchedLocalities.map(({ city, locality }, idx) => (
                  <button
                    key={`${city.id}-${locality}-${idx}`}
                    onClick={() => {
                      onSelectCity(city);
                      onSelectLocality(locality);
                      setSearchTerm('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-blue-50 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="font-bold text-slate-800">{locality}</span>
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                      {city.name}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">
                  No exact match found. Choose from popular cities below!
                </div>
              )}
            </div>
          )}

          {detectSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{detectSuccessMessage}</span>
            </div>
          )}

          {detectErrorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-3 py-2 rounded-xl flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{detectErrorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* City & Locality Selector Badges */}
      <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
        {/* Popular Cities */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-400" /> Cities:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {cities.map((city) => {
              const isSelected = city.id === selectedCity.id;
              return (
                <button
                  key={city.id}
                  onClick={() => {
                    onSelectCity(city);
                    onSelectLocality(city.localities[0]);
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{city.name}</span>
                  {city.popular && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      POPULAR
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Localities in Selected City */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" /> Localities in {selectedCity.name}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedCity.localities.map((loc) => {
              const isSelected = loc === selectedLocality;
              return (
                <button
                  key={loc}
                  onClick={() => onSelectLocality(loc)}
                  className={`text-xs px-3 py-1 rounded-lg font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-amber-300 border-slate-900 font-bold shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Service Coverage Banner */}
      <div className="mt-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-100 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div>
            <span className="font-extrabold text-slate-900">
              Live Coverage in {selectedLocality}, {selectedCity.name}:
            </span>{' '}
            <span className="text-slate-600">38+ Background Verified Technicians Active Now</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-600" /> Avg Arrival: 14 mins
          </span>
          <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-600" /> OTP Authenticated
          </span>
        </div>
      </div>
    </div>
  );
};
