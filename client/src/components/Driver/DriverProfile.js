import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DriverProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          if (data.data.role !== 'driver') {
            navigate('/login');
            return;
          }
          setUser(data.data);
          localStorage.setItem('user', JSON.stringify(data.data));
        } else {
          toast.error(data.message || 'Failed to fetch profile');
          if (response.status === 401) navigate('/login');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <div className="p-20 text-center font-bold text-gray-500">Loading profile...</div>;
  }

  if (!user) return null;

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
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Profile</h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Manage your official identity</p>
            </div>
        </div>
        <button
            onClick={() => navigate('/edit-driver-profile')}
            className="rounded-xl bg-black px-8 py-3.5 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-neutral-800 dark:bg-[#FFD000] dark:text-black dark:hover:bg-[#ffe04d]"
        >
            Update Information &rarr;
        </button>
      </header>

      <div className="grid gap-10">
        {/* Main Info Card */}
        <div className="group relative rounded-[3rem] border border-gray-200 bg-white p-10 shadow-sm transition-all duration-500 hover:shadow-2xl dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center gap-12 border-b border-gray-100 pb-12 dark:border-white/5">
                <div className="relative">
                    <div className="h-40 w-40 rounded-[3rem] overflow-hidden bg-gray-100 dark:bg-white/5 border-4 border-white dark:border-neutral-800 shadow-2xl flex items-center justify-center">
                        {user.profilePicture ? (
                            <img 
                                src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`} 
                                alt={user.name} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            <span className="text-6xl font-black text-[#FFD000]">{user.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-[#FFD000] flex items-center justify-center text-black shadow-lg border-4 border-white dark:border-neutral-800">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>

                <div className="text-center md:text-left flex-1">
                    <h3 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">{user.name}</h3>
                    <div className="mt-2 flex flex-wrap justify-center md:justify-start items-center gap-4">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Official Fleet Driver</span>
                         <span className="h-1 w-1 rounded-full bg-gray-300" />
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {user._id?.slice(-8).toUpperCase()}</span>
                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-6">
                        <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${user.driverStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                                <span className="text-xs font-black uppercase text-gray-900 dark:text-white">{user.driverStatus || 'offline'}</span>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Rating</p>
                            <p className="text-xs font-black text-gray-900 dark:text-white">{user.rating || 5.0} <span className="text-[#FFD000]">★</span></p>
                        </div>
                        <div className="rounded-2xl bg-gray-50 p-4 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">Trips</p>
                            <p className="text-xs font-black text-gray-900 dark:text-white">{user.totalRides || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FFD000]">Contact Email</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FFD000]">Phone Number</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">+91 {user.phone}</p>
                </div>
                <div className="space-y-2">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#FFD000]">Verification</p>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${user.isVerified ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {user.isVerified ? 'Fully Verified' : 'Authentication Pending'}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Vehicle Details */}
        <div className="rounded-[3rem] border border-gray-200 bg-white p-10 shadow-sm dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white lowercase">Registered Vehicle</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#FFD000] mt-1">Official Transport Asset</p>
                </div>
                <button
                    onClick={() => navigate('/vehicle-details')}
                    className="rounded-xl bg-gray-50 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-900 hover:bg-gray-100 transition-all dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                >
                    Update Vehicle &rarr;
                </button>
            </div>

            {user.vehicleInfo ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="rounded-3xl bg-gray-50/50 p-6 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Model</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{user.vehicleInfo.make} {user.vehicleInfo.model}</p>
                    </div>
                    <div className="rounded-3xl bg-gray-50/50 p-6 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">License Plate</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">{user.vehicleInfo.licensePlate}</p>
                    </div>
                    <div className="rounded-3xl bg-gray-50/50 p-6 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Color</p>
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-4 rounded-full border border-gray-200 dark:border-white/10" style={{ backgroundColor: user.vehicleInfo.color?.toLowerCase() }} />
                            <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{user.vehicleInfo.color}</p>
                        </div>
                    </div>
                    <div className="rounded-3xl bg-gray-50/50 p-6 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Class</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{user.vehicleInfo.vehicleType || 'Standard'}</p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/10">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Asset Linked to Profile</p>
                    <button
                        onClick={() => navigate('/vehicle-details')}
                        className="mt-6 rounded-xl bg-black px-10 py-4 text-[10px] font-black uppercase tracking-widest text-white hover:bg-neutral-800 dark:bg-[#FFD000] dark:text-black"
                    >
                        Sync Vehicle Data
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
