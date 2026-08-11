import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Zap,
  Stethoscope,
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
} from 'lucide-react';
import { City, User, ProviderProfile } from '../types';

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
  onOpenAPIDocs: () => void;
  activeBookingsCount: number;
  onOpenBookings: () => void;
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
  onOpenAPIDocs,
  activeBookingsCount,
  onOpenBookings,
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

  return (
    <header id="main-navbar" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Vibrant SOS Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs py-1.5 px-4 font-medium flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
            30-MIN EXPRESS SOS
          </span>
          <span>Emergency AC, Plumbing & Short Circuit Technicians in {selectedCity.name}!</span>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <button
            id="quick-sos-banner-btn"
            onClick={onQuickSOS}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-300" /> Instant SOS Order
          </button>
          <button
            id="api-docs-banner-btn"
            onClick={onOpenAPIDocs}
            className="underline hover:text-blue-200 text-[11px] cursor-pointer"
          >
            REST API & Postgres Docs
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo - Vibrant Blue */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl italic shadow-md shadow-blue-600/30">
                U<span className="text-amber-300">L</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                  Urgent<span className="text-blue-600 italic">Lyfe</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                  Home Repairs & SOS
                </span>
              </div>
            </div>

            {/* City & Locality Selector */}
            <div className="relative hidden lg:block border-l border-slate-200 pl-3">
              <button
                id="city-selector-btn"
                onClick={() => setIsCityOpen(!isCityOpen)}
                className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-blue-600 font-semibold bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <div className="text-left">
                  <p className="text-[9px] text-slate-400 leading-none">Location</p>
                  <p className="font-bold text-slate-800 text-xs leading-tight">
                    {selectedLocality}, {selectedCity.name}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
              </button>

              {isCityOpen && (
                <div className="absolute left-3 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fadeIn">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select City</p>
                  <div className="space-y-1 mb-3">
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
                  <div className="flex flex-wrap gap-1">
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

          {/* Search Bar */}
          <div className="flex-1 max-w-md hidden sm:block">
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
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* AI Doctor Button */}
            <button
              id="ai-doctor-nav-btn"
              onClick={onOpenAIDoctor}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Stethoscope className="w-4 h-4 text-yellow-300 animate-bounce" />
              <span className="hidden md:inline">AI Doctor</span>
            </button>

            {/* AI Voice Assistant Button */}
            {onOpenVoiceAssistant && (
              <button
                id="ai-voice-nav-btn"
                onClick={onOpenVoiceAssistant}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Mic className="w-4 h-4 text-amber-300" />
                <span className="hidden lg:inline">AI Voice</span>
              </button>
            )}

            {/* Wallet Balance */}
            <div className="hidden md:flex items-center bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-xl text-xs text-emerald-800 font-semibold gap-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>₹{walletBalance}</span>
            </div>

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
                  className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 hover:border-blue-500 bg-white transition-all shadow-xs"
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
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fadeIn space-y-1">
                    <div className="p-2 border-b border-slate-100">
                      <p className="text-xs font-extrabold text-slate-900">{currentUser.fullName}</p>
                      <p className="text-[10px] text-slate-500">{currentUser.email}</p>
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
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
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
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Login / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
