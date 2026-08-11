import React, { useState } from 'react';
import {
  ShoppingBag,
  Wallet,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ChevronRight,
  Download,
  AlertCircle,
  Mic,
  User,
  Heart,
  Sparkles,
  Star,
  Edit3,
  Save,
  MessageSquare,
  Bot,
  Plus,
} from 'lucide-react';
import { Booking, UserProfile } from '../types';

interface UserDashboardProps {
  bookings: Booking[];
  walletBalance: number;
  onTrackBooking: (booking: Booking) => void;
  onOpenAIDoctor: () => void;
  onQuickSOS: () => void;
  onOpenVoiceFeedback?: (booking: Booking) => void;
  onOpenAddressManager?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  bookings,
  walletBalance,
  onTrackBooking,
  onOpenAIDoctor,
  onQuickSOS,
  onOpenVoiceFeedback,
  onOpenAddressManager,
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile' | 'ai_history' | 'feedback'>('bookings');

  // Profile Edit State
  const [profile, setProfile] = useState({
    fullName: 'Aarav Mehta',
    email: 'aarav.mehta@gmail.com',
    phone: '+91 98765 12345',
    city: 'Bengaluru',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Written Feedback State
  const [selectedRating, setSelectedRating] = useState(5);
  const [writtenReview, setWrittenReview] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const activeBookings = bookings.filter(
    (b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || b.status === 'CANCELLED'
  );

  const SAVED_SERVICES = [
    { id: 'srv-ac-01', title: 'Power Foam Jet AC Service', price: 599, rating: 4.8 },
    { id: 'srv-elec-01', title: 'Emergency Short Circuit Repair', price: 299, rating: 4.9 },
    { id: 'srv-plumb-01', title: 'Kitchen Water Leakage Drain Repair', price: 349, rating: 4.7 },
  ];

  const AI_PRICE_ESTIMATES = [
    { service: 'Dual Split AC Jet Wash (2 Units)', estimatedRange: '₹1,099 - ₹1,299', aiConfidence: '98% Market Verified' },
    { service: 'Full Home DB Box Electrical Audit', estimatedRange: '₹499 - ₹699', aiConfidence: '95% Market Verified' },
    { service: 'RO Filter Membrane Replacement', estimatedRange: '₹1,200 - ₹1,500', aiConfidence: '99% Genuine Parts' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Account Overview Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            UrgentLyfe VIP Member
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1.5">{profile.fullName}'s Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">
            {profile.email} • {profile.phone} • {profile.city}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-right">
            <p className="text-[10px] text-slate-300 uppercase font-semibold">Wallet Cash</p>
            <p className="text-xl font-black text-emerald-400">₹{walletBalance}</p>
          </div>
          <button
            onClick={onQuickSOS}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>30-Min SOS</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-2xl transition-all cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Bookings & Invoices ({bookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile & Addresses</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-2xl transition-all cursor-pointer ${
            activeTab === 'ai_history'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>AI Price & Voice History</span>
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-2xl transition-all cursor-pointer ${
            activeTab === 'feedback'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Star className="w-4 h-4 text-amber-500" />
          <span>Customer Reviews</span>
        </button>
      </div>

      {/* TAB 1: BOOKINGS & INVOICES */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Active Bookings Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
              <span>Active & En-Route Orders ({activeBookings.length})</span>
            </h2>

            {activeBookings.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3 shadow-xs">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No active bookings right now</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Need instant AC repair, plumbing leak fix, or electrician? Book in 30 seconds with 30-min SOS!
                </p>
                <button
                  onClick={onQuickSOS}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Book Express SOS Service
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-3xl border-2 border-indigo-500/80 p-5 shadow-sm space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded uppercase">
                        {b.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">{b.id}</span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900">{b.service.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {b.userAddress.line1}, {b.userAddress.locality}
                      </p>
                    </div>

                    {b.partner && (
                      <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between text-xs border border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={b.partner.avatar}
                            alt={b.partner.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-300"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{b.partner.name}</p>
                            <p className="text-[10px] text-slate-500">{b.partner.rating}★ Verified Technician</p>
                          </div>
                        </div>
                        {b.otpCode && (
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400">OTP Code</p>
                            <p className="font-mono font-bold text-slate-900 text-sm">{b.otpCode}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-black text-slate-900">₹{b.totalAmount}</span>
                      <button
                        onClick={() => onTrackBooking(b)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span>Track Live</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Orders History */}
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-bold text-slate-900">Order History ({pastBookings.length})</h2>
            <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
              {pastBookings.map((b) => (
                <div key={b.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      UL
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{b.service.title}</h3>
                      <p className="text-xs text-slate-500">
                        Booked on {new Date(b.createdAt).toLocaleDateString()} • Status: {b.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <span>₹{b.totalAmount}</span>
                    {onOpenVoiceFeedback && (
                      <button
                        onClick={() => onOpenVoiceFeedback(b)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Mic className="w-3.5 h-3.5 text-indigo-600" /> Voice Review
                      </button>
                    )}
                    <button
                      onClick={() => alert(`Downloading GST Invoice PDF for Booking ${b.id}...`)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> GST Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE & ADDRESSES */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Details Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> My Profile Information
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {isEditingProfile ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                {isEditingProfile ? 'Save Changes' : 'Edit Profile'}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-extrabold text-slate-400 uppercase">Full Name</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-800">{profile.fullName}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-400 uppercase">Email Address</label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-800">{profile.email}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-400 uppercase">Phone Number</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-800">{profile.phone}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-400 uppercase">Selected Service City</label>
                <p className="text-sm font-bold text-slate-800">{profile.city}</p>
              </div>
            </div>
          </div>

          {/* Manage Saved Addresses */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" /> Saved Delivery Addresses
              </h3>
              {onOpenAddressManager && (
                <button
                  type="button"
                  onClick={onOpenAddressManager}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Manage
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold rounded uppercase">Home</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">#402, Green Palm Heights, 10th Main</p>
                  <p className="text-[11px] text-slate-500">Indiranagar, Bengaluru, KA 560038</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded uppercase">Office</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">Tech Park Tower B, 5th Floor</p>
                  <p className="text-[11px] text-slate-500">Outer Ring Road, Marathahalli, Bengaluru</p>
                </div>
              </div>
            </div>

            {/* Saved Services */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 mb-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Bookmarked / Saved Services
              </h4>
              <div className="space-y-2">
                {SAVED_SERVICES.map((s) => (
                  <div key={s.id} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{s.title}</p>
                      <p className="text-[10px] text-slate-500">₹{s.price} • {s.rating}★</p>
                    </div>
                    <button
                      onClick={onQuickSOS}
                      className="px-2.5 py-1 bg-indigo-600 text-white font-bold rounded-lg text-[10px]"
                    >
                      Book
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI PRICE & VOICE HISTORY */}
      {activeTab === 'ai_history' && (
        <div className="space-y-6">
          {/* AI Price Estimate Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> AI Dynamic Price Benchmark Estimates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {AI_PRICE_ESTIMATES.map((item, i) => (
                <div key={i} className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded uppercase">
                    {item.aiConfidence}
                  </span>
                  <p className="text-xs font-extrabold text-slate-900 mt-1">{item.service}</p>
                  <p className="text-lg font-black text-slate-900">{item.estimatedRange}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Voice Assistant History */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Mic className="w-5 h-5 text-indigo-600" /> Gemini Speech-to-Text Voice Logs
            </h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Hindi/Hinglish Input</span>
                  <span className="text-[10px] text-slate-400">10 mins ago</span>
                </div>
                <p className="text-xs font-bold text-slate-800">"Mera AC thanda nahi kar raha hai, Foam Jet service book kar do"</p>
                <div className="p-2.5 bg-indigo-50 rounded-xl text-xs text-indigo-900 font-medium">
                  <span className="font-extrabold">Gemini AI Reply: </span> "Namaste! Power Foam Jet AC Service ₹599 mein available hai."
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER REVIEWS & FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-xs max-w-2xl mx-auto">
          <div>
            <h3 className="text-lg font-black text-slate-900">Write Service Feedback</h3>
            <p className="text-xs text-slate-500 mt-1">Help UrgentLyfe maintain top service quality by submitting your rating.</p>
          </div>

          {reviewSubmitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-extrabold text-emerald-800">Thank you! Feedback recorded successfully.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700">Star Rating</label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= selectedRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700">Written Review</label>
                <textarea
                  rows={3}
                  value={writtenReview}
                  onChange={(e) => setWrittenReview(e.target.value)}
                  placeholder="Share details about technician behavior, punctuality and work quality..."
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewSubmitted(true)}
                  disabled={!writtenReview.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  Submit Review
                </button>
                {pastBookings.length > 0 && onOpenVoiceFeedback && (
                  <button
                    type="button"
                    onClick={() => onOpenVoiceFeedback(pastBookings[0])}
                    className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Mic className="w-4 h-4 text-indigo-600" /> Record Voice Feedback
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

