import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  Compass,
  Navigation,
  X,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  PUSH_NOTIFICATION_EVENT,
  PushNotificationPayload,
} from '../utils/pushNotificationService';

interface PushNotificationToastProps {
  onOpenBooking?: (bookingId: string) => void;
  onOpenDirections?: (bookingId: string) => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  onOpenBooking,
  onOpenDirections,
}) => {
  const [currentNotification, setCurrentNotification] = useState<PushNotificationPayload | null>(null);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const handlePushEvent = (e: Event) => {
      const customEvent = e as CustomEvent<PushNotificationPayload>;
      if (customEvent.detail) {
        setCurrentNotification(customEvent.detail);
        setProgress(100);
      }
    };

    window.addEventListener(PUSH_NOTIFICATION_EVENT, handlePushEvent);
    return () => {
      window.removeEventListener(PUSH_NOTIFICATION_EVENT, handlePushEvent);
    };
  }, []);

  useEffect(() => {
    if (!currentNotification) return;

    const duration = 10000; // 10 seconds display
    const intervalTime = 100;
    const decrement = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          setCurrentNotification(null);
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentNotification]);

  if (!currentNotification) return null;

  const handleDirectionsClick = () => {
    if (currentNotification.bookingId && onOpenDirections) {
      onOpenDirections(currentNotification.bookingId);
    } else if (currentNotification.directionsUrl) {
      window.open(currentNotification.directionsUrl, '_blank', 'noopener,noreferrer');
    }
    setCurrentNotification(null);
  };

  const handleViewBooking = () => {
    if (currentNotification.bookingId && onOpenBooking) {
      onOpenBooking(currentNotification.bookingId);
    }
    setCurrentNotification(null);
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full sm:w-[420px] px-3 pointer-events-auto animate-in slide-in-from-top-6 duration-300">
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border-2 border-amber-400/80 backdrop-blur-xl relative overflow-hidden">
        {/* Progress timer bar */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-start gap-3">
          {/* Bell / Clock Glow Icon */}
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 animate-pulse mt-0.5">
            {currentNotification.is1HourAlert ? (
              <Clock className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Bell className="w-5 h-5 fill-slate-950" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {currentNotification.is1HourAlert ? '⏰ 1-HOUR ALERT' : 'PUSH ALERT'}
              </span>
              {currentNotification.bookingId && (
                <span className="text-[11px] text-slate-400 font-mono">
                  #{currentNotification.bookingId}
                </span>
              )}
            </div>

            <h4 className="text-sm font-black text-white leading-tight">
              {currentNotification.title}
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-3">
              {currentNotification.body}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800">
              <button
                id="push-toast-directions-btn"
                onClick={handleDirectionsClick}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 hover:scale-[1.02] cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>One-Click Directions</span>
              </button>

              {currentNotification.bookingId && (
                <button
                  onClick={handleViewBooking}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  View Details
                </button>
              )}
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setCurrentNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer absolute top-3 right-3"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
