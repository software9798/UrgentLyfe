import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Zap,
  ShoppingBag,
  Wallet,
  User as UserIcon,
  Briefcase,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  LogOut,
  LogIn,
  Home,
  Wrench,
  KeyRound,
  Mic,
  Gift,
  Bell,
} from 'lucide-react';
import { City, User, ProviderProfile } from '../../types';

interface NavbarProps {
  cities: City[];
  selectedCity: City;
  onSelectCity: (city: City) => void;
  selectedLocality: string;
  onSelectLocality: (locality: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAIDoctor: () => void;
  onOpenAIChat: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenReferAndEarn?: () => void;
  onOpenAPIDocs: () => void;
  activeBookingsCount: number;
  onOpenBookings: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  walletBalance: number;
  onQuickSOS: () => void;
  // Auth & Roles Props
  currentUser: User | null;
  providerProfile?: ProviderProfile | null;
  onOpenAuth: () => void;
  onOpenAddresses: () => void;
  onOpenProviderModal: () => void;
  onOpenAdminModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cities,
  selectedCity,
  onSelectCity,
  selectedLocality,
  onSelectLocality,
  searchQuery,
  onSearchChange,
  onOpenAIDoctor,
  onOpenAIChat,
  onOpenVoiceAssistant,
  onOpenReferAndEarn,
  onOpenAPIDocs,
  activeBookingsCount,
  onOpenBookings,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  walletBalance,
  onQuickSOS,
  currentUser,
  providerProfile,
  onOpenAuth,
  onOpenAddresses,
  onOpenProviderModal,
  onOpenAdminModal,
  onLogout,
}) => {
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header id="main-navbar" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Vibrant SOS Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 font-medium flex items-center justify-between">
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-hidden text-ellipsis whitespace-nowrap min-w-0">
          <span className="bg-amber-400 text-slate-900 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider animate-pulse shrink-0">
            30-MIN SOS
          </span>
          <span className="truncate">Emergency Repairs in {selectedCity.name}!</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
          <button
            id="quick-sos-banner-btn"
            onClick={onQuickSOS}
            className="bg-white/20 hover:bg-white/30 active:scale-95 text-white px-2.5 sm:px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span className="hidden sm:inline">Instant</span> SOS Order
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">
          
          {/* Brand Logo & Mobile Location Selector */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg sm:text-xl italic shadow-md shadow-blue-600/30">
                U<span className="text-amber-300">L</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-none">
                  Urgent<span className="text-blue-600 italic">Lyfe</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                  Repairs & SOS
                </span>
              </div>
            </div>

            {/* City & Locality Selector (Dropdown for all screen sizes) */}
            <div className="relative border-l border-slate-200 pl-2 sm:pl-3">
              <button
                id="city-selector-btn"
                onClick={() => setIsCityOpen(!isCityOpen)}
                className="flex items-center gap-1 text-xs text-slate-700 hover:text-blue-600 font-semibold bg-slate-50 hover:bg-slate-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer max-w-[120px] sm:max-w-[180px]"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <div className="text-left truncate">
                  <p className="text-[8px] sm:text-[9px] text-slate-400 leading-none hidden sm:block">Location</p>
                  <p className="font-bold text-slate-800 text-[11px] sm:text-xs leading-tight truncate">
                    {selectedCity.name}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isCityOpen && (
                <div className="absolute left-0 sm:left-3 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-fadeIn">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select City</p>
                  <div className="space-y-1 mb-3 max-h-44 overflow-y-auto">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => {
                          onSelectCity(city);
                          onSelectLocality(city.localities[0]);
                          setIsCityOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          city.id === selectedCity.id
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span>{city.name}</span>
                        {city.popular && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                            Popular
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Locality</p>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {selectedCity.localities.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => {
                          onSelectLocality(loc);
                          setIsCityOpen(false);
                        }}
                        className={`text-[11px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          loc === selectedLocality
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-services-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search 'AC Foam Jet', 'MCB repair', 'Plumber leak'..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title="Search Services"
            >
              <Search className="w-4.5 h-4.5 text-slate-700" />
            </button>

            {/* Refer & Earn Button (Desktop) */}
            {onOpenReferAndEarn && (
              <button
                id="refer-earn-nav-btn"
                onClick={onOpenReferAndEarn}
                className="hidden sm:flex bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-black px-3 py-2 rounded-xl items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Refer & Earn ₹250 Wallet Cash"
              >
                <Gift className="w-4 h-4 text-amber-600" />
                <span className="hidden md:inline">Refer & Earn</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                  ₹250
                </span>
              </button>
            )}

            {/* AI Voice Assistant Button (Desktop) */}
            {onOpenVoiceAssistant && (
              <button
                id="ai-voice-nav-btn"
                onClick={onOpenVoiceAssistant}
                className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md shadow-indigo-600/20 items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Mic className="w-4 h-4 text-amber-300" />
                <span className="hidden lg:inline">AI Voice</span>
              </button>
            )}

            {/* Notifications Button */}
            {onOpenNotifications && (
              <button
                id="open-notifications-btn"
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                title="Notifications & 1-Hour Alerts"
              >
                <Bell className="w-5 h-5 text-slate-700" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}

            {/* Active Bookings Button */}
            <button
              id="open-bookings-btn"
              onClick={onOpenBookings}
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title="My Bookings"
            >
              <ShoppingBag className="w-5 h-5 text-slate-700" />
              {activeBookingsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {activeBookingsCount}
                </span>
              )}
            </button>

            {/* AUTHENTICATION USER MENU / LOGIN BUTTON */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-2xl border border-slate-200 hover:border-blue-500 bg-white transition-all shadow-xs cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-xl object-cover bg-slate-100"
                  />
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold text-slate-900 leading-none">{currentUser.fullName.split(' ')[0]}</p>
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full mt-0.5 inline-block ${
                        currentUser.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-700'
                          : currentUser.role === 'PROVIDER'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-fadeIn space-y-1">
                    <div className="p-2 border-b border-slate-100">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{currentUser.fullName}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-slate-500">Wallet:</span>
                        <span className="font-extrabold text-emerald-700 font-mono">₹{walletBalance}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenAddresses();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Home className="w-4 h-4 text-blue-600" />
                      Saved Locations ({currentUser.addresses?.length || 0})
                    </button>

                    {onOpenReferAndEarn && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onOpenReferAndEarn();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50/70 hover:bg-amber-100 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-amber-600" />
                          <span>Refer & Earn</span>
                        </div>
                        <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full font-mono">
                          ₹250 Cash
                        </span>
                      </button>
                    )}

                    {currentUser.role === 'PROVIDER' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onOpenProviderModal();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Wrench className="w-4 h-4 text-blue-600" />
                        Provider Portal & Skills
                      </button>
                    )}

                    {currentUser.role === 'ADMIN' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onOpenAdminModal();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Admin Governance Panel
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Row (Expandable on small screens) */}
        {isMobileSearchOpen && (
          <div className="md:hidden pb-3 pt-1 animate-fadeIn">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="search-services-mobile-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search 'AC Foam Jet', 'MCB repair', 'Plumber'..."
                autoFocus
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-8 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
