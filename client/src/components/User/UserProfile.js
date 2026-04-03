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
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-soft-white font-sans text-navy">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-navy/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center group">
              <button
                onClick={() => navigate(-1)}
                className="mr-6 p-2 rounded-xl bg-soft-white border border-navy/5 text-navy/40 hover:text-navy hover:shadow-md transition-all active:scale-95"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-black text-navy uppercase tracking-tighter">Account Profile</h1>
                <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest leading-none mt-1">Identity Management</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/edit-profile')}
              className="bg-navy text-soft-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-navy-dark transition-all shadow-2xl shadow-navy/20 active:scale-95"
            >
              Modify Identity
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-navy/5 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-navy/[0.02] rounded-full -mr-32 -mt-32"></div>

          <div className="px-12 py-12 flex flex-col items-center border-b border-navy/5 bg-navy text-soft-white relative z-10">
            <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-[6px] border-white/10 shadow-2xl mb-6 bg-soft-white/10 flex items-center justify-center transform hover:rotate-3 transition-transform duration-500">
              {user.profilePicture ? (
                <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-soft-white text-6xl font-black">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <h2 className="text-4xl font-black tracking-tight">{user.name}</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="px-4 py-1.5 bg-sky-blue text-soft-white text-[10px] font-black uppercase tracking-widest rounded-full">{user.role}</span>
              <div className="h-1.5 w-1.5 bg-white/20 rounded-full"></div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${user.isVerified ? 'text-green-400' : 'text-red-400'}`}>
                {user.isVerified ? 'Verified Account' : 'Action Required: Verify'}
              </span>
            </div>
          </div>

          <div className="p-12">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-navy/5">
              <div className="p-3 bg-navy rounded-xl text-soft-white shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-black text-navy uppercase tracking-tighter leading-none">Personal Data</h3>
                <p className="text-[10px] font-bold text-navy/30 uppercase tracking-widest mt-1">Private Information Layer</p>
              </div>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <div className="group">
                <dt className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] mb-2 ml-1 transition-colors group-hover:text-navy">Full Legal Name</dt>
                <dd className="px-6 py-4 bg-soft-white/50 border border-navy/5 rounded-2xl text-sm font-bold text-navy shadow-sm">{user.name}</dd>
              </div>
              <div className="group">
                <dt className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] mb-2 ml-1 transition-colors group-hover:text-navy">Digital Address</dt>
                <dd className="px-6 py-4 bg-soft-white/50 border border-navy/5 rounded-2xl text-sm font-bold text-navy shadow-sm break-all">{user.email}</dd>
              </div>
              <div className="group">
                <dt className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] mb-2 ml-1 transition-colors group-hover:text-navy">Secure Mobile Number</dt>
                <dd className="px-6 py-4 bg-soft-white/50 border border-navy/5 rounded-2xl text-sm font-bold text-navy shadow-sm">{user.phone}</dd>
              </div>
              <div className="group">
                <dt className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] mb-2 ml-1 transition-colors group-hover:text-navy">Operational Capacity</dt>
                <dd className="px-6 py-4 bg-soft-white/50 border border-navy/5 rounded-2xl text-sm font-bold text-navy shadow-sm uppercase">{user.role}</dd>
              </div>
            </dl>
          </div>
        </div>

        {user.role === 'driver' && user.vehicleInfo && (
          <div className="mt-12 bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-navy/5">
            <div className="px-12 py-8 bg-sky-blue text-soft-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter leading-none">Registered Fleet</h3>
                <p className="text-[10px] font-bold text-soft-white/60 uppercase tracking-widest mt-1">Vehicle Specifications</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="p-12">
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                <div className="group">
                  <dt className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] mb-2 ml-1">Asset Model</dt>
                  <dd className="px-5 py-4 bg-soft-white/50 border border-navy/5 rounded-xl text-sm font-bold text-navy">{user.vehicleInfo.make} {user.vehicleInfo.model}</dd>
                </div>
                <div className="group">
                  <dt className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] mb-2 ml-1">Plate Number</dt>
                  <dd className="px-5 py-4 bg-soft-white/50 border border-navy/5 rounded-xl text-sm font-bold text-navy uppercase">{user.vehicleInfo.licensePlate}</dd>
                </div>
                <div className="group">
                  <dt className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em] mb-2 ml-1">Asset Category</dt>
                  <dd className="px-5 py-4 bg-soft-white/50 border border-navy/5 rounded-xl text-sm font-bold text-navy uppercase">{user.vehicleInfo.vehicleType}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfile;

