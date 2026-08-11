import React from 'react';
import { ShieldCheck, Zap, Stethoscope, Clock, Star, Award, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onOpenAIDoctor: () => void;
  onQuickSOS: () => void;
  selectedCityName: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenAIDoctor,
  onQuickSOS,
  selectedCityName,
}) => {
  return (
    <div className="relative overflow-hidden bg-slate-900 text-white rounded-2xl mx-4 sm:mx-6 lg:mx-8 my-6 p-6 sm:p-10 border border-slate-800 shadow-xl">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Powered by Google Gemini AI & Real-time Partner Dispatch</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
          Instant Home Services & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-indigo-400">
            Emergency Repairs
          </span>{' '}
          in {selectedCityName}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mb-8 max-w-2xl leading-relaxed">
          Book verified technicians for AC servicing, emergency leaks, short circuit repairs, deep cleaning, and beauty at home. Guaranteed 30-min SOS arrival option with transparent upfront pricing.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button
            id="hero-ai-doctor-btn"
            onClick={onOpenAIDoctor}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 flex items-center gap-2 text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Stethoscope className="w-5 h-5 text-amber-300" />
            <span>Diagnose Issue with AI Doctor</span>
          </button>

          <button
            id="hero-quick-sos-btn"
            onClick={onQuickSOS}
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-red-500/25 flex items-center gap-2 text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Zap className="w-5 h-5 text-amber-200 animate-pulse" />
            <span>Book 30-Min Express SOS</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-slate-300 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>30 Min Express Arrival</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>30-Day Job Guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Background Checked Pros</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 shrink-0" />
            <span>4.9★ Average Rating</span>
          </div>
        </div>
      </div>
    </div>
  );
};
