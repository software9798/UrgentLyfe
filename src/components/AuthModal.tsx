import React, { useState } from 'react';
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
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [showPassword, setShowPassword] = useState(false);

  // Provider specific fields
  const [skills, setSkills] = useState<string>('Electrical, AC Repair');
  const [experienceYears, setExperienceYears] = useState<number>(5);
  const [categoryId, setCategoryId] = useState<string>('ac-appliance');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let response: AuthResponse;
      if (mode === 'login') {
        response = await api.login({ email, password, role });
      } else {
        const skillsArray = skills.split(',').map((s) => s.trim()).filter(Boolean);
        response = await api.signup({
          email,
          password,
          fullName,
          phone,
          role,
          city,
          skills: skillsArray,
          experienceYears: Number(experienceYears),
          categoryId,
        });
      }

      localStorage.setItem('urgentlyfe_jwt', response.token);
      onSuccess(response);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="relative w-full max-w-lg bg-white rounded-3xl md:rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Header Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 md:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Secure UrgentLyfe Auth Engine
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {mode === 'login' ? 'Welcome Back!' : 'Create UrgentLyfe Account'}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Access instant SOS repairs, partner tools, or system admin controls.
          </p>

          {/* Role selector pills */}
          <div className="grid grid-cols-3 gap-2 mt-5 bg-black/20 p-1.5 rounded-2xl backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
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
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
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
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
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

        {/* Form Body */}
        <div className="p-6 md:p-8 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-bounce">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Login Preset Buttons */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-2 text-center">
              ⚡ Instant 1-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('CUSTOMER')}
                className="py-1.5 px-2 bg-white border border-blue-200 rounded-xl text-[11px] font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all text-center shadow-xs"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('PROVIDER')}
                className="py-1.5 px-2 bg-white border border-blue-200 rounded-xl text-[11px] font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all text-center shadow-xs"
              >
                Provider
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('ADMIN')}
                className="py-1.5 px-2 bg-white border border-blue-200 rounded-xl text-[11px] font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-all text-center shadow-xs"
              >
                System Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Mehta"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {role === 'PROVIDER' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Primary Service Category
                      </label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Experience (Yrs)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="40"
                          value={experienceYears}
                          onChange={(e) => setExperienceYears(Number(e.target.value))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Key Skills (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. AC Foam Jet, Leak Fix, Schneider MCB"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@urgentlyfe.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In as {role.charAt(0) + role.slice(1).toLowerCase()}
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register as {role.charAt(0) + role.slice(1).toLowerCase()}
                </>
              )}
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="pt-2 text-center text-xs text-slate-500 font-medium">
            {mode === 'login' ? (
              <p>
                Don't have an UrgentLyfe account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('signup');
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('login');
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
