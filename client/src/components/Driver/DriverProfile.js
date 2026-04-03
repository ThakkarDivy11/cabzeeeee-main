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
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-soft-white font-sans text-navy">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-navy/5 shadow-sm">
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
                  <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Operative Identity</h1>
                  <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest mt-0.5">Registry Profile</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/edit-driver-profile')}
              className="bg-navy text-soft-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-blue shadow-xl shadow-navy/20 transition-all transform active:scale-95"
            >
              Modify Registry
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <div className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-navy/5 relative mb-12">
          <div className="absolute top-0 left-0 w-full h-2 bg-navy"></div>

          <div className="px-10 py-16 flex flex-col items-center border-b border-navy/5 bg-navy/[0.01] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-navy/[0.02] rounded-full -mr-32 -mt-32"></div>

            <div className="relative group mb-8">
              <div className="absolute inset-0 bg-sky-blue rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="w-40 h-40 rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative z-10 bg-navy flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                {user.profilePicture ? (
                  <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${user.profilePicture}`} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-soft-white text-6xl font-black italic">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-sky-blue text-white p-3 rounded-2xl shadow-xl z-20 border-4 border-white">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                </svg>
              </div>
            </div>

            <h2 className="text-4xl font-black text-navy tracking-tighter mb-1 uppercase">{user.name}</h2>
            <div className="flex items-center space-x-2 mb-6">
              <span className="text-[10px] font-black text-navy/30 uppercase tracking-[0.2em]">Fleet Operative</span>
              <div className="w-1 h-1 bg-navy/20 rounded-full"></div>
              <span className="text-[10px] font-black text-sky-blue uppercase tracking-[0.2em]">ID: {user._id?.slice(-8).toUpperCase()}</span>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full max-w-lg mt-4">
              <div className="bg-white p-6 rounded-3xl border border-navy/5 shadow-sm text-center">
                <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em] mb-1">Status</p>
                <div className="flex items-center justify-center space-x-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${user.driverStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-navy/20'}`}></div>
                  <p className="text-xs font-black text-navy uppercase">{user.driverStatus || 'offline'}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-navy/5 shadow-sm text-center">
                <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em] mb-1">Merit Score</p>
                <p className="text-xs font-black text-navy">{user.rating || 5.0} <span className="text-yellow-500">★</span></p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-navy/5 shadow-sm text-center">
                <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em] mb-1">Missions</p>
                <p className="text-xs font-black text-navy">{user.totalRides || 0}</p>
              </div>
            </div>
          </div>

          <div className="px-10 py-12">
            <h3 className="text-[10px] font-black text-navy/20 uppercase tracking-[0.3em] mb-10 ml-1">Core Registry Data</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="group">
                <dt className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-2 flex items-center">
                  <div className="w-1.5 h-1.5 bg-sky-blue rounded-full mr-2"></div>
                  Full Name
                </dt>
                <dd className="text-lg font-bold text-navy bg-soft-white p-5 rounded-2xl border border-navy/5 group-hover:border-navy/20 transition-colors">{user.name}</dd>
              </div>
              <div className="group">
                <dt className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-2 flex items-center">
                  <div className="w-1.5 h-1.5 bg-sky-blue rounded-full mr-2"></div>
                  Contact Email
                </dt>
                <dd className="text-lg font-bold text-navy bg-soft-white p-5 rounded-2xl border border-navy/5 group-hover:border-navy/20 transition-colors">{user.email}</dd>
              </div>
              <div className="group">
                <dt className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-2 flex items-center">
                  <div className="w-1.5 h-1.5 bg-sky-blue rounded-full mr-2"></div>
                  Mobile Protocol
                </dt>
                <dd className="text-lg font-bold text-navy bg-soft-white p-5 rounded-2xl border border-navy/5 group-hover:border-navy/20 transition-colors">+91 {user.phone}</dd>
              </div>
              <div className="group">
                <dt className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-2 flex items-center">
                  <div className="w-1.5 h-1.5 bg-sky-blue rounded-full mr-2"></div>
                  Verification Status
                </dt>
                <dd className="flex items-center justify-between bg-soft-white p-5 rounded-2xl border border-navy/5 group-hover:border-navy/20 transition-colors">
                  <span className="text-lg font-bold text-navy">{user.isVerified ? 'Synchronized' : 'Pending Link'}</span>
                  <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full ${user.isVerified ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Vehicle Information section */}
        <div className="bg-navy p-1 col-span-full rounded-[3rem] shadow-2xl shadow-navy/20 overflow-hidden group">
          <div className="bg-white rounded-[2.9rem] p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-navy/[0.01] rounded-full -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-1000"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
              <div>
                <h3 className="text-3xl font-black text-navy uppercase tracking-tighter mb-2">Fleet Asset Data</h3>
                <div className="flex items-center space-x-2">
                  <div className="h-1 w-8 bg-sky-blue rounded-full"></div>
                  <p className="text-[10px] font-bold text-navy/30 uppercase tracking-widest">Registered Operator Vehicle</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/vehicle-details')}
                className="bg-navy/5 text-navy px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-navy hover:text-soft-white transition-all shadow-sm"
              >
                Modify Asset Details
              </button>
            </div>

            {user.vehicleInfo ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-soft-white p-6 rounded-[2rem] border border-navy/5 hover:border-sky-blue/30 transition-colors">
                  <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-3">Make & Model</p>
                  <p className="text-lg font-black text-navy leading-none">{user.vehicleInfo.make} {user.vehicleInfo.model}</p>
                  <p className="text-[10px] font-bold text-sky-blue mt-2 uppercase">{user.vehicleInfo.year || '2024'} Edition</p>
                </div>
                <div className="bg-soft-white p-6 rounded-[2rem] border border-navy/5 hover:border-sky-blue/30 transition-colors">
                  <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-3">Registry Plate</p>
                  <p className="text-lg font-black text-navy leading-none uppercase tracking-wider">{user.vehicleInfo.licensePlate || 'N/A'}</p>
                  <p className="text-[10px] font-bold text-navy/20 mt-2 uppercase tracking-widest">RTO Authorized</p>
                </div>
                <div className="bg-soft-white p-6 rounded-[2rem] border border-navy/5 hover:border-sky-blue/30 transition-colors">
                  <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-3">Aesthetic Finish</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full shadow-inner border border-navy/10" style={{ backgroundColor: user.vehicleInfo.color?.toLowerCase() || '#000' }}></div>
                    <p className="text-lg font-black text-navy leading-none capitalize">{user.vehicleInfo.color || 'Onyx'}</p>
                  </div>
                  <p className="text-[10px] font-bold text-navy/20 mt-2 uppercase tracking-widest">External Hue</p>
                </div>
                <div className="bg-soft-white p-6 rounded-[2rem] border border-navy/5 hover:border-sky-blue/30 transition-colors">
                  <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-3">Asset Classification</p>
                  <p className="text-lg font-black text-navy leading-none capitalize">{user.vehicleInfo.vehicleType || 'Economy'}</p>
                  <p className="text-[10px] font-bold text-sky-blue mt-2 uppercase tracking-widest">Fleet Tier</p>
                </div>
              </div>
            ) : (
              <div className="bg-soft-white border-2 border-dashed border-navy/10 rounded-[2.5rem] p-16 text-center">
                <div className="w-20 h-20 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-navy/10">
                  <svg className="w-10 h-10 text-navy/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-navy uppercase tracking-tighter mb-2">No Asset Linked</h3>
                <p className="text-sm font-bold text-navy/30 max-w-sm mx-auto leading-relaxed uppercase tracking-widest mb-8">Your registry lacks active vehicle synchronization. Link an asset to initiate mission acceptance.</p>
                <button
                  onClick={() => navigate('/vehicle-details')}
                  className="bg-navy text-soft-white px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-sky-blue shadow-xl shadow-navy/20 transition-all"
                >
                  Synchronize Asset
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.5em] flex items-center">
            <span className="mr-4">Data Integrity Secured</span>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.666.945V14a2 2 0 01-2 2h-1.5a1 1 0 010-2h1.5V7.248L10 4.383 3.334 7.248V14h1.5a1 1 0 110 2H3.334a2 2 0 01-2-2V5.845a1 1 0 01.832-.945zM10 8a1 1 0 100-2 1 1 0 000 2zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <span className="ml-4">Registry v2.0</span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default DriverProfile;
