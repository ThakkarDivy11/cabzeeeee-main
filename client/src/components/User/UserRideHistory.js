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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRides(data.data || []);
        } else {
          setRides([]);
        }
      } else {
        setRides([]);
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
      const navy = [10, 17, 114]; // #0A1172 RGB
      
      // Set properties
      doc.setProperties({
        title: `Invoice-${ride._id}`,
        subject: 'Ride Invoice',
        author: 'CabZee Logistics'
      });

      // Header
      doc.setFillColor(navy);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(30);
      doc.setFont('helvetica', 'bold');
      doc.text('CABZEE', 20, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL LOGISTICS INVOICE', 20, 32);

      // Invoice Info
      doc.setTextColor(navy);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE TO:', 20, 60);
      
      doc.setFont('helvetica', 'normal');
      doc.text(user?.name || 'Valued Client', 20, 67);
      doc.text(user?.email || '', 20, 73);

      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE DETAILS:', 140, 60);
      doc.setFont('helvetica', 'normal');
      doc.text(`ID: ${ride._id.substring(0, 8)}...`, 140, 67);
      doc.text(`Date: ${new Date(ride.createdAt).toLocaleDateString()}`, 140, 73);
      doc.text(`Status: ${ride.status.toUpperCase()}`, 140, 79);

      // Ride Details Table Header
      doc.setFillColor(245, 245, 245);
      doc.rect(20, 95, 170, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.text('DESCRIPTION', 25, 102);
      doc.text('DETAILS', 100, 102);
      doc.text('AMOUNT', 160, 102);

      // Table Content
      doc.setFont('helvetica', 'normal');
      doc.text('Base Fare & Travel Merit', 25, 115);
      doc.text('Standard Logistics Cycle', 100, 115);
      doc.text(`INR ${ride.fare}.00`, 160, 115);

      doc.setDrawColor(230, 230, 230);
      doc.line(20, 120, 190, 120);

      // Locations
      doc.setFontSize(10);
      doc.text('Pickup:', 25, 130);
      doc.text(ride.pickupLocation?.address || 'N/A', 45, 130, { maxWidth: 140 });
      
      doc.text('Drop:', 25, 140);
      doc.text(ride.dropLocation?.address || 'N/A', 45, 140, { maxWidth: 140 });

      // Driver & Vehicle Info
      if (ride.driver) {
        doc.line(20, 155, 190, 155);
        doc.text(`Asset Operator: ${ride.driver.name} (${ride.driver.phone || 'N/A'})`, 25, 165);
        
        if (ride.driver.vehicleInfo) {
          const v = ride.driver.vehicleInfo;
          doc.setFontSize(9);
          doc.text(`Fleet Asset: ${v.make} ${v.model} (${v.year})`, 25, 172);
          doc.text(`Registry Plate: ${v.licensePlate} • Finish: ${v.color}`, 25, 177);
        }
      }

      // Total
      doc.setFillColor(navy);
      doc.rect(140, 180, 50, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL: INR ${ride.fare}`, 145, 190);

      // Footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(8);
      doc.text('This is a computer-generated document and does not require a physical signature.', 105, 280, { align: 'center' });
      doc.text('© 2026 CabZee Logistics. All rights reserved.', 105, 285, { align: 'center' });

      // Save
      doc.save(`CabZee-Invoice-${ride._id.substring(0, 8)}.pdf`);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Invoice generation failed:', error);
      toast.error('Failed to generate invoice');
    }
  };


  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-soft-white font-sans text-navy">
      {/* Responsive Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-navy/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-20 gap-2">
            <div className="flex items-center min-w-0">
              <button
                onClick={() => navigate('/rider')}
                className="mr-3 sm:mr-6 p-2 sm:p-3 rounded-xl bg-navy/5 text-navy hover:bg-navy hover:text-soft-white transition-all duration-300 transform active:scale-95 flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-black tracking-tighter uppercase leading-none truncate">Ride History</h1>
                <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest mt-0.5">Audit Trail</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <span className="text-[10px] font-black text-navy/30 uppercase tracking-widest px-3 py-1.5 sm:px-4 sm:py-2 bg-navy/5 rounded-full border border-navy/5 whitespace-nowrap">
                {rides.length} Trips
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white shadow-2xl rounded-2xl sm:rounded-[3rem] p-10 sm:p-24 text-center border border-navy/5">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-navy/5"></div>
              <div className="absolute inset-0 rounded-full border-4 border-sky-blue border-t-transparent animate-spin"></div>
            </div>
            <p className="text-sm font-black text-navy/40 uppercase tracking-[0.2em]">Synchronizing Ledger...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="bg-white shadow-2xl rounded-2xl sm:rounded-[3rem] p-10 sm:p-24 text-center border border-navy/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-sky-blue"></div>
            <div className="w-24 h-24 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-10 border border-dashed border-navy/20">
              <svg className="w-10 h-10 text-navy/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-navy uppercase tracking-tighter mb-4">No Historical Data</h3>
            <p className="text-sm font-bold text-navy/30 max-w-sm mx-auto leading-relaxed uppercase tracking-widest mb-12">Your operational history is currently unpopulated. Complete a journey to start data tracking.</p>
            <button
              onClick={() => navigate('/book-ride-live')}
              className="bg-navy text-soft-white px-12 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-sky-blue shadow-2xl shadow-navy/20 transition-all transform active:scale-95"
            >
              Initiate Booking
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-8">
            <div className="bg-navy p-5 sm:p-10 rounded-2xl sm:rounded-[3rem] shadow-2xl shadow-navy/30 relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.05] rounded-full -mr-16 -mt-16"></div>
              <h2 className="text-3xl font-black text-soft-white uppercase tracking-tighter leading-none mb-3">JOURNEY ARCHIVE</h2>
              <div className="flex items-center space-x-3">
                <div className="h-1 w-8 bg-sky-blue rounded-full"></div>
                <p className="text-[10px] font-bold text-soft-white/40 uppercase tracking-widest">Aggregate Data for {user.name}</p>
              </div>
            </div>

            {rides.map((ride) => (
              <div key={ride._id} className="group bg-white rounded-2xl sm:rounded-[3rem] shadow-xl border border-navy/5 hover:border-sky-blue/30 transition-all duration-500 overflow-hidden relative">
                <div className="absolute top-8 right-10 w-32 h-32 bg-navy/[0.01] rounded-full blur-3xl group-hover:bg-sky-blue/[0.05] transition-colors"></div>

                <div className="p-5 sm:p-10 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-5 sm:mb-10">
                    <div>
                      <span className={`inline-flex px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm ${ride.status === 'completed' ? 'bg-green-500 text-white' :
                          ride.status === 'cancelled' ? 'bg-red-500 text-white' :
                            'bg-sky-blue text-white'
                        }`}>
                        {ride.status}
                      </span>
                      <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.2em] mt-4 flex items-center">
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(ride.createdAt)}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-[10px] font-bold text-navy/20 uppercase tracking-widest mb-1">Settlement</p>
                      <p className="text-3xl sm:text-4xl font-black text-navy tracking-tighter leading-none group-hover:text-sky-blue transition-colors">₹{ride.fare}</p>
                    </div>
                  </div>

                  <div className="space-y-4 sm:space-y-6 bg-navy/[0.02] p-4 sm:p-8 rounded-xl sm:rounded-[2rem] border border-navy/5 mb-5 sm:mb-10">
                    <div className="flex items-start">
                      <div className="w-1.5 h-10 bg-green-500 rounded-full mr-6 mt-1 group-hover:scale-y-110 transition-transform origin-top"></div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-1">Departure Vector</p>
                        <p className="text-sm font-bold text-navy leading-relaxed">{ride.pickupLocation?.address || 'Operational Point Alpha'}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-1.5 h-10 bg-red-500 rounded-full mr-6 mt-1 group-hover:scale-y-110 transition-transform origin-top"></div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-1">Destination Vector</p>
                        <p className="text-sm font-bold text-navy leading-relaxed">{ride.dropLocation?.address || 'Fleet Terminal Omega'}</p>
                      </div>
                    </div>
                  </div>

                  {ride.driver && (
                    <div className="flex items-center pt-6 border-t border-navy/5">
                      <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-soft-white font-black text-xl mr-5 shadow-2xl shadow-navy/20 border-2 border-white transform group-hover:-rotate-3 transition-transform">
                        {ride.driver.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest mb-0.5">Asset Operator</p>
                        <p className="text-lg font-black text-navy leading-none">{ride.driver.name}</p>
                      </div>
                      <div className="flex items-center bg-yellow-500/5 px-4 py-2 rounded-xl border border-yellow-500/10">
                        <span className="text-yellow-500 text-lg mr-2 leading-none">★</span>
                        <span className="text-sm font-black text-navy">{ride.driver.rating}</span>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => handleDownloadInvoice(ride)}
                      className="text-[10px] font-black text-sky-blue uppercase tracking-widest hover:text-navy transition-colors flex items-center group/btn"
                    >
                      Request Formal Invoice
                      <svg className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                    </button>
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

export default UserRideHistory;
