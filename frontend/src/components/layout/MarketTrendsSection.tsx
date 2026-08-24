import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Zap,
  Calendar,
  AlertCircle,
  Sparkles,
  Info,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface MarketTrendsSectionProps {
  onQuickSOS?: () => void;
}

// 30-Day simulated dynamic demand data based on realistic urban service patterns
const generate30DayDemandData = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const isWeekend = dayName === 'Sat' || dayName === 'Sun';

    // Base demand + weekend bump + natural fluctuation
    const baseDemand = isWeekend ? 130 + Math.floor(Math.random() * 35) : 80 + Math.floor(Math.random() * 30);
    const acDemand = Math.round(baseDemand * 0.42 + Math.random() * 8);
    const electricalDemand = Math.round(baseDemand * 0.24 + Math.random() * 6);
    const plumbingDemand = Math.round(baseDemand * 0.18 + Math.random() * 5);
    const applianceDemand = Math.round(baseDemand * 0.16 + Math.random() * 4);
    const urgentSosCount = Math.round(baseDemand * 0.32);

    data.push({
      date: dateStr,
      day: dayName,
      totalOrders: baseDemand,
      urgentSos: urgentSosCount,
      ac: acDemand,
      electrical: electricalDemand,
      plumbing: plumbingDemand,
      appliance: applianceDemand,
      avgWaitTimeMinutes: isWeekend ? 28 : 18,
    });
  }
  return data;
};

// 24-Hour Peak Booking Hour Distribution (Hourly Demand)
const HOURLY_PEAK_DATA = [
  { hour: '6 AM', label: '6:00 AM', demand: 18, status: 'off-peak', waitTime: 15, surge: '1.0x' },
  { hour: '7 AM', label: '7:00 AM', demand: 32, status: 'off-peak', waitTime: 16, surge: '1.0x' },
  { hour: '8 AM', label: '8:00 AM', demand: 68, status: 'moderate', waitTime: 20, surge: '1.0x' },
  { hour: '9 AM', label: '9:00 AM', demand: 110, status: 'peak', waitTime: 32, surge: '1.1x' },
  { hour: '10 AM', label: '10:00 AM', demand: 135, status: 'peak', waitTime: 38, surge: '1.15x' },
  { hour: '11 AM', label: '11:00 AM', demand: 125, status: 'peak', waitTime: 34, surge: '1.1x' },
  { hour: '12 PM', label: '12:00 PM', demand: 90, status: 'moderate', waitTime: 22, surge: '1.0x' },
  { hour: '1 PM', label: '1:00 PM', demand: 65, status: 'off-peak', waitTime: 17, surge: '1.0x' },
  { hour: '2 PM', label: '2:00 PM', demand: 55, status: 'off-peak', waitTime: 15, surge: '1.0x' },
  { hour: '3 PM', label: '3:00 PM', demand: 62, status: 'off-peak', waitTime: 16, surge: '1.0x' },
  { hour: '4 PM', label: '4:00 PM', demand: 85, status: 'moderate', waitTime: 21, surge: '1.0x' },
  { hour: '5 PM', label: '5:00 PM', demand: 115, status: 'peak', waitTime: 30, surge: '1.1x' },
  { hour: '6 PM', label: '6:00 PM', demand: 150, status: 'super-peak', waitTime: 42, surge: '1.2x' },
  { hour: '7 PM', label: '7:00 PM', demand: 165, status: 'super-peak', waitTime: 45, surge: '1.25x' },
  { hour: '8 PM', label: '8:00 PM', demand: 140, status: 'peak', waitTime: 36, surge: '1.15x' },
  { hour: '9 PM', label: '9:00 PM', demand: 95, status: 'moderate', waitTime: 24, surge: '1.0x' },
  { hour: '10 PM', label: '10:00 PM', demand: 50, status: 'off-peak', waitTime: 19, surge: '1.0x' },
  { hour: '11 PM', label: '11:00 PM', demand: 28, status: 'off-peak', waitTime: 15, surge: '1.0x' },
];

// Category Share Pie Data
const CATEGORY_SHARE_DATA = [
  { name: 'AC & Cooling', value: 42, color: '#3B82F6', growth: '+18% MoM' },
  { name: 'Electrical & Power', value: 24, color: '#F59E0B', growth: '+12% MoM' },
  { name: 'Plumbing & Leakage', value: 18, color: '#06B6D4', growth: '+8% MoM' },
  { name: 'Appliance Repair', value: 11, color: '#8B5CF6', growth: '+15% MoM' },
  { name: 'Home Deep Cleaning', value: 5, color: '#10B981', growth: '+22% MoM' },
];

