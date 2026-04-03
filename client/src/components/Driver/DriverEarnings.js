import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DriverEarnings = () => {
  const [user, setUser] = useState(null);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0
  });
  const [recentEarnings, setRecentEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('today');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'driver') {
        navigate('/login');
        return;
      }
      setUser(parsedUser);
    } else {
      navigate('/login');
    }

    fetchEarnings();
  }, [navigate, period]);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/earnings?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEarnings(data.data.earnings || earnings);
          setRecentEarnings(data.data.recentRides || []);
        }
      } else {
        const defaultEarnings = {
          today: 0,
          week: 0,
          month: 0,
          total: 0
        };
        setEarnings(defaultEarnings);
        setRecentEarnings([]);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      const defaultEarnings = {
        today: 0,
        week: 0,
        month: 0,
        total: 0
      };
      setEarnings(defaultEarnings);
      setRecentEarnings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-soft-white font-sans text-navy">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-navy/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/driver')}
                className="mr-6 p-3 rounded-xl bg-navy/5 text-navy hover:bg-navy hover:text-soft-white transition-all duration-300 transform active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center group cursor-pointer" onClick={() => navigate('/driver')}>
                <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-navy/20">
                  <span className="text-soft-white font-black italic">C</span>
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Fiscal Terminal</h1>
                  <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest mt-0.5">Earnings Repository</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-navy/5 border border-navy/5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-navy focus:outline-none focus:ring-4 focus:ring-navy/5 focus:border-navy transition-all cursor-pointer hover:bg-navy/10"
              >
                <option value="today">Today</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="all">Historical</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-navy tracking-tight mb-3">Professional Merit</h2>
          <div className="flex items-center space-x-3">
            <div className="h-1.5 w-12 bg-sky-blue rounded-full"></div>
            <p className="text-sm font-bold text-navy/40 uppercase tracking-[0.2em]">Verified earnings and transaction history</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white shadow-2xl rounded-[3rem] p-24 text-center border border-navy/5 animate-pulse">
            <div className="w-20 h-20 bg-navy/[0.02] rounded-full flex items-center justify-center mx-auto mb-8 border border-navy/5">
              <svg className="w-10 h-10 text-navy animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-navy uppercase tracking-tighter mb-2">Syncing Fiscal State</h3>
            <p className="text-sm font-bold text-navy/30 uppercase tracking-widest">Accessing cloud-synchronized earnings ledger...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Primary Earnings Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2 bg-navy rounded-[3rem] p-10 shadow-2xl shadow-navy/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-blue/5 rounded-full -ml-16 -mb-16"></div>

                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <p className="text-[10px] font-black text-soft-white/40 uppercase tracking-[0.4em] mb-4">Total Settled Merit</p>
                    <h3 className="text-6xl font-black text-soft-white tracking-tighter leading-none mb-2">₹{earnings.total}</h3>
                    <p className="text-xs font-bold text-sky-blue uppercase tracking-widest">Protocol Version 4.8.2 Active</p>
                  </div>
                  <div className="mt-12 flex items-center gap-4">
                    <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10">
                      <p className="text-[9px] font-black text-soft-white/60 uppercase">Lifetime Rides: {user.totalRides || 0}</p>
                    </div>
                    <div className="px-4 py-2 bg-white/10 rounded-xl border border-white/10">
                      <p className="text-[9px] font-black text-soft-white/60 uppercase">Operational Grade: A+</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-white rounded-[2.5rem] p-8 border border-navy/5 shadow-xl group hover:border-navy transition-colors">
                  <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-3">Today's Yield</p>
                  <p className="text-4xl font-black text-navy tracking-tighter mb-4">₹{earnings.today}</p>
                  <div className="h-1 w-full bg-navy/5 rounded-full overflow-hidden">
                    <div className="h-full bg-navy w-3/4"></div>
                  </div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-navy/5 shadow-xl group hover:border-sky-blue transition-colors">
                  <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-3">Weekly Dividend</p>
                  <p className="text-4xl font-black text-navy tracking-tighter mb-4">₹{earnings.week}</p>
                  <div className="h-1 w-full bg-navy/5 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-blue w-1/2"></div>
                  </div>
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 border border-navy/5 shadow-xl sm:col-span-2 group hover:border-navy transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-3">Monthly Accrual</p>
                      <p className="text-4xl font-black text-navy tracking-tighter">₹{earnings.month}</p>
                    </div>
                    <div className="w-16 h-16 bg-soft-white rounded-2xl flex items-center justify-center border border-navy/5 shadow-inner">
                      <svg className="w-8 h-8 text-navy/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="bg-white shadow-2xl rounded-[3rem] p-10 border border-navy/5 relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-navy/[0.01] rounded-full -mr-24 -mb-24"></div>
              <h2 className="text-xl font-black text-navy mb-10 uppercase tracking-tighter">Operational Analytics</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                <div className="p-8 bg-soft-white rounded-[2rem] border border-navy/5 flex flex-col items-center text-center group hover:bg-navy transition-all duration-500">
                  <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-4 group-hover:text-soft-white/40">Total Operations</p>
                  <p className="text-5xl font-black text-navy tracking-tighter group-hover:text-soft-white transition-colors">{user.totalRides || 0}</p>
                  <p className="text-[8px] font-black text-sky-blue uppercase mt-2 group-hover:text-sky-blue">Verified Count</p>
                </div>
                <div className="p-8 bg-soft-white rounded-[2rem] border border-navy/5 flex flex-col items-center text-center group hover:bg-navy transition-all duration-500">
                  <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-4 group-hover:text-soft-white/40">Efficiency Merit</p>
                  <p className="text-5xl font-black text-sky-blue tracking-tighter">₹{user.totalRides > 0 ? Math.round(earnings.total / user.totalRides) : 0}</p>
                  <p className="text-[8px] font-black text-navy/20 uppercase mt-2 group-hover:text-soft-white/40">Avg Per Mission</p>
                </div>
                <div className="p-8 bg-navy rounded-[2rem] shadow-2xl shadow-navy/20 flex flex-col items-center text-center group hover:scale-105 transition-all duration-500">
                  <p className="text-[10px] font-black text-soft-white/40 uppercase tracking-[0.3em] mb-4">Service Grade</p>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-5xl font-black text-soft-white tracking-tighter">{user.rating || 5.0}</span>
                    <span className="text-yellow-400 text-3xl">★</span>
                  </div>
                  <p className="text-[8px] font-black text-sky-blue uppercase mt-2">Elite Protocol</p>
                </div>
              </div>
            </div>

            {/* Ledger Timeline */}
            <div className="bg-white shadow-2xl rounded-[3rem] p-10 border border-navy/5 relative">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black text-navy uppercase tracking-tighter">Fiscal Timeline</h2>
                <div className="w-10 h-1bg-navy/5 rounded-full"></div>
              </div>

              {recentEarnings.length === 0 ? (
                <div className="text-center py-20 bg-soft-white rounded-[2.5rem] border border-dashed border-navy/10">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg className="w-8 h-8 text-navy/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-navy/20 font-black uppercase text-[10px] tracking-[0.4em]">Historical ledger empty</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {recentEarnings.map((earning, index) => (
                    <div key={index} className="group relative flex items-center justify-between p-6 bg-soft-white rounded-2xl border border-navy/5 hover:bg-white hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
                      <div className="absolute inset-y-6 left-0 w-1 bg-navy/0 group-hover:bg-navy rounded-full transition-all"></div>
                      <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-soft-white text-xl font-black italic shadow-lg group-hover:rotate-12 transition-transform">
                          {earning.rider?.charAt(0) || 'R'}
                        </div>
                        <div>
                          <p className="text-base font-black text-navy uppercase tracking-tight">{earning.rider || 'Authorized Client'}</p>
                          <div className="flex items-center space-x-3 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em]">{formatDate(earning.date)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-navy/20 uppercase tracking-[0.3em] mb-1 italic">Net Merit</p>
                        <p className="text-2xl font-black text-navy tracking-tighter">+₹{earning.fare}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-12 flex justify-center pb-8">
              <div className="bg-white/50 backdrop-blur-sm px-8 py-3 rounded-full border border-navy/5 flex items-center space-x-4">
                <div className="w-2 h-2 bg-navy rounded-full animate-pulse"></div>
                <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.4em]">Protocol Fiscal Link: Secure</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverEarnings;
