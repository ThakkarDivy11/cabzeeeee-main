import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const DriverRideHistory = () => {
  const [user, setUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRide, setActiveRide] = useState(null);
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

    fetchRideHistory();
  }, [navigate]);

  const fetchRideHistory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [historyResponse, activeRideResponse] = await Promise.all([
        fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/rides/driver-rides', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/rides/active', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (historyResponse.ok) {
        const data = await historyResponse.json();
        if (data.success) {
          setRides(data.data || []);
        } else {
          setRides([]);
        }
      } else {
        setRides([]);
      }

      if (activeRideResponse.ok) {
         const activeData = await activeRideResponse.json();
         if (activeData && activeData.success && activeData.data) {
           localStorage.setItem('activeRide', JSON.stringify(activeData.data));
           setActiveRide(activeData.data);
         } else {
           localStorage.removeItem('activeRide');
           setActiveRide(null);
         }
      }
    } catch (error) {
      console.error('Error fetching ride history:', error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadInvoice = (ride) => {
    try {
      const doc = new jsPDF();
      
      doc.setProperties({
        title: `Invoice-${ride._id}`,
        subject: 'Mission Report / Invoice',
        author: 'CabZee Logistics'
      });

      const navy = '#0A1128';
      
      // Header
      doc.setFillColor(navy);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(30);
      doc.setFont('helvetica', 'bold');
      doc.text('CABZEE', 20, 25);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('MISSION DEPLOYMENT REPORT & INVOICE', 20, 32);

      // Info
      doc.setTextColor(navy);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('OPERATIVE:', 20, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(`${user?.name || 'Authorized Operative'} (${user?.phone || 'N/A'})`, 20, 67);
      
      doc.setFont('helvetica', 'bold');
      doc.text('MISSION DETAILS:', 140, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${ride._id.substring(0, 8)}...`, 140, 67);
      doc.text(`Date: ${new Date(ride.createdAt).toLocaleDateString()}`, 140, 73);
      doc.text(`Status: ${ride.status.toUpperCase()}`, 140, 79);

      // Table
      doc.setFillColor(245, 245, 245);
      doc.rect(20, 95, 170, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPTION', 25, 102);
      doc.text('CLIENT', 100, 102);
      doc.text('MERIT', 160, 102);

      doc.setFont('helvetica', 'normal');
      doc.text('Strategic Logistics Mission', 25, 115);
      doc.text(ride.rider?.name || 'N/A', 100, 115);
      doc.text(`INR ${ride.fare}.00`, 160, 115);

      doc.setDrawColor(230, 230, 230);
      doc.line(20, 120, 190, 120);

      doc.setFontSize(10);
      doc.text('Activation:', 25, 130);
      doc.text(ride.pickupLocation?.address || 'N/A', 45, 130, { maxWidth: 140 });
      doc.text('Terminal:', 25, 140);
      doc.text(ride.dropLocation?.address || 'N/A', 45, 140, { maxWidth: 140 });

      // Vehicle Info
      if (user?.vehicleInfo) {
        const v = user.vehicleInfo;
        doc.setFontSize(10);
        doc.text('FLEET ASSET DATA:', 20, 160);
        doc.setFont('helvetica', 'normal');
        doc.text(`${v.make} ${v.model} (${v.year}) • ${v.licensePlate} • ${v.color}`, 20, 167);
      }

      // Total
      doc.setFillColor(navy);
      doc.rect(140, 180, 50, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL: INR ${ride.fare}`, 145, 190);

      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text('© 2026 CabZee Logistics. Highly Confidential.', 105, 285, { align: 'center' });

      doc.save(`Mission-Report-${ride._id.substring(0, 8)}.pdf`);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Report generation failed:', error);
      toast.error('Failed to generate report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'in-progress':
        return 'bg-sky-blue/10 text-sky-blue';
      default:
        return 'bg-navy/10 text-navy';
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-soft-white font-sans text-navy">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-navy/5 shadow-sm">
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
                  <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Deployment Archive</h1>
                  <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest mt-0.5">Mission History</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-navy px-4 py-2 rounded-xl shadow-lg border border-white/10 hidden sm:block">
                <p className="text-[9px] font-black text-soft-white/60 uppercase tracking-widest">Active Operative</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-navy tracking-tight mb-3 uppercase">Strategic Log</h2>
          <div className="flex items-center space-x-3">
            <div className="h-1.5 w-12 bg-sky-blue rounded-full"></div>
            <p className="text-sm font-bold text-navy/40 uppercase tracking-[0.2em]">Verified archival records of deployed missions</p>
          </div>
        </div>

        {/* Active Mission Prompt */}
        {activeRide && (
          <div className="mb-12 bg-navy rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110"></div>
            
            <div className="w-16 h-16 bg-sky-blue/20 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 border border-sky-blue/30">
              <svg className="w-8 h-8 text-sky-blue animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            
            <div className="flex-1 text-center md:text-left relative z-10">
              <p className="font-black text-[10px] text-sky-blue uppercase tracking-[0.3em] mb-1">Mission Live</p>
              <h3 className="font-bold text-xl text-soft-white mb-1">You have an ongoing deployment</h3>
              <p className="text-sm text-soft-white/60">Client: {activeRide.rider?.name || 'Authenticated Client'} • Fare: ₹{activeRide.fare}</p>
            </div>
            
            <button
              onClick={() => navigate('/active-ride')}
              className="w-full md:w-auto px-8 py-4 bg-sky-blue text-navy text-xs font-black uppercase tracking-widest rounded-xl hover:bg-soft-white transition-all transform active:scale-95 shadow-lg relative z-10"
            >
              Resume Mission
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white shadow-2xl rounded-[3rem] p-24 text-center border border-navy/5 animate-pulse">
            <div className="w-20 h-20 bg-navy/[0.02] rounded-full flex items-center justify-center mx-auto mb-8 border border-navy/5">
              <svg className="w-10 h-10 text-navy animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-navy uppercase tracking-tighter mb-2">Syncing Archives</h3>
            <p className="text-sm font-bold text-navy/30 uppercase tracking-widest">Accessing cloud-synchronized deployment ledger...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="bg-white shadow-2xl rounded-[3rem] p-24 text-center border border-navy/5">
            <div className="w-24 h-24 bg-soft-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-navy/5">
              <svg className="w-10 h-10 text-navy/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-navy uppercase tracking-tighter mb-4">No Historical Data</h3>
            <p className="max-w-xs mx-auto text-sm font-bold text-navy/30 uppercase tracking-widest">Strategic records will manifest here upon mission finalization.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white shadow-xl rounded-[2.5rem] p-8 border border-navy/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-navy uppercase tracking-tight">Deployment Summary</h2>
                <p className="text-[10px] font-black text-sky-blue uppercase tracking-[0.3em] mt-1 italic">Operative Clearance Level 4</p>
              </div>
              <div className="bg-navy text-soft-white px-6 py-3 rounded-2xl shadow-lg shadow-navy/20 flex flex-col items-center">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 leading-none mb-1">Total</p>
                <span className="text-xl font-black leading-none italic">{rides.length}</span>
              </div>
            </div>

            {rides.map((ride) => (
              <div key={ride._id} className="group bg-white shadow-xl rounded-[2.5rem] border border-navy/5 transition-all duration-500 hover:shadow-2xl hover:border-navy/10 relative overflow-hidden mb-6">
                
                {/* Top Section: Status & Fare */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 border-b border-navy/5">
                  <div>
                    <span className={`inline-flex px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full ${ride.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' :
                      ride.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                        'bg-sky-blue/5 text-sky-blue border border-sky-blue/10'
                      }`}>
                      {ride.status}
                    </span>
                    <p className="text-[10px] font-bold text-navy/30 uppercase tracking-widest mt-3">{formatDate(ride.createdAt)}</p>
                  </div>
                  
                  <div className="text-left sm:text-right mt-4 sm:mt-0">
                    <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.3em] mb-1">Contract Merit</p>
                    <p className="text-4xl font-black text-navy tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-navy to-navy/70">₹{ride.fare}</p>
                  </div>
                </div>

                {/* Bottom Section: Grid for Locations & Rider */}
                <div className="grid grid-cols-1 lg:grid-cols-5 p-8 gap-8 items-center bg-navy/[0.01]">
                  
                  {/* Locations (Span 3) */}
                  <div className="lg:col-span-3 space-y-8 relative">
                    {/* Connecting Line */}
                    <div className="absolute left-2 top-4 w-0.5 h-16 bg-gradient-to-b from-green-500/20 to-red-500/20 ml-[3px] z-0"></div>
                    
                    <div className="flex items-start relative z-10 group/loc">
                      <div className="flex-shrink-0 w-3.5 h-3.5 bg-green-500 rounded-full mt-1.5 shadow-md shadow-green-200 ring-4 ring-green-50 group-hover/loc:scale-110 transition-transform"></div>
                      <div className="ml-6">
                        <p className="text-[9px] font-bold text-navy/30 uppercase tracking-[0.3em] mb-1.5">Activation Point (Pickup)</p>
                        <p className="text-base font-semibold text-navy leading-relaxed">{ride.pickupLocation?.address || 'Secure Loc'}</p>
                      </div>
                    </div>

                    <div className="flex items-start relative z-10 group/loc">
                      <div className="flex-shrink-0 w-3.5 h-3.5 bg-red-500 rounded-full mt-1.5 shadow-md shadow-red-200 ring-4 ring-red-50 group-hover/loc:scale-110 transition-transform"></div>
                      <div className="ml-6">
                        <p className="text-[9px] font-bold text-navy/30 uppercase tracking-[0.3em] mb-1.5">Target Terminal (Drop)</p>
                        <p className="text-base font-semibold text-navy leading-relaxed">{ride.dropLocation?.address || 'Deployment Loc'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rider Info Card (Span 2) */}
                  <div className="lg:col-span-2 space-y-4">
                    {ride.rider && (
                      <div className="bg-white rounded-3xl p-6 border border-navy/5 shadow-sm flex items-center hover:shadow-md transition-shadow group/rider">
                        <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-white text-xl font-bold mr-5 shadow-lg shadow-navy/10 transform group-hover/rider:scale-105 transition-transform">
                          {ride.rider.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-bold text-navy/40 uppercase tracking-[0.2em] mb-1">Authenticated Client</p>
                          <p className="text-base font-bold text-navy tracking-tight">{ride.rider.name}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-500 text-sm">★</span>
                            <span className="ml-1.5 text-xs font-bold text-navy">{ride.rider.rating} <span className="text-[9px] text-navy/40 uppercase tracking-widest ml-1">Merit</span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {ride.status === 'completed' && (
                      <button 
                        onClick={() => handleDownloadInvoice(ride)}
                        className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-navy/5 hover:bg-navy text-navy hover:text-soft-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Download Report
                      </button>
                    )}
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-sky-blue/0 via-sky-blue/20 to-sky-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}

            <div className="pt-12 flex justify-center pb-8">
              <div className="bg-white/50 backdrop-blur-sm px-8 py-3 rounded-full border border-navy/5 flex items-center space-x-4">
                <div className="w-2 h-2 bg-navy rounded-full animate-pulse"></div>
                <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.4em]">Historical Ledger: Locked & Finalized</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DriverRideHistory;
