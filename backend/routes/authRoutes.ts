import { Router } from 'express';
import { db } from '../data/database';
import { authenticateToken } from '../middleware/authMiddleware';

export const authRouter = Router();

// Signup (Customer / Service Provider / Admin)
authRouter.post('/signup', (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      role,
      city,
      locality,
      addressLine,
      pincode,
      addressLabel,
      landmark,
      avatar,
      skills,
      experienceYears,
      categoryId,
    } = req.body;

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
      locality,
      addressLine,
      pincode,
      addressLabel,
      landmark,
      skills,
      experienceYears,
      categoryId,
      avatar,
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

// Login via Email or Mobile Number + Password
authRouter.post('/login', (req, res) => {
  try {
    const { email, phone, emailOrPhone, password, role } = req.body;

    if ((!email && !phone && !emailOrPhone) || !password) {
      return res.status(400).json({ success: false, error: 'Email/Mobile Number and password are required.' });
    }

    const result = db.loginUser({ email, phone, emailOrPhone, password, role });

    res.json({
      success: true,
      message: `Welcome back, ${result.user.fullName}!`,
      data: result,
    });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message });
  }
});

// Send OTP to Mobile Number
authRouter.post('/send-otp', (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Mobile number is required.' });
    }

    const result = db.sendOtp(phone);
    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Verify OTP and Log In
authRouter.post('/verify-otp', (req, res) => {
  try {
    const { phone, otp, role, fullName } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, error: 'Mobile number and OTP code are required.' });
    }

    const result = db.verifyOtp({ phone, otp, role, fullName });
    res.json({
      success: true,
      message: result.isNewUser ? `Welcome to UrgentLyfe, ${result.user.fullName}!` : `Welcome back, ${result.user.fullName}!`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Google Sign In
authRouter.post('/google', (req, res) => {
  try {
    const { email, fullName, avatar, role } = req.body;
    if (!email || !fullName) {
      return res.status(400).json({ success: false, error: 'Google email and name are required.' });
    }

    const result = db.loginWithGoogle({ email, fullName, avatar, role });
    res.json({
      success: true,
      message: result.isNewUser ? `Welcome to UrgentLyfe, ${result.user.fullName}!` : `Welcome back, ${result.user.fullName}!`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get Current Logged-in User Profile
authRouter.get('/me', authenticateToken, (req: any, res) => {
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
authRouter.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
});
