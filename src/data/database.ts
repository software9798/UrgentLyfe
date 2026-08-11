import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  User,
  ProviderProfile,
  Category,
  ServiceItem,
  Booking,
  Review,
  Payment,
  Feedback,
  Notification,
  LocationItem,
  ChatHistoryItem,
  VoiceHistoryItem,
  ProviderScore,
  AIRecommendation,
  Address,
  UserRole,
} from '../types';
import { CITIES, CATEGORIES, SERVICES, PARTNERS, MOCK_BOOKINGS } from './mockData';

const JWT_SECRET = process.env.JWT_SECRET || 'urgentlyfe-secret-key-2026';

// -------------------------------------------------------------
// IN-MEMORY PERSISTENT DATABASE ENGINE FOR URGENTLYFE
// -------------------------------------------------------------

export class UrgentLyfeDatabase {
  public users: Map<string, User & { passwordHash: string }> = new Map();
  public providers: Map<string, ProviderProfile> = new Map();
  public categories: Map<string, Category> = new Map();
  public services: Map<string, ServiceItem> = new Map();
  public bookings: Map<string, Booking> = new Map();
  public reviews: Map<string, Review> = new Map();
  public payments: Map<string, Payment> = new Map();
  public feedback: Map<string, Feedback> = new Map();
  public notifications: Map<string, Notification> = new Map();
  public locations: Map<string, LocationItem> = new Map();
  public chatHistory: Map<string, ChatHistoryItem> = new Map();
  public voiceHistory: Map<string, VoiceHistoryItem> = new Map();
  public providerScores: Map<string, ProviderScore> = new Map();
  public aiRecommendations: Map<string, AIRecommendation> = new Map();

  constructor() {
    this.seedDatabase();
  }

