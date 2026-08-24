import { Router } from 'express';
import { db } from '../data/database';
import { COUPONS } from '../data/mockData';
import { Review, Feedback } from '../types';
import { authenticateToken } from '../middleware/authMiddleware';

export const serviceRouter = Router();

// Get Services with category and search filter
serviceRouter.get('/services', (req, res) => {
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

serviceRouter.get('/services/:id', (req, res) => {
  const service = db.services.get(req.params.id);
  if (!service) return res.status(404).json({ success: false, error: 'Service not found' });
  res.json({ success: true, data: service });
});

// Categories
serviceRouter.get('/categories', (req, res) => {
  res.json({ success: true, data: Array.from(db.categories.values()) });
});

// Reviews
serviceRouter.get('/reviews', (req, res) => {
  const { providerId } = req.query;
  let list = Array.from(db.reviews.values());
  if (providerId) list = list.filter((r) => r.providerId === providerId);
  res.json({ success: true, data: list });
});

serviceRouter.post('/reviews', authenticateToken, (req: any, res) => {
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

// Feedback
serviceRouter.get('/feedback', (req, res) => {
  res.json({ success: true, data: Array.from(db.feedback.values()) });
});

serviceRouter.post('/feedback', (req, res) => {
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

// Coupon Validation
serviceRouter.post('/coupons/validate', (req, res) => {
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
