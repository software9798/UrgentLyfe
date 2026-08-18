import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  Wrench,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
  Smartphone,
  KeyRound,
  MapPin,
  Building,
  Navigation,
  Gift,
  RefreshCw,
} from 'lucide-react';
import { api } from '../api/client';
import { UserRole, AuthResponse, Category } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authData: AuthResponse) => void;
  categories: Category[];
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, categories }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'phone_otp' | 'password'>('phone_otp');
  const [role, setRole] = useState<UserRole>('CUSTOMER');

  // Login States
  const [loginPhone, setLoginPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Comprehensive Signup States ("Sari Details")
  const [fullName, setFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Address Details for Signup
  const [addressLine, setAddressLine] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressLabel, setAddressLabel] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Provider Specific Fields
  const [skills, setSkills] = useState<string>('Electrical, AC Repair, Appliance Maintenance');
  const [experienceYears, setExperienceYears] = useState<number>(4);
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || 'ac-appliance');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  if (!isOpen) return null;

  // Handle Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const cleanPhone = loginPhone.replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(cleanPhone);
      setOtpSent(true);
      setGeneratedOtp(res.otp);
      setOtpTimer(30); // 30s resend timer
      setSuccessMessage(`OTP sent to ${cleanPhone}. Please verify.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!otp.trim()) {
      setError('Please enter the 6-digit OTP received.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.verifyOtp({
        phone: loginPhone,
        otp: otp.trim(),
        role,
      });

      localStorage.setItem('urgentlyfe_jwt', response.token);
      onSuccess(response);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email / Phone + Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!loginEmailOrPhone || !loginPassword) {
      setError('Please enter both Email/Phone and Password.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.login({
        emailOrPhone: loginEmailOrPhone,
        password: loginPassword,
        role,
      });

      localStorage.setItem('urgentlyfe_jwt', response.token);
      onSuccess(response);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google 1-Click Sign-in
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    try {
      // Simulate Google Profile payload
      const response = await api.googleLogin({
        email: 'saurabhkumarsoftware0101@gmail.com',
        fullName: 'Saurabh Kumar',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role,
      });

      localStorage.setItem('urgentlyfe_jwt', response.token);
      onSuccess(response);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Comprehensive Signup
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!fullName.trim() || !signupEmail.trim() || !signupPhone.trim() || !signupPassword.trim()) {
      setError('Please fill in all required personal details.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!addressLine.trim() || !locality.trim() || !pincode.trim()) {
      setError('Please fill in your complete address details (Street, Locality, Pincode).');
      return;
    }

    setLoading(true);
    try {
      const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
      const response = await api.signup({
        fullName: fullName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        password: signupPassword,
        role,
        city,
        locality: locality.trim(),
        addressLine: addressLine.trim(),
        pincode: pincode.trim(),
        addressLabel,
        landmark: landmark.trim() || undefined,
        skills: skillsArray,
        experienceYears: Number(experienceYears),
        categoryId,
      });

      localStorage.setItem('urgentlyfe_jwt', response.token);
      onSuccess(response);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check the details provided.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Instant 1-Click Demo Login
  const handleDemoLogin = async (demoRole: UserRole) => {
    setError(null);
    setLoading(true);
    let demoEmail = 'customer@urgentlyfe.com';
    if (demoRole === 'PROVIDER') demoEmail = 'provider@urgentlyfe.com';
    if (demoRole === 'ADMIN') demoEmail = 'admin@urgentlyfe.com';

    try {
      const response = await api.login({ email: demoEmail, password: 'password123', role: demoRole });
      localStorage.setItem('urgentlyfe_jwt', response.token);
      onSuccess(response);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl md:rounded-[36px] shadow-2xl border border-slate-100 overflow-hidden my-6">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 md:p-7 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            UrgentLyfe Secure Access
          </div>

          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {mode === 'login' ? 'Welcome Back!' : 'Create New Account'}
          </h2>
          <p className="text-blue-100 text-xs md:text-sm mt-1">
            {mode === 'login'
              ? 'Log in via Mobile OTP, Google, or Email & Password.'
              : 'Fill in your complete profile & address details to get started.'}
          </p>

          {/* Role selector pills */}
          <div className="grid grid-cols-3 gap-2 mt-4 bg-black/25 p-1 rounded-2xl backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === 'CUSTOMER'
                  ? 'bg-white text-blue-600 shadow-md scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('PROVIDER')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === 'PROVIDER'
                  ? 'bg-white text-blue-600 shadow-md scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Provider
            </button>
            <button
              type="button"
              onClick={() => setRole('ADMIN')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                role === 'ADMIN'
                  ? 'bg-white text-blue-600 shadow-md scale-[1.02]'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-7 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Error Message Toast */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message Toast */}
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 1: LOGIN (Mobile + OTP, Google, or Email + Password) */}
          {/* ========================================================= */}
          {mode === 'login' && (
            <div className="space-y-4">
              
              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  OR SIGN IN WITH
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Login Method Sub-Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('phone_otp');
                    setError(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginMethod === 'phone_otp'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Mobile Number & OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('password');
                    setError(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginMethod === 'password'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Email / Phone & Password
                </button>
              </div>

              {/* SUB-METHOD A: MOBILE NUMBER & OTP */}
              {loginMethod === 'phone_otp' && (
                <div className="space-y-3.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Enter 10-Digit Mobile Number
                        </label>
                        <div className="relative flex">
                          <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-slate-300 bg-slate-100 text-slate-700 text-xs font-bold">
                            🇮🇳 +91
                          </span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={loginPhone}
                            onChange={(e) => setLoginPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="98765 43210"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-r-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || loginPhone.length < 10}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Send Verification OTP</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">
                          OTP sent to <strong className="text-slate-900">+91 {loginPhone}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp('');
                            setGeneratedOtp(null);
                          }}
                          className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          Change Number
                        </button>
                      </div>

                      {/* Demo Helper Badge for testing */}
                      {generatedOtp && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="text-xs text-amber-900 font-medium">
                              Your OTP is: <strong className="font-mono text-sm text-amber-950 font-black">{generatedOtp}</strong>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOtp(generatedOtp)}
                            className="text-[10px] font-black uppercase px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg cursor-pointer"
                          >
                            Auto-Fill
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Enter 6-Digit OTP Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="••••••"
                          className="w-full text-center tracking-[0.4em] font-mono text-lg py-2.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        {otpTimer > 0 ? (
                          <span className="text-slate-500">Resend OTP in {otpTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendOtp()}
                            className="text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" /> Resend OTP
                          </button>
                        )}
                        <span className="text-slate-400 text-[11px]">(Default Demo: 123456)</span>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || otp.length < 4}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Verify OTP & Sign In</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* SUB-METHOD B: EMAIL / PHONE + PASSWORD */}
              {loginMethod === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Email Address or Mobile Number
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={loginEmailOrPhone}
                        onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                        placeholder="user@urgentlyfe.com or 9876543210"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In as {role.charAt(0) + role.slice(1).toLowerCase()}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Quick Demo Login Preset Buttons */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1.5 text-center">
                  ⚡ 1-Click Demo Profiles
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('CUSTOMER')}
                    className="py-1.5 px-2 bg-white border border-blue-200 rounded-xl text-[11px] font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all text-center shadow-xs cursor-pointer"
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('PROVIDER')}
                    className="py-1.5 px-2 bg-white border border-blue-200 rounded-xl text-[11px] font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all text-center shadow-xs cursor-pointer"
                  >
                    Provider
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('ADMIN')}
                    className="py-1.5 px-2 bg-white border border-blue-200 rounded-xl text-[11px] font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all text-center shadow-xs cursor-pointer"
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* MODE 2: SIGNUP / REGISTER WITH ALL DETAILS ("Sari Details") */}
          {/* ========================================================= */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              
              {/* Signup Welcome Bonus Banner */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Gift className="w-5 h-5 text-yellow-300 shrink-0" />
                  <div>
                    <p className="text-xs font-black">🎁 Instant ₹200 Wallet Bonus</p>
                    <p className="text-[10px] text-emerald-100">+ 50 Loyalty Points credited upon full registration</p>
                  </div>
                </div>
                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  FREE
                </span>
              </div>

              {/* 1. PERSONAL INFORMATION */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  1. Personal & Contact Details
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Aarav Mehta"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="98765 43210"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="aarav.mehta@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password (Min 6 Chars) *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 ${
                          confirmPassword && confirmPassword !== signupPassword
                            ? 'border-rose-300 focus:ring-rose-500'
                            : 'border-slate-300 focus:ring-blue-600'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. COMPLETE ADDRESS DETAILS */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    2. Service Delivery Address
                  </p>
                  
                  {/* Address Tag Selector */}
                  <div className="flex gap-1 bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                    {(['Home', 'Work', 'Other'] as const).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setAddressLabel(tag)}
                        className={`px-2 py-0.5 rounded-md cursor-pointer ${
                          addressLabel === tag ? 'bg-white text-blue-700 shadow-2xs font-black' : 'text-slate-600'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Flat / House No / Street Address *
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="e.g. Flat 402, Sunshine Apartments, 10th Main"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Locality / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Indiranagar"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="560038"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Landmark (Optional)
                  </label>
                  <div className="relative">
                    <Navigation className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Metro Station Gate 2"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* 3. PROVIDER SPECIFIC FIELDS (If role === 'PROVIDER') */}
              {role === 'PROVIDER' && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-amber-700" />
                    3. Professional Technician Credentials
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                        Primary Specialization *
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                        Field Experience (Years) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="40"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                      Key Skills & Certifications (Comma Separated)
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      placeholder="e.g. AC Foam Jet, Leak Fix, Schneider MCB, Inverter Repair"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              )}

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Complete Registration & Claim ₹200 Bonus</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode Switcher */}
          <div className="pt-2 text-center text-xs text-slate-500 font-medium">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setMode('signup');
                  }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Register with full details
                </button>
              </p>
            ) : (
              <p>
                Already have an UrgentLyfe account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setMode('login');
                  }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Sign in with Mobile OTP or Google
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

