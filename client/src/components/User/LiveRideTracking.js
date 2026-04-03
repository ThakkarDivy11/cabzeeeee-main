import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import socketService from '../../services/socketService';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../Payment/CheckoutForm';
import './LiveRideTracking.css';
import carMarkerUrl from '../../assets/car-marker.svg';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_please_add_your_key');

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const carIcon = new L.Icon({
    iconUrl: carMarkerUrl,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -18]
});

// Map Component to handle routing
const Routing = ({ start, end, onRouteUpdate }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        if (!routingControlRef.current) {
            routingControlRef.current = L.Routing.control({
                waypoints: [],
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                lineOptions: {
                    styles: [{ color: '#00AEEF', weight: 6, opacity: 0.8 }]
                },
                createMarker: () => null // We handle markers manually
            }).addTo(map);

            routingControlRef.current.on('routesfound', function(e) {
                const routes = e.routes;
                if (routes && routes.length > 0) {
                    const summary = routes[0].summary;
                    onRouteUpdate({
                        distance: parseFloat((summary.totalDistance / 1000).toFixed(1)),
                        duration: Math.round(summary.totalTime / 60)
                    });
                }
            });

            // Hide the default routing instructions container
            const p = routingControlRef.current.getContainer();
            if (p) {
                p.style.display = 'none';
            }
        }

        return () => {
            const control = routingControlRef.current;
            if (!control) return;

            // Leaflet Routing Machine can still have an in-flight OSRM request.
            // Abort while the control is still attached to the map to avoid
            // `_clearLines` calling `this._map.removeLayer(...)` after unmount.
            try {
                if (control._pendingRequest && control._pendingRequest.abort) {
                    control._pendingRequest.abort();
                }
            } catch (e) {
                // ignore
            }

            try {
                if (control._plan && control._plan.off) control._plan.off();
                if (control.off) control.off();
            } catch (e) {
                // ignore
            }

            try {
                // `remove()` is safer than `map.removeControl(...)` for plugin controls.
                if (control.remove) control.remove();
                else if (map && map.removeControl) map.removeControl(control);
            } catch (e) {
                console.log('Error removing routing control');
            } finally {
                routingControlRef.current = null;
            }
        };
    }, [map, onRouteUpdate]);

    // Update waypoints dynamically
    useEffect(() => {
        if (routingControlRef.current && start && end) {
            // If the control has been removed/unmounted, skip updates.
            if (!routingControlRef.current._map) return;
            try {
                const wp1 = L.latLng(start[0], start[1]);
                const wp2 = L.latLng(end[0], end[1]);
                
                // Only update if coordinates actually changed
                const currentWps = routingControlRef.current.getWaypoints();
                const curr1 = currentWps?.[0]?.latLng || null;
                const curr2 = currentWps?.[1]?.latLng || null;

                // Leaflet Routing Machine may initialize with 2 empty waypoints (latLng = null).
                // Guard against calling `.equals` on null so we don't silently fail to set waypoints.
                if (!curr1 || !curr2 || !curr1.equals(wp1) || !curr2.equals(wp2)) {
                    routingControlRef.current.setWaypoints([wp1, wp2]);
                }
            } catch (err) {
                console.warn('Failed to set waypoints:', err);
            }
        }
    }, [start, end]);

    return null;
};

