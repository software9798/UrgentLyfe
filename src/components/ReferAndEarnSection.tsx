import React, { useState, useEffect } from 'react';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  MessageCircle,
  Mail,
  Smartphone,
  QrCode,
  Info,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import { ReferralStats, ReferralRecord } from '../types';

interface ReferAndEarnSectionProps {
  initialWalletBalance?: number;
  onWalletUpdated?: (newBalance: number) => void;
  onOpenSOS?: () => void;
}

export const ReferAndEarnSection: React.FC<ReferAndEarnSectionProps> = ({
  initialWalletBalance,
  onWalletUpdated,
  onOpenSOS,
}) => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Invite Form State
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Simulation State for Testing
  const [simulatingId, setSimulatingId] = useState<string | null>(null);
  const [rewardToast, setRewardToast] = useState<{ name: string; amount: number } | null>(null);

  // Filter for referral list
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'REWARD_CREDITED' | 'PENDING_FIRST_SERVICE'>('ALL');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getReferralStats();
      setStats(data);
      if (onWalletUpdated && data.walletBalance !== undefined) {
        onWalletUpdated(data.walletBalance);
      }
    } catch (err) {
      console.error('Failed to load referral stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const referralCode = stats?.referralCode || 'AARAV250';
  const referralLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}?ref=${referralCode}`
      : `https://urgentlyfe.app?ref=${referralCode}`;

  const shareText = `Hey! Use my UrgentLyfe referral code *${referralCode}* to get ₹200 OFF on your first 30-min SOS home repair, AC jet wash, or electrical service. Book here: ${referralLink}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'UrgentLyfe - ₹200 Discount Code',
          text: shareText,
          url: referralLink,
        });
      } catch (e) {
        console.log('Share canceled or not supported');
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Get ₹200 OFF on Home Services on UrgentLyfe');
    const body = encodeURIComponent(
      `Hi,\n\nI recommend UrgentLyfe for instant 30-minute emergency repairs and home services.\n\nUse my invite code ${referralCode} to get ₹200 discount on your first booking:\n${referralLink}\n\nCheers!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccessMsg(null);

    const cleanPhone = friendPhone.replace(/[^0-9]/g, '');
    if (!friendName.trim() || cleanPhone.length < 10) {
      setInviteError('Please provide a valid friend name and 10-digit mobile number.');
      return;
    }

    setSendingInvite(true);
    try {
      const res = await api.sendReferralInvite({
        friendName: friendName.trim(),
        friendPhone: cleanPhone,
        friendEmail: friendEmail.trim() || undefined,
      });

      setInviteSuccessMsg(res.message);
      setFriendName('');
      setFriendPhone('');
      setFriendEmail('');
      await fetchStats();
    } catch (err: any) {
      setInviteError(err.message || 'Failed to send invite.');
    } finally {
      setSendingInvite(false);
    }
  };

  // Simulate friend booking completion for instant test feedback
  const handleSimulateCompletion = async (referralId: string, friendName: string) => {
    setSimulatingId(referralId);
    try {
      const updated = await api.simulateCompleteReferral(referralId);
      setStats(updated);
      if (onWalletUpdated && updated.walletBalance !== undefined) {
        onWalletUpdated(updated.walletBalance);
      }
      setRewardToast({ name: friendName, amount: 250 });
      setTimeout(() => setRewardToast(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Simulation failed');
    } finally {
      setSimulatingId(null);
    }
  };

  const filteredReferrals = (stats?.referrals || []).filter((r) => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Reward Toast Animation */}
      {rewardToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 px-5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-6 h-6 text-amber-300 shrink-0 animate-spin" />
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-100">
              🎉 Wallet Credit Unlocked!
            </p>
            <p className="text-sm font-bold text-white">
              ₹{rewardToast.amount} added for {rewardToast.name}'s completed service!
            </p>
          </div>
          <button
            onClick={() => setRewardToast(null)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-950 p-6 sm:p-8 md:p-10 text-white shadow-xl border border-indigo-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>UrgentLyfe Referral Program</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Give <span className="text-amber-400">₹200</span>, Earn{' '}
              <span className="text-emerald-400">₹250</span> Wallet Cash
            </h1>

            <p className="text-sm text-slate-200 leading-relaxed max-w-xl">
              Invite your friends, colleagues, and neighbors to UrgentLyfe. When they complete their first
              urgent repair or home maintenance service, you get{' '}
              <strong className="text-emerald-300">₹250 cash credited</strong> to your UrgentLyfe wallet, and
              they get <strong className="text-amber-300">₹200 instant discount</strong> on their first order!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Unlimited Referrals
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Usable on Any Service
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Never Expires
              </span>
            </div>
          </div>

          {/* Referral Code Share Box */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-2xl space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1.5 flex items-center justify-between">
                <span>Your Personal Referral Code</span>
                <span className="text-emerald-400 font-mono">₹250/Friend</span>
              </p>
              
              <div className="flex items-center justify-between bg-black/40 border border-white/20 rounded-2xl p-2.5 px-4">
                <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-wider">
                  {referralCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Sharing Action Channels */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Share Via 1-Click:
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-900/30"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-900/30"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Link</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium py-2 px-3 rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Code</span>
                </button>

                <button
                  onClick={handleEmailShare}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium py-2 px-3 rounded-xl border border-white/10 transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Invite</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Live Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Referrals */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Friends Invited
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalReferrals ?? 4}</p>
          <p className="text-[11px] text-slate-500 font-medium">
            {stats?.pendingReferrals ?? 2} in progress / awaiting booking
          </p>
        </div>

        {/* Card 2: Completed Services */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Services Delivered
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats?.completedReferrals ?? 2}</p>
          <p className="text-[11px] text-emerald-700 font-semibold">
            100% Rewards Credited ✓
          </p>
        </div>

        {/* Card 3: Total Referral Earnings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Earned So Far
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600">₹{stats?.totalEarnings ?? 500}</p>
          <p className="text-[11px] text-slate-500 font-medium">₹250 per successful friend</p>
        </div>

        {/* Card 4: Current Wallet Balance */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-3xl border border-indigo-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Available Wallet Cash
            </span>
            <div className="p-2 bg-indigo-600 text-white rounded-xl">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-900">
            ₹{stats?.walletBalance ?? initialWalletBalance ?? 1250}
          </p>
          <p className="text-[11px] text-indigo-700 font-bold">Auto-applied on next booking</p>
        </div>
      </div>

      {/* 3-Step Visual Guide: How It Works */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900">How Refer & Earn Works</h2>
          <p className="text-xs text-slate-500">
            3 simple steps to earn unlimited free service credits for your home repairs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Step 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-md">
              1
            </div>
            <h3 className="font-bold text-sm text-slate-900">Share Your Code / Link</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Send your personal code <strong className="font-mono text-blue-600 font-bold">{referralCode}</strong> or
              invite link to friends, family, and housing society groups.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md">
              2
            </div>
            <h3 className="font-bold text-sm text-slate-900">Friend Books First Service</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your friend applies your referral code during booking or signup and gets{' '}
              <strong className="text-emerald-600 font-bold">₹200 instant discount</strong> off their order.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-md">
              3
            </div>
            <h3 className="font-bold text-sm text-slate-900">You Get ₹250 Wallet Cash</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Once our verified technician completes the repair job,{' '}
              <strong className="text-emerald-600 font-bold">₹250 cash</strong> is instantly credited to your
              UrgentLyfe wallet!
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Direct Invite Form + Referral Status Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Direct Send Invite Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600" />
              <span>Direct Invite Friend</span>
            </h2>
            <p className="text-xs text-slate-500">
              We'll send an instant WhatsApp & SMS invite with a ₹200 discount code.
            </p>
          </div>

          {inviteSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{inviteSuccessMsg}</span>
            </div>
          )}

          {inviteError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{inviteError}</span>
            </div>
          )}

          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Friend's Full Name *
              </label>
              <input
                type="text"
                required
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Friend's Mobile Number *
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={friendPhone}
                  onChange={(e) => setFriendPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="98765 43210"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-r-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Friend's Email (Optional)
              </label>
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder="rahul.sharma@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={sendingInvite}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {sendingInvite ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invite & Free ₹200 Coupon</span>
                </>
              )}
            </button>
          </form>

          {/* Value Guarantee Note */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              When your friend registers using this phone number and books their first service, your wallet
              will automatically receive ₹250 upon delivery completion!
            </p>
          </div>
        </div>

        {/* Right Column: Live Referral Tracking List & Rewards (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Referred Friends & Reward Status</span>
              </h2>
              <p className="text-xs text-slate-500">Track service progress and wallet credits in real-time</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({stats?.referrals?.length ?? 0})
              </button>
              <button
                onClick={() => setStatusFilter('REWARD_CREDITED')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'REWARD_CREDITED'
                    ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Credited ({stats?.completedReferrals ?? 0})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING_FIRST_SERVICE')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'PENDING_FIRST_SERVICE'
                    ? 'bg-white text-amber-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Pending ({stats?.pendingReferrals ?? 0})
              </button>
            </div>
          </div>

          {/* Referral List */}
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading referral ledger...</p>
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <Gift className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No referrals found in this filter</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Invite your friends using the form on the left to start earning ₹250 wallet credits!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReferrals.map((ref) => {
                const isCredited = ref.status === 'REWARD_CREDITED';

                return (
                  <div
                    key={ref.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCredited
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-slate-50/80 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{ref.referredName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({ref.referredPhone})</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        {ref.serviceName ? (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            <Zap className="w-3 h-3 text-amber-500" />
                            {ref.serviceName}
                          </span>
                        ) : (
                          <span className="text-slate-400">First Booking Pending</span>
                        )}

                        {ref.bookingId && (
                          <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                            #{ref.bookingId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      {isCredited ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            +₹{ref.rewardAmount} Credited
                          </span>
                          <p className="text-[10px] text-emerald-600 mt-0.5 font-medium">
                            Added to Wallet
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Service (₹{ref.rewardAmount})
                          </span>

                          {/* Simulation Button for testing live flow */}
                          <button
                            onClick={() => handleSimulateCompletion(ref.id, ref.referredName)}
                            disabled={simulatingId === ref.id}
                            title="Simulate job completion to test live ₹250 wallet reward credit"
                            className="text-[10px] font-black uppercase px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-all cursor-pointer shadow-xs"
                          >
                            {simulatingId === ref.id ? 'Crediting...' : 'Test Complete'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick FAQ info footer */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Credits are auto-applied on your next booking total.
            </span>
            <button
              onClick={fetchStats}
              className="text-blue-600 font-bold hover:underline cursor-pointer"
            >
              Refresh Ledger
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-center space-y-4">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Scan to Claim ₹200 OFF</h3>
              <p className="text-xs text-slate-500 mt-1">
                Show this QR code to friends to scan directly with their phone camera
              </p>
            </div>

            {/* Simulated QR Code Frame */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                  referralLink
                )}`}
                alt="Referral QR Code"
                className="w-44 h-44 rounded-xl shadow-xs"
              />
              <p className="font-mono text-sm font-black text-slate-900 mt-2">Code: {referralCode}</p>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {copiedLink ? 'Link Copied to Clipboard!' : 'Copy Referral Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
