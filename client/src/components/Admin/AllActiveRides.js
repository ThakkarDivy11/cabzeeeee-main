import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AllActiveRides = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeRides, setActiveRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            if (parsed.role !== 'admin') {
                navigate('/login');
                return;
            }
            setUser(parsed);
        } else {
            navigate('/login');
            return;
        }

        fetchActiveRides();
        const interval = setInterval(fetchActiveRides, 10000); // Refresh every 10 seconds

        return () => clearInterval(interval);
    }, [navigate]);

    const fetchActiveRides = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/rides/my-rides', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const active = data.data.filter(r =>
                    ['accepted', 'started', 'picked-up'].includes(r.status)
                );
                setActiveRides(active);
            }
        } catch (error) {
            console.error('Error fetching rides:', error);
            toast.error('Failed to load rides');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Active Feed</h2>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Real-time fleet monitoring</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-black px-6 py-3 shadow-xl dark:bg-[#FFD000]">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white dark:text-black">Live Operations</span>
                </div>
            </header>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                <div>
                    <h3 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Operational Status</h3>
                    <div className="mt-4 flex items-center gap-3">
                        <div className="h-1.5 w-16 bg-[#FFD000] rounded-full" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Global Command of Active Deployments</p>
                    </div>
                </div>
                <div className="flex items-center gap-6 rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/5">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Assets</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{activeRides.length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-[#FFD000] flex items-center justify-center text-black shadow-lg">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-24 rounded-[4rem] border border-gray-100 bg-white dark:border-white/5 dark:bg-neutral-900/40">
                    <div className="h-12 w-12 border-4 border-[#FFD000] border-t-transparent animate-spin rounded-full mx-auto" />
                </div>
            ) : activeRides.length === 0 ? (
                <div className="text-center py-32 rounded-[4rem] border-2 border-dashed border-gray-100 dark:border-white/5">
                     <div className="mx-auto h-24 w-24 rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-200 mb-8 dark:bg-white/5">
                        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                     </div>
                     <h4 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-tight">Fleet Standby</h4>
                     <p className="mt-2 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Zero active deployments currently intercepted</p>
                </div>
            ) : (
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-2">
                    {activeRides.map((ride) => (
                        <div key={ride._id} className="group relative rounded-[3.5rem] border border-gray-200 bg-white p-10 shadow-sm transition-all duration-500 hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-10 pb-10 border-b border-gray-100 dark:border-white/5">
                                <span className={`rounded-xl px-5 py-2 text-[9px] font-black uppercase tracking-widest border ${ride.status === 'accepted' ? 'bg-[#FFD000]/10 text-[#FFD000] border-[#FFD000]/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                    Status: {ride.status.replace('-', ' ')}
                                </span>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Commenced</p>
                                    <p className="text-sm font-black text-gray-900 dark:text-white">{new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="rounded-[2rem] bg-gray-50 p-6 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">Passenger</p>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold dark:bg-[#FFD000] dark:text-black">
                                            {ride.rider?.name?.charAt(0) || 'R'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate uppercase">{ride.rider?.name || 'Authorized Client'}</p>
                                            <p className="text-[10px] font-bold text-gray-400 truncate">+91 {ride.rider?.phone}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-[2rem] bg-black p-6 text-white border border-white/5">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4">Driver</p>
                                    {ride.driver ? (
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-sm font-bold">
                                                {ride.driver.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-white truncate uppercase">{ride.driver.name}</p>
                                                <p className="text-[10px] font-bold text-gray-500 truncate">+91 {ride.driver.phone}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-10 animate-pulse bg-white/5 rounded-xl w-full" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8 mb-10 pl-2">
                                <div className="relative flex gap-6">
                                    <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Pickup Location</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed line-clamp-1">{ride.pickupLocation?.address}</p>
                                    </div>
                                </div>
                                <div className="relative flex gap-6">
                                    <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-red-500 ring-4 ring-red-500/10" />
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Drop Destination</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed line-clamp-1">{ride.dropLocation?.address}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-10 border-t border-gray-100 flex items-center justify-between dark:border-white/5">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contract Merit</p>
                                    <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">₹{ride.fare}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-end">
                                        <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${ride.otpVerified ? 'text-emerald-500' : 'text-[#FFD000]'}`}>
                                            {ride.otpVerified ? 'Auth Verified' : 'Pending Auth'}
                                        </p>
                                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center border ${ride.otpVerified ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[#FFD000]/10 text-[#FFD000] border-[#FFD000]/20'}`}>
                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                {ride.otpVerified ? (
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                ) : (
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                )}
                                            </svg>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/live-ride/${ride._id}`); }}
                                        className="h-14 w-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-xl hover:scale-110 hover:-rotate-12 transition-all dark:bg-[#FFD000] dark:text-black"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllActiveRides;
