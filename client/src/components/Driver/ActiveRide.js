
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
  <div className="flex items-center justify-center gap-2">
    {[1,2,3,4,5].map(i => (
      <button
        key={i}
        type="button"
        onClick={() => !disabled && setRating(i)}
        className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
        disabled={disabled}
      >
        <svg className={`w-10 h-10 ${i <= rating ? 'text-[#FFD000]' : 'text-gray-300 dark:text-neutral-700'}`} fill={i <= rating ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.276a1 1 0 00.95.69h6.6c.969 0 1.371 1.24.588 1.81l-5.347 3.89a1 1 0 00-.364 1.118l2.036 6.276c.3.921-.755 1.688-1.538 1.118l-5.347-3.89a1 1 0 00-1.175 0l-5.347 3.89c-.783.57-1.838-.197-1.538-1.118l2.036-6.276a1 1 0 00-.364-1.118l-5.347-3.89c-.783-.57-.38-1.81.588-1.81h6.6a1 1 0 00.95-.69l2.036-6.276z" />
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
            toast.error('No active trip found');
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
      setLoading(false);
    }
    
    fetchActiveRide();

    // Socket Integration
    const currentActiveRide = JSON.parse(localStorage.getItem('activeRide'));
    const rideId = activeRide?._id || currentActiveRide?._id;
    
    if (rideId) {
      socketService.connect();
      socketService.joinRide(rideId);

      socketService.onStatusUpdate((data) => {
        if (data.status === 'cancelled') {
          toast.error('Trip cancelled by the rider.', { icon: '🚫' });
          localStorage.removeItem('activeRide');
          setTimeout(() => navigate('/driver'), 2000);
        } else {
          setRideStatus(data.status);
          if (data.ride) {
            setActiveRide(data.ride);
            localStorage.setItem('activeRide', JSON.stringify(data.ride));
          }
        }
      });
    }

    return () => {
      if (rideId) {
        socketService.leaveRide(rideId);
        socketService.removeAllListeners();
      }
    };
  }, [navigate]);

  useEffect(() => {
    const shouldCheck = showPaymentConfirm && rideStatus === 'completed' && !!activeRide?._id && !paymentReceived;
    if (!shouldCheck) return;

    let cancelled = false;
    const check = async () => {
      try {
        setCheckingPayment(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${activeRide._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (cancelled) return;
        if (data?.success && data?.data) {
          setActiveRide(data.data);
          localStorage.setItem('activeRide', JSON.stringify(data.data));
          if (data.data.isPaid) setPaymentReceived(true);
        }
      } catch (e) { } finally {
        if (!cancelled) setCheckingPayment(false);
      }
    };

    check();
    const intervalId = setInterval(check, 3000);
    return () => { cancelled = true; clearInterval(intervalId); };
  }, [activeRide?._id, paymentReceived, rideStatus, showPaymentConfirm]);

  const initializeMapData = (ride) => {
    let pCoords = [28.6139, 77.2090];
    let dCoords = [28.6339, 77.2290];
    if (ride.pickupLocation?.coordinates) pCoords = [ride.pickupLocation.coordinates[1], ride.pickupLocation.coordinates[0]];
    if (ride.dropLocation?.coordinates) dCoords = [ride.dropLocation.coordinates[1], ride.dropLocation.coordinates[0]];
    setPickupCoords(pCoords);
    setDropCoords(dCoords);
    setRoutePositions([pCoords, dCoords]);
    setMapCenter(pCoords);
  };

  const handleLocationUpdate = (newPos) => {
    setCurrentLocation(newPos);
    if (activeRide?._id) socketService.updateDriverLocation(activeRide._id, newPos[0], newPos[1]);
  };

  const handleVerifyOTP = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${activeRide._id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ otp: otpInput })
      });
      const data = await response.json();
      if (data.success) {
        setOtpVerified(true);
        setRideStatus('on_board');
        const updatedRide = { ...activeRide, otpVerified: true, status: 'on_board' };
        setActiveRide(updatedRide);
        localStorage.setItem('activeRide', JSON.stringify(updatedRide));
        socketService.notifyOTPVerified(activeRide._id);
        socketService.notifyRideStatusChange(activeRide._id, 'on_board');
        toast.success('OTP Verified! Destination unlocked.');
      } else {
        toast.error('Invalid OTP.');
      }
    } catch (error) { toast.error('Verification failed'); }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${activeRide._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (!data.success) { toast.error(data.message); return; }
      const updatedRide = data.data ? data.data : { ...activeRide, status: newStatus };
      setRideStatus(newStatus);
      setActiveRide(updatedRide);
      localStorage.setItem('activeRide', JSON.stringify(updatedRide));
      if (activeRide._id) socketService.notifyRideStatusChange(activeRide._id, newStatus);
      if (newStatus === 'completed') {
        setShowPaymentConfirm(true);
        setPaymentReceived(!!updatedRide.isPaid);
      } else if (newStatus === 'picked-up') {
        toast.success('In transit to destination.');
        if (dropCoords) setMapCenter(dropCoords);
      }
    } catch (error) { toast.error('Network error'); } finally { setUpdatingStatus(false); }
  };

  const [driverRating, setDriverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(!!(activeRide && activeRide.riderRating));
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');

  if (loading || !user || !activeRide) return <div className="p-20 text-center font-bold text-gray-500">Initializing Tracking...</div>;

  if (showPaymentConfirm) {
    const showFeedback = paymentReceived && !ratingSubmitted && !(activeRide && activeRide.riderRating);
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8 rounded-[3rem] border border-gray-200 bg-white p-12 shadow-xl dark:border-[rgba(255,255,255,0.05)] dark:bg-neutral-900/40 dark:backdrop-blur-xl">
            <div className="text-center">
                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl ${paymentReceived ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-[#FFD000] text-black shadow-[#FFD000]/20'} shadow-xl mb-8`}>
                    <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white uppercase">{paymentReceived ? 'Payment Secured' : 'Awaiting Settlement'}</h2>
                <p className="mt-4 text-sm text-gray-500 max-w-sm mx-auto">{paymentReceived ? 'Rider has successfully paid the trip fare. Please rate their behavior.' : 'Trip completed. Monitoring rider payment completion signal...'}</p>
            </div>

            <div className="rounded-[2.5rem] bg-gray-50 p-8 dark:bg-[rgba(255,255,255,0.05)] border border-gray-100 dark:border-[rgba(255,255,255,0.05)] space-y-4">
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest text-gray-400">
                    <span>Final Fare</span>
                    <span>Passenger</span>
                </div>
                <div className="flex justify-between items-end">
                    <p className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">₹{activeRide.fare}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white uppercase">{activeRide.rider?.name || 'Client'}</p>
                </div>
            </div>

            {showFeedback && (
              <div className="text-center space-y-6 pt-4">
                <p className="text-sm font-bold uppercase tracking-widest text-[#FFD000]">Rate Behavior</p>
                <StarRating rating={driverRating} setRating={setDriverRating} disabled={submittingRating} />
                <button
                  disabled={driverRating === 0 || submittingRating}
                  onClick={async () => {
                    setSubmittingRating(true);
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${activeRide._id}/rate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ rating: driverRating })
                      });
                      const data = await response.json();
                      if (data.success) setRatingSubmitted(true);
                    } catch (err) { } finally { setSubmittingRating(false); }
                  }}
                  className="w-full rounded-2xl bg-black py-5 text-xs font-black uppercase tracking-widest force-light-text shadow-xl transition-all hover:bg-neutral-800 dark:bg-[#FFD000] dark:text-black dark:hover:bg-[#ffe04d]"
                >
                  Submit Feedback &rarr;
                </button>
              </div>
            )}

            {paymentReceived && ratingSubmitted && (
              <div className="text-center pt-4">
                <button
                  onClick={() => { localStorage.removeItem('activeRide'); navigate('/driver'); }}
                  className="w-full rounded-2xl bg-[#FFD000] py-5 text-xs font-black uppercase tracking-widest text-black shadow-xl shadow-[#FFD000]/10 transition-all hover:scale-105"
                >
                  Return to Base
                </button>
              </div>
            )}

            {!paymentReceived && (
              <button
                onClick={() => { localStorage.removeItem('activeRide'); navigate('/driver'); }}
                className="w-full rounded-2xl bg-emerald-500 py-6 text-xs font-black uppercase tracking-widest force-light-text shadow-xl shadow-emerald-500/10 transition-all hover:scale-105"
              >
                I Received Payout & Finish
              </button>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 h-[calc(100vh-100px)] flex flex-col">
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => navigate('/driver')}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all dark:bg-[rgba(255,255,255,0.05)] dark:text-gray-400 dark:hover:bg-[rgba(255,255,255,0.10)]"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Trip Tracking</h2>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Live Coordinate Stream</p>
                </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 rounded-full bg-[#FFD000]/10 px-6 py-2 border border-[#FFD000]/20">
                <div className="h-2 w-2 rounded-full bg-[#FFD000] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD000]">Signal Locked</span>
            </div>
        </header>

        <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
            {/* Map Container */}
            <div className="lg:col-span-8 h-[400px] lg:h-full rounded-[3rem] overflow-hidden border border-gray-200 shadow-2xl dark:border-[rgba(255,255,255,0.05)] relative">
                <MapContainer center={currentLocation || mapCenter} zoom={15} className="h-full w-full">
                  <LiveLocationTracker onLocationUpdate={handleLocationUpdate} track={true} />
                  {currentLocation && <DriverMarker position={currentLocation} driverName={user.name} />}
                  {rideStatus !== 'picked-up' && rideStatus !== 'completed' && pickupCoords && <UserMarker position={pickupCoords} popupContent="Pickup Location" />}
                  {dropCoords && <UserMarker position={dropCoords} popupContent="Drop Location" />}
                  {routePositions.length > 0 && <RoutePolyline positions={routePositions} />}
                </MapContainer>
                
                {/* Floating Map Stats */}
                <div className="absolute top-8 left-8 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl dark:bg-[#06060a]/80 dark:border-white/5 hidden md:block">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Trip Status</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">Optimal Guidance Active</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Controls */}
            <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto">
                <div className="rounded-[3rem] border border-gray-200 bg-white p-8 shadow-sm dark:border-[rgba(255,255,255,0.05)] dark:bg-neutral-900/40 dark:backdrop-blur-xl flex flex-col">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-8 dark:border-[rgba(255,255,255,0.05)]">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-[#FFD000] flex items-center justify-center text-xl font-black text-black shadow-lg">
                                {activeRide.rider.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{activeRide.rider.name}</h3>
                                <div className="mt-1 flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-0.5 dark:bg-[rgba(255,255,255,0.05)] border border-gray-100 dark:border-[rgba(255,255,255,0.05)]">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">{rideStatus.replace('_', ' ')}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-2xl font-black tracking-tighter text-[#FFD000]">₹{activeRide.fare}</p>
                    </div>

                    <div className="flex-1 py-8 space-y-6">
                        {/* OTP Logic */}
                        {activeRide.pickupOTP && !otpVerified && rideStatus === 'accepted' && (
                            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-[rgba(255,255,255,0.05)]">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-center text-[#FFD000]">Security Verification Required</p>
                                <input
                                    type="text"
                                    maxLength="4"
                                    value={otpInput}
                                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                                    placeholder="• • • •"
                                    className="w-full rounded-2xl bg-gray-50 p-6 text-center text-5xl font-black tracking-[0.4em] outline-none focus:ring-4 focus:ring-[#FFD000]/20 dark:bg-[rgba(255,255,255,0.05)] dark:border-[rgba(255,255,255,0.05)]"
                                />
                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={otpInput.length !== 4}
                                    className="w-full rounded-2xl bg-black py-5 text-xs font-black uppercase tracking-widest force-light-text shadow-xl hover:bg-neutral-800 disabled:opacity-20 transition-all dark:bg-[#FFD000] dark:text-black dark:hover:bg-[#ffe04d]"
                                >
                                    Start Trip &rarr;
                                </button>
                                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ask passenger for their 4-digit code</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Pickup Information</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{activeRide.pickupLocation?.address}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Destination Target</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed">{activeRide.dropLocation?.address}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-3xl bg-gray-50 p-6 dark:bg-[rgba(255,255,255,0.05)] border border-gray-100 dark:border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estimated duration</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{activeRide.estimatedTime || '12'} MIN</p>
                            </div>
                            <div className="h-10 w-1 rounded-full bg-[#FFD000]" />
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Distance remaining</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">{activeRide.distance || '5.2'} KM</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 dark:border-[rgba(255,255,255,0.05)] space-y-4">
                         {rideStatus === 'on_board' && (
                            <button
                                onClick={() => handleStatusChange('picked-up')}
                                className="w-full rounded-2xl bg-[#FFD000] py-6 text-xs font-black uppercase tracking-[0.2em] text-black shadow-xl transition-all hover:scale-105"
                            >
                                Confirm Drop-off Arrival
                            </button>
                        )}
                        {rideStatus === 'picked-up' && (
                            <button
                                onClick={() => handleStatusChange('completed')}
                                className="w-full rounded-2xl bg-black py-6 text-xs font-black uppercase tracking-[0.2em] force-light-text shadow-xl transition-all hover:bg-neutral-800 dark:bg-[#FFD000] dark:text-black"
                            >
                                Complete Settlement &rarr;
                            </button>
                        )}
                        <button
                            onClick={() => { if (window.confirm('Abort this trip?')) { localStorage.removeItem('activeRide'); navigate('/driver'); } }}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-all"
                        >
                            Emergency Abort
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ActiveRide;