// Day of Week Peak Patterns
const DAY_OF_WEEK_DATA = [
  { day: 'Mon', totalBookings: 640, avgArrivalMins: 18, peakWindow: '6 PM - 8 PM' },
  { day: 'Tue', totalBookings: 580, avgArrivalMins: 16, peakWindow: '10 AM - 12 PM' },
  { day: 'Wed', totalBookings: 590, avgArrivalMins: 17, peakWindow: '5 PM - 7 PM' },
  { day: 'Thu', totalBookings: 610, avgArrivalMins: 17, peakWindow: '6 PM - 8 PM' },
  { day: 'Fri', totalBookings: 720, avgArrivalMins: 22, peakWindow: '5 PM - 9 PM' },
  { day: 'Sat', totalBookings: 1150, avgArrivalMins: 32, peakWindow: '9 AM - 1 PM' },
  { day: 'Sun', totalBookings: 1280, avgArrivalMins: 36, peakWindow: '10 AM - 2 PM' },
];

export const MarketTrendsSection: React.FC<MarketTrendsSectionProps> = ({ onQuickSOS }) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | 'ac' | 'electrical' | 'plumbing' | 'appliance'>('all');
  const [timeRange, setTimeRange] = useState<'30d' | '14d' | '7d'>('30d');

  const rawDemandData = useMemo(() => generate30DayDemandData(), []);

  const filteredDemandData = useMemo(() => {
    let sliceCount = 30;
    if (timeRange === '14d') sliceCount = 14;
    if (timeRange === '7d') sliceCount = 7;
    return rawDemandData.slice(-sliceCount);
  }, [rawDemandData, timeRange]);

  const currentHour = new Date().getHours();
  const currentSlot = HOURLY_PEAK_DATA.find((slot) => {
    const hourNum = parseInt(slot.hour);
    const isPM = slot.hour.includes('PM');
    const adjustedHour = isPM && hourNum !== 12 ? hourNum + 12 : !isPM && hourNum === 12 ? 0 : hourNum;
    return adjustedHour === currentHour;
  }) || HOURLY_PEAK_DATA[10];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Smart Booking Advisor Insight */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time Market Demand & Pricing Trends</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Optimize Your Booking Time for Faster Arrival & Best Rates
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              UrgentLyfe tracks real-time technician workload across localities. Book during recommended off-peak windows to enjoy <span className="text-emerald-400 font-bold">15-minute express dispatch</span> and zero wait times.
            </p>
          </div>

          {/* Current Slot Live Pulse */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 w-full md:w-auto text-left md:text-right space-y-1">
            <div className="flex items-center md:justify-end gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Current Time: {currentSlot.label}
              </span>
            </div>
            <p className="text-lg font-black text-white">
              Status:{' '}
              <span
                className={
                  currentSlot.status.includes('peak') ? 'text-amber-400' : 'text-emerald-400'
                }
              >
                {currentSlot.status.toUpperCase()}
              </span>
            </p>
            <p className="text-xs text-slate-300">
              Avg dispatch wait: <span className="font-bold text-white">{currentSlot.waitTime} mins</span>
            </p>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Best Booking Window</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900">1:00 PM – 4:00 PM</p>
          <p className="text-[11px] text-emerald-600 font-bold">✓ 35% faster arrival rates</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Highest Demand Peak</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900">6:00 PM – 8:30 PM</p>
          <p className="text-[11px] text-rose-600 font-bold">⚠️ High evening rush</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Fastest Response Day</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900">Tuesdays & Wednesdays</p>
          <p className="text-[11px] text-blue-600 font-bold">16 mins average arrival</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Top In-Demand Category</span>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg sm:text-xl font-black text-slate-900">Power AC Jet Wash</p>
          <p className="text-[11px] text-indigo-600 font-bold">42% of total city orders</p>
        </div>
      </div>

      {/* CHART 1: 30-Day Service Demand Timeline (Recharts AreaChart) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              30-Day Service Demand Trends & Daily Order Volume
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Track volume spikes, emergency 30-min SOS bookings, and weekday vs weekend workload
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Time range selector */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === '7d' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange('14d')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === '14d' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                14 Days
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeRange === '30d' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'
                }`}
              >
                30 Days
              </button>
            </div>

            {/* Category breakdown filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-600 cursor-pointer"
            >
              <option value="all">All Service Categories</option>
              <option value="ac">AC & Cooling Only</option>
              <option value="electrical">Electrical Only</option>
              <option value="plumbing">Plumbing Only</option>
              <option value="appliance">Appliance Only</option>
            </select>
          </div>
        </div>

        {/* Recharts Area Chart Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredDemandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="totalOrdersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="urgentSosGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="acGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1 gap-4">
                          <span className="font-bold text-slate-200">
                            {label} ({data.day})
                          </span>
                          <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">
                            {data.avgWaitTimeMinutes}m avg arrival
                          </span>
                        </div>
                        <div className="space-y-1 text-[11px]">
                          <p className="flex justify-between gap-4 text-indigo-300">
                            <span>Total Bookings:</span>
                            <span className="font-bold text-white">{data.totalOrders}</span>
                          </p>
                          <p className="flex justify-between gap-4 text-amber-300">
                            <span>Emergency SOS:</span>
                            <span className="font-bold text-white">{data.urgentSos}</span>
                          </p>
                          <p className="flex justify-between gap-4 text-blue-300">
                            <span>AC & Cooling:</span>
                            <span className="font-bold text-white">{data.ac}</span>
                          </p>
                          <p className="flex justify-between gap-4 text-cyan-300">
                            <span>Electrical / Plumbing:</span>
                            <span className="font-bold text-white">{data.electrical + data.plumbing}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                iconType="circle"
              />

              {selectedCategoryFilter === 'all' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="totalOrders"
                    name="Total Service Bookings"
                    stroke="#4F46E5"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#totalOrdersGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="urgentSos"
                    name="30-Min Emergency SOS"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#urgentSosGradient)"
                  />
                </>
              ) : selectedCategoryFilter === 'ac' ? (
                <Area
                  type="monotone"
                  dataKey="ac"
                  name="AC & Cooling Demand"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#acGradient)"
                />
              ) : selectedCategoryFilter === 'electrical' ? (
                <Area
                  type="monotone"
                  dataKey="electrical"
                  name="Electrical Demand"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#urgentSosGradient)"
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="plumbing"
                  name="Plumbing Demand"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#totalOrdersGradient)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column Grid: Hourly Peak Hours + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 2: Hourly Peak Hours & Wait Times (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Hourly Peak Booking Times (24-Hour City Activity)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bars show order intensity by hour. Green bars indicate fastest technician availability.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Off-Peak (Fastest)
              </span>
              <span className="flex items-center gap-1 text-indigo-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Moderate
              </span>
              <span className="flex items-center gap-1 text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Rush / Peak
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_PEAK_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const isPeak = item.status.includes('peak');
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                          <p className="font-extrabold text-slate-200 border-b border-slate-800 pb-1">
                            {item.label}
                          </p>
                          <p className="flex justify-between gap-3 text-slate-300">
                            <span>Demand Volume:</span>
                            <span className="font-bold text-white">{item.demand} requests/hr</span>
                          </p>
                          <p className="flex justify-between gap-3 text-slate-300">
                            <span>Avg Arrival Time:</span>
                            <span
                              className={`font-bold ${
                                isPeak ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {item.waitTime} minutes
                            </span>
                          </p>
                          <p className="flex justify-between gap-3 text-slate-300">
                            <span>Pricing Multiplier:</span>
                            <span className="font-bold text-amber-400">{item.surge}</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="demand" radius={[6, 6, 0, 0]}>
                  {HOURLY_PEAK_DATA.map((entry, index) => {
                    let fillColor = '#10B981'; // off-peak green
                    if (entry.status === 'moderate') fillColor = '#6366F1'; // moderate indigo
                    if (entry.status === 'peak') fillColor = '#F59E0B'; // peak amber
                    if (entry.status === 'super-peak') fillColor = '#EF4444'; // super-peak rose
                    return <Cell key={`cell-${index}`} fill={fillColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick takeaway banner */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Info className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Smart Tip:</strong> Booking between <strong>1:00 PM – 4:00 PM</strong> gets you 15-minute technician dispatch and 0% surge charges.
              </span>
            </div>
            {onQuickSOS && (
              <button
                onClick={onQuickSOS}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ml-2"
              >
                Book Now
              </button>
            )}
          </div>
        </div>

        {/* CHART 3: Category Demand Share (Pie Chart) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Category Demand Share
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              30-day percentage distribution of booked urban home services
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_SHARE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {CATEGORY_SHARE_DATA.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-0.5 border border-slate-800">
                          <p className="font-bold text-slate-200">{item.name}</p>
                          <p className="text-indigo-400 font-extrabold">{item.value}% market share</p>
                          <p className="text-[10px] text-emerald-400 font-semibold">{item.growth}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Category Legend List */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            {CATEGORY_SHARE_DATA.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{cat.value}%</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">
                    {cat.growth}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHART 4: Day of Week Workload & Arrival Times */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Weekly Day-by-Day Booking Intensity & Dispatch Times
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare booking volumes (bars) against average technician arrival times in minutes (purple line)
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={DAY_OF_WEEK_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                unit="m"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-800">
                        <p className="font-extrabold text-indigo-300 border-b border-slate-800 pb-1">
                          {label} (Day Overview)
                        </p>
                        <p className="flex justify-between gap-4 text-slate-300">
                          <span>Total City Orders:</span>
                          <span className="font-bold text-white">{d.totalBookings}</span>
                        </p>
                        <p className="flex justify-between gap-4 text-amber-300">
                          <span>Avg Arrival Time:</span>
                          <span className="font-bold text-white">{d.avgArrivalMins} minutes</span>
                        </p>
                        <p className="flex justify-between gap-4 text-slate-400">
                          <span>Daily Peak Window:</span>
                          <span className="font-semibold text-slate-200">{d.peakWindow}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="totalBookings" name="Total City Bookings" fill="#6366F1" radius={[6, 6, 0, 0]} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgArrivalMins"
                name="Avg Arrival Wait (Minutes)"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ r: 4, fill: '#EF4444' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
