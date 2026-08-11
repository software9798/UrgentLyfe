import React, { useState } from 'react';
import {
  Briefcase,
  Star,
  CheckCircle2,
  Clock,
  Phone,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Upload,
  User,
  Sparkles,
  ThumbsUp,
  XCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Booking, Partner } from '../types';

interface PartnerDashboardProps {
  partner: Partner;
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, status: string) => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({
  partner,
  bookings,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'earnings' | 'profile' | 'ai_score'>('jobs');

  const assignedJobs = bookings.filter((b) => b.status !== 'CANCELLED');
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalEarnings = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalAmount * 0.85, 0); // 85% partner payout

  const MOCK_AI_SCORE = {
    overallAIScore: 94,
    rankPosition: '#1 in Indiranagar HVAC Category',
    qualityScore: 95,
    behaviorScore: 98,
    punctualityScore: 92,
    priceSatisfaction: 91,
    recentSentiments: [
      { text: 'Polite speech and very clean jet wash work', sentiment: 'POSITIVE', rating: 5.0 },
      { text: 'Arrived exactly in 15 minutes during rain emergency', sentiment: 'POSITIVE', rating: 5.0 },
    ],
    aiSuggestions: [
      'Maintain 100% OTP verification on job start to boost ranking',
      'Wear UrgentLyfe uniform badge for higher customer trust score',
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Partner Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={partner.avatar}
            alt={partner.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                {partner.badge || 'Verified Pro Partner'}
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Online & Available
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">{partner.name}</h1>
            <p className="text-xs text-slate-300">
              {partner?.rating}★ Rating • {partner?.totalJobs} Total Jobs • {partner?.city || 'Bengaluru'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-right">
            <p className="text-[10px] text-amber-300 uppercase font-semibold">Today's Payout</p>
            <p className="text-2xl font-black text-amber-400">₹{Math.round(totalEarnings || 1850)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-2xl transition-all cursor-pointer ${
            activeTab === 'jobs'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Assigned Jobs ({assignedJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-2xl transition-all cursor-pointer ${
            activeTab === 'earnings'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Earnings & Payouts</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_score')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-2xl transition-all cursor-pointer ${
            activeTab === 'ai_score'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span>AI Provider Score & Ranking</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-2xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Skills & Verified Documents</span>
        </button>
      </div>

      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {assignedJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-2 shadow-xs">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No active assigned jobs right now</p>
              <p className="text-xs text-slate-500">
                Keep app open. New emergency SOS dispatch leads in your area will pop up automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignedJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl border-2 border-slate-200 hover:border-amber-400 p-5 shadow-xs space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2.5 py-0.5 rounded uppercase flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-600" />
                      {job.isUrgent ? '30-MIN EXPRESS SOS LEAD' : 'SCHEDULED JOB'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{job.id}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{job.service.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {job.userAddress?.line1}, {job.userAddress?.locality}, {job.userAddress?.city || 'Bengaluru'}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Customer: {job.userName} ({job.userPhone})</span>
                    </p>
                  </div>

                  {job.notes && (
                    <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700 border border-slate-100">
                      <span className="font-bold text-slate-900">Customer Note: </span>"{job.notes}"
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400">Partner Earnings (85%)</p>
                      <p className="text-base font-black text-slate-900">₹{Math.round(job.totalAmount * 0.85)}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {job.status === 'CONFIRMED' || job.status === 'PARTNER_ASSIGNED' ? (
                        <>
                          <button
                            onClick={() => onUpdateStatus(job.id, 'CANCELLED')}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => onUpdateStatus(job.id, 'PARTNER_EN_ROUTE')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                          >
                            Accept & Start Route
                          </button>
                        </>
                      ) : job.status === 'PARTNER_EN_ROUTE' ? (
                        <button
                          onClick={() => onUpdateStatus(job.id, 'WORK_IN_PROGRESS')}
                          className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                        >
                          Verify OTP & Start Work
                        </button>
                      ) : job.status === 'WORK_IN_PROGRESS' ? (
                        <button
                          onClick={() => onUpdateStatus(job.id, 'COMPLETED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Job Complete</span>
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          Completed ✓
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'earnings' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-1 shadow-xs">
            <p className="text-xs text-slate-500 font-bold uppercase">Weekly Net Earnings</p>
            <p className="text-3xl font-black text-slate-900">₹14,850</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18% vs last week
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-1 shadow-xs">
            <p className="text-xs text-slate-500 font-bold uppercase">Total Completed Jobs</p>
            <p className="text-3xl font-black text-slate-900">{partner.totalJobs}</p>
            <p className="text-[11px] text-slate-400">100% On-time arrival rate</p>
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-3xl space-y-1 shadow-xs">
            <p className="text-xs text-slate-500 font-bold uppercase">Customer Rating Score</p>
            <p className="text-3xl font-black text-amber-500">{partner.rating} ★</p>
            <p className="text-[11px] text-amber-800 font-semibold">Eligible for ₹2,000 Monthly Bonus!</p>
          </div>
        </div>
      )}

      {/* AI Score Tab */}
      {activeTab === 'ai_score' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 rounded-3xl text-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
            <div>
              <span className="bg-slate-950 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                AI Performance Rank
              </span>
              <h2 className="text-3xl font-black mt-2">{MOCK_AI_SCORE.rankPosition}</h2>
              <p className="text-xs text-amber-950 font-bold mt-1">
                AI Overall Score: {MOCK_AI_SCORE.overallAIScore} / 100 based on Voice Reviews & OTP Punctuality
              </p>
            </div>
            <div className="bg-slate-950/90 text-white p-4 rounded-2xl text-center min-w-[140px]">
              <p className="text-[10px] text-amber-400 font-extrabold uppercase">Overall AI Score</p>
              <p className="text-4xl font-black text-amber-400">{MOCK_AI_SCORE.overallAIScore}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Work Quality</p>
              <p className="text-xl font-black text-slate-900 mt-1">{MOCK_AI_SCORE.qualityScore}%</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Behavior & Speech</p>
              <p className="text-xl font-black text-slate-900 mt-1">{MOCK_AI_SCORE.behaviorScore}%</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Punctuality</p>
              <p className="text-xl font-black text-slate-900 mt-1">{MOCK_AI_SCORE.punctualityScore}%</p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Price Transparency</p>
              <p className="text-xl font-black text-slate-900 mt-1">{MOCK_AI_SCORE.priceSatisfaction}%</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">AI Improvement Recommendations</h3>
            <div className="space-y-2">
              {MOCK_AI_SCORE.aiSuggestions.map((sug, i) => (
                <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile & Documents Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-lg font-black text-slate-900">Technician Credentials & KYC Documents</h3>
            <p className="text-xs text-slate-500 mt-1">Verified on UrgentLyfe Partner Network.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-xs font-extrabold text-slate-400 uppercase">Service Category & Skills</p>
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
                <p className="font-bold text-slate-900">Primary Skill: HVAC & Electrical Repair</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-[10px]">Dual Jet Wash</span>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-[10px]">Freon Leakage Repair</span>
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg text-[10px]">DB Box Wiring</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-extrabold text-slate-400 uppercase">KYC Verification Status</p>
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Aadhaar Verification</span>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">VERIFIED ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Police Verification Clearance</span>
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">VERIFIED ✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

