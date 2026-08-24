import { Router } from 'express';
import { db } from '../data/database';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware';

export const analyticsRouter = Router();

// Advanced BI Analytics & Reports
analyticsRouter.get('/analytics/business-intelligence', (req, res) => {
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
analyticsRouter.get('/health', (req, res) => {
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
analyticsRouter.get('/docs', (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'UrgentLyfe Platform REST API & Auth',
      version: '2.0.0',
      description: 'Production JWT Auth, In-Memory DB models, Customer/Provider/Admin Role Authorization',
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

// Database raw inspection endpoints
analyticsRouter.get('/db/users', authenticateToken, requireRoles('ADMIN'), (req, res) => {
  res.json({ success: true, data: Array.from(db.users.values()).map((u) => db.sanitizeUser(u)) });
});

analyticsRouter.get('/db/providers', (req, res) => {
  res.json({ success: true, data: Array.from(db.providers.values()) });
});

analyticsRouter.get('/payments', (req, res) => {
  res.json({ success: true, data: Array.from(db.payments.values()) });
});

analyticsRouter.get('/notifications', (req, res) => {
  res.json({ success: true, data: Array.from(db.notifications.values()) });
});

analyticsRouter.get('/locations', (req, res) => {
  res.json({ success: true, data: Array.from(db.locations.values()) });
});

analyticsRouter.get('/chat-history', (req, res) => {
  res.json({ success: true, data: Array.from(db.chatHistory.values()) });
});

analyticsRouter.get('/voice-history', (req, res) => {
  res.json({ success: true, data: Array.from(db.voiceHistory.values()) });
});

analyticsRouter.get('/provider-scores', (req, res) => {
  res.json({ success: true, data: Array.from(db.providerScores.values()) });
});

analyticsRouter.get('/ai-recommendations', (req, res) => {
  res.json({ success: true, data: Array.from(db.aiRecommendations.values()) });
});
