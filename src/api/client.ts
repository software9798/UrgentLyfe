import {
  Category,
  ServiceItem,
  Partner,
  City,
  Booking,
  AIDiagnosis,
  User,
  ProviderProfile,
  AuthResponse,
  Address,
  Notification,
  Review,
  Payment,
  Feedback,
  LocationItem,
  ChatHistoryItem,
  VoiceHistoryItem,
  ProviderScore,
  AIRecommendation,
} from '../types';
import { perfMonitor } from '../utils/performance';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('urgentlyfe_jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const method = options?.method || 'GET';
  const endTimer = perfMonitor.startTimer('API_HTTP', `${method} ${endpoint}`);

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...(options?.headers || {}),
      },
      ...options,
    });

    const json = await response.json();
    if (!response.ok || json.success === false) {
      endTimer({ status: 'ERROR', httpStatus: response.status });
      throw new Error(json.error || json.message || 'API Request failed');
    }

    endTimer({ status: 'SUCCESS', httpStatus: response.status });
    return json.data as T;
  } catch (err: any) {
    endTimer({ status: 'ERROR', error: err.message });
    throw err;
  }
}

export const api = {
  // System Health
  getHealth: () => fetch('/api/health').then((r) => r.json()),

  // AUTHENTICATION APIs
  signup: (data: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    role?: 'CUSTOMER' | 'PROVIDER' | 'ADMIN';
    city?: string;
    skills?: string[];
    experienceYears?: number;
    categoryId?: string;
  }): Promise<AuthResponse> =>
    fetchAPI<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string; role?: string }): Promise<AuthResponse> =>
    fetchAPI<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: (): Promise<{ user: User; providerProfile?: ProviderProfile }> =>
    fetchAPI<{ user: User; providerProfile?: ProviderProfile }>('/api/auth/me'),

  logout: () => {
    localStorage.removeItem('urgentlyfe_jwt');
    return fetchAPI<any>('/api/auth/logout', { method: 'POST' });
  },

  // CUSTOMER ADDRESS MANAGEMENT APIs
  addAddress: (addressData: Partial<Address>): Promise<Address> =>
    fetchAPI<Address>('/api/users/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    }),

  updateAddress: (addressId: string, addressData: Partial<Address>): Promise<Address> =>
    fetchAPI<Address>(`/api/users/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    }),

  deleteAddress: (addressId: string): Promise<any> =>
    fetchAPI<any>(`/api/users/addresses/${addressId}`, {
      method: 'DELETE',
    }),

  updateProfile: (profileData: { fullName?: string; phone?: string; city?: string; avatar?: string }): Promise<User> =>
    fetchAPI<User>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  getNotifications: (): Promise<Notification[]> => fetchAPI<Notification[]>('/api/users/notifications'),

  markNotificationRead: (id: string) =>
    fetchAPI<any>(`/api/users/notifications/${id}/read`, { method: 'PATCH' }),

  // SERVICE PROVIDER APIs
  updateProviderProfile: (data: Partial<ProviderProfile>): Promise<ProviderProfile> =>
    fetchAPI<ProviderProfile>('/api/providers/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateAvailability: (availability: 'available' | 'busy' | 'offline'): Promise<ProviderProfile> =>
    fetchAPI<ProviderProfile>('/api/providers/availability', {
      method: 'PATCH',
      body: JSON.stringify({ availability }),
    }),

  getProviderBookings: (): Promise<Booking[]> => fetchAPI<Booking[]>('/api/providers/bookings'),

  // ADMIN MANAGEMENT APIs
  getAdminUsers: (): Promise<User[]> => fetchAPI<User[]>('/api/admin/users'),

  updateAdminUser: (id: string, data: { isBlocked?: boolean; role?: string }): Promise<User> =>
    fetchAPI<User>(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getAdminProviders: (): Promise<ProviderProfile[]> => fetchAPI<ProviderProfile[]>('/api/admin/providers'),

  verifyAdminProvider: (id: string, data: { verified?: boolean; badge?: string }): Promise<ProviderProfile> =>
    fetchAPI<ProviderProfile>(`/api/admin/providers/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getAdminStats: (): Promise<{
    totalUsers: number;
    totalProviders: number;
    totalBookings: number;
    activeBookings: number;
    totalRevenue: number;
    systemHealth: string;
    activeCities: number;
    averageRating: number;
  }> => fetchAPI<any>('/api/admin/stats'),

  // DATABASE TABLES APIs
  getDbUsers: (): Promise<User[]> => fetchAPI<User[]>('/api/db/users'),
  getDbProviders: (): Promise<ProviderProfile[]> => fetchAPI<ProviderProfile[]>('/api/db/providers'),
  getReviews: (providerId?: string): Promise<Review[]> =>
    fetchAPI<Review[]>(`/api/reviews${providerId ? `?providerId=${providerId}` : ''}`),
  createReview: (reviewData: Partial<Review>): Promise<Review> =>
    fetchAPI<Review>('/api/reviews', { method: 'POST', body: JSON.stringify(reviewData) }),
  getPayments: (): Promise<Payment[]> => fetchAPI<Payment[]>('/api/payments'),
  getFeedback: (): Promise<Feedback[]> => fetchAPI<Feedback[]>('/api/feedback'),
  submitFeedback: (fb: Partial<Feedback>): Promise<Feedback> =>
    fetchAPI<Feedback>('/api/feedback', { method: 'POST', body: JSON.stringify(fb) }),
  getLocations: (): Promise<LocationItem[]> => fetchAPI<LocationItem[]>('/api/locations'),
  getChatHistory: (): Promise<ChatHistoryItem[]> => fetchAPI<ChatHistoryItem[]>('/api/chat-history'),
  getVoiceHistory: (): Promise<VoiceHistoryItem[]> => fetchAPI<VoiceHistoryItem[]>('/api/voice-history'),
  getProviderScores: (): Promise<ProviderScore[]> => fetchAPI<ProviderScore[]>('/api/provider-scores'),
  getAIRecommendations: (): Promise<AIRecommendation[]> => fetchAPI<AIRecommendation[]>('/api/ai-recommendations'),

  // CATALOG & GENERAL APIs
  getCities: (): Promise<City[]> => fetchAPI<City[]>('/api/cities'),

  getCategories: (): Promise<Category[]> => fetchAPI<Category[]>('/api/categories'),

  getServices: (params?: { category?: string; search?: string; urgentOnly?: boolean }): Promise<ServiceItem[]> => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.urgentOnly) query.append('urgentOnly', 'true');
    return fetchAPI<ServiceItem[]>(`/api/services?${query.toString()}`);
  },

  getServiceById: (id: string): Promise<ServiceItem> => fetchAPI<ServiceItem>(`/api/services/${id}`),

  getPartners: (params?: { city?: string; category?: string }): Promise<Partner[]> => {
    const query = new URLSearchParams();
    if (params?.city) query.append('city', params.city);
    if (params?.category) query.append('category', params.category);
    return fetchAPI<Partner[]>(`/api/partners?${query.toString()}`);
  },

  validateCoupon: (code: string, amount: number) =>
    fetchAPI<{ code: string; discountAmount: number; description: string }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, amount }),
    }),

  getMLEstimatedPrice: (data: { serviceId: string; isUrgent: boolean; city: string; quantity?: number }) =>
    fetchAPI<any>('/api/ml/estimate-price', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBookings: (): Promise<Booking[]> => fetchAPI<Booking[]>('/api/bookings'),

  getBookingById: (id: string): Promise<Booking> => fetchAPI<Booking>(`/api/bookings/${id}`),

  createBooking: (bookingData: any): Promise<Booking> =>
    fetchAPI<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    }),

  updateBookingStatus: (id: string, status: string): Promise<Booking> =>
    fetchAPI<Booking>(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  diagnoseIssue: (data: { problemDescription: string; imageBase64?: string; categoryHint?: string }): Promise<AIDiagnosis> =>
    fetchAPI<AIDiagnosis>('/api/ai/diagnose', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  chatWithAI: (message: string) =>
    fetchAPI<{ reply: string }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  sendVoiceQuery: (data: { transcript: string; language?: string; userId?: string }) =>
    fetchAPI<any>('/api/ai/voice', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  sendVoiceFeedback: (data: { bookingId: string; providerId?: string; voiceFeedbackText: string }) =>
    fetchAPI<any>('/api/ai/voice-feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  smartSearch: (query: string) =>
    fetchAPI<any>('/api/ai/smart-search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  getFraudAlerts: () => fetchAPI<any[]>('/api/admin/fraud-alerts'),

  detectImageProblem: (imageBase64: string) =>
    fetchAPI<any>('/api/ai/image-detect', {
      method: 'POST',
      body: JSON.stringify({ imageBase64 }),
    }),

  getBIAnalytics: () => fetchAPI<any>('/api/analytics/business-intelligence'),

  getAPIDocs: () => fetch('/api/docs').then((r) => r.json()),
};
