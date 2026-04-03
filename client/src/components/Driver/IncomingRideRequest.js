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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRideRequests(data.data || []);
          if (data.data && data.data.length > 0) {
            console.log(`✅ Found ${data.data.length} pending ride request(s)`);
          }
        } else {
          setRideRequests([]);
          toast.error(data.message || 'Failed to fetch requests');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch ride requests:', errorData);
        setRideRequests([]);
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else {
          toast.error(errorData.message || 'Could not fetch ride requests');
        }
      }
    } catch (error) {
      console.error('Error fetching ride requests:', error);
      setRideRequests([]);
      toast.error('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request) => {
    localStorage.setItem('selectedRideRequest', JSON.stringify(request));
    navigate('/accept-reject-ride');
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

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
                  <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Mission Control</h1>
                  <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest mt-0.5">Queue Monitor</p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchRideRequests}
              className="bg-navy text-soft-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-blue shadow-xl shadow-navy/20 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Dispatch
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-navy tracking-tight mb-3">Dispatch Signal</h2>
          <div className="flex items-center space-x-3">
            <div className={`h-2 w-2 rounded-full ${rideRequests.length > 0 ? 'bg-sky-blue animate-ping' : 'bg-navy/20'}`}></div>
            <p className="text-sm font-bold text-navy/40 uppercase tracking-[0.2em]">{rideRequests.length} Incoming Mission Signals</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white shadow-2xl rounded-[3rem] p-24 text-center border border-navy/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-navy animate-pulse"></div>
            <div className="w-20 h-20 bg-navy/[0.02] rounded-full flex items-center justify-center mx-auto mb-8 border border-navy/5">
              <svg className="w-10 h-10 text-navy animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-navy uppercase tracking-tighter mb-2">Scanning Airwaves</h3>
            <p className="text-sm font-bold text-navy/30 uppercase tracking-widest">Awaiting cloud-synchronized ride dispatch signals...</p>
          </div>
        ) : rideRequests.length === 0 ? (
          <div className="bg-white shadow-2xl rounded-[3rem] p-24 text-center border border-navy/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-navy/10 group-hover:bg-sky-blue transition-colors"></div>
            <div className="w-32 h-32 bg-soft-white rounded-full flex items-center justify-center mx-auto mb-10 border border-navy/5 shadow-inner">
              <svg className="w-16 h-16 text-navy/10 group-hover:text-sky-blue/20 transition-colors duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.5 9.5 0 0114.142 0M2.121 8.879a14.5 14.5 0 0120.758 0" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-navy uppercase tracking-tighter mb-4">Operational Quiet</h3>
            <p className="text-sm font-bold text-navy/30 max-w-sm mx-auto leading-relaxed uppercase tracking-[0.2em] mb-12">No dispatch signals detected at current coordinates. Maintain standby status for system-wide mission alerts.</p>
            <button
              onClick={() => navigate('/driver')}
              className="bg-navy text-soft-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-sky-blue shadow-2xl shadow-navy/20 transition-all transform active:scale-95"
            >
              Return to Command Center
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {rideRequests.map((request) => (
              <div key={request._id} className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-navy/5 group hover:scale-[1.02] transition-all duration-500 relative">
                <div className="absolute top-0 left-0 w-3 h-full bg-navy group-hover:bg-sky-blue transition-colors"></div>

                <div className="p-10">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-10 pb-10 border-b border-navy/5">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-navy rounded-[2rem] blur-xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
                        <div className="w-20 h-20 bg-navy rounded-[1.8rem] flex items-center justify-center text-soft-white text-3xl font-black italic shadow-2xl relative z-10 border-4 border-white transform group-hover:-rotate-6 transition-transform">
                          {request.rider?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg z-20"></div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-1">Rider Information</p>
                        <h3 className="text-2xl font-black text-navy uppercase tracking-tighter mb-1">{request.rider?.name || 'Authorized Client'}</h3>
                        <div className="flex items-center bg-soft-white px-3 py-1.5 rounded-full border border-navy/5 shadow-sm inline-flex">
                          <span className="text-yellow-500 text-sm">★</span>
                          <span className="ml-2 text-xs font-black text-navy">{request.rider?.rating || '5.0'} Merit</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right w-full md:w-auto">
                      <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-1">Proposed Merit (Fare)</p>
                      <div className="flex items-center justify-end space-x-3">
                        <span className="text-lg font-black text-navy/20 italic">INR</span>
                        <p className="text-5xl font-black text-navy tracking-tighter">₹{request.fare}</p>
                      </div>
                      <div className="flex items-center justify-end space-x-3 mt-4">
                        <div className="bg-sky-blue/5 px-4 py-1.5 rounded-xl border border-sky-blue/10">
                          <p className="text-[10px] font-black text-sky-blue uppercase tracking-widest">{request.distance || '0'} KM MISSION</p>
                        </div>
                        <div className="bg-navy/5 px-4 py-1.5 rounded-xl border border-navy/10">
                          <p className="text-[10px] font-black text-navy uppercase tracking-widest">{request.estimatedTime || '5'} MIN EST.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-navy/[0.01] p-6 md:p-8 rounded-[2.5rem] border border-navy/5 relative overflow-hidden items-center">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-navy/[0.01] rounded-full -mr-16 -mt-16"></div>

                    <div className="relative space-y-6 lg:col-span-2">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-1.5 shadow-md shadow-green-200 ring-4 ring-green-100/50"></div>
                        <div className="ml-5">
                          <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em] mb-1.5">Activation Point (Pickup)</p>
                          <p className="text-sm md:text-base font-bold text-navy leading-relaxed">{request.pickupLocation?.address || 'Restricted Area'}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full mt-1.5 shadow-md shadow-red-200 ring-4 ring-red-100/50"></div>
                        <div className="ml-5">
                          <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em] mb-1.5">Termination Point (Drop)</p>
                          <p className="text-sm md:text-base font-bold text-navy leading-relaxed">{request.dropLocation?.address || 'Undisclosed'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-end lg:col-span-1 mt-4 lg:mt-0 relative z-10 w-full">
                      <button
                        onClick={() => handleViewRequest(request)}
                        className="w-full bg-navy text-soft-white py-4 md:py-5 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-sky-blue shadow-xl shadow-navy/20 transition-all transform active:scale-[0.98] flex items-center justify-center group/btn"
                      >
                        Initiate Mission
                        <svg className="w-5 h-5 ml-3 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default IncomingRideRequest;
