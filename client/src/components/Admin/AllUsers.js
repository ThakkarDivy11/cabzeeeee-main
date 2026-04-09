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
        return <div className="p-20 text-center font-bold text-gray-500">Loading directory...</div>;
    }

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
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">User Management</h2>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Manage official partners & clients</p>
                    </div>
                </div>

                <div className="flex h-14 items-center gap-6 rounded-[2rem] border border-gray-100 bg-white px-8 shadow-sm dark:border-white/5 dark:bg-white/5">
                    <div className="flex flex-col items-end">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{users.length}</p>
                    </div>
                    <div className="h-8 w-px bg-gray-100 dark:bg-white/10" />
                    <div className="rounded-xl bg-black px-4 py-2 dark:bg-[#FFD000]">
                         <span className="text-[10px] font-black uppercase tracking-widest text-white dark:text-black">Master Access</span>
                    </div>
                </div>
            </header>

            <div className="rounded-[3.5rem] border border-gray-200 bg-white shadow-xl dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-black">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Profile</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Contact</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Role</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Vehicle</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {users.map((user) => (
                                <tr key={user._id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                                {user.profilePicture ? (
                                                    <img
                                                        className="h-full w-full object-cover"
                                                        src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`}
                                                        alt={user.name}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-[#FFD000] text-xl font-black text-black">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-tight leading-none">{user.name}</p>
                                                <p className="mt-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">ID: {user._id.slice(-12).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user.email}</p>
                                        <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">+91 {user.phone}</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`rounded-xl px-5 py-2 text-[9px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : user.role === 'driver' ? 'bg-[#FFD000]/10 text-[#FFD000] border-[#FFD000]/20' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        {user.role === 'driver' && user.vehicleInfo && user.vehicleInfo.licensePlate ? (
                                            <span className="font-mono text-xs font-black uppercase tracking-widest bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
                                                {user.vehicleInfo.licensePlate}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300 dark:text-gray-700">──</span>
                                        )}
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-2.5 w-2.5 rounded-full ${user.isVerified ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-red-500'}`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${user.isVerified ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {user.isVerified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllUsers;
