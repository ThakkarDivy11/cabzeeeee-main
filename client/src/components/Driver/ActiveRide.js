
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapContainer from '../Map/MapContainer';
import LiveLocationTracker from '../Map/LiveLocationTracker';
import UserMarker from '../Map/UserMarker';
import RoutePolyline from '../Map/RoutePolyline';
import DriverMarker from '../Map/DriverMarker';
import socketService from '../../services/socketService';

// Star rating component for driver to rate rider
const StarRating = ({ rating, setRating, disabled }) => (
  <div className="flex items-center justify-center gap-1">
    {[1,2,3,4,5].map(i => (
      <button
        key={i}
        type="button"
        onClick={() => !disabled && setRating(i)}
        className="focus:outline-none"
        disabled={disabled}
      >
        <svg className={`w-8 h-8 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`} fill={i <= rating ? '#fbbf24' : 'none'} stroke="#fbbf24" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.276a1 1 0 00.95.69h6.6c.969 0 1.371 1.24.588 1.81l-5.347 3.89a1 1 0 00-.364 1.118l2.036 6.276c.3.921-.755 1.688-1.538 1.118l-5.347-3.89a1 1 0 00-1.175 0l-5.347 3.89c-.783.57-1.838-.197-1.538-1.118l2.036-6.276a1 1 0 00-.364-1.118l-5.347-3.89c-.783-.57-.38-1.81.588-1.81h6.6a1 1 0 00.95-.69l2.036-6.276z" />
        </svg>
      </button>
    ))}
  </div>
);

