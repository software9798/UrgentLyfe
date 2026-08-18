import { Booking, Notification as AppNotification } from '../types';
import { getGoogleMapsDirectionsUrl, formatFullAddress } from './directionsHelper';

export interface PushNotificationPayload {
  id?: string;
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  bookingId?: string;
  directionsUrl?: string;
  actionUrl?: string;
  is1HourAlert?: boolean;
  scheduledTime?: string;
  partnerName?: string;
  serviceTitle?: string;
  timestamp?: string;
}

// Custom event name for in-app reactive notification toasts
export const PUSH_NOTIFICATION_EVENT = 'urgentlyfe:push-notification';

class PushNotificationService {
  private audioContext: AudioContext | null = null;
  private permission: NotificationPermission = 'default';
  private scheduledTimers: Map<string, number> = new Map();
  private sentAlertsSet: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        this.permission = Notification.permission;
      }
      // Load previously sent alerts from session storage
      try {
        const saved = sessionStorage.getItem('urgentlyfe_sent_1hr_alerts');
        if (saved) {
          const list: string[] = JSON.parse(saved);
          list.forEach((id) => this.sentAlertsSet.add(id));
        }
      } catch (e) {
        // ignore
      }
    }
  }

  /**
   * Checks if native browser Notifications are supported
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Gets current push permission state
   */
  public getPermission(): NotificationPermission {
    if (this.isSupported()) {
      this.permission = Notification.permission;
    }
    return this.permission;
  }

  /**
   * Requests permission from user to send native web push notifications
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return this.permission;
    }
  }

  /**
   * Plays a crisp, pleasant synthesizer chime using Web Audio API
   */
  public playChime(type: 'reminder' | 'success' | 'urgent' = 'reminder') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      if (type === 'reminder') {
        // Double ding: 587.33Hz (D5) -> 880Hz (A5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880.0, now + 0.12);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'urgent') {
        // Triple chime for SOS
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(880.0, now + 0.1);
        osc.frequency.setValueAtTime(1046.5, now + 0.2);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.start(now);
        osc.stop(now + 0.75);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Sends both browser native push notification (if permitted) and in-app animated toast
   */
  public sendPush(payload: PushNotificationPayload): void {
    // 1. Play audio chime
    this.playChime(payload.is1HourAlert ? 'reminder' : 'reminder');

    // 2. Dispatch custom event for reactive in-app banner/toast
    if (typeof window !== 'undefined') {
      const event = new CustomEvent(PUSH_NOTIFICATION_EVENT, {
        detail: {
          ...payload,
          id: payload.id || `push-${Date.now()}`,
          timestamp: payload.timestamp || new Date().toISOString(),
        },
      });
      window.dispatchEvent(event);
    }

    // 3. Trigger native browser push notification if permitted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          tag: payload.tag || payload.bookingId || 'urgentlyfe-reminder',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200] as any,
          data: {
            bookingId: payload.bookingId,
            directionsUrl: payload.directionsUrl,
            actionUrl: payload.actionUrl,
          },
        } as any);

        notif.onclick = (e) => {
          e.preventDefault();
          window.focus();
          if (payload.directionsUrl) {
            window.open(payload.directionsUrl, '_blank');
          }
          notif.close();
        };
      } catch (err) {
        console.warn('Native notification dispatch failed:', err);
      }
    }
  }

  /**
   * Triggers the 1-Hour Service Alert for a specific booking
   */
  public trigger1HourAlert(booking: Booking, targetRole: 'CUSTOMER' | 'PROVIDER' | string = 'CUSTOMER'): PushNotificationPayload {
    const fullAddress = formatFullAddress(booking.userAddress);
    const directionsUrl = getGoogleMapsDirectionsUrl(booking.userAddress);
    const scheduledSlot = booking.scheduledTimeSlot || '10:00 AM - 11:00 AM';
    const partnerName = booking.partner?.name || 'Assigned Certified Professional';

    let title = '';
    let body = '';

    if (targetRole === 'PROVIDER') {
      title = `⏰ 1-Hour Service Alert: Job #${booking.id}`;
      body = `Service for ${booking.userName} (${booking.service.title}) starts in 1 hour at ${scheduledSlot}. Tap for One-Click Directions to ${booking.userAddress.locality}!`;
    } else {
      title = `⏰ Service Reminder: Starting in 1 Hour!`;
      body = `Your ${booking.service.title} is scheduled for ${scheduledSlot}. Expert ${partnerName} is preparing. Tap to view One-Click Directions & Live ETA.`;
    }

    const payload: PushNotificationPayload = {
      id: `alert-1hr-${booking.id}-${Date.now()}`,
      title,
      body,
      bookingId: booking.id,
      directionsUrl,
      actionUrl: `booking:${booking.id}`,
      is1HourAlert: true,
      scheduledTime: scheduledSlot,
      partnerName,
      serviceTitle: booking.service.title,
      timestamp: new Date().toISOString(),
    };

    // Mark as sent
    this.sentAlertsSet.add(booking.id);
    try {
      sessionStorage.setItem('urgentlyfe_sent_1hr_alerts', JSON.stringify(Array.from(this.sentAlertsSet)));
    } catch (e) {
      // ignore
    }

    this.sendPush(payload);
    return payload;
  }

  /**
   * Checks a list of bookings and triggers 1-hour alerts for any eligible upcoming booking
   */
  public checkAndScheduleBookings(bookings: Booking[], targetRole: 'CUSTOMER' | 'PROVIDER' | string = 'CUSTOMER'): void {
    bookings.forEach((booking) => {
      if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') return;
      if (this.sentAlertsSet.has(booking.id) || booking.oneHourAlertSent) return;

      // Check if scheduled date/time is within 1 hour or is standard upcoming
      const isUrgent = booking.isUrgent;
      if (isUrgent) return; // Urgent bookings are instant SOS (within 30 mins)

      // Auto schedule check: for demo convenience, if booking is confirmed and not yet notified
      // we can schedule the 1 hour timer
      if (!this.scheduledTimers.has(booking.id)) {
        // Set an automated check timer
        const timerId = window.setTimeout(() => {
          this.trigger1HourAlert(booking, targetRole);
        }, 12000); // Demo preview timer triggers within 12s if user has active booking
        this.scheduledTimers.set(booking.id, timerId);
      }
    });
  }

  /**
   * Clears timers on unmount
   */
  public clearTimers() {
    this.scheduledTimers.forEach((timerId) => clearTimeout(timerId));
    this.scheduledTimers.clear();
  }
}

export const pushService = new PushNotificationService();
