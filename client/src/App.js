import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import './App.css';

// Components
import AuthLayout from './components/Auth/AuthLayout';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import OTPVerification from './components/Auth/OTPVerification';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import LandingPage from './components/ui/LandingPage';

// Dashboard components
import RiderDashboard from './components/Dashboard/RiderDashboard';
import DriverDashboard from './components/Dashboard/DriverDashboard';

// Driver components
import DriverProfile from './components/Driver/DriverProfile';
import EditDriverProfile from './components/Driver/EditDriverProfile';
import VehicleDetails from './components/Driver/VehicleDetails';
import IncomingRideRequest from './components/Driver/IncomingRideRequest';
import AcceptRejectRide from './components/Driver/AcceptRejectRide';
import ActiveRide from './components/Driver/ActiveRide';
import DriverRideHistory from './components/Driver/DriverRideHistory';
import DriverEarnings from './components/Driver/DriverEarnings';

// User components
import UserProfile from './components/User/UserProfile';
import EditProfile from './components/User/EditProfile';
import LiveRideTracking from './components/User/LiveRideTracking';
import LiveMapBooking from './components/User/LiveMapBooking';
import UserRideHistory from './components/User/UserRideHistory';

// Common components
import Layout from './components/Common/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

import DocumentUpload from './components/Driver/DocumentUpload';
import AdminVerification from './components/Admin/AdminVerification';

// Payment components
import PaymentOptions from './components/Payment/PaymentOptions';
import PaymentSuccess from './components/Payment/PaymentSuccess';
import ManagePaymentMethods from './components/Payment/ManagePaymentMethods';

// Admin components
import AllUsers from './components/Admin/AllUsers';
import AllActiveRides from './components/Admin/AllActiveRides';
import SystemSettings from './components/Admin/SystemSettings';
import Reports from './components/Admin/Reports';
import ChatBot from './components/ChatBot/ChatBot';
import MobileBottomNav from './components/Common/MobileBottomNav';
import { fetchAdminCommissionSummary } from './services/paymentSplitService';
import { icon } from 'leaflet';

// Admin Login Component — Styled for Clean Premium
const AdminLogin = () => {
    const [email, setEmail] = useState('admin@cabzee.com');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Clear any stale session on mount — prevents old tokens from
    // triggering background API calls that produce "Not authorized" toasts
    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/auth/admin-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const payload = await response.json();

            if (response.ok && payload.success && payload.data && payload.data.user) {
                if (payload.data.user.role === 'admin') {
                    localStorage.setItem('token', payload.data.token);
                    localStorage.setItem('user', JSON.stringify(payload.data.user));
                    toast.success('Access Granted');
                    navigate('/admin');
                } else {
                    toast.error('Insufficient privileges');
                }
            } else {
                toast.error(payload.message || 'Invalid access key');
            }
        } catch (err) {
            toast.error('Connection to server failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 dark:bg-[#06060a]">
            <div className="cz-grid fixed inset-0 z-0 pointer-events-none opacity-20" />

            <div className="w-full max-w-md space-y-8 rounded-3xl border border-gray-200 bg-white p-10 shadow-xl dark:border-[rgba(255,255,255,0.05)] dark:bg-neutral-900/40 dark:backdrop-blur-xl relative z-10">
                <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFD000] text-black shadow-lg shadow-[#FFD000]/20">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-black tracking-tight text-gray-900 dark:text-white">Central Overlook</h2>
                    <p className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-widest leading-none">Authorization Required</p>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Admin Email</label>
                        <input
                            type="email"
                            required
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-bold text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#FFD000]/20 dark:border-[rgba(255,255,255,0.05)] dark:bg-[rgba(255,255,255,0.05)] dark:text-white"
                            placeholder="admin@cabzee.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="ml-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Access Key</label>
                        <input
                            type="password"
                            required
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-center text-lg font-bold tracking-[0.4em] text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#FFD000]/20 dark:border-[rgba(255,255,255,0.05)] dark:bg-[rgba(255,255,255,0.05)] dark:text-white"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full rounded-xl bg-black py-4 text-xs font-black uppercase tracking-[0.2em] force-light-text transition-all hover:bg-neutral-800 dark:bg-[#FFD000] dark:text-black dark:hover:bg-[#ffe04d] shadow-lg shadow-[#FFD000]/10 mt-2"
                    >
                        Establish Uplink
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">Protected by CabZee Security Protocol</p>
                </form>
            </div>
        </div>
    );
};

