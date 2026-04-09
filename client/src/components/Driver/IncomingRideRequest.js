import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const IncomingRideRequest = () => {
  const [user, setUser] = useState(null);
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(true);
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

    fetchRideRequests();
    const interval = setInterval(fetchRideRequests, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchRideRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/rides/pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRideRequests(data.data || []);
        } else {
          setRideRequests([]);
        }
      } else {
        setRideRequests([]);
        if (response.status === 401) navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching ride requests:', error);
      setRideRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request) => {
    localStorage.setItem('selectedRideRequest', JSON.stringify(request));
    navigate('/accept-reject-ride');
  };

  if (!user) return <div className="p-20 text-center font-bold text-gray-500">Initializing...</div>;

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
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Ride Requests</h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Live dispatch stream</p>
            </div>
        </div>
        <button
            onClick={fetchRideRequests}
            className="flex items-center gap-2 rounded-xl bg-gray-100 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-900 transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
        >
            <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh List
        </button>
      </header>

      <div className="space-y-6">
        {loading ? (
          <div className="rounded-[2.5rem] border border-gray-200 bg-white p-24 text-center dark:border-white/5 dark:bg-neutral-900/40">
            <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10">
                <div className="h-10 w-10 border-4 border-[#FFD000] border-t-transparent animate-spin rounded-full" />
            </div>
            <h4 className="mt-8 text-xl font-bold">Scanning...</h4>
            <p className="mt-2 text-sm text-gray-500 uppercase tracking-widest">Awaiting dispatch signals from the network</p>
          </div>
        ) : rideRequests.length === 0 ? (
          <div className="rounded-[2.5rem] border border-gray-200 bg-white p-24 text-center dark:border-white/5 dark:bg-neutral-900/40">
            <div className="mx-auto h-32 w-32 flex items-center justify-center rounded-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 mb-8">
              <svg className="h-16 w-16 text-gray-300 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.5 9.5 0 0114.142 0" />
              </svg>
            </div>
            <h3 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Operational Quiet</h3>
            <p className="mt-4 text-sm font-medium text-gray-400 uppercase tracking-[0.2em] max-w-sm mx-auto">No requests detected at your current coordinates. Maintain standby status.</p>
            <button
              onClick={() => navigate('/driver')}
              className="mt-12 rounded-xl bg-[#FFD000] px-10 py-4 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-[#FFD000]/20 transition-all hover:scale-105 active:scale-95"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="grid gap-8">
            {rideRequests.map((request) => (
              <div key={request._id} className="group relative rounded-[3rem] border border-gray-200 bg-white p-10 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-[#FFD000]/30 hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                  <div className="flex items-center gap-8">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-[2rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center text-4xl font-black text-[#FFD000] border-4 border-white dark:border-neutral-800 shadow-xl group-hover:scale-110 transition-transform">
                            {request.rider?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-4 border-white dark:border-neutral-800 shadow-lg" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Incoming Client</p>
                        <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{request.rider?.name || 'Authorized Client'}</h3>
                        <div className="mt-2 flex items-center gap-2">
                             <span className="text-yellow-500">★</span>
                             <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{request.rider?.rating || '5.0'} Merit</span>
                        </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-auto text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Estimated fare</p>
                    <p className="text-5xl font-black tracking-tighter text-[#FFD000]">₹{request.fare}</p>
                    <div className="mt-4 flex items-center justify-end gap-3 font-bold uppercase tracking-widest text-[10px]">
                        <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">{request.distance || '0'} KM</span>
                        <span className="bg-[#FFD000]/10 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full border border-[#FFD000]/20">{request.estimatedTime || '5'} MIN</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 grid gap-8 lg:grid-cols-2 items-end">
                    <div className="space-y-6 rounded-[2rem] border border-gray-100 bg-gray-50/50 p-8 dark:border-white/5 dark:bg-white/5">
                        <div className="flex gap-6 items-start">
                            <div className="mt-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Pickup point</p>
                                <p className="text-base font-bold text-gray-900 dark:text-white line-clamp-2">{request.pickupLocation?.address || 'Restricted Area'}</p>
                            </div>
                        </div>
                        <div className="flex gap-6 items-start">
                            <div className="mt-1.5 h-3 w-3 rounded-full bg-red-500 ring-4 ring-red-500/10" />
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Drop point</p>
                                <p className="text-base font-bold text-gray-900 dark:text-white line-clamp-2">{request.dropLocation?.address || 'Undisclosed'}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => handleViewRequest(request)}
                        className="w-full rounded-2xl bg-black py-6 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-neutral-800 dark:bg-[#FFD000] dark:text-black dark:hover:bg-[#ffe04d] active:scale-[0.98]"
                    >
                        Review Request Signal &rarr;
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingRideRequest;
