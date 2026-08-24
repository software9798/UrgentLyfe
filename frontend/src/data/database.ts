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
  ReferralRecord,
  ReferralStats,
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
  public activeOtps: Map<string, { otp: string; expiresAt: number }> = new Map();
  public referrals: Map<string, ReferralRecord> = new Map();

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

    // 13. Seed Referrals for Default Customer (Aarav Mehta)
    const ref1: ReferralRecord = {
      id: 'ref-101',
      referrerUserId: customerUser.id,
      referredName: 'Vikram Malhotra',
      referredPhone: '+91 98450 11223',
      referredEmail: 'vikram.m@gmail.com',
      serviceName: 'Power Foam Jet AC Service',
      bookingId: 'UL-7429',
      rewardAmount: 250,
      status: 'REWARD_CREDITED',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    };
    const ref2: ReferralRecord = {
      id: 'ref-102',
      referrerUserId: customerUser.id,
      referredName: 'Priya Sharma',
      referredPhone: '+91 97120 44556',
      referredEmail: 'priya.sharma@yahoo.com',
      serviceName: 'Emergency Short Circuit Repair',
      bookingId: 'UL-8104',
      rewardAmount: 250,
      status: 'REWARD_CREDITED',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    };
    const ref3: ReferralRecord = {
      id: 'ref-103',
      referrerUserId: customerUser.id,
      referredName: 'Rohan Das',
      referredPhone: '+91 99012 33445',
      referredEmail: 'rohan.das@outlook.com',
      serviceName: 'Kitchen Water Leakage Drain Repair',
      bookingId: 'UL-9022',
      rewardAmount: 250,
      status: 'PENDING_FIRST_SERVICE',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    };
    const ref4: ReferralRecord = {
      id: 'ref-104',
      referrerUserId: customerUser.id,
      referredName: 'Sneha Patel',
      referredPhone: '+91 98860 99887',
      referredEmail: 'sneha.p@gmail.com',
      rewardAmount: 250,
      status: 'PENDING_FIRST_SERVICE',
      createdAt: new Date().toISOString(),
    };

    this.referrals.set(ref1.id, ref1);
    this.referrals.set(ref2.id, ref2);
    this.referrals.set(ref3.id, ref3);
    this.referrals.set(ref4.id, ref4);
  }

  // --- AUTH METHODS ---

  // Helper to normalize phone number
  public normalizePhone(phone: string): string {
    return phone.replace(/[^0-9+]/g, '').trim();
  }

  // 1. Send OTP to Mobile Number
  public sendOtp(phone: string): { success: boolean; message: string; otp: string; phone: string } {
    const cleanPhone = this.normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    // Generate 6-digit OTP (e.g. 482910)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    this.activeOtps.set(cleanPhone, { otp, expiresAt });

    return {
      success: true,
      message: `OTP sent successfully to ${cleanPhone}`,
      otp, // Provided for easy development & instant testing
      phone: cleanPhone,
    };
  }

  // 2. Verify OTP and Log In or Create User
  public verifyOtp(data: {
    phone: string;
    otp: string;
    role?: UserRole;
    fullName?: string;
  }): { token: string; user: User; providerProfile?: ProviderProfile; isNewUser: boolean } {
    const cleanPhone = this.normalizePhone(data.phone);
    const stored = this.activeOtps.get(cleanPhone);

    // Allow static demo bypass code '123456' or valid generated OTP
    const isValid = (stored && stored.otp === data.otp.trim() && stored.expiresAt > Date.now()) || data.otp.trim() === '123456';

    if (!isValid) {
      throw new Error('Invalid or expired OTP. Please enter the correct 6-digit code or request a new OTP.');
    }

    // Clear OTP after successful use
    this.activeOtps.delete(cleanPhone);

    // Find if user already exists by phone
    let foundUser: (User & { passwordHash: string }) | undefined;
    for (const u of this.users.values()) {
      if (this.normalizePhone(u.phone) === cleanPhone || (cleanPhone.endsWith(u.phone.replace(/[^0-9]/g, '')) && u.phone.length >= 10)) {
        foundUser = u;
        break;
      }
    }

    let isNewUser = false;
    if (!foundUser) {
      // Auto-create user profile for this phone
      isNewUser = true;
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync('otp-login-auto-pass', salt);
      const userId = `usr-otp-${Date.now()}`;
      const generatedEmail = `user.${cleanPhone.replace(/[^0-9]/g, '').slice(-10)}@urgentlyfe.com`;
      const name = data.fullName || `Customer ${cleanPhone.slice(-4)}`;

      foundUser = {
        id: userId,
        email: generatedEmail,
        passwordHash,
        fullName: name,
        phone: cleanPhone,
        role: data.role || 'CUSTOMER',
        city: 'Bengaluru',
        addresses: [
          {
            id: `addr-${Date.now()}`,
            label: 'Home',
            line1: 'Flat 101, Residency',
            locality: 'Indiranagar',
            city: 'Bengaluru',
            pincode: '560038',
            landmark: 'Near Main Road',
            isDefault: true,
          },
        ],
        walletBalance: 200, // Welcome bonus
        loyaltyPoints: 50,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        createdAt: new Date().toISOString(),
      };
      this.users.set(userId, foundUser);
    }

    if (foundUser.isBlocked) {
      throw new Error('Your account has been suspended by Administrator.');
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
    return { token, user: sanitized, providerProfile: providerProf, isNewUser };
  }

  // 3. Google Sign-In / 1-Click Authentication
  public loginWithGoogle(data: {
    email: string;
    fullName: string;
    avatar?: string;
    role?: UserRole;
  }): { token: string; user: User; providerProfile?: ProviderProfile; isNewUser: boolean } {
    const normalizedEmail = data.email.toLowerCase().trim();
    let foundUser: (User & { passwordHash: string }) | undefined;

    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        foundUser = u;
        break;
      }
    }

    let isNewUser = false;
    if (!foundUser) {
      isNewUser = true;
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(`google-auth-${Date.now()}`, salt);
      const userId = `usr-google-${Date.now()}`;

      foundUser = {
        id: userId,
        email: normalizedEmail,
        passwordHash,
        fullName: data.fullName,
        phone: '+91 98765 00000',
        role: data.role || 'CUSTOMER',
        city: 'Bengaluru',
        addresses: [
          {
            id: `addr-${Date.now()}`,
            label: 'Home',
            line1: 'Skyline Tower 4B',
            locality: 'Koramangala',
            city: 'Bengaluru',
            pincode: '560034',
            landmark: 'Near Forum',
            isDefault: true,
          },
        ],
        walletBalance: 200, // Welcome bonus
        loyaltyPoints: 50,
        avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.fullName)}`,
        createdAt: new Date().toISOString(),
      };
      this.users.set(userId, foundUser);
    }

    if (foundUser.isBlocked) {
      throw new Error('Your account has been suspended by Administrator.');
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
    return { token, user: sanitized, providerProfile: providerProf, isNewUser };
  }

  // 4. Comprehensive User Registration (Sign up with all details)
  public registerUser(data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role: UserRole;
    city?: string;
    locality?: string;
    addressLine?: string;
    pincode?: string;
    addressLabel?: string;
    landmark?: string;
    skills?: string[];
    experienceYears?: number;
    categoryId?: string;
    avatar?: string;
  }): { token: string; user: User; providerProfile?: ProviderProfile } {
    // Check if email exists
    const normalizedEmail = data.email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
    }

    const cleanPhone = this.normalizePhone(data.phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      throw new Error('Please provide a valid 10-digit mobile number.');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.password, salt);
    const userId = `usr-${Date.now()}`;
    const targetCity = data.city || 'Bengaluru';

    // Construct primary initial address from registration details
    const initialAddresses: Address[] = [];
    if (data.addressLine || data.locality) {
      initialAddresses.push({
        id: `addr-${Date.now()}`,
        label: (data.addressLabel as 'Home' | 'Work' | 'Other') || 'Home',
        line1: data.addressLine || 'Street Address',
        locality: data.locality || 'Locality Area',
        city: targetCity,
        pincode: data.pincode || '560001',
        landmark: data.landmark || undefined,
        isDefault: true,
      });
    } else {
      initialAddresses.push({
        id: `addr-${Date.now()}`,
        label: 'Home',
        line1: 'Flat 101, Sunshine Heights',
        locality: 'Central Hub',
        city: targetCity,
        pincode: data.pincode || '560001',
        isDefault: true,
      });
    }

    const newUser: User & { passwordHash: string } = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      fullName: data.fullName.trim(),
      phone: cleanPhone,
      role: data.role || 'CUSTOMER',
      city: targetCity,
      addresses: initialAddresses,
      walletBalance: data.role === 'CUSTOMER' ? 200 : 0, // Signup welcome bonus
      loyaltyPoints: 50,
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.fullName)}`,
      createdAt: new Date().toISOString(),
    };

    this.users.set(userId, newUser);

    let providerProfile: ProviderProfile | undefined;
    if (data.role === 'PROVIDER') {
      const profId = `partner-${Date.now()}`;
      providerProfile = {
        id: profId,
        userId: userId,
        fullName: data.fullName.trim(),
        phone: cleanPhone,
        avatar: newUser.avatar!,
        bio: `${data.fullName.trim()} - Certified ${data.categoryId || 'Home Service'} Specialist with ${data.experienceYears || 2} years of verified field experience.`,
        skills: data.skills && data.skills.length > 0 ? data.skills : ['Standard Inspection', 'Emergency Repairs'],
        experienceYears: data.experienceYears || 2,
        categoryId: data.categoryId || 'electrical',
        city: targetCity,
        availability: 'available',
        rating: 5.0,
        totalJobs: 0,
        hourlyRate: 399,
        verified: true, // Instant verified badge for demo
        badge: 'Certified Professional',
        createdAt: new Date().toISOString(),
      };
      this.providers.set(profId, providerProfile);

      // Add initial provider score
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

  // 5. Standard Login via Email OR Phone with Password
  public loginUser(data: {
    email?: string;
    phone?: string;
    emailOrPhone?: string;
    password: string;
    role?: UserRole;
  }): { token: string; user: User; providerProfile?: ProviderProfile } {
    const searchIdentifier = (data.emailOrPhone || data.email || data.phone || '').trim().toLowerCase();
    const cleanPhone = this.normalizePhone(searchIdentifier);

    let foundUser: (User & { passwordHash: string }) | undefined;

    for (const u of this.users.values()) {
      if (
        u.email.toLowerCase() === searchIdentifier ||
        (cleanPhone && cleanPhone.length >= 8 && this.normalizePhone(u.phone).includes(cleanPhone))
      ) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new Error('No account found with this email or mobile number.');
    }

    if (foundUser.isBlocked) {
      throw new Error('Your account has been suspended by Administrator.');
    }

    const isMatch = bcrypt.compareSync(data.password, foundUser.passwordHash);
    if (!isMatch) {
      throw new Error('Incorrect password. Please verify and try again.');
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
  public addNotification(
    userId: string,
    title: string,
    message: string,
    type: any = 'SYSTEM',
    options?: {
      bookingId?: string;
      directionsUrl?: string;
      actionUrl?: string;
      is1HourAlert?: boolean;
      scheduledTime?: string;
      destinationAddress?: string;
    }
  ): Notification {
    const notif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      read: false,
      type,
      bookingId: options?.bookingId,
      directionsUrl: options?.directionsUrl,
      actionUrl: options?.actionUrl,
      is1HourAlert: options?.is1HourAlert,
      scheduledTime: options?.scheduledTime,
      destinationAddress: options?.destinationAddress,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(notif.id, notif);
    return notif;
  }

  public triggerOneHourAlert(bookingId: string): { customerNotif: Notification; providerNotif?: Notification } {
    const booking = this.bookings.get(bookingId);
    if (!booking) throw new Error('Booking not found');

    const addressQuery = [
      booking.userAddress.line1,
      booking.userAddress.locality,
      booking.userAddress.city,
      booking.userAddress.pincode,
    ]
      .filter(Boolean)
      .join(', ');

    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressQuery)}&travelmode=driving`;
    const slot = booking.scheduledTimeSlot || '10:00 AM - 11:00 AM';

    // 1. Customer Notification
    const customerNotif = this.addNotification(
      booking.userId,
      `⏰ Service Reminder: 1 Hour to Service!`,
      `Your booking #${booking.id} (${booking.service.title}) starts at ${slot}. Expert ${booking.partner?.name || 'Technician'} is preparing.`,
      'REMINDER_1HR',
      {
        bookingId: booking.id,
        directionsUrl,
        is1HourAlert: true,
        scheduledTime: slot,
        destinationAddress: addressQuery,
      }
    );

    // 2. Provider Notification
    let providerNotif: Notification | undefined;
    if (booking.partner?.id) {
      // Find provider user
      const providerProfile = this.providers.get(booking.partner.id);
      const targetUserId = providerProfile?.userId || 'usr-provider-101';

      providerNotif = this.addNotification(
        targetUserId,
        `🧭 1-Hour Alert: Job #${booking.id} Directions Ready`,
        `Upcoming service at ${booking.userAddress.locality} for ${booking.userName} in 1 hour (${slot}). Click for One-Click Directions!`,
        'REMINDER_1HR',
        {
          bookingId: booking.id,
          directionsUrl,
          is1HourAlert: true,
          scheduledTime: slot,
          destinationAddress: addressQuery,
        }
      );
    }

    booking.oneHourAlertSent = true;
    booking.oneHourAlertSentAt = new Date().toISOString();
    this.bookings.set(booking.id, booking);

    return { customerNotif, providerNotif };
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

  // --- REFERRAL & EARN ENGINE ---
  public getUserReferralCode(user: User): string {
    const namePart = (user.fullName.split(' ')[0] || 'URGENT').toUpperCase().replace(/[^A-Z]/g, '');
    return `${namePart}250`;
  }

  public getReferralStats(userId: string): ReferralStats {
    const user = this.users.get(userId) || Array.from(this.users.values())[0];
    const referralCode = this.getUserReferralCode(user);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://urgentlyfe.app';
    const referralLink = `${origin}?ref=${referralCode}`;

    const userReferrals = Array.from(this.referrals.values())
      .filter((r) => r.referrerUserId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const completedReferrals = userReferrals.filter((r) => r.status === 'REWARD_CREDITED').length;
    const pendingReferrals = userReferrals.filter((r) => r.status === 'PENDING_FIRST_SERVICE').length;
    const totalEarnings = completedReferrals * 250;

    return {
      referralCode,
      referralLink,
      totalReferrals: userReferrals.length,
      completedReferrals,
      pendingReferrals,
      totalEarnings,
      walletBalance: user.walletBalance,
      rewardPerReferral: 250,
      friendDiscount: 200,
      referrals: userReferrals,
    };
  }

  public sendReferralInvite(
    userId: string,
    data: { friendName: string; friendPhone: string; friendEmail?: string }
  ): ReferralRecord {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found.');

    if (!data.friendName || !data.friendPhone) {
      throw new Error("Friend's name and mobile number are required.");
    }

    const cleanPhone = this.normalizePhone(data.friendPhone);
    const newRecord: ReferralRecord = {
      id: `ref-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      referrerUserId: user.id,
      referredName: data.friendName.trim(),
      referredPhone: cleanPhone.startsWith('+91') ? cleanPhone : `+91 ${cleanPhone}`,
      referredEmail: data.friendEmail?.trim(),
      rewardAmount: 250,
      status: 'PENDING_FIRST_SERVICE',
      createdAt: new Date().toISOString(),
    };

    this.referrals.set(newRecord.id, newRecord);

    // Add notification to referrer
    this.addNotification(
      user.id,
      'Referral Invite Dispatched 🎁',
      `Invite sent to ${newRecord.referredName} (+91 ${cleanPhone}). ₹250 wallet credit will unlock on their first completed service!`,
      'OFFER'
    );

    return newRecord;
  }

  public simulateCompleteReferral(userId: string, referralId: string): ReferralStats {
    const referral = this.referrals.get(referralId);
    if (!referral) throw new Error('Referral record not found.');

    if (referral.status === 'REWARD_CREDITED') {
      return this.getReferralStats(userId);
    }

    referral.status = 'REWARD_CREDITED';
    referral.serviceName = referral.serviceName || 'Power Foam Jet AC Service';
    referral.bookingId = referral.bookingId || `UL-${Math.floor(1000 + Math.random() * 9000)}`;
    referral.completedAt = new Date().toISOString();
    this.referrals.set(referral.id, referral);

    // Credit ₹250 to referrer user's wallet
    const referrer = this.users.get(referral.referrerUserId);
    if (referrer) {
      referrer.walletBalance = (referrer.walletBalance || 0) + 250;
      referrer.loyaltyPoints = (referrer.loyaltyPoints || 0) + 50;
      this.users.set(referrer.id, referrer);

      // Add high-priority notification & payment record
      this.addNotification(
        referrer.id,
        '₹250 Referral Bonus Credited! 💰',
        `Hurray! ${referral.referredName} completed their first booking (${referral.serviceName}). ₹250 is added to your UrgentLyfe Wallet!`,
        'OFFER'
      );
    }

    return this.getReferralStats(userId);
  }
}

export const db = new UrgentLyfeDatabase();