// Admin Dashboard Component — Styled for Clean Premium
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ totalUsers: 124, activeDrivers: 45, totalRides: 456, totalRevenue: 12500 });
    const [commissionSummary, setCommissionSummary] = useState({ totalCommission: 0, rideCount: 0, recent: [] });

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            if (parsed.role !== 'admin') { navigate('/admin-login'); return; }
            setUser(parsed);
        } else { navigate('/admin-login'); }
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const [repRes, commRes] = await Promise.all([
                    fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/reports/overview', { headers: { Authorization: `Bearer ${token}` } }),
                    fetchAdminCommissionSummary()
                ]);
                const repJson = await repRes.json();
                if (repJson.success) {
                    setStats({
                        totalUsers: repJson.data.totalUsers || 0,
                        activeDrivers: repJson.data.activeDrivers || 0,
                        totalRides: repJson.data.totalRides || 0,
                        totalRevenue: repJson.data.totalRevenue || 0
                    });
                }
                if (commRes.success) setCommissionSummary(commRes.data);
            } catch (err) { console.error(err); }
        };
        fetchStats();
    }, [user]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/admin-login');
    };

    if (!user) return <div className="p-20 text-center font-bold text-gray-500">Initializing node...</div>;

    const menu = [
        { label: 'Fleet Audits', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', path: '/admin/verification', desc: 'Certify partner credentials' },
        { label: 'System Ledger', icon: 'M9 7h6m0 10v-3m-3 3v-3m-3 3v-3m2-10a2 2 0 012 2v1h-4V9a2 2 0 012-2zm-6 3h12v11a2 2 0 01-2 2H7a2 2 0 01-2-2V10z', path: '/admin/settings', desc: 'Revenue split summaries' },
        { label: 'User Hub', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', path: '/admin/users', desc: 'Rider & Driver directory' },
        { label: 'Global Setup', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', path: '/admin/settings', desc: 'Fare matrix & parameters' }
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Command Center</h2>
                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#FFD000]">System Administration Platform</p>
                </div>
                <button onClick={handleLogout} className="px-6 py-2.5 rounded-xl border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Terminate session</button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', val: stats.totalUsers, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
                    { label: 'Active Fleet', val: stats.activeDrivers, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                    {
                        label: 'Revenue', val: `₹${stats.totalRevenue}`, icon: "M6 3h12v2H11.5c1.93 0 3.5 1.57 3.5 3.5S13.43 12 11.5 12H9.41l6.3 6.29-1.41 1.42L8 12.41V11h3.5c1.1 0 2-.9 2-2s-.9-2-2-2H6V3z"
                    },
                    { label: 'Commissions', val: `₹${commissionSummary.totalCommission?.toFixed(0)}`, icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' }
                ].map((s, i) => (
                    <div key={i} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-neutral-900/40">
                        <div className="flex items-center justify-between">
                            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 dark:bg-white/5">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={s.icon} /></svg>
                            </div>
                            <span className="text-2xl font-black text-gray-900 dark:text-white">{s.val}</span>
                        </div>
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {menu.map((m, i) => (
                    <div key={i} onClick={() => navigate(m.path)} className="group cursor-pointer rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:border-[#FFD000]/30 hover:shadow-xl dark:border-white/5 dark:bg-neutral-900/40">
                        <div className="flex items-center gap-6">
                            <div className="h-14 w-14 rounded-2xl bg-gray-100 text-gray-400 transition-colors group-hover:bg-[#FFD000] group-hover:text-black dark:bg-white/5 flex items-center justify-center">
                                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={m.icon} /></svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{m.label}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Split Ledger Summary */}
            <div className="rounded-3xl border border-gray-200 bg-white p-8 dark:border-white/5 dark:bg-neutral-900/40">
                <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-6 dark:border-white/5">
                    <div>
                        <h3 className="text-lg font-bold">Commission Ledger</h3>
                        <p className="text-xs text-gray-500">20% system retention per trip</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-[#FFD000]">₹{commissionSummary.totalCommission?.toFixed(2)}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{commissionSummary.rideCount} Processed</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {commissionSummary.recent?.slice(0, 3).map((r) => (
                        <div key={r._id} className="flex items-center justify-between rounded-2xl bg-gray-50 p-4 dark:bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm dark:border-white/10">
                                    <div className="flex h-full w-full items-center justify-center bg-[#FFD000] text-xs font-black text-black">{r.driverId?.name?.charAt(0)}</div>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">Ride ID: {r.rideId?._id?.slice(-8).toUpperCase()}</p>
                                    <p className="text-[10px] font-medium text-gray-500">Credited from {r.driverId?.name}</p>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-emerald-500">+₹{r.adminCommission.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

function App() {
    return (
        <div className="App">
            <Router>
                <Routes>
                    {/* Landing Route */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Auth Routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-otp" element={<OTPVerification />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                    </Route>

                    {/* Admin Login Route */}
                    <Route path="/admin-login" element={<AdminLogin />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/rider" element={<RiderDashboard />} />

                            {/* User (Rider) Routes */}
                            <Route path="/user-profile" element={<UserProfile />} />
                            <Route path="/edit-profile" element={<EditProfile />} />
                            <Route path="/ride-history" element={<UserRideHistory />} />

                            {/* Payment Routes */}
                            <Route path="/payment-options" element={<PaymentOptions />} />
                            <Route path="/payment-success" element={<PaymentSuccess />} />
                            <Route path="/payment-methods" element={<ManagePaymentMethods />} />

                            {/* Driver Routes */}
                            <Route path="/driver" element={<DriverDashboard />} />
                            <Route path="/incoming-ride-request" element={<IncomingRideRequest />} />
                            <Route path="/driver-ride-history" element={<DriverRideHistory />} />
                            <Route path="/driver-earnings" element={<DriverEarnings />} />
                            <Route path="/driver-profile" element={<DriverProfile />} />
                            <Route path="/edit-driver-profile" element={<EditDriverProfile />} />
                            <Route path="/driver/documents" element={<DocumentUpload />} />
                            <Route path="/vehicle-details" element={<VehicleDetails />} />
                            <Route path="/accept-reject-ride" element={<AcceptRejectRide />} />
                            <Route path="/active-ride" element={<ActiveRide />} />

                            {/* Admin Routes */}
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin/verification" element={<AdminVerification />} />
                            <Route path="/admin/users" element={<AllUsers />} />
                            <Route path="/admin/active-rides" element={<AllActiveRides />} />
                            <Route path="/admin/settings" element={<SystemSettings />} />
                            <Route path="/admin/reports" element={<Reports />} />
                        </Route>

                        {/* Full-Screen Map Routes (No Sidebar/Navbar) */}
                        <Route path="/book-ride-live" element={<LiveMapBooking />} />
                        <Route path="/live-ride/:rideId" element={<LiveRideTracking />} />
                    </Route>

                    {/* Catch all route */}
                    <Route path="*" element={<div className="p-10 text-center font-bold text-gray-500">404 - Node Unreachable</div>} />
                </Routes>

                <ChatBot />
                <MobileBottomNav />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#111827',
                            color: '#F9FAFB',
                            borderRadius: '12px',
                            padding: '16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: '1px solid rgba(255,255,255,0.06)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        },
                        success: {
                            iconTheme: { primary: '#FFD000', secondary: '#000' },
                        },
                    }}
                />
            </Router>
        </div>
    );
}

export default App;
