import { Router } from 'express';
import { db } from '../data/database';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware';

export const providerRouter = Router();

// Update Provider Profile & Skills & Category
providerRouter.put('/profile', authenticateToken, requireRoles('PROVIDER', 'ADMIN'), (req: any, res) => {
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
providerRouter.patch('/availability', authenticateToken, requireRoles('PROVIDER', 'ADMIN'), (req: any, res) => {
  try {
    const userId = req.user.id;
    const { availability } = req.body;

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
providerRouter.get('/bookings', authenticateToken, requireRoles('PROVIDER', 'ADMIN'), (req: any, res) => {
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