const ActiveRide = () => {
  const [user, setUser] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [rideStatus, setRideStatus] = useState('accepted');
  const [loading, setLoading] = useState(true);
  const [otpInput, setOtpInput] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Map State
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [routePositions, setRoutePositions] = useState([]);

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

    const fetchActiveRide = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setActiveRide(data.data);
            setRideStatus(data.data.status);
            initializeMapData(data.data);
            localStorage.setItem('activeRide', JSON.stringify(data.data));
            if (data.data.status === 'completed') {
              setShowPaymentConfirm(true);
              setPaymentReceived(!!data.data.isPaid);
            }
          } else {
            const cachedRide = JSON.parse(localStorage.getItem('activeRide') || 'null');
            if (cachedRide?.status === 'completed') {
              setActiveRide(cachedRide);
              setRideStatus('completed');
              setShowPaymentConfirm(true);
              setPaymentReceived(!!cachedRide.isPaid);
              return;
            }
            toast.error('No active mission found. Routing to base...');
            localStorage.removeItem('activeRide');
            navigate('/driver');
          }
        }
      } catch (err) {
        console.error('Error fetching active ride:', err);
      } finally {
        setLoading(false);
      }
    };

    const ride = localStorage.getItem('activeRide');
    if (ride) {
      const parsedRide = JSON.parse(ride);
      setActiveRide(parsedRide);
      setRideStatus(parsedRide.status || 'accepted');
      initializeMapData(parsedRide);
      if (parsedRide.status === 'completed') {
        setShowPaymentConfirm(true);
        setPaymentReceived(!!parsedRide.isPaid);
      }
      setLoading(false); // Show immediately while syncing
    }
    
    fetchActiveRide();

    // Socket Integration
    const rideId = activeRide?._id || JSON.parse(localStorage.getItem('activeRide'))?._id;
    if (rideId) {
      socketService.connect();
      socketService.joinRide(rideId);
    }

    return () => {
      if (rideId) {
        socketService.leaveRide(rideId);
        socketService.removeAllListeners();
      }
    };
  }, [navigate]);

  useEffect(() => {
    const shouldCheck =
      showPaymentConfirm &&
      rideStatus === 'completed' &&
      !!activeRide?._id &&
      !paymentReceived;

    if (!shouldCheck) return;

    let cancelled = false;
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const check = async () => {
      try {
        setCheckingPayment(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/rides/${activeRide._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (cancelled) return;
        if (data?.success && data?.data) {
          setActiveRide(data.data);
          localStorage.setItem('activeRide', JSON.stringify(data.data));
          if (data.data.isPaid) {
            setPaymentReceived(true);
          }
        }
      } catch (e) {
        // non-fatal: keep polling
      } finally {
        if (!cancelled) setCheckingPayment(false);
      }
    };

    check();
    const intervalId = setInterval(check, 3000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [activeRide?._id, paymentReceived, rideStatus, showPaymentConfirm]);

  // Auto-dismiss logic removed to allow driver to rate the rider manually

  const initializeMapData = (ride) => {
    // Handle coordinates logic
    // Note: Coordinates in standard GeoJSON are [lon, lat], but Leaflet uses [lat, lon]

    let pCoords = [28.6139, 77.2090]; // Default CP Delhi
    let dCoords = [28.6339, 77.2290];

    if (ride.pickupLocation?.coordinates) {
      // Assume format is [lon, lat] from backend, need [lat, lon]
      pCoords = [ride.pickupLocation.coordinates[1], ride.pickupLocation.coordinates[0]];
    }

    if (ride.dropLocation?.coordinates) {
      dCoords = [ride.dropLocation.coordinates[1], ride.dropLocation.coordinates[0]];
    }

    setPickupCoords(pCoords);
    setDropCoords(dCoords);
    setRoutePositions([pCoords, dCoords]);
    setMapCenter(pCoords);
  };

  const handleLocationUpdate = (newPos) => {
    setCurrentLocation(newPos);
    if (activeRide?._id) {
      socketService.updateDriverLocation(activeRide._id, newPos[0], newPos[1]);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${activeRide._id}/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ otp: otpInput })
        }
      );
      const data = await response.json();
      if (data.success) {
        setOtpVerified(true);
        setRideStatus('on_board');
        // Update cached ride
        const updatedRide = { ...activeRide, otpVerified: true, status: 'on_board' };
        setActiveRide(updatedRide);
        localStorage.setItem('activeRide', JSON.stringify(updatedRide));
        // Notify via socket so rider gets the real-time update
        socketService.notifyOTPVerified(activeRide._id);
        socketService.notifyRideStatusChange(activeRide._id, 'on_board');
        toast.success('🚗 OTP Verified! Ride has started — passenger is on board.');
      } else {
        toast.error(data.message || 'Invalid OTP. Please check with the passenger.');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error('Could not verify OTP. Please try again.');
    }
  };

  const handleStatusChange = async (newStatus) => {

    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('token');

      // 1. Persist status to the database
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${activeRide._id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      const data = await response.json();
      if (!data.success) {
        toast.error(data.message || 'Failed to update ride status.');
        return;
      }

      // 2. Update local state (prefer server's updated ride if returned)
      const updatedRide = data.data ? data.data : { ...activeRide, status: newStatus };
      setRideStatus(newStatus);
      setActiveRide(updatedRide);
      localStorage.setItem('activeRide', JSON.stringify(updatedRide));

      // 3. Notify rider in real-time via socket
      if (activeRide._id) {
        socketService.notifyRideStatusChange(activeRide._id, newStatus);
      }

      // 4. Handle post-status UI actions
      if (newStatus === 'completed') {
        toast.success('Ride completed! Waiting for rider payment...');
        setShowPaymentConfirm(true);
        setPaymentReceived(!!updatedRide.isPaid);
      } else if (newStatus === 'picked-up') {
        toast.success('Passenger picked up! Navigate to drop location.');
        if (dropCoords) setMapCenter(dropCoords);
      }
    } catch (error) {
      console.error('Error updating ride status:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Driver rating state (must be at top level, not inside condition)
  const [driverRating, setDriverRating] = useState(0);
  // If the ride already has a riderRating, consider feedback as submitted
  const [ratingSubmitted, setRatingSubmitted] = useState(!!(activeRide && activeRide.riderRating));
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');

  if (loading || !user || !activeRide) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Show rating UI after payment is received and ride is completed
  // Show feedback if payment received and ride not yet rated
  if (showPaymentConfirm) {
    const showFeedback = paymentReceived && !ratingSubmitted && !(activeRide && activeRide.riderRating);
    return (
      <div className="min-h-screen bg-soft-white font-sans text-navy flex items-center justify-center px-4">
        <div className="w-full max-w-2xl bg-white shadow-2xl rounded-[3rem] border border-navy/5 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500"></div>
          <div className="p-10 sm:p-12">
            <div className="flex items-start gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${paymentReceived ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'}`}>
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.35em]">Payment Status</p>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase mt-2">
                  {paymentReceived ? 'Payment Received' : 'Waiting For Payment'}
                </h1>
                <p className="text-sm font-bold text-navy/50 mt-3 leading-relaxed">
                  {paymentReceived
                    ? 'Payment is confirmed. Please rate the rider below.'
                    : 'Rider is now seeing the payment screen. This page will auto-update when payment is completed. If you received cash, confirm below.'}
                </p>
                {!paymentReceived && (
                  <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mt-4">
                    {checkingPayment ? 'Checking payment...' : 'Monitoring payment...'}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-10 bg-navy/[0.02] border border-navy/5 rounded-[2.5rem] p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em]">Fare</p>
                  <p className="text-2xl font-black text-navy tracking-tight">&#8377;{activeRide.fare}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em]">Passenger</p>
                  <p className="text-lg font-black text-navy tracking-tight uppercase">{activeRide.rider?.name || 'Client'}</p>
                </div>
              </div>
            </div>

            {/* Driver rates rider after payment */}
            {showFeedback && (
              <div className="mt-10 flex flex-col items-center">
                <p className="text-lg font-black text-navy mb-2">Rate Your Rider</p>
                <StarRating rating={driverRating} setRating={setDriverRating} disabled={submittingRating} />
                {ratingError && <span className="text-red-500 text-xs mt-2">{ratingError}</span>}
                <button
                  className="mt-4 bg-navy text-soft-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-blue transition-all shadow-2xl shadow-navy/20 active:scale-95 disabled:opacity-40"
                  disabled={driverRating === 0 || submittingRating}
                  onClick={async () => {
                    setSubmittingRating(true);
                    setRatingError('');
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${activeRide._id}/rate`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ rating: driverRating })
                      });
                      const data = await response.json();
                      if (data.success) {
                        setRatingSubmitted(true);
                        toast.success('Rider rated successfully!');
                      } else {
                        setRatingError(data.message || 'Failed to submit rating');
                      }
                    } catch (err) {
                      setRatingError('Network error. Please try again.');
                    } finally {
                      setSubmittingRating(false);
                    }
                  }}
                >
                  Submit Rating
                </button>
              </div>
            )}
            {paymentReceived && ratingSubmitted && (
              <div className="mt-10 flex flex-col items-center">
                <p className="text-lg font-black text-green-600 mb-2">Thank you for rating your rider!</p>
                <button
                  onClick={() => {
                    localStorage.removeItem('activeRide');
                    setShowPaymentConfirm(false);
                    navigate('/driver');
                  }}
                  className="mt-4 bg-navy text-soft-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-blue transition-all shadow-2xl shadow-navy/20 active:scale-95"
                >
                  Go To Dashboard
                </button>
              </div>
            )}
            {/* Fallback: if payment not received, show finish button */}
            {!paymentReceived && (
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    localStorage.removeItem('activeRide');
                    setShowPaymentConfirm(false);
                    navigate('/driver');
                  }}
                  disabled={updatingStatus}
                  className="flex-1 bg-green-600 text-white px-8 py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.35em] hover:bg-green-700 shadow-2xl shadow-green-600/20 transition-all transform active:scale-[0.98] disabled:opacity-40"
                >
                  I Received Payment - Finish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-white font-sans text-navy flex flex-col">
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
                  <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Mission Live</h1>
                  <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest mt-0.5">Deployment Tracking</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3 bg-green-500/5 px-6 py-2.5 rounded-full border border-green-500/10">
                <div className="w-2 h-2 bg-green-500 animate-pulse rounded-full"></div>
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Signal Locked</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 flex flex-col gap-10">

        {/* Full-Width Telemetry Map */}
        <div className="w-full h-[400px] sm:h-[500px] rounded-[3rem] overflow-hidden shadow-2xl relative z-0 border border-navy/5 group">
          <div className="absolute inset-0 bg-navy/5 animate-pulse z-0"></div>
          <MapContainer center={currentLocation || mapCenter} zoom={15} className="h-full w-full relative z-10 transition-all duration-700">
            <LiveLocationTracker onLocationUpdate={handleLocationUpdate} track={true} />
            {currentLocation && <DriverMarker position={currentLocation} driverName={user.name} vehicleInfo={{ brand: 'Fleet', model: 'Class A' }} />}
            {rideStatus !== 'picked-up' && rideStatus !== 'completed' && pickupCoords && (
              <UserMarker position={pickupCoords} popupContent="Target Activation Point" />
            )}
            {dropCoords && <UserMarker position={dropCoords} popupContent="Target Deployment Point" />}
            {routePositions.length > 0 && <RoutePolyline positions={routePositions} />}
          </MapContainer>

          {/* Map Overlays */}
          <div className="absolute top-8 left-8 z-20 hidden md:block">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-navy/5 shadow-2xl space-y-4 max-w-xs">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-navy rounded-2xl flex items-center justify-center text-soft-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em]">Efficiency Rating</p>
                  <p className="text-sm font-black text-navy uppercase">Optimal Path Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Mission Status & Client Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white shadow-2xl rounded-3xl sm:rounded-[3rem] overflow-hidden border border-navy/5 relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-navy"></div>
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-navy/5">
                  <div>
                    <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.3em] mb-1">Operational Status</p>
                    <h2 className="text-base sm:text-xl font-black text-navy uppercase tracking-tighter">Current Phase</h2>
                  </div>
                  <span className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                    rideStatus === 'accepted' ? 'bg-sky-blue/5 text-sky-blue border-sky-blue/10' :
                    rideStatus === 'on_board' ? 'bg-amber-400/10 text-amber-600 border-amber-400/20' :
                    rideStatus === 'picked-up' ? 'bg-green-500/5 text-green-600 border-green-500/10' :
                    'bg-navy/5 text-navy border-navy/10'
                  }`}>
                    {rideStatus === 'accepted' ? 'En Route' :
                      rideStatus === 'on_board' ? '🚗 On Board' :
                        rideStatus === 'picked-up' ? 'In Transit' :
                          'Contract Terminated'}
                  </span>
                </div>

                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-navy rounded-[1.8rem] flex items-center justify-center text-soft-white text-3xl font-black italic shadow-2xl border-4 border-white transform hover:scale-105 transition-transform">
                      {activeRide.rider.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-sky-blue rounded-full border-4 border-white shadow-lg z-20"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.3em] mb-1">Authenticated Client</p>
                    <h3 className="text-2xl font-black text-navy uppercase tracking-tighter mb-1">{activeRide.rider.name}</h3>
                    <div className="flex items-center bg-soft-white px-3 py-1.5 rounded-full border border-navy/5 shadow-sm inline-flex">
                      <span className="text-yellow-500 text-sm">★</span>
                      <span className="ml-2 text-[10px] font-black text-navy uppercase">{activeRide.rider.rating || '5.0'} MERIT</span>
                    </div>
                  </div>
                </div>

                <a href={`tel:${activeRide.rider.phone}`} className="flex items-center justify-center gap-3 w-full bg-soft-white border border-navy/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-navy hover:bg-navy hover:text-soft-white transition-all shadow-sm group">
                  <svg className="w-4 h-4 text-sky-blue group-hover:text-soft-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Secure Signal Call
                </a>
              </div>
            </div>

            {/* OTP Section Integrated in Left Column */}
            {activeRide.pickupOTP && !otpVerified && rideStatus === 'accepted' && (
              <div className="bg-white shadow-2xl rounded-3xl sm:rounded-[3rem] overflow-hidden border border-navy/5 relative group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-sky-blue"></div>
                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 bg-sky-blue/10 rounded-xl flex items-center justify-center text-sky-blue shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-black text-navy uppercase tracking-tighter">Verify Passenger OTP</h2>
                  </div>

                  <div className="space-y-6 text-center">
                    <p className="text-[10px] font-bold text-navy/40 uppercase tracking-[0.2em] px-4 leading-relaxed">Ask the passenger for their 4-digit security code to start the ride.</p>
                    <div className="flex flex-col gap-4">
                      <input
                        type="text"
                        maxLength="4"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="0 0 0 0"
                        className="w-full text-center text-4xl font-black border-2 border-navy/5 bg-soft-white rounded-2xl py-6 tracking-[0.5em] focus:ring-8 focus:ring-navy/5 focus:border-navy focus:outline-none transition-all placeholder:text-navy/5 shadow-inner"
                      />
                      <button
                        onClick={handleVerifyOTP}
                        disabled={otpInput.length !== 4}
                        className="w-full bg-navy text-soft-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-sky-blue shadow-2xl shadow-navy/20 disabled:opacity-20 transition-all transform active:scale-[0.98]"
                      >
                        🚗 Start Ride
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* On Board Confirmation Banner */}
            {otpVerified && rideStatus === 'on_board' && (
              <div className="bg-amber-50 shadow-xl rounded-3xl sm:rounded-[3rem] overflow-hidden border border-amber-200 relative">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-400"></div>
                <div className="p-6 sm:p-8 text-center">
                  <div className="w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shrink-0">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-black text-amber-700 uppercase tracking-widest">Passenger On Board</p>
                  <p className="text-[10px] text-amber-500 font-bold mt-2">Navigate to the drop location</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Mission Logistics & Controls */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="bg-white shadow-2xl rounded-3xl sm:rounded-[3rem] p-6 sm:p-10 border border-navy/5 relative h-full">
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-6 mb-8 sm:mb-12">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-navy tracking-tight mb-2 sm:mb-4 uppercase relative z-10 w-full">Mission Logistics</h2>
                  <div className="flex items-center space-x-3">
                    <div className="h-1.5 w-8 sm:w-12 bg-sky-blue rounded-full"></div>
                    <p className="text-[10px] sm:text-xs font-bold text-navy/40 uppercase tracking-[0.2em] leading-relaxed">Real-time telemetry and target coordinates</p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end bg-navy/[0.02] sm:bg-transparent p-4 sm:p-0 rounded-2xl sm:rounded-none shrink-0 border border-navy/5 sm:border-transparent mt-4 sm:mt-0">
                  <p className="text-[9px] lg:text-[10px] font-black text-navy/20 uppercase tracking-[0.4em] mb-1">Contract Merit</p>
                  <p className="text-4xl lg:text-6xl font-black text-navy tracking-tighter leading-none">₹{activeRide.fare}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                <div className="space-y-12">
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full mt-1.5 sm:mt-2 shadow-lg shadow-green-100 ring-4 ring-green-100/50"></div>
                    <div className="ml-5 sm:ml-8">
                      <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.3em] mb-1.5 sm:mb-2">Activation Point (Pickup)</p>
                      <p className="text-lg sm:text-xl font-bold text-navy leading-relaxed break-words">{activeRide.pickupLocation?.address || 'Restricted Zone'}</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full mt-1.5 sm:mt-2 shadow-lg shadow-red-100 ring-4 ring-red-100/50"></div>
                    <div className="ml-5 sm:ml-8">
                      <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.3em] mb-1.5 sm:mb-2">Target Terminal (Drop)</p>
                      <p className="text-lg sm:text-xl font-bold text-navy leading-relaxed break-words">{activeRide.dropLocation?.address || 'Deployment Zone'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-navy/[0.02] border border-navy/5 rounded-[2.5rem] p-8 sm:p-10 flex flex-col justify-center items-center text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-3xl flex items-center justify-center text-sky-blue mb-6 shadow-xl border border-navy/5">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-navy/30 uppercase tracking-[0.4em] mb-2">Estimated T-Minus</p>
                  <p className="text-4xl sm:text-5xl font-black text-sky-blue tracking-tighter">{activeRide.estimatedTime || '12'} MIN</p>
                  <div className="mt-5 sm:mt-6 flex items-center gap-3 w-full max-w-[200px]">
                    <div className="flex-1 h-1 bg-navy/5 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-blue animate-progress" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-navy/40 uppercase whitespace-nowrap">{activeRide.distance || '5.2 KM'} Remain</span>
                  </div>
                </div>
              </div>

              {/* Master Controls Sticky Bar */}
              <div className="mt-auto pt-10 border-t border-navy/5">
                <div className="flex flex-col sm:flex-row gap-6">
                  {rideStatus === 'accepted' && (
                    <p className="text-[10px] text-navy/40 font-bold uppercase tracking-widest text-center py-4">
                      Enter the passenger's OTP on the left panel to start the ride
                    </p>
                  )}

                  {rideStatus === 'on_board' && (
                    <button
                      onClick={() => handleStatusChange('picked-up')}
                      className="w-full sm:flex-1 bg-sky-blue text-soft-white px-6 sm:px-8 py-6 sm:py-7 rounded-3xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] hover:bg-navy shadow-2xl shadow-sky-blue/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 sm:gap-4 break-words text-center"
                    >
                      <span className="max-w-[75%] break-words">Confirm Arrival at Drop Point</span>
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping shrink-0" style={{flex: '0 0 auto'}}></div>
                    </button>
                  )}

                  {rideStatus === 'picked-up' && (
                    <button
                      onClick={() => handleStatusChange('completed')}
                      className="flex-1 bg-navy text-soft-white px-8 py-7 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] hover:bg-sky-blue shadow-2xl shadow-navy/30 transition-all transform active:scale-[0.98] flex items-center justify-center group"
                    >
                      Finalize & Settle Merit
                      <svg className="w-5 h-5 ml-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  )}

                  {rideStatus !== 'completed' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Terminate mission? This will be logged in operative history.')) {
                          localStorage.removeItem('activeRide');
                          navigate('/driver');
                        }
                      }}
                      className="bg-red-50 text-red-600 border border-red-100/50 px-8 py-7 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
                    >
                      Abort Mission
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActiveRide;
