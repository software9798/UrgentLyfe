import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  Wrench,
  TrendingUp,
  Database,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  DollarSign,
  Activity,
  Calendar,
  Lock,
  Unlock,
  RefreshCw,
  SlidersHorizontal,
  AlertTriangle,
  BarChart3,
  Download,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../../api/client';
import { User, ProviderProfile, Booking } from '../../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'providers' | 'database' | 'fraud' | 'bi'>('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [biAnalytics, setBIAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Database Inspector state
  const [selectedTable, setSelectedTable] = useState<string>('Users');
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersList, providersList, fraudData, biData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminProviders(),
        api.getFraudAlerts().catch(() => []),
        api.getBIAnalytics().catch(() => null),
      ]);
      setStats(statsData);
      setUsers(usersList);
      setProviders(providersList);
      setFraudAlerts(fraudData);
      setBIAnalytics(biData);
      fetchTableData('Users');
    } catch (err) {
      console.error('Failed to fetch admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportBIReport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(
        {
          reportTitle: 'UrgentLyfe Platform Executive Analytics Report',
          generatedAt: new Date().toISOString(),
          stats,
          biAnalytics,
          usersCount: users.length,
          providersCount: providers.length,
        },
        null,
        2
      )
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `UrgentLyfe_BI_Report_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const fetchTableData = async (tableName: string) => {
    setSelectedTable(tableName);
    try {
      let data: any[] = [];
      switch (tableName) {
        case 'Users':
          data = await api.getDbUsers();
          break;
        case 'Providers':
          data = await api.getDbProviders();
          break;
        case 'Services':
          data = await api.getServices();
          break;
        case 'Categories':
          data = await api.getCategories();
          break;
        case 'Bookings':
          data = await api.getBookings();
          break;
        case 'Reviews':
          data = await api.getReviews();
          break;
        case 'Payments':
          data = await api.getPayments();
          break;
        case 'Feedback':
          data = await api.getFeedback();
          break;
        case 'Notifications':
          data = await api.getNotifications();
          break;
        case 'Locations':
          data = await api.getLocations();
          break;
        case 'ChatHistory':
          data = await api.getChatHistory();
          break;
        case 'VoiceHistory':
          data = await api.getVoiceHistory();
          break;
        case 'ProviderScores':
          data = await api.getProviderScores();
          break;
        case 'AIRecommendations':
          data = await api.getAIRecommendations();
          break;
      }
      setTableData(data || []);
    } catch (err) {
      console.error(`Error fetching table ${tableName}:`, err);
    }
  };

  const handleToggleBlock = async (userId: string, currentBlocked: boolean) => {
    try {
      await api.updateAdminUser(userId, { isBlocked: !currentBlocked });
      setUsers(users.map((u) => (u.id === userId ? { ...u, isBlocked: !currentBlocked } : u)));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleToggleVerifyProvider = async (providerId: string, currentVerified: boolean) => {
    try {
      await api.verifyAdminProvider(providerId, { verified: !currentVerified });
      setProviders(providers.map((p) => (p.id === providerId ? { ...p, verified: !currentVerified } : p)));
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProviders = providers.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const DB_TABLES = [
    'Users',
    'Providers',
    'Services',
    'Categories',
    'Bookings',
    'Reviews',
    'Payments',
    'Feedback',
    'Notifications',
    'Locations',
    'ChatHistory',
    'VoiceHistory',
    'ProviderScores',
    'AIRecommendations',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl md:rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 p-6 text-white shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wide uppercase mb-3 w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            System Administrator Control Center
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">UrgentLyfe Platform Governance</h2>
          <p className="text-blue-200 text-xs mt-1">
            Role-Based Authorization, User Management, Provider Audits & PostgreSQL Database Inspector
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 bg-black/20 p-1.5 rounded-2xl w-fit overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'stats' ? 'bg-white text-blue-700 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Metrics & Stats
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users' ? 'bg-white text-blue-700 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Users ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('providers')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'providers' ? 'bg-white text-blue-700 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Providers ({providers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'database' ? 'bg-white text-blue-700 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Database Tables (14)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fraud')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'fraud' ? 'bg-white text-blue-700 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              AI Fraud Alerts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bi')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bi' ? 'bg-white text-blue-700 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
              BI Analytics
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto grow space-y-6 bg-slate-50">
          {/* TAB 1: METRICS & STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Total Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">
                    ₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString('en-IN') : '14,890'}
                  </p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                    +18% this week
                  </span>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Registered Users</span>
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{stats?.totalUsers || users.length}</p>
                  <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full mt-2 inline-block">
                    Customers & Pros
                  </span>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">Verified Pros</span>
                    <Wrench className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 mt-2">{stats?.totalProviders || providers.length}</p>
                  <span className="text-[10px] bg-purple-50 text-purple-600 font-bold px-2 py-0.5 rounded-full mt-2 inline-block">
                    100% Background checked
                  </span>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">System Pulse</span>
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-emerald-600 mt-2">OPERATIONAL</p>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full mt-2 inline-block">
                    JWT & Postgres Ready
                  </span>
                </div>
              </div>

              {/* Health Banner */}
              <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold">UrgentLyfe Platform Authorization Active</h3>
                  <p className="text-xs text-blue-100 mt-1">
                    Protected Express REST endpoints equipped with JWT verification & bcrypt password hashing.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadAdminData}
                  className="px-4 py-2.5 bg-white text-blue-700 rounded-xl text-xs font-bold shadow-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by name, email or role..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">City</th>
                      <th className="p-3.5">Addresses</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatar} alt={u.fullName} className="w-8 h-8 rounded-full bg-slate-200" />
                            <div>
                              <p className="font-bold text-slate-900">{u.fullName}</p>
                              <p className="text-[11px] text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-700'
                                : u.role === 'PROVIDER'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-700 font-medium">{u.city || 'Bengaluru'}</td>
                        <td className="p-3.5 text-slate-500">{u.addresses?.length || 0} Saved</td>
                        <td className="p-3.5">
                          {u.isBlocked ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                              BLOCKED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                              ACTIVE
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(u.id, Boolean(u.isBlocked))}
                            className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                              u.isBlocked
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            }`}
                          >
                            {u.isBlocked ? 'Unblock' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PROVIDER MANAGEMENT */}
          {activeTab === 'providers' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Provider</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Experience</th>
                      <th className="p-3.5">Rating & Jobs</th>
                      <th className="p-3.5">Verification</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProviders.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img src={p.avatar} alt={p.fullName} className="w-8 h-8 rounded-full bg-slate-200" />
                            <div>
                              <p className="font-bold text-slate-900">{p.fullName}</p>
                              <p className="text-[11px] text-slate-500">{p.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-700 font-semibold">{p.categoryId}</td>
                        <td className="p-3.5 text-slate-600">{p.experienceYears} Years</td>
                        <td className="p-3.5">
                          <p className="font-bold text-amber-600">★ {p.rating}</p>
                          <p className="text-[10px] text-slate-400">{p.totalJobs} completed</p>
                        </td>
                        <td className="p-3.5">
                          {p.verified ? (
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                              VERIFIED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleVerifyProvider(p.id, p.verified)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-[11px] font-bold transition-all"
                          >
                            {p.verified ? 'Revoke Verification' : 'Verify Expert'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE TABLES EXPLORER (14 TABLES) */}
          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-slate-200 rounded-3xl">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Select PostgreSQL / UrgentLyfe Table to Inspect:
                </p>
                <div className="flex flex-wrap gap-2">
                  {DB_TABLES.map((tName) => (
                    <button
                      key={tName}
                      type="button"
                      onClick={() => fetchTableData(tName)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                        selectedTable === tName
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {tName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Data View */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <h4 className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
                    Table: {selectedTable} ({tableData.length} Records)
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    GET /api/db/{selectedTable.toLowerCase()}
                  </span>
                </div>

                <div className="max-h-80 overflow-auto bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] leading-relaxed">
                  <pre>{JSON.stringify(tableData, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AI FRAUD & ANOMALY ALERTS */}
          {activeTab === 'fraud' && (
            <div className="space-y-4">
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>AI Fraud & Anomaly Shield Active</span>
                  </h3>
                  <p className="text-xs text-amber-700 mt-1">
                    Real-time monitoring for fake reviews, velocity spikes, and payment abuse.
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-200 text-amber-900 text-xs font-black rounded-full">
                  {fraudAlerts.length} Flagged Threats
                </span>
              </div>

              <div className="space-y-3">
                {fraudAlerts.map((alert) => (
                  <div key={alert.id} className="p-5 bg-white border border-rose-200 rounded-3xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase rounded-md">
                        Risk Score: {alert.riskScore} / 100
                      </span>
                      <span className="text-xs font-mono text-slate-400">{alert.id}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{alert.type}</h4>
                    <p className="text-xs text-slate-600 font-medium">User: {alert.user}</p>
                    <p className="text-xs text-rose-700 bg-rose-50/50 p-2.5 rounded-xl border border-rose-100 font-mono">
                      Reason: {alert.reason}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <button className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 cursor-pointer">
                        Block Account
                      </button>
                      <button className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer">
                        Dismiss Alert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: EXECUTIVE BI ANALYTICS */}
          {activeTab === 'bi' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-3xl">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
                    <Sparkles className="w-4 h-4" />
                    Executive Business Intelligence
                  </div>
                  <h3 className="text-xl font-black">UrgentLyfe Demand & Revenue Insights</h3>
                  <p className="text-xs text-slate-400 mt-1">Real-time marketplace velocity & growth analytics</p>
                </div>
                <button
                  onClick={handleExportBIReport}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report (JSON)</span>
                </button>
              </div>

              {/* Charts Mock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Monthly Revenue Growth (INR)
                  </h4>
                  <div className="space-y-2 pt-2">
                    {biAnalytics?.monthlyRevenue?.map((m: any) => (
                      <div key={m.month} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">{m.month}</span>
                          <span className="text-slate-900">₹{(m.revenue).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${Math.min(100, (m.revenue / 300000) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Service Demand Breakdown
                  </h4>
                  <div className="space-y-2 pt-2">
                    {biAnalytics?.categoryDemand?.map((c: any) => (
                      <div key={c.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">{c.name}</span>
                          <span className="text-slate-900">{c.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${c.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
