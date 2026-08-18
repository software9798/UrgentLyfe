import React from 'react';
import { Home, Zap, Mic, Gift, ShoppingBag, Bot } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'services' | 'dashboard';
  dashboardTab?: 'bookings' | 'trends' | 'refer_earn' | 'profile' | 'ai_history' | 'feedback';
  activeBookingsCount: number;
  onNavigateHome: () => void;
  onNavigateBookings: () => void;
  onNavigateReferEarn: () => void;
  onQuickSOS: () => void;
  onOpenAIAssistant: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  dashboardTab,
  activeBookingsCount,
  onNavigateHome,
  onNavigateBookings,
  onNavigateReferEarn,
  onQuickSOS,
  onOpenAIAssistant,
}) => {
  const isHomeActive = activeTab === 'services';
  const isBookingsActive = activeTab === 'dashboard' && dashboardTab !== 'refer_earn';
  const isReferActive = activeTab === 'dashboard' && dashboardTab === 'refer_earn';

  return (
    <nav
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] px-2 py-1.5 safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Home / Explore */}
        <button
          id="mobile-nav-home"
          type="button"
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[46px] ${
            isHomeActive
              ? 'text-blue-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-600" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Services</span>
        </button>

        {/* 2. Refer & Earn */}
        <button
          id="mobile-nav-refer"
          type="button"
          onClick={onNavigateReferEarn}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[46px] relative ${
            isReferActive
              ? 'text-amber-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Gift className={`w-5 h-5 ${isReferActive ? 'text-amber-600 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[8px] font-black px-1 rounded-full shadow-xs">
              ₹250
            </span>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Rewards</span>
        </button>

        {/* 3. Center SOS Button - High Emphasis Floating Action */}
        <button
          id="mobile-nav-sos"
          type="button"
          onClick={onQuickSOS}
          className="relative -top-3 flex flex-col items-center justify-center group cursor-pointer focus:outline-none"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-lg shadow-red-500/35 group-active:scale-95 transition-transform">
            <div className="w-full h-full rounded-[14px] bg-gradient-to-tr from-red-600 to-amber-500 flex flex-col items-center justify-center text-white">
              <Zap className="w-5 h-5 text-amber-200 fill-amber-200 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">SOS</span>
            </div>
          </div>
          <span className="text-[9px] font-black text-rose-600 mt-0.5">30m Rapid</span>
        </button>

        {/* 4. AI Assistant / Voice */}
        <button
          id="mobile-nav-ai"
          type="button"
          onClick={onOpenAIAssistant}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[46px] text-slate-500 hover:text-indigo-600"
        >
          <div className="relative">
            <Bot className="w-5 h-5 stroke-[1.8] text-indigo-600" />
            <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium text-slate-600">AI Help</span>
        </button>

        {/* 5. My Bookings / Orders */}
        <button
          id="mobile-nav-bookings"
          type="button"
          onClick={onNavigateBookings}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[46px] relative ${
            isBookingsActive
              ? 'text-blue-600 font-extrabold scale-105'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${isBookingsActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {activeBookingsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                {activeBookingsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Bookings</span>
        </button>
      </div>
    </nav>
  );
};
