import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ChatBot from '../ChatBot/ChatBot';
import socketService from '../../services/socketService';

/* ── Scroll-reveal hook — Source: Design System ── */
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

/* ── KPI Card — Noir Velocity Style ── */
const KPICard = ({ label, value, sub, icon, accent = false, delay = 0 }) => {
  const ref = useScrollReveal();
  return (
    <div
      ref={ref}
      data-reveal
      className={`
        rounded-3xl p-6 border relative overflow-hidden transition-all duration-500 hover:scale-[1.02]
        cz-glass group
        ${accent ? 'border-yellow-500/30' : 'border-[var(--border)]'}
      `}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 ${accent ? 'bg-yellow-500' : 'bg-teal-500'}`} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)]">
            {label}
          </p>
          <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${accent ? 'text-yellow-500' : 'text-[var(--text)]'}`}>
            <svg className="w-5 h-5 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {icon}
            </svg>
          </div>
        </div>

        <div className="flex flex-col">
          <h3 className={`text-4xl cz-bebas tracking-wider leading-none ${accent ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(255,208,0,0.3)]' : 'text-[var(--text)]'}`}>
            {value}
          </h3>
          {sub && (
            <p className="text-[9px] font-bold uppercase tracking-widest mt-2 text-[var(--muted)] opacity-80">
              {sub}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Quick Action — Mission Control Style ── */
const QuickAction = ({ icon, title, desc, to, accent = false, delay = 0 }) => {
  const navigate = useNavigate();
  const ref = useScrollReveal();
  return (
    <button
      ref={ref}
      data-reveal
      onClick={() => navigate(to)}
      className={`
        group relative flex flex-col p-6 rounded-3xl border transition-all duration-500 text-left
        ${accent
          ? 'bg-yellow-500 border-yellow-400 shadow-[0_20px_40px_rgba(255,208,0,0.2)]'
          : 'cz-glass border-[var(--border)] hover:border-yellow-500/30'}
      `}
      style={{ '--reveal-delay': `${delay}ms` }}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${accent ? 'bg-black/10' : 'bg-white/5 border border-white/10 group-hover:border-yellow-500/30'}`}>
        <svg className={`w-6 h-6 ${accent ? 'text-black' : 'text-yellow-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <h4 className={`cz-bebas text-xl tracking-wider mb-1 ${accent ? 'text-black' : 'text-[var(--text)]'}`}>{title}</h4>
      <p className={`text-[10px] font-bold uppercase tracking-tighter leading-tight ${accent ? 'text-black/60' : 'text-[var(--muted)]'}`}>{desc}</p>

      {!accent && <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0 group-hover:text-yellow-500 duration-300">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </div>}
    </button>
  );
};

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
          fetch(`${apiUrl}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
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

        if (statsJson.success) setStats(statsJson.data);
        if (activeJson.success) setActiveRide(activeJson.data || null);
        if (ridesJson.success) {
          const rides = Array.isArray(ridesJson.data) ? ridesJson.data : [];
          setRecentRides(rides.filter(r => r && r.status === 'completed').slice(0, 5));
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
    socketService.connect();
    socketService.joinRide(activeRide._id);
    socketService.onStatusUpdate((data) => {
      setActiveRide(prev => prev ? { ...prev, ...data.ride, status: data.status } : null);
      if (data.status === 'accepted') toast.success('Ride accepted!', { icon: '🚗' });
      else if (data.status === 'cancelled') {
        toast.error('Ride cancelled', { icon: '🚫' });
        setActiveRide(null);
      }
    });

    return () => {
      socketService.leaveRide(activeRide._id);
      socketService.removeAllListeners();
    };
  }, [activeRide?._id]);

  const handleCancelRide = async (rideId) => {
    if (!window.confirm('Cancel this ride?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelled' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Cancelled');
        setActiveRide(null);
      }
    } catch (err) { toast.error('Error'); }
  };

  if (loading && !user) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin" />
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'MORNING' : hour < 17 ? 'AFTERNOON' : 'EVENING';

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-6 cz-dm">
      {/* ── Header Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-[2px] w-8 bg-yellow-500/50" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-600 dark:text-yellow-500/80">
              GOOD {greeting}
            </span>
          </div>
          <h1 className="text-5xl cz-bebas tracking-wider text-[var(--text)]">
            WELCOME, <span className="text-yellow-600 dark:text-yellow-500 drop-shadow-[0_0_15px_rgba(255,208,0,0.25)]">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)] mt-2">
            YOUR PREMIUM MOBILITY CONTROL CENTER
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 shadow-2xl">
          <div className="text-right">
            <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">WALLET</p>
            <p className="text-xl cz-bebas text-yellow-600 dark:text-yellow-500">₹{(user?.walletBalance || 0).toFixed(2)}</p>
          </div>
          <button onClick={() => navigate('/payment-methods')} className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
        </div>
      </div>

      {/* ── Statistics Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          label="TOTAL TRIPS"
          value={stats.totalTrips || '0'}
          sub="MILESTONES REACHED"
          delay={100}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
        />
        <KPICard
          label="PASSENGER RATING"
          value={`${stats.rating || '5.0'}★`}
          sub="ELITE REPUTATION"
          delay={200}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />}
        />
        <KPICard
          label="ACTIVE ACCOUNT"
          value="SECURE"
          sub="EYES ON TARGET"
          accent
          delay={300}
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
        />
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickAction
          to="/book-ride-live"
          title="BOOK A CAB"
          desc="MISSION START · REALTIME"
          accent
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />}
        />
        <QuickAction
          to="/ride-history"
          title="LOGS & HISTORY"
          desc="PAST MISSIONS · DATA"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        />
        <QuickAction
          to="/user-profile"
          title="OPERATOR"
          desc="IDENTITY · SECURITY"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
        />
        <QuickAction
          to="/payment-methods"
          title="TREASURY"
          desc="FUNDS · WALLET · CARDS"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />}
        />
      </div>

      {/* ── Active Ride / Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Feed / History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="cz-bebas text-2xl tracking-widest text-[var(--text)]">MISSION LOGS</h3>
            <Link to="/ride-history" className="text-[10px] font-black text-yellow-600 hover:text-yellow-500 uppercase tracking-widest transition-colors">VIEW ARCHIVE →</Link>
          </div>

          <div className="space-y-4">
            {recentRides.length === 0 ? (
              <div className="cz-glass rounded-3xl p-12 text-center border-dashed border-[var(--border2)]">
                <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em]">NO RECENT MISSIONS DETECTED</p>
              </div>
            ) : (
              recentRides.map((ride, idx) => (
                <div key={ride._id} className="cz-glass rounded-2xl p-5 group hover:border-yellow-500/30 transition-all duration-300 flex items-center justify-between gap-4 border border-[var(--border)]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black py-0.5 px-2 bg-emerald-500/10 text-emerald-500 rounded-full">COMPLETED</span>
                      <span className="text-[9px] font-bold text-[var(--muted)]">{new Date(ride.completedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm cz-bebas tracking-wider text-[var(--text)] truncate">
                      {ride.pickupLocation?.address?.split(',')[0]} → {ride.dropLocation?.address?.split(',')[0]}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl cz-bebas text-yellow-600 dark:text-yellow-500/80">₹{ride.fare}</p>
                    <p className="text-[9px] font-bold text-[var(--muted)] uppercase">PAID</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active Mission / Support */}
        <div className="space-y-6">
          <h3 className="cz-bebas text-2xl tracking-widest text-[var(--text)] px-2">LIVE INTEL</h3>
          {activeRide ? (
            <div className="rounded-3xl bg-yellow-500 p-6 shadow-[0_25px_60px_rgba(255,208,0,0.25)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <svg className="w-24 h-24 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" /></svg>
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-black text-black/50 uppercase tracking-[0.2em] mb-1">ACTIVE MISSION</p>
                    <h4 className="text-2xl cz-bebas text-black leading-tight tracking-wide">EN ROUTE TO TARGET</h4>
                  </div>
                  <div className="w-3 h-3 bg-black rounded-full animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.3)]" />
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-black/80">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                    <p className="text-[10px] font-bold uppercase truncate">{activeRide.pickupLocation?.address || 'PICKUP'}</p>
                  </div>
                  <div className="flex items-center gap-3 text-black/80">
                    <div className="w-1.5 h-1.5 border border-black rounded-full" />
                    <p className="text-[10px] font-bold uppercase truncate">{activeRide.dropLocation?.address || 'DROP-OFF'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => navigate(`/live-ride/${activeRide._id}`)} className="py-3 bg-black text-white cz-bebas text-lg tracking-widest rounded-xl hover:scale-[1.03] active:scale-95 transition-all">TERMINAL →</button>
                  <button onClick={() => handleCancelRide(activeRide._id)} className="py-3 bg-black/10 text-black cz-bebas text-lg tracking-widest rounded-xl hover:bg-black/20 transition-all border border-black/10">ABORT</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="cz-glass rounded-3xl p-8 border border-[var(--border)] text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">NO LIVE MISSION FEED</p>
              <button onClick={() => navigate('/book-ride-live')} className="mt-6 w-full py-3 bg-white/5 border border-white/10 rounded-xl cz-bebas text-lg tracking-widest hover:border-yellow-500 transition-colors uppercase">PROBE FOR DRIVERS</button>
            </div>
          )}

          <div className="cz-glass rounded-3xl p-6 border border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">SYSTEM STATUS: OPTIMAL</p>
            </div>
            <p className="text-[9px] font-bold text-[var(--muted)] leading-relaxed uppercase tracking-tighter">Satellite link active. Encryption layer V3. Deployment windows wide open across the sector.</p>
          </div>
        </div>
      </div>

      {/* ── AI Assistant ── */}
      <ChatBot />
    </div>
  );
};

export default RiderDashboard;
