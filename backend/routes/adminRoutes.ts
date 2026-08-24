import { Router } from 'express';
import { db } from '../data/database';
import { CITIES } from '../data/mockData';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware';
import { AnomalyDetector } from '../../ml_models';

export const adminRouter = Router();


// Get All Users (Admin)
adminRouter.get('/users', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const allUsers = Array.from(db.users.values()).map((u) => db.sanitizeUser(u));
  res.json({ success: true, data: allUsers, total: allUsers.length });
});

// Block/Unblock or Update User Role (Admin)
adminRouter.patch('/users/:id', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  const { isBlocked, role } = req.body;
  if (typeof isBlocked === 'boolean') user.isBlocked = isBlocked;
  if (role) user.role = role;

  user.updatedAt = new Date().toISOString();
  res.json({ success: true, data: db.sanitizeUser(user), message: 'User updated.' });
});

// Get All Providers (Admin)
adminRouter.get('/providers', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const providers = Array.from(db.providers.values());
  res.json({ success: true, data: providers, total: providers.length });
});

// Verify Provider or Update Badge (Admin)
adminRouter.patch('/providers/:id/verify', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const provider = db.providers.get(req.params.id);
  if (!provider) return res.status(404).json({ success: false, error: 'Provider not found' });

  const { verified, badge } = req.body;
  if (typeof verified === 'boolean') provider.verified = verified;
  if (badge) provider.badge = badge;

  res.json({ success: true, data: provider, message: 'Provider verified status updated.' });
});

// Platform Stats (Admin)
adminRouter.get('/stats', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const totalUsers = db.users.size;
  const totalProviders = db.providers.size;
  const totalBookings = db.bookings.size;
  const activeBookings = Array.from(db.bookings.values()).filter(
    (b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
  ).length;

  let totalRevenue = 0;
  db.bookings.forEach((b) => {
    if (b.paymentStatus === 'PAID') totalRevenue += b.totalAmount;
  });

  res.json({
    success: true,
    data: {
      totalUsers,
      totalProviders,
      totalBookings,
      activeBookings,
      totalRevenue,
      systemHealth: 'OPERATIONAL',
      activeCities: CITIES.length,
      averageRating: 4.91,
    },
  });
});

// Create new service (Admin)
adminRouter.post('/services', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const newService = { ...req.body, id: `srv-${Date.now()}` };
  db.services.set(newService.id, newService);
  res.status(201).json({ success: true, data: newService, message: 'Service created.' });
});

// AI Fraud & Anomaly Detection System
adminRouter.get('/fraud-alerts', (req, res) => {
  const mockAlerts = [
    {
      id: 'frd-101',
      type: 'FAKE_REVIEW_SUSPECT',
      severity: 'HIGH',
      user: 'Priya Sharma (usr-cust-99)',
      riskScore: 88,
      reason: 'Multiple 5-star reviews posted within 30 seconds from same IP address.',
      timestamp: new Date().toISOString(),
      status: 'FLAGGED',
    },
    {
      id: 'frd-102',
      type: 'BOOKING_VELOCITY_ANOMALY',
      severity: 'MEDIUM',
      user: 'Rohan Verma (usr-cust-104)',
      riskScore: 72,
      reason: '5 high-value SOS bookings created within 2 minutes with unpaid cash mode.',
      timestamp: new Date().toISOString(),
      status: 'UNDER_REVIEW',
    },
  ];
  res.json({ success: true, data: mockAlerts });
});

// Real-time ML Anomaly Evaluation Probe
adminRouter.post('/check-anomaly', (req, res) => {
  const {
    userId = 'usr-anon',
    userBookingsLast24h = 1,
    userCancelledLast24h = 0,
    paymentMethod = 'UPI_ONLINE',
    bookingValue = 500,
    userAccountAgeDays = 30,
    isNewDevice = false,
  } = req.body;

  const result = AnomalyDetector.evaluateRisk({
    userId,
    userBookingsLast24h,
    userCancelledLast24h,
    paymentMethod,
    bookingValue,
    userAccountAgeDays,
    isNewDevice,
  });

  res.json({ success: true, data: result });
});