  private seedDatabase() {
    // 1. Seed Categories
    CATEGORIES.forEach((cat) => this.categories.set(cat.id, cat));

    // 2. Seed Services
    SERVICES.forEach((srv) => this.services.set(srv.id, srv));

    // 3. Seed Default Users (Customer, Provider, Admin)
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('password123', salt);

    // Default Customer
    const customerUser: User & { passwordHash: string } = {
      id: 'usr-customer-101',
      email: 'customer@urgentlyfe.com',
      passwordHash: demoPasswordHash,
      fullName: 'Aarav Mehta',
      phone: '+91 98765 12345',
      role: 'CUSTOMER',
      city: 'Bengaluru',
      walletBalance: 1250,
      loyaltyPoints: 340,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString(),
      addresses: [
        {
          id: 'addr-1',
          label: 'Home',
          line1: 'Flat 402, Sunshine Apartments',
          locality: 'Indiranagar',
          city: 'Bengaluru',
          pincode: '560038',
          landmark: 'Near Metro Station Gate 2',
          isDefault: true,
        },
        {
          id: 'addr-2',
          label: 'Work',
          line1: '9th Floor, Tech Park Tower B',
          locality: 'Koramangala',
          city: 'Bengaluru',
          pincode: '560095',
          isDefault: false,
        },
      ],
    };
    this.users.set(customerUser.id, customerUser);

    // Default Provider User
    const providerUser: User & { passwordHash: string } = {
      id: 'usr-provider-101',
      email: 'provider@urgentlyfe.com',
      passwordHash: demoPasswordHash,
      fullName: 'Rajesh Verma',
      phone: '+91 98765 43210',
      role: 'PROVIDER',
      city: 'Bengaluru',
      walletBalance: 4800,
      loyaltyPoints: 920,
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString(),
      addresses: [],
    };
    this.users.set(providerUser.id, providerUser);

    // Provider Profile
    const providerProfile: ProviderProfile = {
      id: 'partner-101',
      userId: providerUser.id,
      fullName: 'Rajesh Verma',
      phone: providerUser.phone,
      avatar: providerUser.avatar!,
      bio: 'Master HVAC & Senior Electrical technician with 8+ years experience in Bengaluru.',
      skills: ['HVAC Certified', 'Short Circuit Specialist', 'Foam Jet Pro', 'Schneider Certified'],
      experienceYears: 8,
      categoryId: 'ac-appliance',
      city: 'Bengaluru',
      availability: 'available',
      rating: 4.92,
      totalJobs: 1480,
      hourlyRate: 499,
      verified: true,
      badge: 'Super Pro',
      createdAt: new Date().toISOString(),
    };
    this.providers.set(providerProfile.id, providerProfile);

    // Default Admin User
    const adminUser: User & { passwordHash: string } = {
      id: 'usr-admin-101',
      email: 'admin@urgentlyfe.com',
      passwordHash: demoPasswordHash,
      fullName: 'UrgentLyfe System Admin',
      phone: '+91 99000 88800',
      role: 'ADMIN',
      city: 'Bengaluru',
      walletBalance: 0,
      loyaltyPoints: 0,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString(),
      addresses: [],
    };
    this.users.set(adminUser.id, adminUser);

    // Seed remaining Partners as Providers
    PARTNERS.forEach((p, idx) => {
      if (!this.providers.has(p.id)) {
        const uId = `usr-partner-${idx + 102}`;
        const pUser: User & { passwordHash: string } = {
          id: uId,
          email: `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@urgentlyfe.com`,
          passwordHash: demoPasswordHash,
          fullName: p.name,
          phone: p.phone,
          role: 'PROVIDER',
          city: p.city,
          walletBalance: 3200,
          loyaltyPoints: 150,
          avatar: p.avatar,
          createdAt: new Date().toISOString(),
          addresses: [],
        };
        this.users.set(uId, pUser);

        const prof: ProviderProfile = {
          id: p.id,
          userId: uId,
          fullName: p.name,
          phone: p.phone,
          avatar: p.avatar,
          bio: `${p.name} - Certified home service specialist in ${p.city}.`,
          skills: p.skills,
          experienceYears: p.experienceYears,
          categoryId: p.categoryIds[0] || 'electrical',
          city: p.city,
          availability: p.status,
          rating: p.rating,
          totalJobs: p.totalJobs,
          hourlyRate: 399,
          verified: p.verified,
          badge: p.badge || 'Verified Expert',
          createdAt: new Date().toISOString(),
        };
        this.providers.set(prof.id, prof);
      }
    });

    // 4. Seed Bookings
    MOCK_BOOKINGS.forEach((b) => this.bookings.set(b.id, b));

    // 5. Seed Reviews
    const sampleReview: Review = {
      id: 'rev-101',
      bookingId: 'UL-7430',
      userId: customerUser.id,
      userName: customerUser.fullName,
      providerId: 'partner-102',
      rating: 5,
      comment: 'Arrived in 20 minutes! Fixed the pipe leakage smoothly and left the bathroom completely clean.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    };
    this.reviews.set(sampleReview.id, sampleReview);

    // 6. Seed Payments
    const samplePayment: Payment = {
      id: 'pay-101',
      bookingId: 'UL-8921',
      userId: customerUser.id,
      amount: 782,
      paymentMethod: 'UPI',
      transactionId: 'TXN-UPI-982189421',
      status: 'PAID',
      createdAt: new Date().toISOString(),
    };
    this.payments.set(samplePayment.id, samplePayment);

    // 7. Seed Feedback
    const sampleFeedback: Feedback = {
      id: 'fb-101',
      userId: customerUser.id,
      userName: customerUser.fullName,
      message: 'Great AI diagnostic feature! It predicted my AC capacitor issue accurately.',
      category: 'AI Feature',
      rating: 5,
      createdAt: new Date().toISOString(),
    };
    this.feedback.set(sampleFeedback.id, sampleFeedback);

    // 8. Seed Notifications
    const sampleNotif: Notification = {
      id: 'notif-101',
      userId: customerUser.id,
      title: 'Technician Dispatched 🚀',
      message: 'Rajesh Verma (Super Pro) is en route to your location. ETA 12 Mins.',
      read: false,
      type: 'BOOKING',
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(sampleNotif.id, sampleNotif);

    // 9. Seed Locations
    CITIES.forEach((city) => {
      city.localities.forEach((loc, i) => {
        const id = `loc-${city.id}-${i}`;
        this.locations.set(id, {
          id,
          city: city.name,
          state: city.state,
          locality: loc,
          pincode: `5600${10 + i}`,
        });
      });
    });

    // 10. Seed Chat History
    const sampleChat: ChatHistoryItem = {
      id: 'chat-101',
      userId: customerUser.id,
      sender: 'assistant',
      message: 'Welcome to UrgentLyfe! How can I assist you with your home services today?',
      timestamp: new Date().toISOString(),
    };
    this.chatHistory.set(sampleChat.id, sampleChat);

    // 11. Seed Provider Scores
    Array.from(this.providers.values()).forEach((p) => {
      this.providerScores.set(p.id, {
        id: `score-${p.id}`,
        providerId: p.id,
        ratingScore: p.rating,
        speedScore: 98,
        completionRate: 99.4,
        overallScore: Number((p.rating * 0.8 + 1.0).toFixed(1)),
        updatedAt: new Date().toISOString(),
      });
    });

    // 12. Seed AI Recommendations
    this.aiRecommendations.set('rec-101', {
      id: 'rec-101',
      userId: customerUser.id,
      recommendedServiceId: 'ac-foam-jet-service',
      serviceTitle: 'Power Foam Jet AC Service',
      score: 0.98,
      reason: 'Hot weather in Bengaluru & scheduled 90 days ago.',
      createdAt: new Date().toISOString(),
    });
  }

  // --- AUTH METHODS ---
  public registerUser(data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    city?: string;
    skills?: string[];
    experienceYears?: number;
    categoryId?: string;
  }): { token: string; user: User; providerProfile?: ProviderProfile } {
    // Check if email exists
    const normalizedEmail = data.email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        throw new Error('User with this email already exists.');
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.password, salt);
    const userId = `usr-${Date.now()}`;

    const newUser: User & { passwordHash: string } = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone || '+91 90000 00000',
      role: data.role || 'CUSTOMER',
      city: data.city || 'Bengaluru',
      addresses: [],
      walletBalance: data.role === 'CUSTOMER' ? 200 : 0, // Signup bonus
      loyaltyPoints: 50,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.fullName)}`,
      createdAt: new Date().toISOString(),
    };

    this.users.set(userId, newUser);

    let providerProfile: ProviderProfile | undefined;
    if (data.role === 'PROVIDER') {
      const profId = `partner-${Date.now()}`;
      providerProfile = {
        id: profId,
        userId: userId,
        fullName: data.fullName,
        phone: data.phone,
        avatar: newUser.avatar!,
        bio: `${data.fullName} - Skilled service professional`,
        skills: data.skills || ['General Maintenance'],
        experienceYears: data.experienceYears || 2,
        categoryId: data.categoryId || 'electrical',
        city: data.city || 'Bengaluru',
        availability: 'available',
        rating: 5.0,
        totalJobs: 0,
        hourlyRate: 399,
        verified: true, // Auto-verified for instant demo
        badge: 'New Professional',
        createdAt: new Date().toISOString(),
      };
      this.providers.set(profId, providerProfile);

      // Add provider score
      this.providerScores.set(profId, {
        id: `score-${profId}`,
        providerId: profId,
        ratingScore: 5.0,
        speedScore: 100,
        completionRate: 100,
        overallScore: 5.0,
        updatedAt: new Date().toISOString(),
      });
    }

    const sanitizedUser = this.sanitizeUser(newUser);
    const token = this.generateJWT(sanitizedUser);

    return { token, user: sanitizedUser, providerProfile };
  }

  public loginUser(data: {
    email: string;
    password: string;
    role?: UserRole;
  }): { token: string; user: User; providerProfile?: ProviderProfile } {
    const normalizedEmail = data.email.toLowerCase().trim();
    let foundUser: (User & { passwordHash: string }) | undefined;

    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('Invalid email or password.');
    }

    if (foundUser.isBlocked) {
      throw new Error('Your account has been suspended by Administrator.');
    }

    const isMatch = bcrypt.compareSync(data.password, foundUser.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const sanitized = this.sanitizeUser(foundUser);
    let providerProf: ProviderProfile | undefined;

    if (sanitized.role === 'PROVIDER') {
      for (const p of this.providers.values()) {
        if (p.userId === sanitized.id) {
          providerProf = p;
          break;
        }
      }
    }

    const token = this.generateJWT(sanitized);
    return { token, user: sanitized, providerProfile: providerProf };
  }

  public generateJWT(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  public verifyJWT(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw new Error('Invalid or expired authentication token.');
    }
  }

  public sanitizeUser(user: User & { passwordHash?: string }): User {
    const { passwordHash, ...clean } = user;
    return clean;
  }

  // --- USER ADDRESS CRUD ---
  public addAddress(userId: string, addressData: Omit<Address, 'id'>): Address {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found.');

    const newAddress: Address = {
      ...addressData,
      id: `addr-${Date.now()}`,
    };

    if (newAddress.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    } else if (user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    user.addresses.push(newAddress);
    user.updatedAt = new Date().toISOString();
    return newAddress;
  }

  public updateAddress(userId: string, addressId: string, addressData: Partial<Address>): Address {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found.');

    const index = user.addresses.findIndex((a) => a.id === addressId);
    if (index === -1) throw new Error('Address not found.');

    if (addressData.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses[index] = { ...user.addresses[index], ...addressData };
    user.updatedAt = new Date().toISOString();
    return user.addresses[index];
  }

  public deleteAddress(userId: string, addressId: string): boolean {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found.');

    const initialLen = user.addresses.length;
    user.addresses = user.addresses.filter((a) => a.id !== addressId);
    if (user.addresses.length < initialLen) {
      if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
        user.addresses[0].isDefault = true;
      }
      user.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // --- PROVIDER CRUD ---
  public updateProviderProfile(
    providerId: string,
    data: Partial<ProviderProfile>
  ): ProviderProfile {
    const provider = this.providers.get(providerId);
    if (!provider) throw new Error('Provider profile not found.');

    Object.assign(provider, data);
    this.providers.set(providerId, provider);
    return provider;
  }

  // --- NOTIFICATIONS CRUD ---
  public addNotification(userId: string, title: string, message: string, type: any = 'SYSTEM'): Notification {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      read: false,
      type,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(notif.id, notif);
    return notif;
  }

  public getUserNotifications(userId: string): Notification[] {
    return Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public markNotificationRead(notifId: string): boolean {
    const n = this.notifications.get(notifId);
    if (n) {
      n.read = true;
      return true;
    }
    return false;
  }
}

export const db = new UrgentLyfeDatabase();
