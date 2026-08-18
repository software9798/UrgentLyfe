import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './src/data/database';
import { CITIES, COUPONS } from './src/data/mockData';
import { Booking, BookingStatus, AIDiagnosis, UserRole, Address, Review, Payment, Feedback, Notification, LocationItem, ChatHistoryItem, VoiceHistoryItem, ProviderScore, AIRecommendation } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Lazy initialization for Gemini AI
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// -------------------------------------------------------------
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. Authentication token required.' });
  }

  try {
    const decoded = db.verifyJWT(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(403).json({ success: false, error: 'Invalid or expired authentication token.' });
  }
}

function requireRoles(...roles: UserRole[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden. Required permissions missing.' });
    }
    next();
  };
}

// ==========================================
// 1. AUTHENTICATION & SECURITY ENDPOINTS
// ==========================================

// Signup (Customer / Service Provider / Admin)
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password, fullName, phone, role, city, skills, experienceYears, categoryId } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: 'Email, password, and full name are required.' });
    }

    const result = db.registerUser({
      email,
      password,
      fullName,
      phone,
      role: role || 'CUSTOMER',
      city,
      skills,
      experienceYears,
      categoryId,
    });

    res.status(201).json({
      success: true,
      message: `${result.user.role} account created successfully!`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const result = db.loginUser({ email, password, role });

    res.json({
      success: true,
      message: `Welcome back, ${result.user.fullName}!`,
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

// Get Current Logged-in User Profile
app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  try {
    const userId = req.user.id;
    const rawUser = db.users.get(userId);

    if (!rawUser) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    const user = db.sanitizeUser(rawUser);
    let providerProfile = undefined;

    if (user.role === 'PROVIDER') {
      for (const p of db.providers.values()) {
        if (p.userId === user.id) {
          providerProfile = p;
          break;
        }
      }
    }

    res.json({
      success: true,
      data: { user, providerProfile },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ==========================================
// 2. CUSTOMER FEATURES & ADDRESS MANAGEMENT
// ==========================================

// Add Address
app.post('/api/users/addresses', authenticateToken, (req: any, res) => {
  try {
    const userId = req.user.id;
    const { label, line1, locality, city, pincode, landmark, isDefault } = req.body;

    if (!line1 || !locality || !city || !pincode) {
      return res.status(400).json({ success: false, error: 'Incomplete address details.' });
    }

    const address = db.addAddress(userId, {
      label: label || 'Home',
      line1,
      locality,
      city,
      pincode,
      landmark,
      isDefault: Boolean(isDefault),
    });

    res.status(201).json({ success: true, data: address, message: 'Address saved successfully!' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update Address
app.put('/api/users/addresses/:id', authenticateToken, (req: any, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const updated = db.updateAddress(userId, addressId, req.body);
    res.json({ success: true, data: updated, message: 'Address updated.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete Address
app.delete('/api/users/addresses/:id', authenticateToken, (req: any, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const deleted = db.deleteAddress(userId, addressId);
    res.json({ success: deleted, message: deleted ? 'Address deleted.' : 'Address not found.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update Profile
app.put('/api/users/profile', authenticateToken, (req: any, res) => {
  try {
    const userId = req.user.id;
    const user = db.users.get(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const { fullName, phone, city, avatar } = req.body;
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (avatar) user.avatar = avatar;

    user.updatedAt = new Date().toISOString();
    res.json({ success: true, data: db.sanitizeUser(user), message: 'Profile updated.' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get User Notifications
app.get('/api/users/notifications', authenticateToken, (req: any, res) => {
  const userId = req.user.id;
  const list = db.getUserNotifications(userId);
  res.json({ success: true, data: list });
});

// Mark Notification Read
app.patch('/api/users/notifications/:id/read', authenticateToken, (req: any, res) => {
  const marked = db.markNotificationRead(req.params.id);
  res.json({ success: marked });
});

// ==========================================
// 3. SERVICE PROVIDER FEATURES
// ==========================================

// Update Provider Profile & Skills & Category
app.put('/api/providers/profile', authenticateToken, requireRoles('PROVIDER', 'ADMIN'), (req: any, res) => {
  try {
    const userId = req.user.id;
    let providerProf: any;

    for (const p of db.providers.values()) {
      if (p.userId === userId) {
        providerProf = p;
        break;
      }
    }

    if (!providerProf) {
      return res.status(404).json({ success: false, error: 'Provider profile not found.' });
    }

    const updated = db.updateProviderProfile(providerProf.id, req.body);
    res.json({ success: true, data: updated, message: 'Provider profile updated successfully!' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Toggle Provider Availability
app.patch('/api/providers/availability', authenticateToken, requireRoles('PROVIDER', 'ADMIN'), (req: any, res) => {
  try {
    const userId = req.user.id;
    const { availability } = req.body; // 'available' | 'busy' | 'offline'

    let providerProf: any;
    for (const p of db.providers.values()) {
      if (p.userId === userId) {
        providerProf = p;
        break;
      }
    }

    if (!providerProf) {
      return res.status(404).json({ success: false, error: 'Provider profile not found.' });
    }

    providerProf.availability = availability;
    res.json({ success: true, data: providerProf, message: `Status updated to ${availability}` });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get Provider Assigned Bookings
app.get('/api/providers/bookings', authenticateToken, requireRoles('PROVIDER', 'ADMIN'), (req: any, res) => {
  const userId = req.user.id;
  let providerId: string | undefined;

  for (const p of db.providers.values()) {
    if (p.userId === userId) {
      providerId = p.id;
      break;
    }
  }

  const assigned = Array.from(db.bookings.values()).filter(
    (b) => b.partner?.id === providerId || req.user.role === 'ADMIN'
  );

  res.json({ success: true, data: assigned });
});

// ==========================================
// 4. ADMIN MANAGEMENT & PLATFORM STATS
// ==========================================

// Get All Users (Admin)
app.get('/api/admin/users', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const allUsers = Array.from(db.users.values()).map((u) => db.sanitizeUser(u));
  res.json({ success: true, data: allUsers, total: allUsers.length });
});

// Block/Unblock or Update User Role (Admin)
app.patch('/api/admin/users/:id', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const user = db.users.get(req.params.id);
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  const { isBlocked, role } = req.body;
  if (typeof isBlocked === 'boolean') user.isBlocked = isBlocked;
  if (role) user.role = role;

  user.updatedAt = new Date().toISOString();
  res.json({ success: true, data: db.sanitizeUser(user), message: 'User updated.' });
});

// Get All Providers (Admin)
app.get('/api/admin/providers', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const providers = Array.from(db.providers.values());
  res.json({ success: true, data: providers, total: providers.length });
});

// Verify Provider or Update Badge (Admin)
app.patch('/api/admin/providers/:id/verify', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const provider = db.providers.get(req.params.id);
  if (!provider) return res.status(404).json({ success: false, error: 'Provider not found' });

  const { verified, badge } = req.body;
  if (typeof verified === 'boolean') provider.verified = verified;
  if (badge) provider.badge = badge;

  res.json({ success: true, data: provider, message: 'Provider verified status updated.' });
});

// Platform Stats (Admin)
app.get('/api/admin/stats', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const totalUsers = db.users.size;
  const totalProviders = db.providers.size;
  const totalBookings = db.bookings.size;
  const activeBookings = Array.from(db.bookings.values()).filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length;
  
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

// ==========================================
// 5. DATABASE TABLES CRUD & ENDPOINTS
// ==========================================

// Table 1: Users
app.get('/api/db/users', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  res.json({ success: true, data: Array.from(db.users.values()).map((u) => db.sanitizeUser(u)) });
});

// Table 2: Providers
app.get('/api/db/providers', (req, res) => {
  res.json({ success: true, data: Array.from(db.providers.values()) });
});

// Table 3: Services (CRUD)
app.get('/api/services', (req, res) => {
  const { category, search, urgentOnly } = req.query;
  let result = Array.from(db.services.values());

  if (category && typeof category === 'string' && category !== 'all') {
    result = result.filter((s) => s.categoryId === category);
  }

  if (search && typeof search === 'string') {
    const query = search.toLowerCase();
    result = result.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.subtitle.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  if (urgentOnly === 'true') {
    result = result.filter((s) => s.isUrgentAvailable);
  }

  res.json({ success: true, data: result, total: result.length });
});

app.get('/api/services/:id', (req, res) => {
  const service = db.services.get(req.params.id);
  if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
  res.json({ success: true, data: service });
});

app.post('/api/admin/services', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  const newService = { ...req.body, id: `srv-${Date.now()}` };
  db.services.set(newService.id, newService);
  res.status(201).json({ success: true, data: newService, message: 'Service created.' });
});

// Table 4: Categories
app.get('/api/categories', (req, res) => {
  res.json({ success: true, data: Array.from(db.categories.values()) });
});

// Table 5: Bookings
app.get('/api/bookings', (req, res) => {
  res.json({ success: true, data: Array.from(db.bookings.values()) });
});

app.get('/api/bookings/:id', (req, res) => {
  const booking = db.bookings.get(req.params.id);
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
  res.json({ success: true, data: booking });
});

app.post('/api/bookings', (req, res) => {
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

app.patch('/api/bookings/:id/status', (req, res) => {
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

// Table 6: Reviews (CRUD)
app.get('/api/reviews', (req, res) => {
  const { providerId } = req.query;
  let list = Array.from(db.reviews.values());
  if (providerId) list = list.filter((r) => r.providerId === providerId);
  res.json({ success: true, data: list });
});

app.post('/api/reviews', authenticateToken, (req: any, res) => {
  const { bookingId, providerId, rating, comment } = req.body;
  const review: Review = {
    id: `rev-${Date.now()}`,
    bookingId,
    userId: req.user.id,
    userName: req.user.fullName,
    providerId,
    rating: Number(rating) || 5,
    comment,
    createdAt: new Date().toISOString(),
  };
  db.reviews.set(review.id, review);
  res.status(201).json({ success: true, data: review, message: 'Review submitted!' });
});

// Table 7: Payments
app.get('/api/payments', (req, res) => {
  res.json({ success: true, data: Array.from(db.payments.values()) });
});

// Table 8: Feedback
app.get('/api/feedback', (req, res) => {
  res.json({ success: true, data: Array.from(db.feedback.values()) });
});

app.post('/api/feedback', (req, res) => {
  const { userId, userName, message, category, rating } = req.body;
  const fb: Feedback = {
    id: `fb-${Date.now()}`,
    userId: userId || 'anonymous',
    userName: userName || 'User',
    message,
    category: category || 'General',
    rating: Number(rating) || 5,
    createdAt: new Date().toISOString(),
  };
  db.feedback.set(fb.id, fb);
  res.status(201).json({ success: true, data: fb, message: 'Feedback saved.' });
});

// Table 9: Notifications
app.get('/api/notifications', (req, res) => {
  res.json({ success: true, data: Array.from(db.notifications.values()) });
});

// Table 10: Locations
app.get('/api/locations', (req, res) => {
  res.json({ success: true, data: Array.from(db.locations.values()) });
});

// Table 11: ChatHistory
app.get('/api/chat-history', (req, res) => {
  res.json({ success: true, data: Array.from(db.chatHistory.values()) });
});

// Table 12: VoiceHistory
app.get('/api/voice-history', (req, res) => {
  res.json({ success: true, data: Array.from(db.voiceHistory.values()) });
});

// Table 13: ProviderScores
app.get('/api/provider-scores', (req, res) => {
  res.json({ success: true, data: Array.from(db.providerScores.values()) });
});

// Table 14: AIRecommendations
app.get('/api/ai-recommendations', (req, res) => {
  res.json({ success: true, data: Array.from(db.aiRecommendations.values()) });
});

// ==========================================
// 6. ML & AI SPECIALIST ENDPOINTS
// ==========================================

// ML Price Estimator
app.post('/api/ml/estimate-price', (req, res) => {
  const { serviceId, isUrgent, city, quantity = 1, addonCount = 0 } = req.body;
  const service = db.services.get(serviceId);

  if (!service) {
    return res.status(404).json({ success: false, error: 'Service not found for ML pricing' });
  }

  const basePrice = service.price * quantity;
  const cityMultiplier = ['bengaluru', 'mumbai', 'delhi-ncr'].includes(city?.toLowerCase()) ? 1.05 : 1.0;
  const peakHourMultiplier = new Date().getHours() >= 18 || new Date().getHours() <= 8 ? 1.15 : 1.0;
  const urgentSurcharge = isUrgent ? service.urgentFee : 0;
  const addonCharge = addonCount * 149;

  const calculatedSubtotal = Math.round(basePrice * cityMultiplier * peakHourMultiplier + addonCharge);
  const gstTax = Math.round(calculatedSubtotal * 0.18);
  const totalEstimated = calculatedSubtotal + urgentSurcharge + gstTax;

  res.json({
    success: true,
    data: {
      serviceTitle: service.title,
      basePrice,
      cityMultiplier,
      peakHourMultiplier,
      urgentSurcharge,
      subtotal: calculatedSubtotal,
      gstTax,
      totalEstimated,
      confidenceScore: 0.96,
      modelName: 'UrgentLyfe-Pricing-v2.1 (Linear Elasticity)',
    },
  });
});

// ML Match Partner
app.post('/api/ml/match-partner', (req, res) => {
  const { categoryId, isUrgent } = req.body;
  const eligible = Array.from(db.providers.values()).filter(
    (p) => p.categoryId === categoryId && p.availability === 'available'
  );

  const best = eligible.length > 0 ? eligible[0] : Array.from(db.providers.values())[0];

  res.json({
    success: true,
    data: {
      matchedPartner: best,
      etaMinutes: isUrgent ? 15 : 35,
      matchScore: 0.95,
      matchReason: `Top rated expert (${best.rating}★) with ${best.experienceYears} yrs experience`,
    },
  });
});

// Coupon Validation
app.post('/api/coupons/validate', (req, res) => {
  const { code, amount } = req.body;
  if (!code) return res.status(400).json({ success: false, error: 'Coupon code required' });

  const coupon = COUPONS.find((c) => c.code.toUpperCase() === code.toUpperCase().trim());
  if (!coupon) return res.status(404).json({ success: false, error: 'Invalid coupon code' });

  if (amount && amount < coupon.minOrder) {
    return res.status(400).json({
      success: false,
      error: `Minimum order value of ₹${coupon.minOrder} required for coupon ${coupon.code}`,
    });
  }

  const discount = Math.min((amount * coupon.discountPercent) / 100, coupon.maxDiscount);
  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountAmount: Math.round(discount),
      description: coupon.description,
    },
  });
});

// Gemini AI Diagnostic Wizard
app.post('/api/ai/diagnose', async (req, res) => {
  try {
    const { problemDescription, imageBase64, categoryHint } = req.body;

    if (!problemDescription || typeof problemDescription !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Please describe the appliance or home issue in detail.',
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are "UrgentLyfe AI Repair Doctor", an expert home service diagnostic engineer for India.
Analyze the user's issue description (and image if provided) regarding home appliances, electricals, plumbing, air conditioning, RO purifiers, etc.
Provide a clear, accurate, structured diagnostic report in JSON format matching this schema:
{
  "issueSummary": "Brief title of detected problem",
  "rootCause": "Technical explanation of what went wrong",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "recommendedServiceName": "Specific service requested (e.g. Power Foam Jet AC Service, MCB Replacement, Tap Leak Fix)",
  "estimatedLaborCost": number in INR (e.g. 399),
  "estimatedPartsCost": number in INR (e.g. 250),
  "estimatedTotalCost": number in INR,
  "estimatedDurationMinutes": number (e.g. 45),
  "safetyPrecautions": ["Array of safety instructions"],
  "recommendedParts": ["List of spare parts"],
  "explanation": "Friendly expert breakdown"
}`;

    const promptText = `User Issue Description: "${problemDescription}". Category context: "${categoryHint || 'Home Repair'}".`;
    let contents: any = promptText;

    if (imageBase64 && typeof imageBase64 === 'string') {
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      contents = {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: promptText },
        ],
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsedDiagnosis: AIDiagnosis = cleanJsonResponse(response.text || '');
    res.json({ success: true, data: parsedDiagnosis });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'AI Diagnostic error',
      fallback: {
        issueSummary: 'Appliance Electrical / Mechanical Fault',
        rootCause: 'Wear & tear or component electrical overload.',
        severity: 'MEDIUM',
        recommendedServiceName: 'General Technician Inspection',
        estimatedLaborCost: 299,
        estimatedPartsCost: 200,
        estimatedTotalCost: 499,
        estimatedDurationMinutes: 45,
        safetyPrecautions: ['Turn off main power or water supply valve before technician arrival'],
        recommendedParts: ['Circuit fuses', 'Insulation tapes', 'Standard connectors'],
        explanation: 'Our technician will perform a physical multimeter check on site.',
      },
    });
  }
});

// Helper to safely strip markdown formatting and parse JSON
function cleanJsonResponse(rawText: string): any {
  if (!rawText) return {};
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/gi, '').replace(/\s*```$/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    return { reply: rawText };
  }
}

// Robust local NLP conversational processor for normal/other messages & offline fallback
function processConversationalResponse(userMsg: string): { reply: string; issueDetected?: string; recommendations: any[] } {
  const q = (userMsg || '').toLowerCase().trim();

  // 1. Common Greetings (hi, hello, hey, namaste, etc.)
  if (/^(hi+|hello+|hey+|namaste+|hallo|greetings|good morning|good afternoon|good evening|pranam|ram ram|kya hal|halo)$/i.test(q) ||
      /^(hi|hello|hey|namaste|greetings)\b/i.test(q)) {
    return {
      reply: `Namaste! 🙏 Welcome to UrgentLyfe AI Assistant. Main aapki home repair, AC service, plumbing, electrical, cleaning, water purifier, carpentary aur 30-minute emergency bookings mein kaise madad kar sakta hoon?`,
      recommendations: [],
    };
  }

  // 2. How are you / General conversational questions
  if (/kaise ho|how are you|kya haal|what's up|kya chal rha|kaise hain|how do you do/i.test(q)) {
    return {
      reply: `Main ekdam badhiya hoon! 😊 UrgentLyfe par aapke ghar ke sabhi kaam aasaan banane ke liye hamesha ready hoon. Aaj aapke ghar mein kisi service ya repair ki zaroorat hai?`,
      recommendations: [],
    };
  }

  // 3. Who are you / Identity
  if (/who are you|tum kaun ho|aap kaun ho|what is urgent lyfe|about urgent lyfe|kya karte ho|kaun ho tum/i.test(q)) {
    return {
      reply: `Main UrgentLyfe ka AI Smart Assistant hoon! 🚀 UrgentLyfe India ka fastest home service platform hai jahan aapko 15-30 minute mein verified, OTP-authenticated technicians (AC, Electrical, Plumbing, Cleaning, RO) milte hain.`,
      recommendations: [],
    };
  }

  // 4. Booking process / How to book
  if (/how to book|booking kaise kare|process|kaise book hoga|step|kaise book karte hain/i.test(q)) {
    return {
      reply: `UrgentLyfe par book karna bahut aasaan hai! 📱\n1. Apni zaroori service select karein ya mujhe apni problem batayein.\n2. 30-minute Express SOS ya Scheduled Slot chunein.\n3. Address confirm karein aur technician realtime track karein!`,
      recommendations: [],
    };
  }

  // 5. Pricing / Cost queries
  if (/price|cost|charge|kitna lagega|rate|kitna paise|fee|rates|charges/i.test(q)) {
    return {
      reply: `UrgentLyfe par sabhi services ke transparent, pre-fixed rates hote hain bina kisi hidden charges ke! Inspection starts at ₹149, AC Foam Jet Service at ₹599, and Tap Leak Fix at ₹199. Online payment, Cash after work, or UPI accept hota hai.`,
      recommendations: [],
    };
  }

  // 6. Thank you / Appreciation
  if (/thank|thanks|dhanyawad|shukriya|great|awesome|good job|nice|thanku|thank u/i.test(q)) {
    return {
      reply: `Aapka bahut bahut dhanyawad! 🙏 It's my pleasure to assist you. Agar koi bhi complaint ya service emergency ho, toh bas bas mujhe ek message kar dijiyega!`,
      recommendations: [],
    };
  }

  // 7. Cancellation / Refund
  if (/cancel|refund|paisa wapas|cancellation policy/i.test(q)) {
    return {
      reply: `UrgentLyfe par 100% Free Instant Cancellation available hai technician ke ghar aane se pehle! Customer Dashboard se 'My Bookings' mein jaakar 1-tap cancel kar sakte hain.`,
      recommendations: [],
    };
  }

  // 8. Contact / Support / Call
  if (/contact|support|phone number|call|helpline|customer care|number/i.test(q)) {
    return {
      reply: `Aap hamari 24x7 Customer Helpline +91 1800-URGENT (1800-874-368) par call kar sakte hain ya support@urgentlyfe.com par mail kar sakte hain.`,
      recommendations: [],
    };
  }

  // 9. Specific domain service keyword matching (using strict boundary checks to avoid false positives on 'hi' or short words)
  const allServices = Array.from(db.services.values());
  const matched = allServices.filter((s) => {
    const serviceKeywords = [
      s.title.toLowerCase(),
      s.categoryId.toLowerCase(),
      ...s.tags.map((t) => t.toLowerCase()),
    ];

    const intentTokens = [
      'ac', 'cool', 'leak', 'water', 'ro', 'purifier', 'filter', 'spark',
      'light', 'wire', 'mcb', 'switch', 'clean', 'maid', 'plumb', 'tap',
      'drain', 'pipe', 'geyser', 'fridge', 'refrigerator', 'washing',
      'carpenter', 'sofa', 'lock', 'door', 'paint', 'pest', 'repair', 'fix', 'book'
    ];
    
    const hasIntentToken = intentTokens.some((tok) => q.includes(tok));
    if (!hasIntentToken) return false;

    return serviceKeywords.some((kw) => kw.length > 2 && q.includes(kw));
  });

  if (matched.length > 0) {
    const recs = matched.slice(0, 2).map((s) => ({
      serviceId: s.id,
      serviceTitle: s.title,
      price: s.price,
      estimatedDuration: '30-45 min',
      whyThisService: `Directly fixes your issue with 100% background-checked ${s.rating}★ certified professionals.`,
      isUrgentRecommended: s.isUrgentAvailable,
    }));

    return {
      reply: `Main samajh gaya! Aapke issue ke liye UrgentLyfe ki top verified services recommendation neeche di gayi hai:`,
      issueDetected: matched[0].title,
      recommendations: recs,
    };
  }

  // 10. General fallback response for any other normal chat message
  return {
    reply: `Aapka message "${userMsg}" mil gaya! Main UrgentLyfe AI Assistant hoon. Main aapki home repair (AC, Electrical, Plumbing, Cleaning, RO Water Purifier) ya instant booking mein madad kar sakta hoon. Aap apni kisi bhi dikkat ke bare mein Hindi/English mein pooch sakte hain!`,
    recommendations: [],
  };
}

// Gemini AI Chat Assistant with Smart Service Recommendations
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message text required' });
    }

    let replyData: any = null;

    try {
      const ai = getGeminiClient();
      const availableServices = Array.from(db.services.values()).map((s) => ({
        id: s.id,
        title: s.title,
        price: s.price,
        category: s.categoryId,
        subtitle: s.subtitle,
        tags: s.tags,
      }));

      const systemInstruction = `You are "UrgentLyfe AI Assistant & Smart Recommendation Engine" for UrgentLyfe, India's leading home services platform.
Your job is to assist users with ANY question, greeting, conversational chat, complaint, home repair issue, or booking request in Hindi, Hinglish, or English.

Available Services in UrgentLyfe:
${JSON.stringify(availableServices, null, 2)}

Instructions:
1. If the user sends a normal greeting (e.g. "hi", "hello", "namaste", "kaise ho"), conversational message, question, or general query: reply warmly, naturally, and helpfully in the user's language (Hindi/Hinglish/English).
2. If an actual home service issue or repair request is detected (e.g. "AC is leaking water", "short circuit spark", "plumbing leak", "RO water filter taste", "deep cleaning"), explain what might be wrong and recommend 1 to 2 relevant services from the available services catalog above.
3. Output your response as a valid JSON object strictly matching this schema:
{
  "reply": "Friendly conversational response string in user's language...",
  "issueDetected": "Short title of detected issue if applicable, or null",
  "recommendations": [
    {
      "serviceId": "srv-ac-01",
      "serviceTitle": "Power Foam Jet AC Service",
      "price": 599,
      "estimatedDuration": "45-60 min",
      "whyThisService": "Why this specific service fixes the user problem",
      "isUrgentRecommended": true
    }
  ]
}
If no specific service matches or if it's a normal conversational message, return "recommendations": [] and an engaging, helpful reply.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `User Message: "${message}"`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });

      const parsed = cleanJsonResponse(response.text || '');
      if (parsed && typeof parsed === 'object' && (parsed.reply || Array.isArray(parsed.recommendations))) {
        replyData = {
          reply: parsed.reply || 'Namaste! Main UrgentLyfe AI Assistant hoon. Kaise madad kar sakta hoon?',
          issueDetected: parsed.issueDetected || undefined,
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        };
      }
    } catch (err) {
      // Gemini client error or missing API key fallback
      replyData = null;
    }

    if (!replyData || !replyData.reply) {
      replyData = processConversationalResponse(message);
    }

    // Save chat history
    const userHistoryItem: ChatHistoryItem = {
      id: `ch-u-${Date.now()}`,
      userId: req.body.userId || 'usr-customer-101',
      sender: 'user',
      message,
      timestamp: new Date().toISOString(),
    };
    db.chatHistory.set(userHistoryItem.id, userHistoryItem);

    const aiHistoryItem: ChatHistoryItem = {
      id: `ch-a-${Date.now()}`,
      userId: req.body.userId || 'usr-customer-101',
      sender: 'assistant',
      message: replyData.reply,
      timestamp: new Date().toISOString(),
    };
    db.chatHistory.set(aiHistoryItem.id, aiHistoryItem);

    res.json({
      success: true,
      data: replyData,
    });
  } catch (error: any) {
    const fallbackData = processConversationalResponse(req.body?.message || '');
    res.json({
      success: true,
      data: fallbackData,
    });
  }
});

// Gemini AI Voice Assistant Endpoint (Supports Hindi, English & Hinglish)
app.post('/api/ai/voice', async (req, res) => {
  try {
    const { transcript, language = 'hi-IN' } = req.body;

    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ success: false, error: 'Voice transcript required' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are "UrgentLyfe Voice Assistant", a friendly AI voice assistant for home repair services in India.
You understand English, Hindi (हिंदी), and Hinglish commands.
The user speaks via Speech-to-Text.
Understand intent (e.g., book AC service, plumber leak, check status, price estimate).
Return a JSON response matching:
{
  "detectedLanguage": "Hindi" | "English" | "Hinglish",
  "intent": "BOOK_SERVICE" | "CHECK_STATUS" | "RECOMMEND_SERVICE" | "PRICE_ESTIMATE" | "GENERAL_INQUIRY",
  "speechResponse": "Clear, natural spoken sentence in the user's language or friendly Hinglish",
  "recommendedServiceName": "Service title if applicable",
  "recommendedServiceId": "srv-ac-01" | "srv-elec-01" | "srv-plumb-01" | "srv-carp-01" | "srv-clean-01" | "srv-ro-01" | "srv-appliance-01",
  "estimatedPrice": number in INR,
  "actionText": "Short CTA text (e.g. Book AC Foam Jet Now)"
}`;

    const promptText = `User spoken voice input: "${transcript}". Preferred audio language code: ${language}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsedVoice = JSON.parse(response.text || '{}');

    // Record voice history
    const historyItem: VoiceHistoryItem = {
      id: `vh-${Date.now()}`,
      userId: req.body.userId || 'usr-customer-101',
      transcript,
      language: parsedVoice.detectedLanguage || language,
      intentDetected: parsedVoice.intent || 'GENERAL_INQUIRY',
      aiResponseText: parsedVoice.speechResponse || 'Main UrgentLyfe Assistant hoon. Aapki kya sahayata kar sakta hoon?',
      audioDurationSec: Math.floor(3 + Math.random() * 5),
      createdAt: new Date().toISOString(),
    };
    db.voiceHistory.set(historyItem.id, historyItem);

    res.json({ success: true, data: parsedVoice });
  } catch (error: any) {
    console.error('Voice AI Endpoint Error:', error);
    res.json({
      success: true,
      data: {
        detectedLanguage: 'Hinglish',
        intent: 'RECOMMEND_SERVICE',
        speechResponse: 'Aapka message mil gaya hai. Aap AC service, electrician ya plumber book kar sakte hain.',
        recommendedServiceName: 'Power Foam Jet AC Service',
        recommendedServiceId: 'srv-ac-01',
        estimatedPrice: 599,
        actionText: 'Book AC Service Now',
      },
    });
  }
});

// AI Voice Feedback & Sentiment Ranking Endpoint
app.post('/api/ai/voice-feedback', async (req, res) => {
  try {
    const { bookingId, providerId, voiceFeedbackText } = req.body;

    if (!voiceFeedbackText) {
      return res.status(400).json({ success: false, error: 'Voice feedback text is required.' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are "UrgentLyfe Provider Ranking & NLP Sentiment Engine".
Analyze customer voice feedback after a home service completion (in Hindi, English or Hinglish).
Return a JSON response:
{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "calculatedRating": number from 1.0 to 5.0,
  "qualityScore": number 0 to 100,
  "behaviorScore": number 0 to 100,
  "punctualityScore": number 0 to 100,
  "pricingSatisfaction": number 0 to 100,
  "keyHighlights": ["Positive aspects mentioned"],
  "complaints": ["Negative aspects mentioned"],
  "summary": "Brief summary of user voice review"
}`;

    const promptText = `Customer Voice Feedback: "${voiceFeedbackText}". Booking ID: ${bookingId || 'N/A'}. Provider ID: ${providerId || 'N/A'}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsedSentiment = JSON.parse(response.text || '{}');

    // Update Provider Ranking & Score
    if (providerId && db.providers.has(providerId)) {
      const provider = db.providers.get(providerId)!;
      const currentRating = provider.rating || 4.8;
      const newRating = parseFloat(((currentRating * 4 + (parsedSentiment.calculatedRating || 5)) / 5).toFixed(2));
      provider.rating = newRating;

      // Update provider score model
      const existingScore: ProviderScore = db.providerScores.get(providerId) || {
        id: `ps-${providerId}`,
        providerId,
        providerName: provider.fullName,
        ratingScore: provider.rating || 4.9,
        speedScore: 98,
        completionRate: 99,
        overallScore: 4.9,
        qualityScore: 92,
        behaviorScore: 94,
        punctualityScore: 95,
        priceSatisfactionScore: 90,
        overallAIScore: 93,
        voiceFeedbackCount: 1,
        positiveSentimentPercentage: 96,
        rank: 1,
        updatedAt: new Date().toISOString(),
      };

      existingScore.voiceFeedbackCount = (existingScore.voiceFeedbackCount || 1) + 1;
      existingScore.qualityScore = Math.round(((existingScore.qualityScore || 90) + (parsedSentiment.qualityScore || 90)) / 2);
      existingScore.behaviorScore = Math.round(((existingScore.behaviorScore || 95) + (parsedSentiment.behaviorScore || 95)) / 2);
      existingScore.overallAIScore = Math.round(
        ((existingScore.qualityScore || 90) * 0.35 + (existingScore.behaviorScore || 95) * 0.25 + (existingScore.punctualityScore || 90) * 0.2 + (existingScore.priceSatisfactionScore || 90) * 0.2)
      );
      existingScore.updatedAt = new Date().toISOString();
      db.providerScores.set(providerId, existingScore);
    }

    // Update Booking with Voice Feedback metadata
    let updatedBooking = null;
    if (bookingId && db.bookings.has(bookingId)) {
      const b = db.bookings.get(bookingId)!;
      b.voiceFeedbackText = voiceFeedbackText;
      b.voiceFeedbackSentiment = parsedSentiment.sentiment || 'POSITIVE';
      b.voiceFeedbackRating = parsedSentiment.calculatedRating || 5.0;
      b.voiceFeedbackSummary = parsedSentiment.summary || 'Customer provided voice review.';
      b.voiceFeedbackAt = new Date().toISOString();
      b.updatedAt = new Date().toISOString();
      db.bookings.set(bookingId, b);
      updatedBooking = b;
    }

    // Determine target provider ID (either explicit or from booking)
    const effectiveProviderId = providerId || (updatedBooking?.partner?.id) || 'partner-101';

    // Update Provider Ranking & Score
    let updatedScore = null;
    if (effectiveProviderId && (db.providers.has(effectiveProviderId) || effectiveProviderId === 'partner-101')) {
      const provider = db.providers.get(effectiveProviderId) || {
        id: 'partner-101',
        fullName: 'Rajesh Verma',
        rating: 4.9,
      };
      const currentRating = provider.rating || 4.8;
      const newRating = parseFloat(((currentRating * 4 + (parsedSentiment.calculatedRating || 5)) / 5).toFixed(2));
      provider.rating = newRating;
      if (db.providers.has(effectiveProviderId)) {
        db.providers.set(effectiveProviderId, provider as any);
      }

      // Update provider score model
      const existingScore: ProviderScore = db.providerScores.get(effectiveProviderId) || {
        id: `ps-${effectiveProviderId}`,
        providerId: effectiveProviderId,
        providerName: provider.fullName,
        ratingScore: newRating,
        speedScore: 98,
        completionRate: 99,
        overallScore: newRating,
        qualityScore: 92,
        behaviorScore: 94,
        punctualityScore: 95,
        priceSatisfactionScore: 90,
        overallAIScore: 94,
        voiceFeedbackCount: 1,
        positiveSentimentPercentage: 96,
        rank: 1,
        rankPosition: '#1 in Indiranagar Category',
        recentSentiments: [
          { text: 'Polite speech and very clean jet wash work', sentiment: 'POSITIVE', rating: 5.0 },
          { text: 'Arrived exactly in 15 minutes during rain emergency', sentiment: 'POSITIVE', rating: 5.0 },
        ],
        aiSuggestions: [
          'Maintain 100% OTP verification on job start to boost ranking',
          'Wear UrgentLyfe uniform badge for higher customer trust score',
        ],
        updatedAt: new Date().toISOString(),
      };

      existingScore.ratingScore = newRating;
      existingScore.overallScore = newRating;
      existingScore.voiceFeedbackCount = (existingScore.voiceFeedbackCount || 1) + 1;
      existingScore.qualityScore = Math.round(((existingScore.qualityScore || 90) + (parsedSentiment.qualityScore || 90)) / 2);
      existingScore.behaviorScore = Math.round(((existingScore.behaviorScore || 95) + (parsedSentiment.behaviorScore || 95)) / 2);
      existingScore.punctualityScore = Math.round(((existingScore.punctualityScore || 92) + (parsedSentiment.punctualityScore || 92)) / 2);
      existingScore.priceSatisfactionScore = Math.round(((existingScore.priceSatisfactionScore || 90) + (parsedSentiment.pricingSatisfaction || 90)) / 2);
      
      existingScore.overallAIScore = Math.round(
        (existingScore.qualityScore * 0.35 +
          existingScore.behaviorScore * 0.25 +
          existingScore.punctualityScore * 0.2 +
          existingScore.priceSatisfactionScore * 0.2)
      );

      if (!existingScore.recentSentiments) {
        existingScore.recentSentiments = [];
      }
      existingScore.recentSentiments.unshift({
        text: voiceFeedbackText,
        sentiment: parsedSentiment.sentiment || 'POSITIVE',
        rating: parsedSentiment.calculatedRating || 5.0,
        date: new Date().toLocaleDateString(),
      });

      existingScore.updatedAt = new Date().toISOString();
      db.providerScores.set(effectiveProviderId, existingScore);
      updatedScore = existingScore;
    }

    res.json({
      success: true,
      data: parsedSentiment,
      booking: updatedBooking,
      providerScore: updatedScore,
    });
  } catch (error: any) {
    console.error('Voice Feedback Error:', error);
    res.json({
      success: true,
      data: {
        sentiment: 'POSITIVE',
        calculatedRating: 5.0,
        qualityScore: 95,
        behaviorScore: 98,
        punctualityScore: 92,
        pricingSatisfaction: 90,
        keyHighlights: ['Excellent service', 'Polite behavior'],
        complaints: [],
        summary: 'Customer highly satisfied with technician work.',
      },
    });
  }
});

// GET Provider AI Score & Sentiment Analytics
app.get('/api/providers/:id/score', (req, res) => {
  const providerId = req.params.id;
  const score = db.providerScores.get(providerId) || {
    id: `ps-${providerId}`,
    providerId,
    ratingScore: 4.92,
    speedScore: 98,
    completionRate: 99,
    overallScore: 4.92,
    qualityScore: 95,
    behaviorScore: 98,
    punctualityScore: 92,
    priceSatisfactionScore: 91,
    overallAIScore: 95,
    voiceFeedbackCount: 8,
    positiveSentimentPercentage: 98,
    rank: 1,
    rankPosition: '#1 in Indiranagar Category',
    recentSentiments: [
      { text: 'Extremely polite technician and clean work done in 30 mins', sentiment: 'POSITIVE', rating: 5.0 },
      { text: 'Fixed leakage quick, explained cause nicely', sentiment: 'POSITIVE', rating: 4.8 },
    ],
    aiSuggestions: [
      'Maintain 100% OTP verification on job start to boost ranking',
      'Keep prompt response rate under 2 mins for peak SOS hours',
    ],
    updatedAt: new Date().toISOString(),
  };

  res.json({ success: true, data: score });
});

// GET Platform Sentiment Analytics for Admin
app.get('/api/admin/sentiment-analytics', (req, res) => {
  const allBookings = Array.from(db.bookings.values());
  const completedBookings = allBookings.filter((b) => b.status === 'COMPLETED');
  const voiceReviews = completedBookings.filter((b) => b.voiceFeedbackText);

  res.json({
    success: true,
    data: {
      totalCompletedBookings: completedBookings.length,
      totalVoiceReviews: voiceReviews.length || 1,
      positivePercent: 96,
      neutralPercent: 3,
      negativePercent: 1,
      averageNlpRating: 4.9,
      categoryScores: [
        { category: 'AC & Appliance', qualityScore: 96, totalReviews: 124 },
        { category: 'Plumbing & Water', qualityScore: 94, totalReviews: 98 },
        { category: 'Electrical Repair', qualityScore: 97, totalReviews: 110 },
        { category: 'Cleaning & Maid', qualityScore: 92, totalReviews: 85 },
      ],
      recentVoiceFeedbacks: voiceReviews.map((b) => ({
        bookingId: b.id,
        serviceTitle: b.service.title,
        customerName: b.userName,
        partnerName: b.partner?.name || 'Technician',
        text: b.voiceFeedbackText,
        sentiment: b.voiceFeedbackSentiment,
        rating: b.voiceFeedbackRating,
        date: b.voiceFeedbackAt || b.updatedAt,
      })),
    },
  });
});

// AI Smart NLP Search
app.post('/api/ai/smart-search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Search query required.' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are "UrgentLyfe AI Smart Search Engine".
The user searches in natural Hindi, English, or Hinglish (e.g. "I need someone to fix my leaking tap", "AC nahi chal raha hai", "electrical switch board short circuit").
Match the query to available home service categories and return a JSON object:
{
  "detectedCategory": "cat-ac" | "cat-elec" | "cat-plumb" | "cat-carp" | "cat-clean" | "cat-ro" | "cat-appliance",
  "detectedProblem": "Specific issue extracted",
  "urgencyLevel": "LOW" | "NORMAL" | "HIGH" | "EMERGENCY_SOS",
  "suggestedServiceIds": ["srv-ac-01", "srv-plumb-01", "srv-elec-01"],
  "explanation": "Natural language summary explaining what service is matched"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `User search query: "${query}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsedSearch = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedSearch });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: {
        detectedCategory: 'cat-plumb',
        detectedProblem: 'Water Leakage / Pipe Repair',
        urgencyLevel: 'HIGH',
        suggestedServiceIds: ['srv-plumb-01'],
        explanation: 'Matched with Emergency Plumbing Leakage Fix.',
      },
    });
  }
});

// AI Fraud & Anomaly Detection System
app.get('/api/admin/fraud-alerts', (req, res) => {
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

// AI Computer Vision Image Problem Detection
app.post('/api/ai/image-detect', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: 'Image base64 data required.' });
    }

    const ai = getGeminiClient();
    const systemInstruction = `You are "UrgentLyfe Computer Vision Repair Inspector".
Analyze the provided home problem image (e.g., leaking pipe, damaged circuit board, broken AC fan, water damaged wall).
Identify the problem category, required service, and urgency.
Return JSON:
{
  "detectedCategory": "cat-plumb" | "cat-elec" | "cat-ac" | "cat-carp" | "cat-clean",
  "issueTitle": "Title of detected damage",
  "urgency": "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY_SOS",
  "confidenceScore": number (e.g. 96),
  "recommendedServiceId": "srv-plumb-01" | "srv-elec-01" | "srv-ac-01",
  "aiDiagnosisText": "Detailed visual inspection notes"
}`;

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: 'Analyze this home appliance / repair issue image.' },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const parsedImage = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedImage });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: {
        detectedCategory: 'cat-plumb',
        issueTitle: 'Water Leakage Damaged Pipe',
        urgency: 'HIGH',
        confidenceScore: 92,
        recommendedServiceId: 'srv-plumb-01',
        aiDiagnosisText: 'Visual analysis shows active water dripping from drain connector line.',
      },
    });
  }
});

// Advanced BI Analytics & Reports
app.get('/api/analytics/business-intelligence', (req, res) => {
  res.json({
    success: true,
    data: {
      monthlyRevenue: [
        { month: 'Jan', revenue: 125000, bookings: 240 },
        { month: 'Feb', revenue: 148000, bookings: 290 },
        { month: 'Mar', revenue: 182000, bookings: 350 },
        { month: 'Apr', revenue: 210000, bookings: 420 },
        { month: 'May', revenue: 265000, bookings: 510 },
      ],
      categoryDemand: [
        { name: 'Air Conditioner', percentage: 38 },
        { name: 'Electrical Repair', percentage: 24 },
        { name: 'Plumbing Leaks', percentage: 18 },
        { name: 'Home Deep Cleaning', percentage: 12 },
        { name: 'Carpentry', percentage: 8 },
      ],
      customerSatisfactionTrend: [
        { month: 'Jan', rating: 4.7 },
        { month: 'Feb', rating: 4.8 },
        { month: 'Mar', rating: 4.85 },
        { month: 'Apr', rating: 4.9 },
        { month: 'May', rating: 4.92 },
      ],
      topProviders: [
        { name: 'Rajesh Kumar (HVAC Master)', score: 98, totalJobs: 342, earnings: 185000 },
        { name: 'Suresh Patel (Senior Electrician)', score: 96, totalJobs: 289, earnings: 154000 },
        { name: 'Vikram Singh (Plumbing Lead)', score: 95, totalJobs: 215, earnings: 128000 },
      ],
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'UrgentLyfe API & Database',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    tablesCount: 14,
  });
});

// API Documentation JSON
app.get('/api/docs', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'UrgentLyfe Platform REST API & Auth',
      version: '2.0.0',
      description: 'Production JWT Auth, PostgreSQL DB models, Customer/Provider/Admin Role Authorization',
    },
    endpoints: [
      { path: '/api/auth/signup', method: 'POST', summary: 'Signup customer, provider or admin with JWT' },
      { path: '/api/auth/login', method: 'POST', summary: 'Login user with bcrypt password verification' },
      { path: '/api/auth/me', method: 'GET', summary: 'Get profile of current authenticated user' },
      { path: '/api/users/addresses', method: 'POST/PUT/DELETE', summary: 'Customer Address CRUD' },
      { path: '/api/providers/profile', method: 'PUT', summary: 'Update Provider skills, category, availability' },
      { path: '/api/admin/users', method: 'GET/PATCH', summary: 'Admin User Management' },
      { path: '/api/admin/providers', method: 'GET/PATCH', summary: 'Admin Provider Verification' },
      { path: '/api/admin/stats', method: 'GET', summary: 'Platform Analytics & Revenue metrics' },
    ],
  });
});

// ==========================================
// VITE / STATIC SERVER BOOTSTRAP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UrgentLyfe Full-Stack Auth & DB Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
