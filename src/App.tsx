import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryGrid } from './components/CategoryGrid';
import { ServiceCard } from './components/ServiceCard';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { AIDiagnosticModal } from './components/AIDiagnosticModal';
import { BookingWizardModal } from './components/BookingWizardModal';
import { LiveTrackingModal } from './components/LiveTrackingModal';
import { UserDashboard } from './components/UserDashboard';
import { PartnerDashboard } from './components/PartnerDashboard';
import { AIChatDrawer } from './components/AIChatDrawer';
import { APIDocsModal } from './components/APIDocsModal';
import { AuthModal } from './components/AuthModal';
import { AddressManagerModal } from './components/AddressManagerModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { ProviderProfileModal } from './components/ProviderProfileModal';
import { AIVoiceAssistantModal } from './components/AIVoiceAssistantModal';

import { CITIES, CATEGORIES, SERVICES, PARTNERS, MOCK_BOOKINGS } from './data/mockData';
import { City, Category, ServiceItem, Booking, AIDiagnosis, Partner, User, ProviderProfile, AuthResponse } from './types';
import { api } from './api/client';
import { Sparkles, Zap, Stethoscope, ShoppingBag, CheckCircle2, WifiOff } from 'lucide-react';

export default function App() {
  const [cities] = useState<City[]>(CITIES);
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]); // Bengaluru
  const [selectedLocality, setSelectedLocality] = useState<string>(CITIES[0].localities[0]);

  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [services, setServices] = useState<ServiceItem[]>(SERVICES);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);

  // Modals & Drawers
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState<boolean>(false);

  const [selectedServiceDetail, setSelectedServiceDetail] = useState<ServiceItem | null>(null);
  const [isBookingWizardOpen, setIsBookingWizardOpen] = useState<boolean>(false);
  const [bookingServiceTarget, setBookingServiceTarget] = useState<ServiceItem | null>(null);
  const [bookingIsUrgent, setBookingIsUrgent] = useState<boolean>(false);
  const [aiDiagnosisForBooking, setAiDiagnosisForBooking] = useState<AIDiagnosis | null>(null);

  // Bookings & Tracking
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [activeLiveTrackingBooking, setActiveLiveTrackingBooking] = useState<Booking | null>(null);

  // AI Tools
  const [isAIDoctorOpen, setIsAIDoctorOpen] = useState<boolean>(false);
  const [aiDoctorCategoryHint, setAiDoctorCategoryHint] = useState<string>('');
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [isAIVoiceOpen, setIsAIVoiceOpen] = useState<boolean>(false);
  const [voiceFeedbackTargetBooking, setVoiceFeedbackTargetBooking] = useState<{
    id: string;
    partnerId?: string;
    partnerName?: string;
    serviceTitle: string;
  } | null>(null);
  const [isAPIDocsOpen, setIsAPIDocsOpen] = useState<boolean>(false);

  // Role & View State
  const [activeTab, setActiveTab] = useState<'services' | 'dashboard'>('services');
  const [walletBalance, setWalletBalance] = useState<number>(1250);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Restore JWT Session on App Mount
  useEffect(() => {
    const token = localStorage.getItem('urgentlyfe_jwt');
    if (token) {
      api
        .getCurrentUser()
        .then((res) => {
          setCurrentUser(res.user);
          if (res.providerProfile) {
            setProviderProfile(res.providerProfile);
          }
          if (res.user.walletBalance) {
            setWalletBalance(res.user.walletBalance);
          }
        })
        .catch(() => {
          localStorage.removeItem('urgentlyfe_jwt');
        });
    }
  }, []);

  // Filter services dynamically
  const filteredServices = services.filter((s) => {
    const matchesCategory =
      selectedCategoryId === 'all' || s.categoryId === selectedCategoryId;
    const matchesSearch =
      !searchQuery.trim() ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Handle Quick SOS Click
  const handleQuickSOS = () => {
    const sosService = services.find((s) => s.isUrgentAvailable) || services[0];
    setBookingServiceTarget(sosService);
    setBookingIsUrgent(true);
    setAiDiagnosisForBooking(null);
    setIsBookingWizardOpen(true);
  };

  // Handle AI Diagnosis Booking CTA
  const handleBookFromDiagnosis = (diagnosis: AIDiagnosis) => {
    const matchedService =
      services.find((s) => s.id === diagnosis.recommendedServiceId) || services[0];
    setBookingServiceTarget(matchedService);
    setBookingIsUrgent(diagnosis.severity === 'HIGH' || diagnosis.severity === 'CRITICAL');
    setAiDiagnosisForBooking(diagnosis);
    setIsBookingWizardOpen(true);
  };

  // Handle Auth Success
  const handleAuthSuccess = (authData: AuthResponse) => {
    setCurrentUser(authData.user);
    if (authData.providerProfile) {
      setProviderProfile(authData.providerProfile);
    }
    if (authData.user.walletBalance) {
      setWalletBalance(authData.user.walletBalance);
    }
    showToast(`Welcome ${authData.user.fullName}! Logged in as ${authData.user.role}.`);
  };

  // Logout
  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setProviderProfile(null);
    showToast('Signed out successfully.');
  };

  // Handle Booking Creation Success
  const handleBookingSuccess = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setActiveLiveTrackingBooking(newBooking);
    showToast(
      newBooking.isUrgent
        ? '⚡ SOS Order Confirmed! Emergency technician dispatched immediately.'
        : 'Service slot confirmed successfully!'
    );
  };

  // Handle Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'CANCELLED');
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
      if (activeLiveTrackingBooking?.id === bookingId) {
        setActiveLiveTrackingBooking((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
      }
      showToast('Booking cancelled successfully.');
    } catch (err: any) {
      showToast('Failed to cancel booking.');
    }
  };

  // Partner status update
  const handlePartnerUpdateStatus = async (bookingId: string, status: string) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: status as any } : b))
      );
      showToast(`Job status updated to ${status}`);
    } catch (err: any) {
      showToast('Failed to update status.');
    }
  };

  const activeBookingsCount = bookings.filter(
    (b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2 sticky top-0 z-50 shadow-md">
          <WifiOff className="w-4 h-4 animate-pulse shrink-0" />
          <span>You are offline. Showing cached UI for your existing authenticated session.</span>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        selectedLocality={selectedLocality}
        onSelectLocality={setSelectedLocality}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAIDoctor={() => {
          setAiDoctorCategoryHint('');
          setIsAIDoctorOpen(true);
        }}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenVoiceAssistant={() => {
          setVoiceFeedbackTargetBooking(null);
          setIsAIVoiceOpen(true);
        }}
        onOpenAPIDocs={() => setIsAPIDocsOpen(true)}
        activeBookingsCount={activeBookingsCount}
        onOpenBookings={() => setActiveTab('dashboard')}
        walletBalance={walletBalance}
        onQuickSOS={handleQuickSOS}
        currentUser={currentUser}
        providerProfile={providerProfile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAddresses={() => {
          if (!currentUser) setIsAuthOpen(true);
          else setIsAddressesOpen(true);
        }}
        onOpenProviderModal={() => setIsProviderModalOpen(true)}
        onOpenAdminModal={() => setIsAdminPanelOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content View */}
      {currentUser?.role === 'PROVIDER' ? (
        /* Service Provider View */
        <main className="flex-1">
          <PartnerDashboard
            partner={{
              id: providerProfile?.id || 'partner-101',
              name: currentUser.fullName,
              phone: currentUser.phone,
              avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
              categoryIds: [providerProfile?.categoryId || 'ac-appliance'],
              city: currentUser.city,
              rating: providerProfile?.rating || 4.92,
              totalJobs: providerProfile?.totalJobs || 1480,
              experienceYears: providerProfile?.experienceYears || 8,
              verified: providerProfile?.verified ?? true,
              skills: providerProfile?.skills || ['HVAC Certified', 'Short Circuit Specialist'],
              status: providerProfile?.availability || 'available',
              badge: providerProfile?.badge || 'Super Pro',
            }}
            bookings={bookings}
            onUpdateStatus={handlePartnerUpdateStatus}
          />
        </main>
      ) : activeTab === 'dashboard' ? (
        /* Customer Dashboard View */
        <main className="flex-1">
          <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3">
            <button
              onClick={() => setActiveTab('services')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              ← Back to Service Catalog
            </button>
          </div>
          <UserDashboard
            bookings={bookings}
            walletBalance={walletBalance}
            onTrackBooking={(booking) => setActiveLiveTrackingBooking(booking)}
            onOpenAIDoctor={() => setIsAIDoctorOpen(true)}
            onQuickSOS={handleQuickSOS}
            onOpenAddressManager={() => setIsAddressesOpen(true)}
            onOpenVoiceFeedback={(booking) => {
              setVoiceFeedbackTargetBooking({
                id: booking.id,
                partnerId: booking.partner?.id,
                partnerName: booking.partner?.name,
                serviceTitle: booking.service.title,
              });
              setIsAIVoiceOpen(true);
            }}
          />
        </main>
      ) : (
        /* Customer Home & Service Catalog View */
        <main className="flex-1 pb-16">
          <HeroSection
            selectedCityName={selectedCity.name}
            onOpenAIDoctor={() => {
              setAiDoctorCategoryHint('');
              setIsAIDoctorOpen(true);
            }}
            onQuickSOS={handleQuickSOS}
          />

          <CategoryGrid
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />

          {/* Services Grid Section */}
          <section id="services-catalog-grid" className="mx-4 sm:mx-6 lg:mx-8 my-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Available Packages ({filteredServices.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Upfront guaranteed pricing for {selectedLocality}, {selectedCity.name}
                </p>
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                <p className="text-base font-bold text-slate-700">No matching services found</p>
                <p className="text-xs text-slate-500">
                  Try searching for 'AC', 'Plumber', 'MCB', or clear filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId('all');
                  }}
                  className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onSelectService={(s) => setSelectedServiceDetail(s)}
                    onBookUrgent={(s) => {
                      setBookingServiceTarget(s);
                      setBookingIsUrgent(true);
                      setAiDiagnosisForBooking(null);
                      setIsBookingWizardOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Modals & Floating Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        categories={categories}
      />

      {currentUser && (
        <AddressManagerModal
          isOpen={isAddressesOpen}
          onClose={() => setIsAddressesOpen(false)}
          user={currentUser}
          onAddressesUpdated={(updated) => setCurrentUser(updated)}
        />
      )}

      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />

      {currentUser && (
        <ProviderProfileModal
          isOpen={isProviderModalOpen}
          onClose={() => setIsProviderModalOpen(false)}
          user={currentUser}
          providerProfile={providerProfile}
          categories={categories}
          onProviderProfileUpdated={(updated) => setProviderProfile(updated)}
        />
      )}

      <ServiceDetailModal
        service={selectedServiceDetail}
        onClose={() => setSelectedServiceDetail(null)}
        onProceedBooking={(s, isUrgent) => {
          setSelectedServiceDetail(null);
          setBookingServiceTarget(s);
          setBookingIsUrgent(isUrgent);
          setAiDiagnosisForBooking(null);
          setIsBookingWizardOpen(true);
        }}
        onOpenAIDoctorForCategory={(categoryName) => {
          setAiDoctorCategoryHint(categoryName);
          setIsAIDoctorOpen(true);
        }}
      />

      <AIDiagnosticModal
        isOpen={isAIDoctorOpen}
        onClose={() => setIsAIDoctorOpen(false)}
        categoryHint={aiDoctorCategoryHint}
        onBookDiagnosis={handleBookFromDiagnosis}
      />

      <BookingWizardModal
        isOpen={isBookingWizardOpen}
        onClose={() => setIsBookingWizardOpen(false)}
        service={bookingServiceTarget}
        isUrgentDefault={bookingIsUrgent}
        aiDiagnosis={aiDiagnosisForBooking}
        selectedCity={selectedCity}
        selectedLocality={selectedLocality}
        onBookingSuccess={handleBookingSuccess}
      />

      <LiveTrackingModal
        booking={activeLiveTrackingBooking}
        onClose={() => setActiveLiveTrackingBooking(null)}
        onCancelBooking={handleCancelBooking}
      />

      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />

      <AIVoiceAssistantModal
        isOpen={isAIVoiceOpen}
        onClose={() => {
          setIsAIVoiceOpen(false);
          setVoiceFeedbackTargetBooking(null);
        }}
        bookingForVoiceFeedback={voiceFeedbackTargetBooking}
        onBookService={(serviceId) => {
          const srv = services.find((s) => s.id === serviceId) || services[0];
          setBookingServiceTarget(srv);
          setBookingIsUrgent(false);
          setAiDiagnosisForBooking(null);
          setIsBookingWizardOpen(true);
        }}
      />

      <APIDocsModal
        isOpen={isAPIDocsOpen}
        onClose={() => setIsAPIDocsOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-8 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black italic flex items-center justify-center">
              UL
            </div>
            <span className="font-bold text-white text-sm">UrgentLyfe India</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-blue-400 font-bold">
              PostgreSQL & JWT Auth
            </span>
          </div>

          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} UrgentLyfe Home Services Private Limited. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setIsAPIDocsOpen(true)} className="hover:text-blue-400 cursor-pointer">
              REST API & DB Docs
            </button>
            <button onClick={() => setIsAIChatOpen(true)} className="hover:text-blue-400 cursor-pointer">
              AI Assistant
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
