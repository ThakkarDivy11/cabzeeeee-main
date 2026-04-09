import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
          localStorage.setItem('user', JSON.stringify(data.data));
        } else {
          toast.error(data.message || 'Failed to fetch profile');
          if (response.status === 401) navigate('/login');
        }
      } catch (error) { toast.error('Network error'); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) return <div className="h-screen w-screen bg-[var(--bg)] flex items-center justify-center cz-bebas text-3xl text-yellow-500 animate-pulse">DECRYPTING IDENTITY...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] cz-dm relative py-12 px-4 sm:px-8">
      <div className="cz-noise" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
                <button onClick={() => navigate('/rider')} className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500 hover:translate-x-[-4px] transition-transform">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                    Terminal Home
                </button>
                <h1 className="cz-bebas text-7xl text-[var(--text)] tracking-widest leading-none drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">IDENTITY PROFILE</h1>
                <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.5em] mt-3 ml-1">SECURE CLEARANCE & PERSONAL PARAMETERS</p>
            </div>
            <button
              onClick={() => navigate('/edit-profile')}
              className="cz-bebas text-2xl tracking-widest bg-yellow-500 text-black px-10 py-4 rounded-2xl hover:scale-105 transition-all shadow-[0_15px_40px_rgba(255,208,0,0.2)]"
            >
              MODIFY PARAMETERS
            </button>
        </div>

        {/* Identity Matrix Card */}
        <div className="cz-glass rounded-[4rem] border border-[var(--border)] overflow-hidden shadow-2xl">
            {/* Upper Profile Shield */}
            <div className="bg-yellow-500/5 p-12 flex flex-col items-center border-b border-white/5 relative group">
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/20" />
                <div className="w-48 h-48 rounded-[3.5rem] overflow-hidden border-[8px] border-white/5 shadow-2xl mb-8 bg-black/40 flex items-center justify-center transform group-hover:rotate-2 transition-transform duration-700">
                    {user.profilePicture ? (
                        <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="cz-bebas text-8xl text-yellow-500">{user.name.charAt(0)}</span>
                    )}
                </div>
                <h2 className="cz-bebas text-5xl text-[var(--text)] tracking-widest mb-4">{user.name}</h2>
                <div className="flex items-center gap-4">
                    <span className="px-5 py-1.5 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full">{user.role} OPERATOR</span>
                    <div className={`flex items-center gap-2 px-5 py-1.5 rounded-full border ${user.isVerified ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-rose-500/30 text-rose-500 bg-rose-500/5'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isVerified ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{user.isVerified ? 'VERIFIED' : 'PENDING'}</span>
                    </div>
                </div>
            </div>

            {/* Parameter Grid */}
            <div className="p-12 sm:p-16">
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-1.5 h-8 bg-yellow-500 rounded-full" />
                    <h3 className="cz-bebas text-3xl text-[var(--text)] tracking-widest">PRIVATE DATA SECTOR</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] ml-1">LEGAL ALIAS</label>
                        <div className="cz-glass-light border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold text-[var(--text)] uppercase tracking-wider">{user.name}</div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] ml-1">DIGITAL COORDS</label>
                        <div className="cz-glass-light border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold text-[var(--text)] break-all">{user.email}</div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] ml-1">SECURE COMMS</label>
                        <div className="cz-glass-light border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold text-[var(--text)] tracking-widest">{user.phone}</div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] ml-1">STATUS PHASE</label>
                        <div className="cz-glass-light border border-white/5 rounded-2xl px-8 py-5 text-sm font-bold text-[var(--text)] uppercase tracking-widest">ACTIVE DUTY / {user.role}</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Fleet Section (Conditional) */}
        {user.role === 'driver' && user.vehicleInfo && (
          <div className="mt-12 cz-glass rounded-[3.5rem] border border-yellow-500/20 overflow-hidden shadow-2xl">
            <div className="bg-yellow-500 px-12 py-6 flex items-center justify-between">
                <h3 className="cz-bebas text-3xl text-black tracking-widest">FLEET SPECIFICATIONS</h3>
                <svg className="w-8 h-8 text-black/40" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/></svg>
            </div>
            <div className="p-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">ASSET MODEL</p>
                    <div className="bg-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text)] uppercase">{user.vehicleInfo.make} {user.vehicleInfo.model}</div>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">PLATE REGISTRY</p>
                    <div className="bg-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text)] uppercase tracking-widest">{user.vehicleInfo.licensePlate}</div>
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest ml-1">ASSET TYPE</p>
                    <div className="bg-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-[var(--text)] uppercase tracking-widest">{user.vehicleInfo.vehicleType}</div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
