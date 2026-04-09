import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchDriverEarningsSummary } from '../../services/paymentSplitService';
import socketService from '../../services/socketService';

/* ── Scroll-reveal hook ── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); observer.unobserve(el); } },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── SVG Sparkline — from real data array ── */
const Sparkline = ({ data = [], color = '#0074D9', width = 100, height = 32 }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - 4 - ((v - min) / range) * (height - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" className="overflow-visible">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Data point dots */}
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - 4 - ((v - min) / range) * (height - 8);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
};

/* ── KPI Card with optional sparkline ── */
const KPICard = ({ label, value, sub, icon, accent = false, sparkData, sparkColor, delay = 0 }) => {
  const ref = useScrollReveal();

  const cardBg = accent
    ? 'bg-white border-[#e5e5e5] shadow-sm dark:bg-gradient-to-br dark:from-purple-600/25 dark:to-indigo-600/10 dark:border-purple-500/30 dark:shadow-level-2'
    : 'bg-white border-[#e5e5e5] shadow-sm dark:bg-[#111827]/70 dark:backdrop-blur dark:border-white/10 dark:shadow-level-1';

  return (
    <div
      ref={ref}
      data-reveal
      className={`
        rounded-2xl sm:rounded-3xl p-4 sm:p-6 border relative overflow-hidden
        transition-all duration-200 hover:shadow-glow hover:-translate-y-0.5
        ${cardBg}
      `}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      <div className="relative">
        <div className={`absolute -top-6 -right-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full opacity-10 ${accent ? 'bg-purple-400' : 'bg-purple-600'}`} />
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2 text-black dark:text-gray-400">{label}</p>
        <div className="flex items-end justify-between gap-3">
          <div className="flex-1">
            <p className="text-3xl font-bold tracking-tight leading-none text-black dark:text-white">{value}</p>
            {sub && <p className="text-[10px] font-semibold uppercase tracking-wider mt-2 text-black dark:text-gray-400">{sub}</p>}
            {sparkData && (
              <div className="mt-3">
                <Sparkline data={sparkData} color={sparkColor || (accent ? '#A78BFA' : '#7C3AED')} width={90} height={28} />
              </div>
            )}
          </div>
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border border-black/5 dark:border-white/10 ${accent ? 'bg-purple-500/15 dark:bg-purple-500/20' : 'bg-black/5 dark:bg-white/10'}`}>
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {icon}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Availability Toggle ── */
const AvailabilityToggle = ({ status, onToggle }) => {
  const isOnline = status === 'online';
  return (
    <div className={`
      flex items-center justify-between p-5 rounded-2xl border
      transition-all duration-300
      ${isOnline
        ? 'bg-white border-[#e5e5e5] shadow-sm dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:shadow-level-1'
        : 'bg-white border-[#e5e5e5] shadow-sm dark:bg-white/5 dark:border-white/10 dark:shadow-level-1'
      }
    `}>
      <div className="flex items-center gap-3">
        <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isOnline ? 'bg-emerald-500 text-white' : 'bg-black/5 text-black dark:bg-white/10 dark:text-gray-400'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isOnline && <div className="live-dot absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#020617]" />}
        </div>
        <div>
          <p className={`font-semibold text-sm leading-tight ${isOnline ? 'text-black dark:text-emerald-400' : 'text-black dark:text-gray-400'}`}>
            {isOnline ? 'You\'re Online' : 'You\'re Offline'}
          </p>
          <p className="text-xs text-black dark:text-gray-400 leading-tight">{isOnline ? 'Accepting new rides' : 'Not visible to riders'}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`
          relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-[#020617]
          transition-all duration-300
          ${isOnline ? 'bg-emerald-500 focus:ring-emerald-500/30' : 'bg-black/15 focus:ring-black/10 dark:bg-white/15 dark:focus:ring-white/20'}
        `}
        style={{ transition: 'background-color 0.3s cubic-bezier(0.4,0,0.2,1)' }}
        aria-checked={isOnline}
        role="switch"
      >
        <span
          className="inline-block h-6 w-6 rounded-full bg-white shadow-md"
          style={{
            transform: isOnline ? 'translateX(28px)' : 'translateX(4px)',
            transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </button>
    </div>
  );
};

/* ── Quick Action Card ── */
const QuickActionCard = ({ icon, title, desc, action, to, color = 'navy', delay = 0 }) => {
  const navigate = useNavigate();
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      data-reveal
      onClick={() => navigate(to)}
      className="group cursor-pointer rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white/5 backdrop-blur-sm border border-white/10
        hover:shadow-glow hover:border-purple-500/30 hover:-translate-y-1 active:scale-[0.97] transition-all duration-200 relative overflow-hidden"
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-5 bg-purple-500 transition-transform duration-300 group-hover:scale-150" />
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-200">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
      </div>
      <h3 className="font-bold text-sm text-slate-200 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-4">{desc}</p>
      <div className="pt-3 border-t border-white/10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">{action} →</span>
      </div>
    </div>
  );
};

/* ── Main Driver Dashboard ── */
const DriverDashboard = () => {
  const [user, setUser] = useState(null);
  const [driverStatus, setDriverStatus] = useState('offline');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ todayEarnings: 0, totalRides: 0, rating: 5.0, onlineHours: 0 });
  const [rideRequests, setRideRequests] = useState([]);
  const [activeRide, setActiveRide] = useState(null);
  const [splitSummary, setSplitSummary] = useState({
    totalEarning: 0,
    rideCount: 0,
    detail: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.role !== 'driver') { navigate('/login'); return; }
          setUser(parsed);
          setDriverStatus(parsed.driverStatus || 'offline');
          setStats({
            todayEarnings: parsed.todayEarnings || 0,
            totalRides: parsed.totalRides || 0,
            rating: parsed.rating || 5.0,
            onlineHours: parsed.onlineHours || 0,
          });
        }
        const [userResponse, earningsResponse, activeRideResponse, statsResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/earnings?period=today`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/active`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/stats`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const [userJson, earningsData, activeData, statsJson] = await Promise.all([
          userResponse.json(),
          earningsResponse.json(),
          activeRideResponse.json(),
          statsResponse.json()
        ]);

        if (userJson.success) {
          setUser(userJson.data);
          localStorage.setItem('user', JSON.stringify(userJson.data));
          setDriverStatus(userJson.data.driverStatus || 'offline');
          
          // Combine user stats with real earnings stats and trip stats
          const realEarnings = earningsData.success ? earningsData.data.earnings : null;
          const realStats = statsJson.success ? statsJson.data : null;
          
          setStats({
            todayEarnings: realEarnings ? realEarnings.today : (userJson.data.todayEarnings || 0),
            totalRides: realStats ? realStats.totalTrips : (userJson.data.totalRides || 0),
            rating: realStats ? realStats.rating : (userJson.data.rating || 5.0),
            onlineHours: userJson.data.onlineHours || 0,
          });
        }
        
        if (activeData && activeData.success && activeData.data) {
          localStorage.setItem('activeRide', JSON.stringify(activeData.data));
          setActiveRide(activeData.data);
          
          // Join socket room for the active ride to listen for cancellations
          socketService.connect();
          socketService.joinRide(activeData.data._id);
          socketService.onStatusUpdate((data) => {
            if (data.status === 'cancelled') {
              toast.error('Mission Terminated: The rider has cancelled.', { 
                icon: '🚫',
                duration: 6000
              });
              setActiveRide(null);
              localStorage.removeItem('activeRide');
              setDriverStatus('online');

              // Sync local user state so availability toggle looks correct
              setUser(prev => {
                if (!prev) return prev;
                const updatedUser = { ...prev, driverStatus: 'online' };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                return updatedUser;
              });
            }
          });
        } else {
          localStorage.removeItem('activeRide');
          setActiveRide(null);
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();

    return () => {
      socketService.removeAllListeners();
    };
  }, [navigate]);

  useEffect(() => {
    const loadSplitSummary = async () => {
      try {
        const payload = await fetchDriverEarningsSummary();
        if (payload.success) {
          setSplitSummary(payload.data);
        }
      } catch (err) {
        console.error('Failed to load split summary', err);
      }
    };
    loadSplitSummary();
  }, []);

  useEffect(() => {
    let interval;
    if (driverStatus === 'online') {
      const fetchRequests = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setRideRequests(data.data || []);
            } else {
              setRideRequests([]);
            }
          }
        } catch (err) {
          console.error('Error fetching pending requests:', err);
        }
      };
      
      fetchRequests();
      interval = setInterval(fetchRequests, 10000); // Poll every 10 seconds
    } else {
      setRideRequests([]);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [driverStatus]);

  const toggleAvailability = async () => {
    const isVerified = user?.documents?.insurance?.verified
      && user?.documents?.license?.verified
      && user?.documents?.registration?.verified;
    if (!isVerified) {
      toast.error('Please complete document verification to go online.');
      return;
    }
    const newStatus = driverStatus === 'online' ? 'offline' : 'online';
    setDriverStatus(newStatus);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/me`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ driverStatus: newStatus }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          localStorage.setItem('user', JSON.stringify(data.data));
          toast.success(newStatus === 'online' ? 'You\'re now online!' : 'You\'re now offline');
        }
      }
    } catch (err) {
      toast.success(newStatus === 'online' ? 'You\'re now online!' : 'You\'re now offline');
    }
  };

  const handleViewRequest = (request) => {
    localStorage.setItem('selectedRideRequest', JSON.stringify(request));
    navigate('/accept-reject-ride');
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton rounded-xl" style={{ width: 120, height: 6 }} />
          <div className="skeleton rounded-xl" style={{ width: 80, height: 6 }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Functional weekly earnings data for sparkline (using actual today's earnings)
  const weeklyEarnings = user.weeklyEarnings || [0, 0, 0, 0, 0, 0, stats.todayEarnings || 0];
  const hourOfDay = new Date().getHours();
  const greeting = hourOfDay < 12 ? 'Good morning' : hourOfDay < 17 ? 'Good afternoon' : 'Good evening';

  const quickActions = [
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
      title: 'Incoming Requests', desc: 'Monitor passenger requests in real time.', action: 'View Requests', to: '/incoming-ride-request', color: 'blue',
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      title: 'Documents', desc: 'Review and update your certifications.', action: 'Manage Docs', to: '/driver/documents', color: 'navy',
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
      title: 'Trip History', desc: 'Browse all your completed trips.', action: 'View History', to: '/driver-ride-history', color: 'green',
    },
    {
      icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></>,
      title: 'Earnings', desc: 'View performance metrics and revenue.', action: 'See Earnings', to: '/driver-earnings', color: 'amber',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Zone 3 — Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 font-medium">{greeting},</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">{user.name?.split(' ')[0]} 🚗</h2>
        </div>
        {/* Availability toggle — this is the primary action: prominent at top-right */}
        <div className="sm:w-72">
          <AvailabilityToggle status={driverStatus} onToggle={toggleAvailability} />
        </div>
      </div>

      {/* Active Mission Prompt — high priority if the driver has an ongoing ride */}
      {activeRide && (
        <div className="bg-white border border-[#e5e5e5] shadow-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row items-center gap-4 sm:gap-6 relative overflow-hidden group dark:bg-gradient-to-r dark:from-purple-900/40 dark:to-indigo-900/40 dark:shadow-2xl dark:border-purple-500/30">
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-purple-500/[0.05] rounded-full -mr-24 -mt-24 sm:-mr-32 sm:-mt-32 transition-transform duration-700 group-hover:scale-110"></div>
          
          <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 border border-purple-500/30">
            <svg className="w-8 h-8 text-purple-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          
          <div className="flex-1 text-center md:text-left relative z-10">
            <p className="font-black text-[10px] text-purple-400 uppercase tracking-[0.3em] mb-1">Mission Live</p>
            <h3 className="font-bold text-xl text-black dark:text-white mb-1">You have an ongoing deployment</h3>
            <p className="text-sm text-black dark:text-gray-400">Client: {activeRide.rider?.name || 'Authenticated Client'} • Fare: ₹{activeRide.fare}</p>
          </div>
          
          <button
            onClick={() => navigate('/active-ride')}
            className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all transform active:scale-95 shadow-purple relative z-10"
          >
            Resume Mission
          </button>
        </div>
      )}

      {/* Vehicle setup prompt — if no vehicle registered */}
      {!user.vehicleInfo && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-300 text-sm">Vehicle registration required</p>
            <p className="text-xs text-amber-400/70 mt-0.5">Add your vehicle details to start accepting rides.</p>
          </div>
          <button
            onClick={() => navigate('/vehicle-details')}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold rounded-lg hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition-all duration-150 whitespace-nowrap flex-shrink-0"
          >
            Add vehicle
          </button>
        </div>
      )}

      {/* Zone 4 — Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Today's Earnings"
          value={`₹${stats.todayEarnings}`}
          sub="Diurnal yield"
          sparkData={weeklyEarnings}
          sparkColor="#16a34a"
          delay={0}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />}
        />
        <KPICard
          label="Total Trips"
          value={stats.totalRides}
          sub="All time"
          delay={60}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
        />
        <KPICard
          label="Rating"
          value={`${stats.rating}★`}
          sub="Avg score"
          delay={120}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />}
        />
        <KPICard
          label="Online Hours"
          value={`${stats.onlineHours}h`}
          sub="Today"
          accent
          delay={180}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
      </div>

      {/* Zone 5 — Quick actions */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <QuickActionCard key={action.to} {...action} delay={i * 60} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Split Earnings Overview</p>
          <h3 className="text-3xl font-black text-slate-100 tracking-tight mb-1">₹{splitSummary.totalEarning?.toFixed?.(2) || '0.00'}</h3>
          <p className="text-xs text-slate-400 uppercase tracking-[0.3em] mb-4">{splitSummary.rideCount || 0} completed splits</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            80% of every fare is stored here as your payable earnings. This section pulls directly from the payment split ledger.
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Latest splits</p>
            <span className="text-[10px] uppercase tracking-widest text-purple-400">{splitSummary.detail?.length || 0} rides</span>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {splitSummary.detail?.length > 0 ? splitSummary.detail.map((split) => (
              <div key={split._id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs text-slate-200">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-100 truncate">Ride {split?.rideId?.fare ? `₹${split.rideId.fare}` : split.rideId?._id?.slice(0, 8)}</p>
                  <p className="text-[11px] text-slate-400 truncate">Status: {split?.paymentStatus}</p>
                </div>
                <p className="text-right text-slate-100">₹{split.driverEarning.toFixed(2)}</p>
              </div>
            )) : (
              <p className="text-sm text-slate-500">No split records yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Zone 6 — Dispatch status */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/10 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Dispatch Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your ride visibility on the network</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${driverStatus === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${driverStatus === 'online' ? 'bg-emerald-400 live-dot' : 'bg-slate-600'}`} />
            {driverStatus}
          </div>
        </div>

        {driverStatus === 'online' && rideRequests.length > 0 ? (
          <div className="p-4 sm:p-6 space-y-4">
            {rideRequests.map((request) => (
              <div key={request._id} className="bg-white/5 backdrop-blur-sm shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 group hover:scale-[1.01] hover:border-purple-500/30 transition-all duration-300 relative">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600 group-hover:bg-purple-400 transition-colors"></div>
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black italic shadow-lg">
                        {request.rider?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Incoming Request</p>
                        <h3 className="text-xl font-bold text-slate-100 tracking-tight">{request.rider?.name || 'Rider'}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="ml-1.5 text-xs font-bold text-slate-300">{request.rider?.rating || '5.0'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right w-full md:w-auto">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Proposed Fare</p>
                      <p className="text-3xl font-black text-slate-100 tracking-tighter">₹{request.fare}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 bg-white/[0.03] p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/5 items-center">
                    <div className="space-y-4 lg:col-span-2">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2.5 h-2.5 bg-emerald-500 rounded-full mt-1.5 shadow-md"></div>
                        <div className="ml-4">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Pickup</p>
                          <p className="text-sm font-semibold text-slate-200 leading-tight">{request.pickupLocation?.address || 'Restricted Area'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-2.5 h-2.5 bg-red-500 rounded-full mt-1.5 shadow-md"></div>
                        <div className="ml-4">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Drop</p>
                          <p className="text-sm font-semibold text-slate-200 leading-tight">{request.dropLocation?.address || 'Undisclosed'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end lg:col-span-1 mt-2 lg:mt-0 w-full">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:from-purple-500 hover:to-indigo-500 shadow-purple hover:-translate-y-0.5 transition-all flex items-center justify-center group/btn"
                      >
                        Initiate Mission
                        <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-14 text-center px-6">
            <div className="w-16 h-16 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center mb-4 relative">
              {driverStatus === 'online' && (
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 animate-ping" />
              )}
              <svg className={`w-7 h-7 ${driverStatus === 'online' ? 'text-purple-400' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.5 9.5 0 0113.436 0m-17.678-4.242a14.5 14.5 0 0120.661 0" />
              </svg>
            </div>
            <h3 className="font-bold text-slate-200 text-base mb-1">
              {driverStatus === 'online' ? 'Waiting for requests' : 'You\'re offline'}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              {driverStatus === 'online'
                ? 'You\'re visible to nearby riders. Incoming requests will appear here.'
                : 'Toggle online above to start receiving ride requests from nearby riders.'}
            </p>
            {driverStatus === 'offline' && (
              <button
                onClick={toggleAvailability}
                className="mt-6 px-7 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 active:scale-[0.97] transition-all duration-150 shadow-purple"
                style={{ transition: 'background-color 0.15s ease, transform 0.08s ease' }}
              >
                Go Online
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
