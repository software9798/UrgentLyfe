import React, { useState } from 'react';
import {
  X,
  Wrench,
  CheckCircle2,
  Clock,
  Star,
  Zap,
  Briefcase,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { ProviderProfile, Category, Booking, User } from '../types';
import { api } from '../api/client';

interface ProviderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  providerProfile?: ProviderProfile | null;
  categories: Category[];
  onProviderProfileUpdated: (updated: ProviderProfile) => void;
}

export const ProviderProfileModal: React.FC<ProviderProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  providerProfile,
  categories,
  onProviderProfileUpdated,
}) => {
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>(
    providerProfile?.availability || 'available'
  );
  const [bio, setBio] = useState(providerProfile?.bio || '');
  const [skills, setSkills] = useState(providerProfile?.skills?.join(', ') || '');
  const [experienceYears, setExperienceYears] = useState(providerProfile?.experienceYears || 5);
  const [hourlyRate, setHourlyRate] = useState(providerProfile?.hourlyRate || 399);
  const [categoryId, setCategoryId] = useState(providerProfile?.categoryId || 'ac-appliance');

  const [assignedBookings, setAssignedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'jobs'>('profile');

  if (!isOpen) return null;

  const handleToggleAvailability = async (newStatus: 'available' | 'busy' | 'offline') => {
    try {
      setAvailability(newStatus);
      const updated = await api.updateAvailability(newStatus);
      onProviderProfileUpdated(updated);
    } catch (err: any) {
      alert(err.message || 'Could not update status');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const updated = await api.updateProviderProfile({
        bio,
        skills: skillsArray,
        experienceYears: Number(experienceYears),
        hourlyRate: Number(hourlyRate),
        categoryId,
      });

      onProviderProfileUpdated(updated);
      alert('Provider profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const loadProviderBookings = async () => {
    try {
      const list = await api.getProviderBookings();
      setAssignedBookings(list);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl md:rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 md:p-8 text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3 w-fit">
            <Wrench className="w-3.5 h-3.5 text-yellow-300" />
            Service Provider Dashboard
          </div>

          <div className="flex items-center gap-4">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80'}
              alt={user.fullName}
              className="w-14 h-14 rounded-2xl border-2 border-white/50 object-cover"
            />
            <div>
              <h2 className="text-2xl font-extrabold">{user.fullName}</h2>
              <p className="text-blue-100 text-xs mt-0.5">
                {providerProfile?.badge || 'Certified Partner'} • {user?.city || 'Bengaluru'}
              </p>
            </div>
          </div>

          {/* Quick Availability Status Selector */}
          <div className="mt-5 p-2 bg-black/20 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-white/90 pl-2">Live Availability:</span>
            <div className="flex items-center gap-1.5">
              {(['available', 'busy', 'offline'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleToggleAvailability(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold capitalize transition-all ${
                    availability === st
                      ? st === 'available'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : st === 'busy'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-rose-500 text-white shadow-xs'
                      : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              Profile & Skills
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('jobs');
                loadProviderBookings();
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'jobs' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              Assigned Jobs & Dispatch
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 bg-slate-50">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Provider Performance Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Rating</p>
                  <p className="text-lg font-black text-amber-500 mt-0.5">★ {providerProfile?.rating || 4.92}</p>
                </div>
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Jobs</p>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{providerProfile?.totalJobs || 1480}</p>
                </div>
                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Hourly Rate</p>
                  <p className="text-lg font-black text-blue-600 mt-0.5">₹{hourlyRate}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Professional Bio / Introduction
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients about your expertise..."
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Service Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Hourly Charge (₹)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Skills & Certifications
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Foam Jet Pro, Schneider Certified, Jaquar Expert"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                {saving ? 'Updating Profile...' : 'Save Provider Profile'}
              </button>
            </form>
          ) : (
            /* ASSIGNED JOBS */
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Dispatched SOS & Scheduled Bookings
              </h3>
              {assignedBookings.length === 0 ? (
                <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center">
                  <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No active jobs assigned currently</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Keep your status set to <span className="font-bold text-emerald-600">Available</span> to receive auto-dispatched orders.
                  </p>
                </div>
              ) : (
                assignedBookings.map((bk) => (
                  <div key={bk.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-blue-600">#{bk.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                        {bk.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{bk.service.title}</p>
                    <p className="text-xs text-slate-500">
                      Customer: {bk.userName} ({bk.userPhone})
                    </p>
                    <p className="text-xs text-slate-500">
                      Location: {bk.userAddress.line1}, {bk.userAddress.locality}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
