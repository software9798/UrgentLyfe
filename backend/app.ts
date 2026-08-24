import express from 'express';
import dotenv from 'dotenv';
import { authRouter } from './routes/authRoutes';
import { userRouter } from './routes/userRoutes';
import { bookingRouter } from './routes/bookingRoutes';
import { serviceRouter } from './routes/serviceRoutes';
import { providerRouter } from './routes/providerRoutes';
import { adminRouter } from './routes/adminRoutes';
import { referralRouter } from './routes/referralRoutes';
import { aiRouter } from './routes/aiRoutes';
import { analyticsRouter } from './routes/analyticsRoutes';

dotenv.config();

export const app = express();

app.use(express.json({ limit: '20mb' }));

// Mount Modular API Routers
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/providers', providerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/referrals', referralRouter);
app.use('/api', serviceRouter);
app.use('/api', aiRouter);
app.use('/api', analyticsRouter);

// Fallback compatibility for old direct routes
app.use('/api/notifications', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/trigger-1hr-alert') {
    return bookingRouter(req, res, next);
  }
  next();
});
