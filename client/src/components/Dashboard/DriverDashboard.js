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

/* ── SVG Sparkline ── */
const Sparkline = ({ data = [], color = '#FFD000', width = 100, height = 32 }) => {
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
            {data.map((v, i) => {
                const x = (i / (data.length - 1)) * width;
                const y = height - 4 - ((v - min) / range) * (height - 8);
                return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
            })}
        </svg>
    );
};

/* ── KPI Card — Modern Glass Design ── */
const KPICard = ({ label, value, sub, icon, accent = false, sparkData, sparkColor, delay = 0 }) => {
    const ref = useScrollReveal();

    return (
        <div
            ref={ref}
            data-reveal
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl"
            style={{ '--reveal-delay': `${delay}ms` }}
        >
            <div className="relative z-10">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</p>
                        <h3 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</h3>
                        {sub && <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{sub}</p>}
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 ${accent ? 'bg-[#FFD000] text-black shadow-lg shadow-[#FFD000]/20' : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400'}`}>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {icon}
                        </svg>
                    </div>
                </div>
                {sparkData && (
                    <div className="mt-4">
                        <Sparkline data={sparkData} color={sparkColor || '#FFD000'} width={120} height={32} />
                    </div>
                )}
            </div>
            {accent && (
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#FFD000]/10 blur-2xl" />
            )}
        </div>
    );
};

/* ── Availability Toggle — Modern Logic ── */
const AvailabilityToggle = ({ status, onToggle }) => {
    const isOnline = status === 'online';
    return (
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${isOnline ? 'bg-[#FFD000] text-black shadow-lg shadow-[#FFD000]/20' : 'bg-gray-100 text-gray-500 dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-400'}`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {isOnline && <div className="absolute top-0 right-0 h-3 w-3 animate-ping rounded-full bg-emerald-500" />}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">{isOnline ? 'Online' : 'Offline'}</h4>
                    <p className="text-xs text-gray-500">{isOnline ? 'Ready for trips' : 'Stealth mode'}</p>
                </div>
            </div>
            <button
                onClick={onToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${isOnline ? 'bg-[#FFD000]' : 'bg-gray-300 dark:bg-[rgba(255,255,255,0.10)]'}`}
            >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300" style={{ transform: isOnline ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }} />
            </button>
        </div>
    );
};

