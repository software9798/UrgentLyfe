import { Router } from 'express';
import { db } from '../data/database';
import { COUPONS } from '../data/mockData';
import { Booking, BookingStatus } from '../types';

export const bookingRouter = Router();

// Get all bookings
bookingRouter.get('/', (req, res) => {
  res.json({ success: true, data: Array.from(db.bookings.values()) });
});

// Get single booking
bookingRouter.get('/:id', (req, res) => {
  const booking = db.bookings.get(req.params.id);
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
  res.json({ success: true, data: booking });
});

// Create new booking
bookingRouter.post('/', (req, res) => {
  const {
    serviceId,
    quantity = 1,
    isUrgent = false,
    scheduledDate,
    scheduledTimeSlot,
    userAddress,
    paymentMethod = 'UPI',
    notes,
    aiDiagnosis,
    couponCode,
    userId,
  } = req.body;

  const service = db.services.get(serviceId);
  if (!service) {
    return res.status(400).json({ success: false, error: 'Invalid service selected' });
  }

  if (!userAddress || !userAddress.line1 || !userAddress.locality) {
    return res.status(400).json({ success: false, error: 'Incomplete delivery address provided' });
  }

  const subtotal = service.price * quantity;
  const urgentFee = isUrgent ? service.urgentFee : 0;

  let discountAmount = 0;
  if (couponCode) {
    const coupon = COUPONS.find((c) => c.code.toUpperCase() === couponCode.toUpperCase().trim());
    if (coupon) {
      discountAmount = Math.min((subtotal * coupon.discountPercent) / 100, coupon.maxDiscount);
    }
  }

  const taxableAmount = Math.max(0, subtotal + urgentFee - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.18);
  const totalAmount = taxableAmount + taxAmount;

  // Find matching provider
  const categoryPartners = Array.from(db.providers.values()).filter(
    (p) => p.categoryId === service.categoryId && p.availability === 'available'
  );
  const assignedPartner = categoryPartners.length > 0 ? categoryPartners[0] : Array.from(db.providers.values())[0];

  const newBooking: Booking = {
    id: `UL-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: userId || 'usr-customer-101',
    userName: req.body.userName || 'Aarav Mehta',
    userPhone: req.body.userPhone || '+91 98765 12345',
    userAddress,
    service,
    quantity,
    isUrgent,
    scheduledDate: isUrgent ? new Date().toISOString().split('T')[0] : scheduledDate || 'Tomorrow',
    scheduledTimeSlot: isUrgent ? '30 Mins Express SOS' : scheduledTimeSlot || '10:00 AM - 11:00 AM',
    status: isUrgent ? 'PARTNER_EN_ROUTE' : 'CONFIRMED',
    partner: assignedPartner ? {
      id: assignedPartner.id,
      name: assignedPartner.fullName,
      phone: assignedPartner.phone,
      avatar: assignedPartner.avatar,
      categoryIds: [assignedPartner.categoryId],
      city: assignedPartner.city,
      rating: assignedPartner.rating,
      totalJobs: assignedPartner.totalJobs,
      experienceYears: assignedPartner.experienceYears,
      verified: assignedPartner.verified,
      skills: assignedPartner.skills,
      status: assignedPartner.availability,
      badge: assignedPartner.badge,
    } : undefined,
    subtotal,
    urgentFee,
    taxAmount,
    discountAmount: Math.round(discountAmount),
    totalAmount,
    paymentMethod,
    paymentStatus: 'PAID',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes,
    aiDiagnosis,
    etaMinutes: isUrgent ? 18 : 60,
    otpCode: String(Math.floor(1000 + Math.random() * 9000)),
  };

  db.bookings.set(newBooking.id, newBooking);

  // Add notification
  db.addNotification(
    newBooking.userId,
    isUrgent ? 'Emergency SOS Booked! ⚡' : 'Booking Confirmed! 🎉',
    `Your booking #${newBooking.id} for ${service.title} has been received.`,
    'BOOKING'
  );

  res.json({
    success: true,
    data: newBooking,
    message: isUrgent
      ? 'SOS Order Confirmed! Emergency partner dispatched immediately.'
      : 'Service booking scheduled successfully!',
  });
});

// Update booking status
bookingRouter.patch('/:id/status', (req, res) => {
  const { status } = req.body as { status: BookingStatus };
  const booking = db.bookings.get(req.params.id);

  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  booking.status = status;
  booking.updatedAt = new Date().toISOString();
  db.bookings.set(booking.id, booking);

  res.json({ success: true, data: booking });
});

// Directions info for booking
bookingRouter.get('/:id/directions', (req, res) => {
  try {
    const booking = db.bookings.get(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    const addressQuery = [
      booking.userAddress.line1,
      booking.userAddress.landmark ? `Near ${booking.userAddress.landmark}` : '',
      booking.userAddress.locality,
      booking.userAddress.city,
      booking.userAddress.pincode,
    ]
      .filter(Boolean)
      .join(', ');

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressQuery)}&travelmode=driving`;
    const appleMapsUrl = `https://maps.apple.com/?daddr=${encodeURIComponent(addressQuery)}&dirflg=d`;
    const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(addressQuery)}&navigate=yes`;

    res.json({
      success: true,
      data: {
        bookingId: booking.id,
        customerName: booking.userName,
        customerPhone: booking.userPhone,
        destinationAddress: addressQuery,
        scheduledSlot: booking.scheduledTimeSlot,
        googleMapsUrl,
        appleMapsUrl,
        wazeUrl,
        oneHourAlertSent: Boolean(booking.oneHourAlertSent),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger 1-Hour Service Alert
bookingRouter.post('/trigger-1hr-alert', (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, error: 'bookingId is required' });
    }

    const result = db.triggerOneHourAlert(bookingId);
    res.json({
      success: true,
      data: result,
      message: '1-Hour Service Reminder Push Alert dispatched with One-Click Directions link.',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
