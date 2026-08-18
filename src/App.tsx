import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { LocationBarSection } from './components/LocationBarSection';
import { FloatingAIAssistant } from './components/FloatingAIAssistant';
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
import { PostServiceFeedbackModal } from './components/PostServiceFeedbackModal';
import { InvoiceModal } from './components/InvoiceModal';
import { CompareFloatingBar } from './components/CompareFloatingBar';
import { CompareServicesModal } from './components/CompareServicesModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DirectionsModal } from './components/DirectionsModal';
import { PushNotificationToast } from './components/PushNotificationToast';
import { NotificationCenterModal } from './components/NotificationCenterModal';

import { CITIES, CATEGORIES, SERVICES, PARTNERS, MOCK_BOOKINGS } from './data/mockData';
import { City, Category, ServiceItem, Booking, AIDiagnosis, Partner, User, ProviderProfile, AuthResponse, Notification as AppNotification } from './types';
import { api } from './api/client';
import { pushService } from './utils/pushNotificationService';
import { Sparkles, Zap, Wrench, ShoppingBag, CheckCircle2, WifiOff, ArrowRightLeft } from 'lucide-react';

export default function App() {
  const [cities, setCities] = useState<City[]>(CITIES);
  const [selectedCity, setSelectedCity] = useState<City>(CITIES[0]); // Bengaluru
  const [selectedLocality, setSelectedLocality] = useState<string>(CITIES[0].localities[0]);

  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [services, setServices] = useState<ServiceItem[]>(SERVICES);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compare Feature State (up to 3 services)
  const [compareList, setCompareList] = useState<ServiceItem[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);

  // Modals & Drawers
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAddressesOpen, setIsAddressesOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState<boolean>(false);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);
  const [dashboardDefaultTab, setDashboardDefaultTab] = useState<'bookings' | 'trends' | 'refer_earn' | 'profile' | 'ai_history' | 'feedback'>('bookings');

  const [selectedServiceDetail, setSelectedServiceDetail] = useState<ServiceItem | null>(null);
  const [isBookingWizardOpen, setIsBookingWizardOpen] = useState<boolean>(false);
  const [bookingServiceTarget, setBookingServiceTarget] = useState<ServiceItem | null>(null);
  const [bookingIsUrgent, setBookingIsUrgent] = useState<boolean>(false);
  const [aiDiagnosisForBooking, setAiDiagnosisForBooking] = useState<AIDiagnosis | null>(null);

  // Bookings & Tracking
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [activeLiveTrackingBooking, setActiveLiveTrackingBooking] = useState<Booking | null>(null);
  const [feedbackTargetBooking, setFeedbackTargetBooking] = useState<Booking | null>(null);

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

  // Push Notifications & Directions State
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [directionsModalBooking, setDirectionsModalBooking] = useState<Booking | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-welcome-1',
      userId: 'usr-customer-101',
      title: '⏰ 1-Hour Service Alert System Ready',
      message: 'UrgentLyfe will alert you 1 hour before scheduled service times with One-Click Turn-by-Turn GPS Directions.',
      read: false,
      is1HourAlert: true,
      type: 'REMINDER_1HR',
      createdAt: new Date().toISOString(),
    },
  ]);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (Array.isArray(data) && data.length > 0) {
        setNotifications(data);
      }
    } catch (e) {
      // ignore
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await api.markNotificationRead(id);
    } catch (e) {
      // ignore
    }
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

  // Background 1-Hour Alert Scheduler & Check
  useEffect(() => {
    fetchNotifications();

    // Check bookings and register 1-hour alerts
    pushService.checkAndScheduleBookings(bookings, currentUser?.role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER');

    const interval = setInterval(() => {
      pushService.checkAndScheduleBookings(bookings, currentUser?.role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER');
      fetchNotifications();
    }, 25000);

    return () => {
      clearInterval(interval);
      pushService.clearTimers();
    };
  }, [bookings, currentUser]);

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

  // Compare Feature Handlers (Max 3 items)
  const handleToggleCompare = (service: ServiceItem) => {
    setCompareList((prev) => {
      const exists = prev.some((s) => s.id === service.id);
      if (exists) {
        return prev.filter((s) => s.id !== service.id);
      }
      if (prev.length >= 3) {
        showToast('Maximum 3 services can be compared at once.');
        return prev;
      }
      showToast(`Added "${service.title}" to compare (${prev.length + 1}/3)`);
      return [...prev, service];
    });
  };

  const handleRemoveFromCompare = (serviceId: string) => {
    setCompareList((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const handleClearCompare = () => {
    setCompareList([]);
    setIsCompareModalOpen(false);
  };

  const handleAddToCompare = (service: ServiceItem) => {
    if (compareList.some((s) => s.id === service.id)) return;
    if (compareList.length >= 3) {
      showToast('Maximum 3 services can be compared at once.');
      return;
    }
    setCompareList((prev) => [...prev, service]);
    showToast(`Added "${service.title}" to compare (${compareList.length + 1}/3)`);
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
        onOpenBookings={() => {
          setDashboardDefaultTab('bookings');
          setActiveTab('dashboard');
        }}
        onOpenNotifications={() => setIsNotificationCenterOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        onOpenReferAndEarn={() => {
          setDashboardDefaultTab('refer_earn');
          setActiveTab('dashboard');
        }}
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
        <main className="flex-1 pb-24 md:pb-12">
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
            onViewInvoice={(booking) => setInvoiceBooking(booking)}
            onOpenDirections={(booking) => setDirectionsModalBooking(booking)}
          />
        </main>
      ) : activeTab === 'dashboard' ? (
        /* Customer Dashboard View */
        <main className="flex-1 pb-24 md:pb-12">
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
            defaultTab={dashboardDefaultTab}
            onWalletUpdated={(newBal) => setWalletBalance(newBal)}
            onTrackBooking={(booking) => setActiveLiveTrackingBooking(booking)}
            onOpenAIDoctor={() => setIsAIDoctorOpen(true)}
            onQuickSOS={handleQuickSOS}
            onOpenAddressManager={() => setIsAddressesOpen(true)}
            onOpenPostServiceFeedback={(booking) => setFeedbackTargetBooking(booking)}
            onViewInvoice={(booking) => setInvoiceBooking(booking)}
            onOpenDirections={(booking) => setDirectionsModalBooking(booking)}
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
        <main className="flex-1 pb-24 md:pb-16">
          <HeroSection
            selectedCityName={selectedCity.name}
            onOpenAIDoctor={() => {
              setAiDoctorCategoryHint('');
              setIsAIDoctorOpen(true);
            }}
            onQuickSOS={handleQuickSOS}
          />

          {/* Location-Wise Service Booking & GPS Search Section */}
          <LocationBarSection
            cities={cities}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
            selectedLocality={selectedLocality}
            onSelectLocality={setSelectedLocality}
            onAddCustomCity={(newCity) => setCities((prev) => [newCity, ...prev.filter((c) => c.id !== newCity.id)])}
          />

          <CategoryGrid
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
          />

          {/* Services Grid Section */}
          <section id="services-catalog-grid" className="mx-4 sm:mx-6 lg:mx-8 my-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  Available Packages ({filteredServices.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Upfront guaranteed pricing for {selectedLocality}, {selectedCity.name}
                </p>
              </div>

              {/* Compare Quick Access Trigger */}
              {compareList.length > 0 && (
                <button
                  onClick={() => setIsCompareModalOpen(true)}
                  className="self-start sm:self-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Compare Selected ({compareList.length}/3)</span>
                </button>
              )}
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
                    isComparing={compareList.some((c) => c.id === service.id)}
                    onToggleCompare={handleToggleCompare}
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
        isComparing={selectedServiceDetail ? compareList.some((c) => c.id === selectedServiceDetail.id) : false}
        onToggleCompare={handleToggleCompare}
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
        onOpenPostServiceFeedback={(b) => setFeedbackTargetBooking(b)}
        onViewInvoice={(b) => setInvoiceBooking(b)}
        onOpenDirections={(b) => setDirectionsModalBooking(b)}
        onBookingUpdated={(updated) => {
          setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
          setActiveLiveTrackingBooking(updated);
          showToast(`💵 Cash payment of ₹${updated.totalAmount} recorded. GST Invoice generated!`);
        }}
      />

      {/* One-Click Directions & Turn-by-Turn Route Navigation Modal */}
      <DirectionsModal
        isOpen={Boolean(directionsModalBooking)}
        onClose={() => setDirectionsModalBooking(null)}
        booking={directionsModalBooking}
        viewerRole={currentUser?.role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER'}
      />

      {/* Real-time Push Notification Floating Interactive Toast */}
      <PushNotificationToast
        onOpenBooking={(id) => {
          const matched = bookings.find((b) => b.id === id);
          if (matched) setActiveLiveTrackingBooking(matched);
        }}
        onOpenDirections={(id) => {
          const matched = bookings.find((b) => b.id === id);
          if (matched) setDirectionsModalBooking(matched);
        }}
      />

      {/* Push Notification Center & 1-Hour Alerts Hub Modal */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        bookings={bookings}
        viewerRole={currentUser?.role === 'PROVIDER' ? 'PROVIDER' : 'CUSTOMER'}
        onOpenBooking={(id) => {
          setIsNotificationCenterOpen(false);
          const matched = bookings.find((b) => b.id === id);
          if (matched) setActiveLiveTrackingBooking(matched);
        }}
        onOpenDirections={(booking) => {
          setIsNotificationCenterOpen(false);
          setDirectionsModalBooking(booking);
        }}
      />

      <InvoiceModal
        isOpen={!!invoiceBooking}
        onClose={() => setInvoiceBooking(null)}
        booking={invoiceBooking}
        user={currentUser}
      />

      <PostServiceFeedbackModal
        isOpen={!!feedbackTargetBooking}
        booking={feedbackTargetBooking}
        onClose={() => setFeedbackTargetBooking(null)}
        onSubmitFeedback={(feedback) => {
          setBookings((prev) =>
            prev.map((b) =>
              b.id === feedback.bookingId
                ? {
                    ...b,
                    userStarRating: feedback.rating,
                    userReviewText: feedback.reviewText,
                    workPhotos: feedback.photos,
                  }
                : b
            )
          );
          showToast('🌟 Thank you! Feedback, photos & rating submitted successfully.');
        }}
      />

      <AIChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onBookService={(serviceId, isUrgent) => {
          const srv = services.find((s) => s.id === serviceId) || services[0];
          setBookingServiceTarget(srv);
          setBookingIsUrgent(!!isUrgent);
          setAiDiagnosisForBooking(null);
          setIsBookingWizardOpen(true);
        }}
      />

      <AIVoiceAssistantModal
        isOpen={isAIVoiceOpen}
        onClose={() => {
          setIsAIVoiceOpen(false);
          setVoiceFeedbackTargetBooking(null);
        }}
        bookingForVoiceFeedback={voiceFeedbackTargetBooking}
        onFeedbackSubmitted={({ bookingId, voiceFeedbackText, sentiment, rating, summary }) => {
          setBookings((prev) =>
            prev.map((b) =>
              b.id === bookingId
                ? {
                    ...b,
                    voiceFeedbackText,
                    voiceFeedbackSentiment: sentiment as any,
                    voiceFeedbackRating: rating,
                    voiceFeedbackSummary: summary,
                    voiceFeedbackAt: new Date().toISOString(),
                  }
                : b
            )
          );
        }}
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

      {/* Compare Services Side-by-Side Modal */}
      <CompareServicesModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        compareList={compareList}
        allServices={services}
        onRemoveService={handleRemoveFromCompare}
        onAddService={handleAddToCompare}
        onBookService={(service, isUrgent) => {
          setBookingServiceTarget(service);
          setBookingIsUrgent(isUrgent);
          setAiDiagnosisForBooking(null);
          setIsBookingWizardOpen(true);
        }}
      />

      {/* Floating Compare Drawer Bar */}
      <CompareFloatingBar
        compareList={compareList}
        onRemoveFromCompare={handleRemoveFromCompare}
        onClearCompare={handleClearCompare}
        onOpenCompareModal={() => setIsCompareModalOpen(true)}
      />

      {/* Left Corner Floating AI Assistant & Voice Assistant */}
      <FloatingAIAssistant
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenAIVoice={() => {
          setVoiceFeedbackTargetBooking(null);
          setIsAIVoiceOpen(true);
        }}
        onOpenAIDoctor={() => {
          setAiDoctorCategoryHint('');
          setIsAIDoctorOpen(true);
        }}
      />

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet screens) */}
      <MobileBottomNav
        activeTab={activeTab}
        dashboardTab={dashboardDefaultTab}
        activeBookingsCount={activeBookingsCount}
        onNavigateHome={() => setActiveTab('services')}
        onNavigateBookings={() => {
          setDashboardDefaultTab('bookings');
          setActiveTab('dashboard');
        }}
        onNavigateReferEarn={() => {
          setDashboardDefaultTab('refer_earn');
          setActiveTab('dashboard');
        }}
        onQuickSOS={handleQuickSOS}
        onOpenAIAssistant={() => setIsAIChatOpen(true)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 py-8 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black italic flex items-center justify-center">
              UL
            </div>
            <span className="font-bold text-white text-sm">UrgentLyfe India</span>
          </div>

          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} UrgentLyfe Home Services Private Limited. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setIsAIChatOpen(true)} className="hover:text-blue-400 cursor-pointer">
              AI Assistant
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
