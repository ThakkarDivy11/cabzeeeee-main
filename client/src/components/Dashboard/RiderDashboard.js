import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ChatBot from '../ChatBot/ChatBot';
import socketService from '../../services/socketService';

/* ── Scroll-reveal hook ───────────────────────────────── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ── Real sparkline generator per Design Rulebook §7.5 ── */
function sparkline(data, width = 120, height = 36) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');
  return points;
}

/* ── KPI Card ─────────────────────────────────────────── */
const KPICard = ({ label, value, sub, trend, trendLabel, icon, accent = false, delay = 0 }) => {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      data-reveal
      className={`
        rounded-3xl p-6 border relative overflow-hidden
        transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5 hover:border-purple-500/30
        backdrop-blur-sm
        ${accent
          ? 'bg-purple-700/20 border-purple-500/30 shadow-purple'
          : 'bg-white/5 border-white/10 shadow-level-1'
        }
      `}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      {/* Background glow decoration */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 ${accent ? 'bg-purple-500' : 'bg-purple-700'}`} />
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-500">
          {label}
        </p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold leading-none tracking-tight text-slate-100">
              {value}
            </p>
            {sub && (
              <p className="text-[10px] font-semibold uppercase tracking-wider mt-2 text-slate-600">
                {sub}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${accent ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}>
            <svg className={`w-6 h-6 ${accent ? 'text-purple-300' : 'text-purple-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {icon}
            </svg>
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"
                d={trend >= 0 ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
            </svg>
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Quick Action Card ─────────────────────────────────── */
const QuickActionCard = ({ icon, title, desc, action, to, accent = false, delay = 0 }) => {
  const navigate = useNavigate();
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      data-reveal
      onClick={() => navigate(to)}
      className={`
        group cursor-pointer rounded-3xl p-7 border relative overflow-hidden
        transition-all duration-300 hover:shadow-glow hover:-translate-y-1 active:scale-[0.97] backdrop-blur-sm
        ${accent
          ? 'bg-gradient-to-br from-purple-600/30 to-indigo-600/20 border-purple-500/40 text-white'
          : 'bg-white/5 border-white/10 text-slate-200 hover:border-purple-500/30'
        }
      `}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-20 transition-transform duration-300 group-hover:scale-125 ${accent ? 'bg-purple-400' : 'bg-purple-700'}`} />
      <div className="relative">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110 ${accent ? 'bg-purple-400/20' : 'bg-purple-500/10 group-hover:bg-purple-500/20'}`}>
          <svg className={`w-6 h-6 transition-colors ${accent ? 'text-purple-200' : 'text-purple-400 group-hover:text-purple-300'}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
        <h3 className="font-bold text-base mb-1.5 tracking-tight text-slate-100">{title}</h3>
        <p className="text-xs leading-relaxed mb-5 text-slate-500">{desc}</p>
        <div className={`pt-4 border-t flex items-center justify-between ${accent ? 'border-purple-500/20' : 'border-white/8'}`}>
          <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${accent ? 'text-purple-300' : 'text-purple-400 group-hover:text-purple-300'}`}>
            {action} →
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${accent ? 'bg-purple-400/70' : 'bg-purple-500 animate-pulse'}`} />
        </div>
      </div>
    </div>
  );
};

/* ── Empty State ───────────────────────────────────────── */
const EmptyState = ({ onBook }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-dashed border-purple-500/30 flex items-center justify-center mb-5">
      <svg className="w-9 h-9 text-purple-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
    <h3 className="text-lg font-bold text-slate-200 mb-2">Your trips live here</h3>
    <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-7">
      Once you complete a trip it will appear in your activity feed. Book your first ride to get started.
    </p>
    <button
      onClick={onBook}
      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold
        hover:from-purple-700 hover:to-indigo-700 active:scale-[0.97] transition-all duration-200 shadow-purple"
    >
      Book a Ride
    </button>
  </div>
);

const RiderDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ totalTrips: 0, completedTrips: 0, rating: 5.0 });
  const [activeRide, setActiveRide] = useState(null);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.role !== 'rider') { navigate('/login'); return; }
          setUser(parsed);
        }

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

        const [userResponse, statsResponse, activeResponse, ridesResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/rides/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/rides/active`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${apiUrl}/api/rides/my-rides`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const [userJson, statsJson, activeJson, ridesJson] = await Promise.all([
          userResponse.json(),
          statsResponse.json(),
          activeResponse.json(),
          ridesResponse.json()
        ]);

        if (userJson.success) {
          setUser(userJson.data);
          localStorage.setItem('user', JSON.stringify(userJson.data));
        }

        if (statsJson.success) {
          setStats(statsJson.data);
        }

        if (activeJson.success) {
          setActiveRide(activeJson.data || null);
        }

        if (ridesJson.success) {
          const rides = Array.isArray(ridesJson.data) ? ridesJson.data : [];
          // Show most recent completed rides first
          const completed = rides
            .filter(r => r && r.status === 'completed')
            .slice(0, 8);
          setRecentRides(completed);
        } else {
          setRecentRides([]);
        }
      } catch (err) {
        console.error('Rider dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (!activeRide?._id) return;

    // Connect and join ride room
    socketService.connect();
    socketService.joinRide(activeRide._id);

    // Listen for status updates
    socketService.onStatusUpdate((data) => {
      console.log('📡 Dashboard: Ride status updated:', data);
      
      // Update active ride state
      setActiveRide(prev => {
        if (!prev) return null;
        return { ...prev, ...data.ride, status: data.status };
      });

      if (data.status === 'accepted') {
        toast.success('Your ride has been accepted by a driver!', {
          icon: '🚗',
          duration: 5000
        });
      } else if (data.status === 'cancelled') {
        toast.error('The ride was cancelled.', { icon: '🚫' });
        setActiveRide(null);
      }
    });

    return () => {
      // Don't disconnect socket globally, just leave the room and remove listeners
      socketService.leaveRide(activeRide._id);
      socketService.removeAllListeners();
    };
  }, [activeRide?._id]);

  const handleResetWallet = async () => {
    if (!user) return;

    const confirmed = window.confirm('Are you sure you want to reset your wallet balance to ₹0.00? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token missing. Please login again.');
        return;
      }

      const payload = { userId: user._id };

      const response = await fetch(`${apiUrl}/api/wallet/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || 'Failed to reset wallet balance.');
        return;
      }

      const updatedUser = { ...user, walletBalance: 0 };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Wallet reset to ₹0.00');
    } catch (error) {
      console.error('Reset wallet error:', error);
      toast.error('An unexpected error occurred while resetting wallet.');
    }
  };

  const handleCancelRide = async (rideId) => {
    const confirmed = window.confirm('Are you sure you want to cancel this ride?');
    if (!confirmed) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/rides/${rideId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Ride cancelled');
        setActiveRide(null);
      } else {
        toast.error(data.message || 'Failed to cancel');
      }
    } catch (err) {
      console.error('Cancel ride error:', err);
      toast.error('Network error');
    }
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

  const quickActions = [
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />,
      title: 'Book a Ride',
      desc: 'Find available drivers near you in real time.',
      action: 'Open Map',
      to: '/book-ride-live',
      accent: true,
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
      title: 'Ride History',
      desc: 'Review all your past trips and receipts.',
      action: 'View History',
      to: '/ride-history',
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
      title: 'Payment',
      desc: 'View and manage your cards and wallet.',
      action: 'Manage',
      to: '/payment-methods',
    },
    {
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      title: 'My Profile',
      desc: 'Update personal info and preferences.',
      action: 'Edit Profile',
      to: '/user-profile',
    },
  ];

  const hourOfDay = new Date().getHours();
  const greeting = hourOfDay < 12 ? 'Good morning' : hourOfDay < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 pb-16">
      {/* Zone 3 — Page Header */}
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{greeting},</p>
        <h2 className="text-3xl font-bold text-slate-100 tracking-tight">{user.name?.split(' ')[0]} 👋</h2>
        <p className="text-sm text-slate-500 mt-1">Ready for your next ride? Let's go.</p>
      </div>

      {/* Zone 4 — Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <KPICard
          label="Total Rides"
          value={stats.totalTrips || '0'}
          sub="Recorded cycles"
          trend={0}
          trendLabel="All time"
          delay={0}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          }
        />
        <KPICard
          label="Passenger Rating"
          value={`${stats.rating || '5.0'}★`}
          sub="Your score"
          delay={60}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          }
        />
        <KPICard
          label="Wallet Balance"
          value={`₹${(user?.walletBalance || 0).toFixed(2)}`}
          sub="Available funds"
          accent
          delay={120}
          icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          }
        />
      </div>

    

      {/* Zone 5 — Quick Actions */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action, i) => (
            <QuickActionCard key={action.to} {...action} delay={i * 60} />
          ))}
        </div>
      </div>

      {/* Zone 6 — Activity Feed */}
      <div
        className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden shadow-level-1"
        data-reveal
      >
        <div className="px-7 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Activity Feed</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Your recent trips</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full">
            <div className="live-dot w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
        </div>
        <div className="px-7 py-6">
          {activeRide && (
            <div className="mb-6 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Active ride</p>
                <p className="text-sm font-bold text-slate-100 truncate mt-1">
                  {activeRide.pickupLocation?.address || 'Pickup'} → {activeRide.dropLocation?.address || 'Drop-off'}
                </p>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Status: <span className="font-bold text-purple-300">{activeRide.status}</span>
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleCancelRide(activeRide._id)}
                  className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => navigate(`/live-ride/${activeRide._id}`)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-purple"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {recentRides.length === 0 ? (
            <EmptyState onBook={() => navigate('/book-ride-live')} />
          ) : (
            <div className="space-y-3">
              {recentRides.map((r) => (
                <button
                  key={r._id}
                  onClick={() => navigate(`/live-ride/${r._id}`)}
                  className="w-full text-left rounded-2xl border border-white/10 hover:border-purple-500/30 hover:shadow-glow transition-all p-5 bg-white/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Completed</p>
                      <p className="text-sm font-bold text-slate-200 truncate mt-1">
                        {r.pickupLocation?.address || 'Pickup'} → {r.dropLocation?.address || 'Drop-off'}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold mt-1">
                        Fare: <span className="font-bold text-slate-300">₹{r.fare}</span>
                        {r.completedAt ? <span className="ml-2">• {new Date(r.completedAt).toLocaleString()}</span> : null}
                      </p>
                    </div>
                    <div className="shrink-0 text-xs font-black text-purple-400">View →</div>
                  </div>
                </button>
              ))}
              <div className="pt-2">
                <button
                  onClick={() => navigate('/ride-history')}
                  className="text-purple-400 text-xs font-bold uppercase tracking-widest hover:text-purple-300 transition-colors"
                >
                  View all rides →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <ChatBot />
    </div>
  );
};

export default RiderDashboard;
