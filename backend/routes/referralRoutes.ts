import { Router } from 'express';
import { db } from '../data/database';

export const referralRouter = Router();

// Get Referral Stats & User Referrals
referralRouter.get('/stats', (req: any, res) => {
  try {
    let userId = 'usr-customer-101';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = db.verifyJWT(authHeader.split(' ')[1]);
        if (decoded?.id) userId = decoded.id;
      } catch {
        // Fallback to default customer
      }
    }

    const stats = db.getReferralStats(userId);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send Referral Invite
referralRouter.post('/invite', (req: any, res) => {
  try {
    let userId = 'usr-customer-101';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = db.verifyJWT(authHeader.split(' ')[1]);
        if (decoded?.id) userId = decoded.id;
      } catch {
        // Fallback
      }
    }

    const { friendName, friendPhone, friendEmail } = req.body;
    if (!friendName || !friendPhone) {
      return res.status(400).json({ success: false, error: "Friend's name and mobile number are required." });
    }

    const record = db.sendReferralInvite(userId, { friendName, friendPhone, friendEmail });
    res.status(201).json({
      success: true,
      data: record,
      message: `Invitation successfully sent to ${friendName}! ₹250 wallet credit will unlock on their first completed job.`,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Simulate / Trigger Referral Service Completion
referralRouter.post('/simulate-complete', (req: any, res) => {
  try {
    let userId = 'usr-customer-101';
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = db.verifyJWT(authHeader.split(' ')[1]);
        if (decoded?.id) userId = decoded.id;
      } catch {
        // Fallback
      }
    }

    const { referralId } = req.body;
    if (!referralId) {
      return res.status(400).json({ success: false, error: 'referralId is required.' });
    }

    const updatedStats = db.simulateCompleteReferral(userId, referralId);
    res.json({
      success: true,
      data: updatedStats,
      message: '🎉 Referral service marked completed! ₹250 wallet credit successfully deposited.',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});
