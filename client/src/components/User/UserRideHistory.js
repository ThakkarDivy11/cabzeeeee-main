import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const UserRideHistory = () => {
  const [user, setUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'rider') {
        navigate('/login');
        return;
      }
      setUser(parsedUser);
    } else {
      navigate('/login');
    }
    fetchRideHistory();
  }, [navigate]);

  const fetchRideHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/rides/my-rides', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRides(data.success ? (data.data || []) : []);
      } else { setRides([]); }
    } catch (error) { setRides([]); }
    finally { setLoading(false); }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
  };

  const handleDownloadInvoice = (ride) => {
    try {
      const doc = new jsPDF();
      const accent = [255, 208, 0]; // CabZee Yellow
      doc.setProperties({ title: `Invoice-${ride._id}` });
      doc.setFillColor(6, 6, 10); doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 208, 0); doc.setFontSize(30); doc.setFont('helvetica', 'bold'); doc.text('CABZEE', 20, 25);
      doc.setFontSize(10); doc.setTextColor(150, 150, 150); doc.text('OFFICIAL LOGISTICS INVOICE', 20, 32);
      doc.setTextColor(6, 6, 10); doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.text('INVOICE TO:', 20, 60);
      doc.setFont('helvetica', 'normal'); doc.text(user?.name || 'Valued Client', 20, 67);
      doc.text(`ID: ${ride._id.substring(0, 8)}...`, 140, 67);
      doc.setFillColor(245, 245, 245); doc.rect(20, 95, 170, 10, 'F');
      doc.text('Base Fare & Logistics', 25, 115); doc.text(`INR ${ride.fare}.00`, 160, 115);
      doc.save(`CabZee-Invoice-${ride._id.substring(0, 8)}.pdf`);
      toast.success('Invoice downloaded successfully');
    } catch (error) { toast.error('Failed to generate invoice'); }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-[#06060a] dark:text-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16">
            <div>
                <button 
                  onClick={() => navigate('/rider')} 
                  className="group mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-yellow-600 transition-all hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                >
                    <svg className="h-3 w-3 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>
                <div className="flex items-center gap-4">
                    <div className="h-12 w-1.5 rounded-full bg-[#FFD000]"></div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tight dark:text-white sm:text-6xl">Activity History</h1>
                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.4em] text-gray-400 dark:text-gray-600">Review your past journeys & analytics</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-6 rounded-[2rem] bg-white px-8 py-5 shadow-sm ring-1 ring-gray-100 dark:bg-white/[0.02] dark:ring-white/5">
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Total Journeys</p>
                    <p className="text-3xl font-black tracking-tight text-yellow-600 dark:text-yellow-400">{rides.length}</p>
                </div>
                <div className="h-10 w-px bg-gray-100 dark:bg-white/5"></div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/10 text-yellow-600 dark:text-yellow-400">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
            </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-[3rem] bg-white py-32 shadow-sm ring-1 ring-gray-100 dark:bg-white/[0.02] dark:ring-white/5">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-400/20 border-t-yellow-400"></div>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-600">Synchronizing Archive...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="rounded-[3rem] bg-white p-20 text-center shadow-sm ring-1 ring-gray-100 dark:bg-white/[0.02] dark:ring-white/5">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 text-gray-200 dark:bg-white/5 dark:text-gray-800">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </div>
            <h3 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">The archive is empty.</h3>
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">No previous operation records found in the centralized ledger.</p>
            <button 
              onClick={() => navigate('/book-ride-live')} 
              className="mt-12 rounded-2xl bg-[#FFD000] px-12 py-5 text-sm font-black tracking-widest uppercase text-black transition-all hover:scale-[1.05] hover:shadow-xl hover:shadow-yellow-400/30 active:scale-95"
            >
              Start Your First Journey
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {rides.map((ride) => (
              <div key={ride._id} className="group overflow-hidden rounded-[2.5rem] bg-white shadow-xl shadow-gray-200/50 transition-all duration-300 hover:shadow-2xl dark:bg-neutral-900/40 dark:shadow-none dark:ring-1 dark:ring-white/5 dark:hover:ring-yellow-400/20">
                <div className="p-8 sm:p-12">
                  <div className="mb-10 flex flex-col items-start justify-between gap-6 border-b border-gray-100 pb-10 dark:border-white/5 sm:flex-row sm:items-center">
                    <div>
                      <div className="mb-4 flex items-center gap-4">
                        <span className={`rounded-xl px-5 py-2 text-[10px] font-black uppercase tracking-widest ${
                          ride.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 
                          ride.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 
                          'bg-yellow-50 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400'
                        }`}>
                          {ride.status}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">REF: {ride._id.substring(18).toUpperCase()}</span>
                      </div>
                      <h4 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white uppercase">{formatDate(ride.createdAt)}</h4>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Final Fare</p>
                      <p className="text-5xl font-black tracking-tighter text-yellow-600 dark:text-yellow-400">₹{ride.fare}</p>
                    </div>
                  </div>

                  <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2">
                    <div className="flex items-start gap-5">
                        <div className="flex h-12 w-1 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                             </svg>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Pick-up Location</p>
                            <p className="mt-1 text-sm font-bold uppercase leading-relaxed text-gray-700 dark:text-gray-300">{ride.pickupLocation?.address}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-5">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                             <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                             </svg>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500">Drop-off Location</p>
                            <p className="mt-1 text-sm font-bold uppercase leading-relaxed text-gray-700 dark:text-gray-300">{ride.dropLocation?.address}</p>
                        </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-between gap-6 border-t border-gray-100 pt-10 dark:border-white/5 sm:flex-row">
                    {ride.driver && (
                        <div className="flex items-center gap-5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 font-black text-gray-400 dark:bg-white/5 dark:text-yellow-400">
                                {ride.driver.name[0]}
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-600">Pilot Status</p>
                                <p className="text-sm font-black uppercase text-gray-900 dark:text-white">{ride.driver.name}</p>
                            </div>
                        </div>
                    )}
                    <button 
                      onClick={() => handleDownloadInvoice(ride)}
                      className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-8 py-4 transition-all hover:bg-[#FFD000] hover:text-black hover:border-[#FFD000] hover:scale-[1.05] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-[#FFD000] dark:hover:text-black dark:hover:border-[#FFD000] sm:w-auto"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs font-black uppercase tracking-widest">Download Invoice</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRideHistory;
