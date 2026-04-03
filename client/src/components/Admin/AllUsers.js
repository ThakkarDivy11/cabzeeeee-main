import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/admin-login');
                    return;
                }

                const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (data.success) {
                    setUsers(data.data);
                } else {
                    toast.error(data.message || 'Failed to fetch users');
                    if (response.status === 401 || response.status === 403) navigate('/admin-login');
                }
            } catch (error) {
                console.error('Error:', error);
                toast.error('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [navigate]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-soft-white font-sans text-navy">
            {/* Premium Hub Header */}
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
                                    <span className="text-soft-white text-xl font-black italic">C</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-black tracking-tighter text-navy uppercase leading-none italic">Identity Index</h1>
                                    <p className="text-[10px] font-bold text-sky-blue uppercase tracking-[0.2em] mt-1">Enterprise User Management</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="hidden lg:flex flex-col items-end">
                                <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-1">Total Identities</p>
                                <p className="text-xl font-black text-navy leading-none italic">{users.length}</p>
                            </div>
                            <div className="h-10 w-[1px] bg-navy/5 hidden lg:block"></div>
                            <div className="bg-navy px-4 py-2 rounded-xl shadow-lg border border-white/10">
                                <p className="text-[9px] font-black text-soft-white uppercase tracking-widest">Master Clearance</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-16">
                    <h2 className="text-5xl font-black text-navy tracking-tight mb-4 uppercase italic">Global Registry</h2>
                    <div className="flex items-center space-x-4">
                        <div className="h-1.5 w-16 bg-sky-blue rounded-full"></div>
                        <p className="text-sm font-bold text-navy/40 uppercase tracking-[0.3em] italic">Full-spectrum management of all authorized partners & clients</p>
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-[3rem] border border-navy/5 overflow-hidden group/container">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-navy/5">
                            <thead className="bg-navy">
                                <tr>
                                    <th className="px-10 py-8 text-left text-[10px] font-black text-soft-white/60 uppercase tracking-[0.3em]">Identity Profile</th>
                                    <th className="px-10 py-8 text-left text-[10px] font-black text-soft-white/60 uppercase tracking-[0.3em]">Contact Vector</th>
                                    <th className="px-10 py-8 text-left text-[10px] font-black text-soft-white/60 uppercase tracking-[0.3em]">Operational Role</th>
                                    <th className="px-10 py-8 text-left text-[10px] font-black text-soft-white/60 uppercase tracking-[0.3em]">Asset Meta</th>
                                    <th className="px-10 py-8 text-left text-[10px] font-black text-soft-white/60 uppercase tracking-[0.3em]">Protocol Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-navy/5">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-soft-white transition-all duration-300 group">
                                        <td className="px-10 py-10 whitespace-nowrap">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[1.25rem] overflow-hidden shadow-2xl border-4 border-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                    {user.profilePicture ? (
                                                        <img
                                                            className="h-full w-full object-cover"
                                                            src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`}
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-navy flex items-center justify-center">
                                                            <span className="text-soft-white text-xl font-black italic">{user.name.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-lg font-black text-navy uppercase tracking-tighter leading-none">{user.name}</div>
                                                    <div className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] mt-2">UUID: {user._id.slice(-12)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10 whitespace-nowrap">
                                            <div className="space-y-1.5">
                                                <div className="text-sm font-bold text-navy lowercase tracking-tight flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-blue"></div>
                                                    {user.email}
                                                </div>
                                                <div className="text-[10px] font-black text-navy/40 pl-3.5 tracking-widest">{user.phone}</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-10 whitespace-nowrap">
                                            <span className={`px-5 py-2 inline-flex text-[9px] font-black uppercase tracking-[0.2em] rounded-xl shadow-sm border ${user.role === 'admin' ? 'bg-purple-500/5 text-purple-600 border-purple-500/10' :
                                                    user.role === 'driver' ? 'bg-sky-blue/5 text-sky-blue border-sky-blue/10' :
                                                        'bg-soft-white text-navy/60 border-navy/5'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-10 py-10 whitespace-nowrap">
                                            {user.role === 'driver' && user.vehicleInfo && user.vehicleInfo.licensePlate ? (
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-soft-white rounded-xl border border-navy/5 flex items-center justify-center text-navy/20 group-hover:bg-navy group-hover:text-soft-white transition-colors duration-500">
                                                        <svg className="w-5 h-5 font-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-mono text-xs font-black text-navy bg-soft-white px-4 py-2 rounded-xl border border-navy/5 shadow-inner group-hover:shadow-md transition-all">
                                                        {user.vehicleInfo.licensePlate.toUpperCase()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="h-1 w-10 bg-navy/[0.03] rounded-full mx-auto"></div>
                                            )}
                                        </td>
                                        <td className="px-10 py-10 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-2.5 rounded-full ${user.isVerified ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-red-500 shadow-lg shadow-red-200'}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${user.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                                                    {user.isVerified ? 'Synchronized' : 'Quarantined'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-20 flex justify-center pb-8">
                    <div className="bg-white/50 backdrop-blur-sm px-8 py-3 rounded-full border border-navy/5 flex items-center space-x-4 shadow-sm">
                        <div className="w-2 h-2 bg-navy rounded-full animate-pulse"></div>
                        <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.4em]">Registry Status: Secure & Synchronized</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AllUsers;
