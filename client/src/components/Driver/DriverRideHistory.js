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
        subject: 'Trip Report / Invoice',
        author: 'CabZee'
      });

      const primaryColor = '#111111';
      const accentColor = '#FFD000';
      
      // Header
      doc.setFillColor(primaryColor);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(30);
      doc.setFont('helvetica', 'bold');
      doc.text('CABZEE', 20, 25);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL TRIP SUMMARY & INVOICE', 20, 32);

      // Info
      doc.setTextColor(primaryColor);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DRIVER:', 20, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(`${user?.name || 'Authorized Driver'} (${user?.phone || 'N/A'})`, 20, 67);
      
      doc.setFont('helvetica', 'bold');
      doc.text('TRIP DETAILS:', 140, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${ride._id.substring(0, 8)}...`, 140, 67);
      doc.text(`Date: ${new Date(ride.createdAt).toLocaleDateString()}`, 140, 73);
      doc.text(`Status: ${ride.status.toUpperCase()}`, 140, 79);

      // Table
      doc.setFillColor(accentColor);
      doc.rect(20, 95, 170, 10, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPTION', 25, 102);
      doc.text('PASSENGER', 100, 102);
      doc.text('FARE', 160, 102);

      doc.setFont('helvetica', 'normal');
      doc.text('CabZee Logistics Service', 25, 115);
      doc.text(ride.rider?.name || 'N/A', 100, 115);
      doc.text(`INR ${ride.fare}.00`, 160, 115);

      doc.setDrawColor(230, 230, 230);
      doc.line(20, 120, 190, 120);

      doc.setFontSize(10);
      doc.text('Pickup:', 25, 130);
      doc.text(ride.pickupLocation?.address || 'N/A', 45, 130, { maxWidth: 140 });
      doc.text('Drop:', 25, 140);
      doc.text(ride.dropLocation?.address || 'N/A', 45, 140, { maxWidth: 140 });

      // Vehicle Info
      if (user?.vehicleInfo) {
        const v = user.vehicleInfo;
        doc.setFontSize(10);
        doc.text('VEHICLE DATA:', 20, 160);
        doc.setFont('helvetica', 'normal');
        doc.text(`${v.make} ${v.model} (${v.year}) • ${v.licensePlate}`, 20, 167);
      }

      // Total
      doc.setFillColor(primaryColor);
      doc.rect(140, 180, 50, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL: INR ${ride.fare}`, 145, 190);

      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text('© 2026 CabZee. Secure Document Generation.', 105, 285, { align: 'center' });

      doc.save(`Trip-Report-${ride._id.substring(0, 8)}.pdf`);
      toast.success('Report downloaded');
    } catch (error) {
      console.error('Report generation failed:', error);
      toast.error('Failed to generate report');
    }
  };

  if (!user) return <div className="p-20 text-center font-bold text-gray-500">Loading history...</div>;

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
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Trip History</h2>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Archived activity logs</p>
            </div>
        </div>
        <div className="flex h-12 items-center gap-3 rounded-2xl bg-black px-6 text-[10px] font-black uppercase tracking-widest force-light-text shadow-xl dark:bg-[#FFD000] dark:text-black">
            Total Trips: {rides.length}
        </div>
      </header>

      {activeRide && (
        <div className="group relative rounded-[3rem] bg-black p-8 shadow-2xl transition-all hover:scale-[1.01] dark:bg-[#111]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD000]/10 text-[#FFD000] border border-[#FFD000]/20">
                        <svg className="h-8 w-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#FFD000] mb-1">Ongoing Trip</p>
                        <h4 className="text-xl font-bold tracking-tight force-light-text">Active mission in progress</h4>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/active-ride')}
                    className="w-full md:w-auto rounded-xl bg-[#FFD000] px-8 py-4 text-[10px] font-black uppercase tracking-widest text-black shadow-lg shadow-[#FFD000]/20 hover:scale-105 transition-all"
                >
                    Resume Trip &rarr;
                </button>
            </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 rounded-[3.5rem] border border-gray-100 bg-white dark:border-[rgba(255,255,255,0.05)] dark:bg-neutral-900/40">
            <div className="h-12 w-12 border-4 border-[#FFD000] border-t-transparent animate-spin rounded-full mx-auto" />
        </div>
      ) : rides.length === 0 ? (
        <div className="text-center py-24 rounded-[3.5rem] border-2 border-dashed border-gray-200 dark:border-[rgba(255,255,255,0.05)]">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Archival Records Found</p>
        </div>
      ) : (
        <div className="space-y-8">
            {rides.map((ride) => (
                <div key={ride._id} className="group relative rounded-[3rem] border border-gray-200 bg-white p-10 shadow-sm transition-all duration-500 hover:shadow-2xl dark:border-[rgba(255,255,255,0.05)] dark:bg-neutral-900/40 dark:backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 pb-10 dark:border-[rgba(255,255,255,0.05)]">
                        <div className="flex items-center gap-6">
                             <div className={`flex h-12 px-6 items-center justify-center rounded-full text-[10px] font-black uppercase tracking-widest border ${ride.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                {ride.status}
                             </div>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(ride.createdAt)}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trip Fare</p>
                            <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">₹{ride.fare}</p>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="flex gap-6 group">
                                <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pickup</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{ride.pickupLocation?.address || 'Restricted area'}</p>
                                </div>
                            </div>
                            <div className="flex gap-6 group">
                                <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-red-500" />
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Drop</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{ride.dropLocation?.address || 'Target area'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between gap-6">
                            {ride.rider && (
                                <div className="rounded-3xl bg-gray-50 p-6 dark:bg-[rgba(255,255,255,0.05)] border border-gray-100 dark:border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center text-sm font-bold force-light-text dark:bg-[#FFD000] dark:text-black">
                                            {ride.rider.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tight">{ride.rider.name}</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-yellow-500 text-[10px]">★</span>
                                                <span className="text-[10px] font-bold text-gray-400">{ride.rider.rating} Rating</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {ride.status === 'completed' && (
                                <button
                                    onClick={() => handleDownloadInvoice(ride)}
                                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gray-100 py-4 text-[10px] font-black uppercase tracking-widest text-gray-900 hover:bg-gray-200 transition-all dark:bg-[rgba(255,255,255,0.10)] dark:hover:bg-[rgba(255,255,255,0.20)]"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                                    </svg>
                                    Get Trip Report
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default DriverRideHistory;
