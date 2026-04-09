import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
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

  if (!user) return <div className="p-20 text-center font-bold text-gray-500">Loading financials...</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
            <button
                onClick={() => navigate('/driver')}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Earnings</h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Financial performance dashboard</p>
            </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-gray-100 p-1 dark:bg-[rgba(255,255,255,0.05)]">
            {['today', 'week', 'month', 'all'].map((p) => (
                <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${period === p ? 'bg-black force-light-text shadow-lg dark:bg-[#FFD000] dark:text-black' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    {p === 'all' ? 'Historical' : p}
                </button>
            ))}
        </div>
      </header>

      {loading ? (
        <div className="rounded-[3.5rem] border border-gray-200 bg-white p-24 text-center dark:border-[rgba(255,255,255,0.05)] dark:bg-neutral-900/40">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gray-50 dark:bg-[rgba(255,255,255,0.05)] border border-dashed border-gray-300 dark:border-[rgba(255,255,255,0.10)]">
                <div className="h-10 w-10 border-4 border-[#FFD000] border-t-transparent animate-spin rounded-full" />
            </div>
            <h4 className="mt-8 text-xl font-bold">Syncing Ledger...</h4>
        </div>
      ) : (
        <div className="space-y-12">
            {/* Main Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 rounded-[3.5rem] bg-black p-12 text-white shadow-2xl shadow-black/20 dark:bg-[#111] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD000]/10 rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-125" />
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#FFD000] mb-4">Total Settled Revenue</p>
                            <h3 className="text-7xl font-black tracking-tighter leading-none force-light-text dark:!text-[#FFD000]">₹{earnings.total}</h3>
                            <p className="mt-6 text-xs font-bold force-muted-white uppercase tracking-widest flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Updated in Real-time
                            </p>
                        </div>
                        <div className="mt-12 flex flex-wrap gap-4">
                            <div className="rounded-2xl bg-[rgba(255,255,255,0.05)] px-6 py-3 border border-[rgba(255,255,255,0.05)]">
                                <p className="text-[9px] font-bold force-muted-white uppercase">Operational Grade: A+</p>
                            </div>
                            <div className="rounded-2xl bg-[rgba(255,255,255,0.05)] px-6 py-3 border border-[rgba(255,255,255,0.05)]">
                                <p className="text-[9px] font-bold force-muted-white uppercase">Lifetime Trips: {user.totalRides || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="flex-1 rounded-[2.5rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-[rgba(255,255,255,0.05)] dark:bg-neutral-900/40">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Today's yield</p>
                        <p className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">₹{earnings.today}</p>
                        <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-[rgba(255,255,255,0.05)]">
                            <div className="h-full bg-[#FFD000]" style={{ width: '75%' }} />
                        </div>
                    </div>
                    <div className="flex-1 rounded-[2.5rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-[rgba(255,255,255,0.05)] dark:bg-neutral-900/40">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Weekly performance</p>
                        <p className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">₹{earnings.week}</p>
                        <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-[rgba(255,255,255,0.05)]">
                            <div className="h-full bg-emerald-500" style={{ width: '45%' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Analytics */}
            <div className="rounded-[3.5rem] border border-gray-200 bg-white p-12 shadow-sm dark:border-white/5 dark:bg-neutral-900/40">
                <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white lowercase mb-12">Performance Analytics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                    <div className="text-center space-y-4">
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center dark:bg-[rgba(255,255,255,0.05)] text-gray-400">
                             <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Average Trip Fare</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">₹{user.totalRides > 0 ? Math.round(earnings.total / user.totalRides) : 0}</p>
                        </div>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center dark:bg-[rgba(255,255,255,0.05)] text-gray-400">
                             <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                             </svg>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Efficiency Delta</p>
                            <p className="text-4xl font-black text-emerald-500 tracking-tighter">+12.4%</p>
                        </div>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-[#FFD000] flex items-center justify-center text-black shadow-xl">
                             <span className="text-2xl font-black">★</span>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Driver Rating</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{user.rating || 5.0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Table */}
            <div className="rounded-[3.5rem] border border-gray-200 bg-white p-12 shadow-sm dark:border-white/5 dark:bg-neutral-900/40">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white lowercase">Transaction History</h3>
                    <div className="h-1 w-12 bg-[#FFD000] rounded-full" />
                </div>

                <div className="grid gap-6">
                    {recentEarnings.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-[2rem] dark:bg-[rgba(255,255,255,0.05)]">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">No historical data found</p>
                        </div>
                    ) : (
                        recentEarnings.map((earning, idx) => (
                            <div key={idx} className="group relative rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-[rgba(255,255,255,0.05)] dark:bg-[rgba(255,255,255,0.05)]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-400 dark:bg-[rgba(255,255,255,0.10)] group-hover:bg-[#FFD000] group-hover:text-black transition-colors">
                                            {earning.rider?.charAt(0) || 'R'}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{earning.rider || 'Rider'}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{formatDate(earning.date)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Credit Signal</p>
                                        <p className="text-2xl font-black text-emerald-500 tracking-tighter">+₹{earning.fare}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default DriverEarnings;