/* ── Quick Action Card ── */
const QuickActionCard = ({ icon, title, desc, action, to, delay = 0 }) => {
    const navigate = useNavigate();
    const ref = useScrollReveal();
    return (
        <div
            ref={ref}
            data-reveal
            onClick={() => navigate(to)}
            className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD000]/30 hover:shadow-xl dark:border-transparent dark:bg-neutral-900/40 dark:backdrop-blur-xl dark:border-[rgba(255,255,255,0.05)]"
            style={{ '--reveal-delay': `${delay}ms` }}
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors duration-300 group-hover:bg-[#FFD000] group-hover:text-black dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
            </div>
            <h3 className="mt-4 text-base font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
            <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-widest text-[#FFD000] transition-transform duration-300 group-hover:translate-x-1">
                {action} <span>&rarr;</span>
            </div>
        </div>
    );
};

const DriverDashboard = () => {
    const [user, setUser] = useState(null);
    const [driverStatus, setDriverStatus] = useState('offline');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ todayEarnings: 0, totalRides: 0, rating: 5.0, onlineHours: 0 });
    const [rideRequests, setRideRequests] = useState([]);
    const [activeRide, setActiveRide] = useState(null);
    const [splitSummary, setSplitSummary] = useState({ totalEarning: 0, rideCount: 0, detail: [] });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) { navigate('/login'); return; }
                const [userRes, earningsRes, activeRes, statsRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/earnings?period=today`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/active`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/stats`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const [userJson, earningsJson, activeJson, statsJson] = await Promise.all([
                    userRes.json(), earningsRes.json(), activeRes.json(), statsRes.json()
                ]);

                if (userJson.success) {
                    setUser(userJson.data);
                    setDriverStatus(userJson.data.driverStatus || 'offline');
                    setStats({
                        todayEarnings: earningsJson.success ? earningsJson.data.earnings.today : 0,
                        totalRides: statsJson.success ? statsJson.data.totalTrips : 0,
                        rating: statsJson.success ? statsJson.data.rating : 5.0,
                        onlineHours: userJson.data.onlineHours || 0
                    });
                }

                if (activeJson.success && activeJson.data) {
                    setActiveRide(activeJson.data);
                    socketService.connect();
                    socketService.joinRide(activeJson.data._id);
                    socketService.onStatusUpdate((data) => {
                        if (data.status === 'cancelled') {
                            toast.error('Ride cancelled by rider');
                            setActiveRide(null);
                            setDriverStatus('online');
                        }
                    });
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
        return () => socketService.removeAllListeners();
    }, [navigate]);

    useEffect(() => {
        const loadSplit = async () => {
            try {
                const res = await fetchDriverEarningsSummary();
                if (res.success) setSplitSummary(res.data);
            } catch (err) { console.error(err); }
        };
        loadSplit();
    }, []);

    useEffect(() => {
        let interval;
        if (driverStatus === 'online') {
            const fetchReq = async () => {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/pending`, { headers: { Authorization: `Bearer ${token}` } });
                const json = await res.json();
                if (json.success) setRideRequests(json.data || []);
            };
            fetchReq();
            interval = setInterval(fetchReq, 10000);
        } else { setRideRequests([]); }
        return () => clearInterval(interval);
    }, [driverStatus]);

    const toggleAvailability = async () => {
        const isVerified = user?.documents?.insurance?.verified && user?.documents?.license?.verified && user?.documents?.registration?.verified;
        if (!isVerified) { toast.error('Complete document verification first'); return; }
        const newStatus = driverStatus === 'online' ? 'offline' : 'online';
        setDriverStatus(newStatus);
        const token = localStorage.getItem('token');
        await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/me`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ driverStatus: newStatus }),
        });
        toast.success(newStatus === 'online' ? 'You are now Online' : 'You are now Offline');
    };

    if (loading && !user) return <div className="p-8 text-center text-gray-500">Initializing environment...</div>;
    if (!user) return null;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 pb-24 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium text-gray-500">{greeting},</p>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Captain {user.name.split(' ')[0]} 👋</h2>
                </div>
                <div className="w-full sm:w-72">
                    <AvailabilityToggle status={driverStatus} onToggle={toggleAvailability} />
                </div>
            </div>

            {/* Active Ride Alert */}
            {activeRide && (
                <div className="relative overflow-hidden rounded-3xl bg-[#FFD000] p-6 shadow-2xl transition-transform hover:scale-[1.01] dark:bg-[#FFD000]">
                    <div className="relative z-10 flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex items-center gap-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black/10 backdrop-blur-md">
                                <svg className="h-8 w-8 text-black animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/50">Ongoing Trip</p>
                                <h3 className="text-xl font-bold text-black">Active Deployment</h3>
                                <p className="text-sm font-medium text-black/70">Secure transport for {activeRide.rider?.name || 'Client'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/active-ride')}
                            className="w-full rounded-xl bg-black px-8 py-4 text-xs font-black uppercase tracking-[0.2em] force-light-text shadow-xl transition-all hover:bg-neutral-800 active:scale-95 md:w-auto"
                        >
                            Open Controls
                        </button>
                    </div>
                </div>
            )}

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    label="Today's Earnings"
                    value={`₹${stats.todayEarnings}`}
                    sub="Revenue generated"
                    sparkData={[120, 450, 300, 600, 800, stats.todayEarnings]}
                    delay={0}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />}
                />
                <KPICard
                    label="Completed Rides"
                    value={stats.totalRides}
                    sub="Total missions"
                    delay={100}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                />
                <KPICard
                    label="Performance Rating"
                    value={`${stats.rating}★`}
                    sub="Client satisfaction"
                    delay={200}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />}
                />
                <KPICard
                    label="Active Hours"
                    value={`${stats.onlineHours}h`}
                    sub="Fleet availability"
                    accent
                    delay={300}
                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                />
            </div>

            {/* Quick Access */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <QuickActionCard icon={<path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />} title="Ride Requests" desc="Monitor live dispatch signals" action="Listen" to="/incoming-ride-request" delay={0} />
                <QuickActionCard icon={<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />} title="Fleet Docs" desc="Manage certifications & verify" action="Update" to="/driver/documents" delay={100} />
                <QuickActionCard icon={<path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />} title="Trip Analytics" desc="Review historical performances" action="Analyze" to="/driver-ride-history" delay={200} />
                <QuickActionCard icon={<path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />} title="Earning Panel" desc="Track payouts and split revenue" action="Payouts" to="/driver-earnings" delay={300} />
            </div>

            {/* Split Ledger Summary */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Payable Revenue</p>
                    <h3 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">₹{splitSummary.totalEarning?.toFixed(2) || '0.00'}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 uppercase">80% Share</span>
                        <span className="text-xs text-gray-400">from {splitSummary.rideCount || 0} rides</span>
                    </div>
                </div>
                <div className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Recent Payouts</h4>
                        <span className="cursor-pointer text-xs font-bold text-[#FFD000] hover:underline">View Ledger &rarr;</span>
                    </div>
                    <div className="space-y-3">
                        {splitSummary.detail?.slice(0, 3).map((s) => (
                            <div key={s._id} className="flex items-center justify-between rounded-xl bg-gray-50 p-4 dark:bg-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-neutral-800">
                                        <svg className="h-5 w-5 text-[#FFD000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.3" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Trip Credit</p>
                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{s.paymentStatus}</p>
                                    </div>
                                </div>
                                <p className="text-base font-bold text-[#FFD000]">₹{s.driverEarning.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ride Signal Center */}
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm transition-all dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl">
                <div className="border-b border-gray-100 p-6 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trip Distribution Center</h3>
                        <p className="text-xs text-gray-500">Global queue proximity analysis</p>
                    </div>
                    <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${driverStatus === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-100 text-gray-500 dark:bg-white/5'}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${driverStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                        {driverStatus}
                    </div>
                </div>

                {driverStatus === 'online' && rideRequests.length > 0 ? (
                    <div className="grid gap-4 p-6 sm:grid-cols-2">
                        {rideRequests.map((r) => (
                            <div key={r._id} className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-6 transition-all hover:border-[#FFD000]/50 hover:shadow-lg dark:border-white/5 dark:bg-white/5">
                                <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-neutral-800 text-xl font-black text-[#FFD000]">
                                            {r.rider?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-bold text-gray-900 dark:text-white">{r.rider?.name || 'Client'}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client Priority • 5.0★</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black tracking-tighter text-[#FFD000]">₹{r.fare}</p>
                                </div>
                                <div className="mt-6 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 line-clamp-1">{r.pickupLocation?.address}</p>
                                    </div>
                                    <button
                                        onClick={() => { localStorage.setItem('selectedRideRequest', JSON.stringify(r)); navigate('/accept-reject-ride'); }}
                                        className="w-full rounded-xl bg-black py-4 text-[10px] font-black uppercase tracking-[0.2em] force-light-text transition-all hover:bg-neutral-800 dark:bg-[#FFD000] dark:text-black dark:hover:bg-[#ffe04d]"
                                    >
                                        Review Signal
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-20 text-center">
                        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-gray-300 dark:border-[rgba(255,255,255,0.10)]">
                            {driverStatus === 'online' && <div className="absolute inset-0 animate-ping rounded-full border border-[#FFD000]/30" />}
                            <svg className={`h-10 w-10 ${driverStatus === 'online' ? 'text-[#FFD000]' : 'text-gray-400 dark:text-gray-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.5 9.5 0 0113.436 0m-17.678-4.242a14.5 14.5 0 0120.661 0" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{driverStatus === 'online' ? 'Listening for dispatch signals...' : 'Broadcast Offline'}</h4>
                        <p className="mt-2 text-sm text-gray-500 max-w-xs">{driverStatus === 'online' ? 'The system is scanning for riders in your vicinity.' : 'You are currently invisible. Go online to receive trip requests.'}</p>
                        {driverStatus === 'offline' && (
                            <button onClick={toggleAvailability} className="mt-8 rounded-xl bg-[#FFD000] px-10 py-4 text-xs font-black uppercase tracking-widest text-black shadow-lg shadow-[#FFD000]/20 hover:scale-105 active:scale-95 transition-all">Go Online</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverDashboard;