const LiveRideTracking = () => {
    const { rideId } = useParams();
    const navigate = useNavigate();

    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driverLocation, setDriverLocation] = useState(null);
    const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
    const [status, setStatus] = useState('Driver Coming');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState('');
    const [clientSecret, setClientSecret] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    const [rating, setRating] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);

    const fetchSavedCards = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/payment-methods`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setSavedCards(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch cards:', error);
        }
    };

    const fetchRideDetails = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setRide(data.data);
                if (data.data.status === 'on_board' || data.data.status === 'picked-up') setStatus('On Board');
                if (data.data.status === 'completed') {
                    setStatus('Ride Completed');
                    if (!data.data.isPaid) {
                        setShowPaymentModal(true);
                        fetchSavedCards();
                    } else if (!data.data.driverRating) {
                        setShowRatingModal(true);
                    }
                }
                
                if (data.data.currentDriverLocation) {
                    setDriverLocation([data.data.currentDriverLocation.latitude, data.data.currentDriverLocation.longitude]);
                }
            } else {
                toast.error('Failed to load ride details');
                navigate('/rider');
            }
        } catch (error) {
            console.error('Error fetching ride:', error);
        } finally {
            setLoading(false);
        }
    }, [rideId, navigate]);

    useEffect(() => {
        fetchRideDetails();
        socketService.connect();
        socketService.joinRide(rideId);

        socketService.onLocationUpdate((data) => {
            setDriverLocation([data.latitude, data.longitude]);
        });

        socketService.onStatusUpdate((data) => {
            setRide(prev => ({ ...prev, status: data.status }));
            if (data.status === 'on_board') {
                setStatus('On Board');
                toast.success('🚗 Your ride has started! You are now on board.', {
                    duration: 6000,
                    style: {
                        background: '#111827',
                        color: '#F9FAFB',
                        border: '1px solid #00A8E8',
                        padding: '16px',
                        fontSize: '16px',
                        fontWeight: 'bold'
                    },
                    icon: '🚀'
                });
            } else if (data.status === 'picked-up') {
                setStatus('Arrived at Destination');
                toast.success('📍 You have arrived at your destination!', {
                    icon: '🏢'
                });
            } else if (data.status === 'completed') {
                setStatus('Ride Completed');
                toast.success('✅ Ride finished! Thank you for choosing CabZee.', {
                    duration: 5000,
                    style: { background: '#059669', color: '#fff', fontWeight: 'bold' }
                });
                // Assuming it's not paid yet unless we know. Force payment modal:
                setShowPaymentModal(true);
                fetchSavedCards();
            }
        });

        socketService.onOTPVerified(() => {
            setRide(prev => ({ ...prev, otpVerified: true }));
            toast.success('Identity Verified!');
        });

        return () => {
            socketService.leaveRide(rideId);
            socketService.removeAllListeners();
        };
    }, [rideId, fetchRideDetails]);

    const handleInitiatePayment = async (e) => {
        e.preventDefault();
        setProcessingPayment(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

            if (paymentMethod === 'wallet') {
                const response = await fetch(`${apiUrl}/api/payments/confirm-ride-payment/${rideId}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ method: 'wallet' })
                });
                const data = await response.json();
                if (data.success) {
                    toast.success('Paid via Wallet!');
                    setShowPaymentModal(false);
                    setShowRatingModal(true);
                } else {
                    toast.error(data.message || 'Payment failed');
                }
            } else if (paymentMethod === 'card') {
                const response = await fetch(`${apiUrl}/api/payments/create-ride-payment-intent/${rideId}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ paymentMethodId: selectedCardId || undefined })
                });
                const data = await response.json();
                if (data.success) {
                    setClientSecret(data.clientSecret);
                } else {
                    toast.error(data.message || 'Payment failed');
                }
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('Network error');
        } finally {
            setProcessingPayment(false);
        }
    };

    const handleSuccessfulCardPayment = async () => {
        toast.success('Card Payment Successful!');
        setShowPaymentModal(false);
        setShowRatingModal(true); // Proceed to rating after successful payment
        
        // Optionally notify backend here or rely on webhooks, but for UX, open rating immediately.
        try {
            await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideId}`);
        } catch (e) {}
    };

    const handleRatingSubmit = async () => {
        setSubmittingRating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating })
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Rating Submitted!');
                setShowRatingModal(false);
                setTimeout(() => navigate('/rider'), 2000);
            }
        } catch (error) {
            console.error('Rating error:', error);
        } finally {
            setSubmittingRating(false);
        }
    };

    if (loading) return <div className="loading-screen">Authenticating Encryption...</div>;
    if (!ride) return <div className="error-screen">Ride data unavailable.</div>;

    const pickup = [ride.pickupLocation.coordinates[1], ride.pickupLocation.coordinates[0]];
    const destination = [ride.dropLocation.coordinates[1], ride.dropLocation.coordinates[0]];

    return (
        <div className="live-ride-container">
            {/* Dark Sidebar Dashboard */}
            <aside className="sidebar-dashboard">
                <div className="dashboard-header flex items-center justify-between">
                    <div>
                        <h1>CABZEE</h1>
                        <p className="text-[10px] uppercase tracking-widest text-sky-blue font-bold">Premium Ride Operations</p>
                    </div>
                    <button onClick={() => navigate('/rider')} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                <div className="dark-glass-panel">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-4">Trip Status</p>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="live-pulse w-3 h-3 bg-green-500 rounded-full"></div>
                        <h2 className="text-xl font-bold">{status}</h2>
                    </div>

                    <div className="status-steps flex justify-between items-center mb-10 px-4 relative">
                        {/* Connector Lines */}
                        <div className="absolute top-[18px] left-10 right-10 h-0.5 bg-navy/5 -z-10"></div>
                        <div className={`absolute top-[18px] left-10 h-0.5 bg-sky-blue -z-10 transition-all duration-1000 ${
                            status === 'Ride Completed' ? 'w-[calc(100%-80px)]' : 
                            status === 'On Board' ? 'w-[calc(66%-40px)]' : 
                            ['Driver Arrived', 'Accepted'].includes(status) ? 'w-[calc(33%-20px)]' : 'w-0'
                        }`}></div>
                        
                        <div className="status-step active">
                            <div className="step-dot"></div>
                            <span className="step-label">Booking</span>
                        </div>
                        <div className={`status-step ${['accepted', 'arrived', 'on_board', 'picked-up', 'completed'].includes(ride.status) || ['Driver Arrived', 'On Board', 'Ride Completed'].includes(status) ? 'active' : ''}`}>
                            <div className="step-dot"></div>
                            <span className="step-label">Arrived</span>
                        </div>
                        <div className={`status-step ${['on_board', 'picked-up', 'completed'].includes(ride.status) || ['On Board', 'Ride Completed'].includes(status) ? 'active' : ''}`}>
                            <div className="step-dot"></div>
                            <span className="step-label">On Board</span>
                        </div>
                        <div className={`status-step ${['completed'].includes(ride.status) || status === 'Ride Completed' ? 'active' : ''}`}>
                            <div className="step-dot"></div>
                            <span className="step-label">Complete</span>
                        </div>
                    </div>
                </div>

                {/* OTP Display for User */}
                {ride.pickupOTP && !ride.otpVerified && !['on_board', 'picked-up', 'completed'].includes(ride.status) && (
                    <div className="mt-6 p-6 rounded-2xl border-2 border-dashed border-sky-blue/30 bg-sky-blue/5 text-center">
                        <p className="text-[10px] text-sky-blue font-black uppercase tracking-widest mb-3">Your Security OTP</p>
                        <div className="flex justify-center gap-2">
                            {ride.pickupOTP.split('').map((digit, i) => (
                                <span key={i} className="w-10 h-12 flex items-center justify-center bg-white/10 rounded-xl text-2xl font-black border border-white/20">
                                    {digit}
                                </span>
                            ))}
                        </div>
                        <p className="text-[10px] text-white/40 mt-3 font-bold">Show this to your driver to start the ride</p>
                    </div>
                )}

                {ride.otpVerified && (
                    <div className="mt-6 flex items-center justify-center gap-3 bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-black uppercase text-green-500 tracking-widest">Identity Verified</span>
                    </div>
                )}

                <div className="glass-panel mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-navy/40 font-black uppercase">ETA</span>
                            <span className="text-2xl font-black">{routeInfo.duration || ride.estimatedTime || 0} min</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-navy/40 font-black uppercase">Distance</span>
                            <span className="text-2xl font-black">{routeInfo.distance || ride.distance || 0} km</span>
                        </div>
                    </div>
                </div>

                {ride.driver && (
                    <div className="dark-glass-panel mt-auto">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-navy font-black text-xl">
                                {ride.driver.name[0]}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold">{ride.driver.name}</h3>
                                <p className="text-[10px] text-white/50">{ride.driver.vehicleInfo?.make} {ride.driver.vehicleInfo?.model} • {ride.driver.vehicleInfo?.licensePlate}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center bg-white/10 px-2 py-1 rounded-lg mb-1">
                                    <span className="text-yellow-400 mr-1 text-[10px]">★</span>
                                    <span className="text-[10px] font-bold">{ride.driver.rating || '5.0'}</span>
                                </div>
                                <span className="text-[10px] font-black text-sky-blue">₹{ride.fare}</span>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* Map Section */}
            <main className="full-screen-map">
                <MapContainer center={pickup} zoom={15} scrollWheelZoom={true}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={pickup} icon={pickupIcon} />
                    <Marker position={destination} icon={destinationIcon} />
                    {driverLocation && <Marker position={driverLocation} icon={carIcon} />}
                    <Routing 
                        start={driverLocation || pickup} 
                        end={['started', 'picked-up'].includes(ride.status) ? destination : pickup} 
                        onRouteUpdate={setRouteInfo} 
                    />
                </MapContainer>

                {/* Payment Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-navy/80 backdrop-blur-md"></div>
                        <div className="relative bg-white rounded-3xl sm:rounded-[2.5rem] w-full max-w-md p-6 sm:p-10 shadow-2xl animate-[fadeIn_0.5s_ease-out] max-h-[90vh] overflow-y-auto">
                            <div className="text-center mb-6 sm:mb-8">
                                <h2 className="text-3xl font-black text-navy uppercase tracking-tighter mb-2">Trip Summary</h2>
                                <p className="text-sm font-bold text-navy/40 uppercase tracking-widest">Total Fare: ₹{ride.fare}</p>
                            </div>

                            {!clientSecret ? (
                                <form onSubmit={handleInitiatePayment} className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="flex items-center space-x-3 p-4 border border-navy/10 rounded-2xl cursor-pointer hover:bg-navy/5 transition-colors">
                                            <input type="radio" name="paymentMethod" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="w-5 h-5 text-sky-blue" />
                                            <span className="font-bold text-navy">Pay via Wallet</span>
                                        </label>

                                        <div className="p-4 border border-navy/10 rounded-2xl bg-soft-white space-y-3">
                                            <label className="flex items-center space-x-3 cursor-pointer">
                                                <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-sky-blue" />
                                                <span className="font-bold text-navy">Pay via Card</span>
                                            </label>
                                            
                                            {paymentMethod === 'card' && (
                                                <select
                                                    value={selectedCardId}
                                                    onChange={(e) => setSelectedCardId(e.target.value)}
                                                    className="w-full mt-2 rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm font-bold text-navy focus:outline-none"
                                                >
                                                    <option value="">Use a new card</option>
                                                    {savedCards.map((pm) => (
                                                        <option key={pm.id} value={pm.id}>
                                                            {pm.brand?.toUpperCase?.() || 'CARD'} •••• {pm.last4}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processingPayment || !paymentMethod}
                                        className="w-full bg-navy text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-blue transition-all disabled:opacity-50"
                                    >
                                        {processingPayment ? 'Processing...' : `Pay ₹${ride.fare}`}
                                    </button>
                                </form>
                            ) : (
                                <div className="mt-4">
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutForm
                                            clientSecret={clientSecret}
                                            amount={ride.fare}
                                            paymentMethodId={selectedCardId || undefined}
                                            onSuccess={handleSuccessfulCardPayment}
                                            onCancel={() => setClientSecret(null)}
                                        />
                                    </Elements>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Rating Modal */}
                {showRatingModal && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-navy/80 backdrop-blur-md"></div>
                        <div className="relative bg-white rounded-3xl sm:rounded-[2.5rem] w-full max-w-md p-6 sm:p-10 shadow-2xl animate-[fadeIn_0.5s_ease-out] max-h-[90vh] overflow-y-auto">
                            <div className="text-center mb-6 sm:mb-8">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-black text-navy uppercase tracking-tighter mb-2">Trip Summary</h2>
                                <p className="text-sm font-bold text-navy/40 uppercase tracking-widest">Rate {ride.driver?.name}</p>
                            </div>

                            <div className="flex justify-center space-x-3 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button 
                                        key={star} 
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        className="focus:outline-none transform transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <svg 
                                            className={`w-12 h-12 transition-colors duration-200 ${
                                                (hoveredStar || rating) >= star ? 'text-yellow-400 drop-shadow-md' : 'text-navy/10'
                                            }`} 
                                            fill="currentColor" 
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>

                            <button onClick={handleRatingSubmit} disabled={submittingRating} className="w-full bg-navy text-white py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-sky-blue transition-all disabled:opacity-50">
                                {submittingRating ? 'Processing...' : 'Complete Experience'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Floating Booking Panel Overlay */}
                <div className="floating-booking-panel">
                    <div className="glass-panel">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="text-[10px] font-bold uppercase text-navy/60">{ride.pickupLocation.address}</p>
                        </div>
                        <div className="h-4 border-l-2 border-dashed border-navy/10 ml-1"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <p className="text-[10px] font-bold uppercase text-navy/60">{ride.dropLocation.address}</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveRideTracking;
