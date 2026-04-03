import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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

// Admin Dashboard
// Admin Login Component
const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Lazy import to avoid circular dependency
  const AetherBackground = React.lazy(() => import('./components/ui/AetherBackground'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        navigate('/admin');
      } else {
        alert('Invalid admin credentials');
      }
    } catch (error) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center py-12 px-4 sm:px-8 font-sans">
      <React.Suspense fallback={null}>
        <AetherBackground />
      </React.Suspense>

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3 z-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-purple-500/20 backdrop-blur-md border border-purple-500/30 shadow-lg shadow-purple-500/20">
          <span className="text-3xl font-black leading-none text-white tracking-widest">CZ</span>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            Admin Portal
          </h2>
          <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">Secure Infrastructure Access</p>
        </div>
      </div>

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl shadow-purple-500/20 relative z-10 hover:scale-[1.01] transition-transform duration-300">
        <div className="px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-2">Administrator Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cabzee.com"
                className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-2">Security Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-lg tracking-[0.2em] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-semibold text-white
                bg-gradient-to-r from-purple-500 to-indigo-500
                hover:from-purple-600 hover:to-indigo-600
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500/50
                disabled:opacity-50 disabled:cursor-not-allowed
                active:scale-[0.98] transition-all duration-300 hover:-translate-y-0.5
                shadow-lg shadow-purple-500/25"
            >
              {loading ? 'Authenticating...' : 'Enter Dashboard →'}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-8 text-xs font-semibold text-gray-600 z-10">
        &copy; 2026 CabZee Operations. All rights reserved.
      </p>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeDrivers: 0,
    totalRides: 0,
    totalRevenue: 0
  });
  const [commissionSummary, setCommissionSummary] = useState({
    totalCommission: 0,
    rideCount: 0,
    recent: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        navigate('/admin-login');
        return;
      }
      setUser(parsedUser);
    } else {
      navigate('/admin-login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/reports/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setStats({
            totalUsers: data.data.totalUsers || 0,
            activeDrivers: data.data.activeDrivers || 0,
            totalRides: data.data.totalRides || 0,
            totalRevenue: data.data.totalRevenue || 0
          });
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };
    
    if (user) {
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const loadSummary = async () => {
      try {
        const data = await fetchAdminCommissionSummary();
        if (data.success) {
          setCommissionSummary(data.data);
        }
      } catch (err) {
        console.error('Failed to load commission summary:', err);
      }
    };
    loadSummary();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-soft-white font-sans text-navy">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-navy/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center group cursor-pointer" onClick={() => navigate('/admin')}>
              <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center mr-4 shadow-xl shadow-navy/20 transform group-hover:rotate-6 transition-all duration-300">
                <span className="text-soft-white text-xl font-black">C</span>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-navy uppercase leading-none">CabZee</h1>
                <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest mt-1">Admin Operations</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-black text-navy">{user.name}</span>
                <span className="text-[10px] font-bold text-navy/40 uppercase tracking-widest">System Administrator</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-navy text-soft-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:shadow-lg hover:shadow-red-200 transition-all duration-300 active:scale-95"
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 border border-navy/5 rounded-3xl p-6 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Commission Ledger</p>
              <h3 className="text-3xl font-black text-navy mb-1">₹{commissionSummary.totalCommission?.toFixed?.(2) || '0.00'}</h3>
              <p className="text-xs text-navy/40 uppercase tracking-[0.3em] mb-4">{commissionSummary.rideCount || 0} processed rides</p>
              <p className="text-sm text-navy/50 leading-relaxed">
                Admin retains 20% of the fare from every completed ride. This summary includes the latest splits from the network.
              </p>
            </div>
            <div className="bg-white/5 border border-navy/5 rounded-3xl p-6 shadow-xl space-y-3 overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Recent Splits</p>
                <span className="text-[10px] uppercase tracking-widest text-purple-500">{commissionSummary.recent?.length || 0} latest</span>
              </div>
              <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
                {commissionSummary.recent?.length > 0 ? commissionSummary.recent.map((split) => (
                  <div key={split._id} className="rounded-2xl border border-white/10 bg-white/10 p-3 flex items-center justify-between text-xs text-slate-200">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-100 truncate">{split?.rideId?._id?.slice(0, 8) || 'Ride'}</p>
                      <p className="text-[11px] text-slate-400 leading-tight truncate">
                        Driver: {split?.driverId?.name || 'Driver'} · Rider: {split?.riderId?.name || 'Rider'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-100">₹{split.adminCommission.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">{split.paymentStatus}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-500">No splits recorded yet.</p>}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-navy tracking-tight mb-3">System Overview</h2>
            <div className="flex items-center space-x-3">
              <div className="h-1.5 w-12 bg-sky-blue rounded-full"></div>
              <p className="text-sm font-bold text-navy/40 uppercase tracking-[0.2em]">Fleet, user & performance analytics</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-8 sm:mb-12">
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-xl border border-navy/5 relative overflow-hidden group hover:scale-[1.02] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-navy/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
              <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em] mb-4">Total Users</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-navy tracking-tight">{stats.totalUsers}</p>
                <div className="w-11 h-11 bg-navy/5 rounded-2xl flex items-center justify-center text-navy/40 border border-navy/5 group-hover:bg-navy group-hover:text-soft-white transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-xl border border-navy/5 relative overflow-hidden group hover:scale-[1.02] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-sky-blue/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
              <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em] mb-4">Active Drivers</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-navy tracking-tight">{stats.activeDrivers}</p>
                <div className="w-11 h-11 bg-sky-blue/5 rounded-2xl flex items-center justify-center text-sky-blue border border-sky-blue/10 group-hover:bg-sky-blue group-hover:text-soft-white transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-xl border border-navy/5 relative overflow-hidden group hover:scale-[1.02] transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
              <p className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em] mb-4">Total Rides</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-navy tracking-tight">{stats.totalRides}</p>
                <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 border border-green-100 group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-navy p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-2xl shadow-navy/20 relative overflow-hidden group hover:scale-[1.02] transition-all border border-white/5">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform"></div>
              <p className="text-[10px] font-bold text-soft-white/40 uppercase tracking-[0.2em] mb-4">Total Revenue</p>
              <div className="flex items-end justify-between">
                <p className="text-4xl font-black text-soft-white tracking-tight">₹{stats.totalRevenue.toFixed(2)}</p>
                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center text-soft-white border border-white/10 group-hover:bg-sky-blue group-hover:border-sky-blue transition-colors duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-navy/5 group hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-navy/5 rounded-2xl flex items-center justify-center text-navy mb-6 border border-navy/10 group-hover:bg-navy group-hover:text-soft-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-navy mb-2">User Directory</h3>
              <p className="text-sm font-bold text-navy/40 mb-6 leading-relaxed">System-wide rider and driver management interface.</p>
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full py-4 text-xs font-black uppercase tracking-widest text-navy bg-soft-white border border-navy/10 rounded-2xl hover:bg-navy hover:text-soft-white hover:border-navy transition-all duration-300 group-hover:shadow-lg group-hover:shadow-navy/10"
              >
                Access Directory
              </button>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-navy/5 group hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-sky-blue/5 rounded-2xl flex items-center justify-center text-sky-blue mb-6 border border-sky-blue/10 group-hover:bg-sky-blue group-hover:text-soft-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-navy mb-2">Ride Operations</h3>
              <p className="text-sm font-bold text-navy/40 mb-6 leading-relaxed">Real-time status tracking for all ongoing trips.</p>
              <button
                onClick={() => navigate('/admin/active-rides')}
                className="w-full py-4 text-xs font-black uppercase tracking-widest text-sky-blue bg-sky-blue/5 border border-sky-blue/10 rounded-2xl hover:bg-sky-blue hover:text-soft-white hover:border-sky-blue transition-all duration-300 shadow-sm"
              >
                Monitor Fleet
              </button>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-navy/5 group hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-yellow-500/5 rounded-2xl flex items-center justify-center text-yellow-600 mb-6 border border-yellow-500/10 group-hover:bg-yellow-500 group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-navy mb-2">Configurations</h3>
              <p className="text-sm font-bold text-navy/40 mb-6 leading-relaxed">System parameters, pricing models & settings.</p>
              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full py-4 text-xs font-black uppercase tracking-widest text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-2xl hover:bg-yellow-500 hover:text-white hover:border-yellow-500 transition-all duration-300"
              >
                Global Settings
              </button>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-navy/5 group hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-purple-500/5 rounded-2xl flex items-center justify-center text-purple-600 mb-6 border border-purple-500/10 group-hover:bg-purple-600 group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-navy mb-2">Driver Verification</h3>
              <p className="text-sm font-bold text-navy/40 mb-6 leading-relaxed">KYC and document validation for new partners.</p>
              <button
                onClick={() => navigate('/admin/verification')}
                className="w-full py-4 text-xs font-black uppercase tracking-widest text-purple-600 bg-purple-50 border border-purple-200 rounded-2xl hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all duration-300"
              >
                Verify Documents
              </button>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-navy/5 group hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-indigo-500/5 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 border border-indigo-500/10 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-navy mb-2">System Analytics</h3>
              <p className="text-sm font-bold text-navy/40 mb-6 leading-relaxed">Deep insights into growth & transaction metrics.</p>
              <div className="flex items-center space-x-2 bg-navy/5 px-4 py-3 rounded-xl border border-navy/5">
                <div className="w-2 h-2 bg-sky-blue rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-navy/40">Integrating Data...</span>
              </div>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-navy/5 group hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-red-500/5 rounded-2xl flex items-center justify-center text-red-600 mb-6 border border-red-500/10 group-hover:bg-red-500 group-hover:text-white transition-all">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-navy mb-2">System Reports</h3>
              <p className="text-sm font-bold text-navy/40 mb-6 leading-relaxed">Downloadable operational and audit logs.</p>
              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full py-4 text-xs font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-200 rounded-2xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
              >
                Log Archive
              </button>
            </div>
          </div>

          {/* Modern Status Feed */}
          <div className="bg-white shadow-2xl rounded-2xl sm:rounded-[2.5rem] mt-6 sm:mt-12 border border-navy/5 overflow-hidden">
            <div className="px-5 sm:px-8 py-5 sm:py-8 border-b border-navy/5 flex justify-between items-center bg-navy/[0.02]">
              <h3 className="text-lg sm:text-2xl font-black text-navy">Global Status Feed</h3>
              <div className="flex items-center space-x-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-navy/5 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-[10px] font-black text-navy uppercase tracking-widest hidden sm:inline">Live Monitoring</span>
                <span className="text-[10px] font-black text-navy uppercase tracking-widest sm:hidden">Live</span>
              </div>
            </div>
            <div className="px-5 sm:px-8 py-10 sm:py-16 text-center">
              <div className="w-24 h-24 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-navy/10">
                <svg className="w-10 h-10 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-navy mb-2">Operational Calm</h3>
              <p className="text-sm font-bold text-navy/30 max-w-md mx-auto leading-relaxed">The system is currently reporting zero exceptions. New activity will stream directly into this dashboard.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
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
          <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>} />
        </Routes>

        {/* AI ChatBot Widget */}
        <ChatBot />

        {/* Mobile bottom navigation */}
        <MobileBottomNav />

        {/* Toast notifications — styled per Design Rulebook Interaction 3 */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111827',
              color: '#F9FAFB',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
              border: '1px solid rgba(255,255,255,0.06)',
              animation: 'toastIn 0.35s cubic-bezier(0.0,0.0,0.2,1.0) forwards',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#dc2626', secondary: '#fff' },
            },
          }}
        />
      </div>
    </Router >
  );
}

export default App;
