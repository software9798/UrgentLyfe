import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Clock,
  Navigation,
  Compass,
  CheckCircle2,
  Volume2,
  ShieldCheck,
  Zap,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { Notification as AppNotification, Booking } from '../types';
import { pushService } from '../utils/pushNotificationService';
import { getGoogleMapsDirectionsUrl } from '../utils/directionsHelper';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onOpenBooking?: (bookingId: string) => void;
  onOpenDirections?: (booking: Booking) => void;
  bookings: Booking[];
  viewerRole?: 'CUSTOMER' | 'PROVIDER';
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onOpenBooking,
  onOpenDirections,
  bookings,
  viewerRole = 'CUSTOMER',
}) => {
  if (!isOpen) return null;

  const [activeFilter, setActiveFilter] = useState<'all' | '1hr_alerts' | 'bookings'>('all');
  const [pushPerm, setPushPerm] = useState<NotificationPermission>(pushService.getPermission());
  const [testSent, setTestSent] = useState(false);

  const handleRequestPush = async () => {
    const res = await pushService.requestPermission();
    setPushPerm(res);
    if (res === 'granted') {
      pushService.sendPush({
        title: '🔔 Push Notifications Enabled!',
        body: 'UrgentLyfe will alert you 1 hour before scheduled services with One-Click Directions.',
      });
    }
  };

  const handleTest1HourAlert = () => {
    const sampleBooking =
      bookings.find((b) => b.status !== 'CANCELLED') ||
      bookings[0] || {
        id: 'UL-TEST-101',
        userName: 'Aarav Mehta',
        userPhone: '+91 98765 12345',
        userAddress: {
          line1: 'Flat 402, Sunshine Apartments',
          locality: 'Indiranagar',
          city: 'Bengaluru',
          pincode: '560038',
          landmark: 'Near Metro Gate 2',
        },
        service: {
          id: 'ac-foam-jet',
          title: 'Power Foam Jet AC Service',
          price: 699,
          urgentFee: 0,
        },
        scheduledDate: 'Today',
        scheduledTimeSlot: '11:00 AM - 12:00 PM',
        status: 'CONFIRMED',
        partner: {
          name: 'Rajesh Verma (Super Pro)',
          phone: '+91 98765 43210',
        },
      };

    pushService.trigger1HourAlert(sampleBooking as Booking, viewerRole);
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === '1hr_alerts') return n.is1HourAlert || n.type === 'REMINDER_1HR' || n.title.includes('1-Hour') || n.title.includes('Reminder');
    if (activeFilter === 'bookings') return n.type === 'BOOKING' || n.bookingId;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div
        id="notification-center-modal"
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
            title="Close Notification Center"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Push Notifications & Alerts
                {unreadCount > 0 && (
                  <span className="bg-amber-400 text-slate-950 text-xs px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} New
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                1-Hour Scheduled Service Alerts & One-Click Directions Hub
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Push Notification System Status & Permission Card */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 border border-indigo-800/50 shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    pushPerm === 'granted'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    1-Hour Service Alert System
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                        pushPerm === 'granted'
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-amber-400 text-slate-950'
                      }`}
                    >
                      {pushPerm === 'granted' ? 'LIVE & ACTIVE' : 'ACTION REQUIRED'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Alerts users 1 hour before scheduled slots and sends One-Click Directions to professionals.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-3 border-t border-white/10">
              {pushPerm !== 'granted' ? (
                <button
                  id="enable-browser-push-btn"
                  onClick={handleRequestPush}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Enable Browser Push Notifications</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Browser Push Permission Active</span>
                </div>
              )}

              {/* Instant Test Alert Simulator Button */}
              <button
                id="test-1hr-alert-btn"
                onClick={handleTest1HourAlert}
                className="bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-white/20 active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span>{testSent ? '✓ Alert Triggered!' : 'Test 1-Hour Alert (Chime & Toast)'}</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Notifications ({notifications.length})
            </button>

            <button
              onClick={() => setActiveFilter('1hr_alerts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeFilter === '1hr_alerts'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>1-Hour Alerts</span>
            </button>

            <button
              onClick={() => setActiveFilter('bookings')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'bookings'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Bookings & Dispatch
            </button>
          </div>

          {/* Notification List */}
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No notifications in this category</p>
              <p className="text-xs text-slate-500">
                You will receive alerts 1 hour before scheduled service times.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const is1Hr =
                  notif.is1HourAlert ||
                  notif.type === 'REMINDER_1HR' ||
                  notif.title.toLowerCase().includes('1-hour') ||
                  notif.title.toLowerCase().includes('reminder');

                const relatedBooking = bookings.find((b) => b.id === notif.bookingId);

                return (
                  <div
                    key={notif.id}
                    className={`rounded-2xl border p-4 transition-all ${
                      is1Hr
                        ? 'bg-gradient-to-r from-amber-50/90 to-orange-50/80 border-amber-300 shadow-xs'
                        : notif.read
                        ? 'bg-white border-slate-200'
                        : 'bg-blue-50/60 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            is1Hr
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {is1Hr ? (
                            <Clock className="w-4 h-4 stroke-[2.5]" />
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-black text-slate-900">
                              {notif.title}
                            </h4>
                            {is1Hr && (
                              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.2 rounded-full uppercase tracking-wider">
                                1-HR REMINDER
                              </span>
                            )}
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                            )}
                          </div>

                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {notif.message}
                          </p>

                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>

                            {/* One-Click Directions Button */}
                            {(is1Hr || notif.directionsUrl || relatedBooking) && (
                              <button
                                onClick={() => {
                                  if (relatedBooking && onOpenDirections) {
                                    onOpenDirections(relatedBooking);
                                  } else if (notif.directionsUrl) {
                                    window.open(notif.directionsUrl, '_blank');
                                  } else if (relatedBooking) {
                                    window.open(
                                      getGoogleMapsDirectionsUrl(relatedBooking.userAddress),
                                      '_blank'
                                    );
                                  }
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                              >
                                <Compass className="w-3 h-3" />
                                <span>One-Click Directions</span>
                              </button>
                            )}

                            {/* View Booking Button */}
                            {notif.bookingId && onOpenBooking && (
                              <button
                                onClick={() => onOpenBooking(notif.bookingId!)}
                                className="text-[11px] font-bold text-slate-700 hover:text-slate-900 underline cursor-pointer"
                              >
                                View Booking
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {!notif.read && (
                        <button
                          onClick={() => onMarkRead(notif.id)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 shrink-0 cursor-pointer"
                          title="Mark as read"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Real-time push alerts via UrgentLyfe Automated Scheduler
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
