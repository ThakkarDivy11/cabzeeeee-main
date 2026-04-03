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

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
                return 'bg-blue-100 text-blue-800';
            case 'started':
                return 'bg-yellow-100 text-yellow-800';
            case 'picked-up':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-soft-white font-sans text-navy">
            {/* Strategic Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-navy/5 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/admin')}
                                className="mr-6 p-3 rounded-xl bg-navy/5 text-navy hover:bg-navy hover:text-soft-white transition-all duration-300 transform active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div className="flex items-center group cursor-pointer" onClick={() => navigate('/admin')}>
                                <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center mr-4 shadow-xl shadow-navy/20 transform group-hover:rotate-6 transition-all duration-300">
                                    <span className="text-soft-white text-xl font-black">C</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-black tracking-tighter text-navy uppercase leading-none italic">Fleet Monitor</h1>
                                    <p className="text-[10px] font-bold text-sky-blue uppercase tracking-[0.2em] mt-1">Strategic Operations</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 px-6 py-2 bg-navy rounded-2xl shadow-lg border border-white/10">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></div>
                            <span className="text-[10px] font-black text-soft-white uppercase tracking-widest">Live Operations Feed</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Dynamic Summary */}
                <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <h2 className="text-5xl font-black text-navy tracking-tight mb-4 uppercase">Operational Status</h2>
                        <div className="flex items-center space-x-3">
                            <div className="h-1.5 w-16 bg-sky-blue rounded-full"></div>
                            <p className="text-sm font-bold text-navy/40 uppercase tracking-[0.2em]">Real-time command & control of all active deployments</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-8 py-4 rounded-[1.5rem] shadow-xl border border-navy/5 flex items-center space-x-6">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-navy/30 uppercase tracking-widest mb-1">Active Assets</p>
                                <p className="text-3xl font-black text-navy tracking-tighter italic">{activeRides.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-sky-blue rounded-xl flex items-center justify-center text-soft-white shadow-lg shadow-sky-blue/20">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white shadow-2xl rounded-[3rem] p-32 text-center border border-navy/5 animate-pulse">
                        <div className="w-24 h-24 bg-navy/[0.02] rounded-full flex items-center justify-center mx-auto mb-8 border border-navy/5">
                            <svg className="w-12 h-12 text-navy animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-navy uppercase tracking-tighter mb-3">Intercepting Data</h3>
                        <p className="text-sm font-bold text-navy/30 uppercase tracking-widest">Establishing secure link to fleet telemetry...</p>
                    </div>
                ) : activeRides.length === 0 ? (
                    <div className="bg-white shadow-2xl rounded-[3rem] p-32 text-center border border-navy/5">
                        <div className="w-32 h-32 bg-soft-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-navy/5">
                            <svg className="w-14 h-14 text-navy/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-black text-navy uppercase tracking-tighter mb-4">Zero Active Deployments</h3>
                        <p className="max-w-md mx-auto text-sm font-bold text-navy/30 uppercase tracking-widest leading-relaxed">The fleet is currently idle. Intercepting new mission signals in standby mode.</p>
                    </div>
                ) : (
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-2">
                        {activeRides.map((ride) => (
                            <div
                                key={ride._id}
                                className="group bg-white rounded-[3rem] shadow-2xl p-10 border border-navy/5 hover:border-navy hover:shadow-navy/10 transition-all duration-500 relative overflow-hidden flex flex-col"
                            >
                                {/* Status & Timing Header */}
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border shadow-sm ${ride.status === 'accepted' ? 'bg-sky-blue/5 text-sky-blue border-sky-blue/10' :
                                            ride.status === 'started' ? 'bg-yellow-500/5 text-yellow-600 border-yellow-500/10' :
                                                ride.status === 'picked-up' ? 'bg-green-500/5 text-green-600 border-green-500/10' :
                                                    'bg-navy/5 text-navy/40 border-navy/10'
                                            }`}>
                                            MISSION: {ride.status.replace('-', ' ')}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-navy/20 uppercase tracking-widest mb-1">Deployment Time</p>
                                        <p className="text-sm font-black text-navy tracking-tight">{new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>

                                {/* Tactical Profiles Grid */}
                                <div className="grid grid-cols-2 gap-6 mb-10">
                                    <div className="bg-soft-white p-6 rounded-[2rem] border border-navy/5">
                                        <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-4">Client Detail</p>
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-sky-blue rounded-xl flex items-center justify-center text-soft-white text-base font-black italic shadow-lg shadow-sky-blue/20">
                                                {ride.rider?.name?.charAt(0) || 'R'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-navy truncate uppercase">{ride.rider?.name || 'Authorized Client'}</p>
                                                <p className="text-[10px] text-navy/40 font-bold mt-1 truncate">{ride.rider?.phone}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-navy p-6 rounded-[2rem] border border-white/5 shadow-xl">
                                        <p className="text-[9px] font-black text-soft-white/30 uppercase tracking-widest mb-4">Operative Detail</p>
                                        {ride.driver ? (
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-soft-white text-base font-black italic border border-white/20">
                                                    {ride.driver.name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-soft-white truncate uppercase">{ride.driver.name}</p>
                                                    <p className="text-[10px] text-soft-white/40 font-bold mt-1 truncate">{ride.driver.phone}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-4 animate-pulse">
                                                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 w-20 bg-white/10 rounded"></div>
                                                    <div className="h-2 w-12 bg-white/5 rounded"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Mission Logistics */}
                                <div className="space-y-8 mb-10 pl-2">
                                    <div className="flex items-start group/loc">
                                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 ring-4 ring-green-100 group-hover/loc:scale-125 transition-transform"></div>
                                        <div className="ml-6 flex-1">
                                            <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-1.5">Activation Point</p>
                                            <p className="text-sm font-bold text-navy/80 leading-relaxed line-clamp-1 italic">{ride.pickupLocation?.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start group/loc">
                                        <div className="w-3 h-3 bg-red-500 rounded-full mt-1.5 ring-4 ring-red-100 group-hover/loc:scale-125 transition-transform"></div>
                                        <div className="ml-6 flex-1">
                                            <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-1.5">Target Terminal</p>
                                            <p className="text-sm font-bold text-navy/80 leading-relaxed line-clamp-1 italic">{ride.dropLocation?.address}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Operational Metadata */}
                                <div className="mt-auto pt-8 border-t border-navy/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-navy/20 uppercase tracking-widest mb-1">Contract Merit</p>
                                        <p className="text-3xl font-black text-navy tracking-tighter leading-none italic">₹{ride.fare}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {ride.otpVerified ? (
                                            <div className="flex flex-col items-end">
                                                <p className="text-[8px] font-black text-green-600 uppercase tracking-widest mb-1">Auth Verified</p>
                                                <div className="w-6 h-6 bg-green-500/10 text-green-600 rounded-lg flex items-center justify-center border border-green-500/20">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-end">
                                                <p className="text-[8px] font-black text-yellow-600 uppercase tracking-widest mb-1">Pending Auth</p>
                                                <div className="w-6 h-6 bg-yellow-500/10 text-yellow-600 rounded-lg flex items-center justify-center border border-yellow-500/20">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/live-ride/${ride._id}`); }}
                                            className="p-4 bg-navy text-soft-white rounded-2xl shadow-xl shadow-navy/20 hover:bg-sky-blue hover:shadow-sky-blue/20 transition-all duration-300 transform group-hover:rotate-3"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Interactive Overlay Indicator */}
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-navy/0 group-hover:bg-sky-blue transition-all duration-500"></div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-20 flex justify-center pb-8">
                    <div className="bg-white/50 backdrop-blur-sm px-8 py-3 rounded-full border border-navy/5 flex items-center space-x-4 shadow-sm">
                        <div className="w-2 h-2 bg-navy rounded-full animate-pulse"></div>
                        <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.4em]">Protocol Linked: Strategic Command established</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AllActiveRides;
