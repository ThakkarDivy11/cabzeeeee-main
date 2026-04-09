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

const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const carIcon = new L.Icon({
    iconUrl: carMarkerUrl, iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -18]
});

const Routing = ({ start, end, onRouteUpdate }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map) return;
        if (!routingControlRef.current) {
            routingControlRef.current = L.Routing.control({
                waypoints: [], routeWhileDragging: false, addWaypoints: false, draggableWaypoints: false,
                fitSelectedRoutes: true, showAlternatives: false,
                lineOptions: { styles: [{ color: '#FFD000', weight: 6, opacity: 0.8 }] },
                createMarker: () => null
            }).addTo(map);

            routingControlRef.current.on('routesfound', (e) => {
                const routes = e.routes;
                if (routes && routes.length > 0) {
                    const summary = routes[0].summary;
                    onRouteUpdate({ distance: parseFloat((summary.totalDistance / 1000).toFixed(1)), duration: Math.round(summary.totalTime / 60) });
                }
            });
            const p = routingControlRef.current.getContainer();
            if (p) p.style.display = 'none';
        }

        return () => {
            const control = routingControlRef.current;
            if (!control) return;
            try { if (control._pendingRequest && control._pendingRequest.abort) control._pendingRequest.abort(); } catch (e) {}
            try { if (control.remove) control.remove(); else if (map && map.removeControl) map.removeControl(control); } catch (e) {}
            finally { routingControlRef.current = null; }
        };
    }, [map, onRouteUpdate]);

    useEffect(() => {
        if (routingControlRef.current && start && end) {
            if (!routingControlRef.current._map) return;
            try {
                const wp1 = L.latLng(start[0], start[1]), wp2 = L.latLng(end[0], end[1]);
                const currentWps = routingControlRef.current.getWaypoints();
                if (!currentWps?.[0]?.latLng || !currentWps?.[1]?.latLng || !currentWps[0].latLng.equals(wp1) || !currentWps[1].latLng.equals(wp2)) {
                    routingControlRef.current.setWaypoints([wp1, wp2]);
                }
            } catch (err) {}
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
    const [status, setStatus] = useState('CALIBRATING...');
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
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/payments/payment-methods`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) setSavedCards(data.data);
        } catch (error) {}
    };

    const fetchRideDetails = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();
                setRide(data.data);
                if (['on_board', 'picked-up'].includes(data.data.status)) setStatus('EN ROUTE');
                if (data.data.status === 'completed') {
                    setStatus('MISSION COMPLETE');
                    if (!data.data.isPaid) { setShowPaymentModal(true); fetchSavedCards(); }
                    else if (!data.data.driverRating) setShowRatingModal(true);
                }
                if (data.data.currentDriverLocation) setDriverLocation([data.data.currentDriverLocation.latitude, data.data.currentDriverLocation.longitude]);
            } else { navigate('/rider'); }
        } catch (error) {} finally { setLoading(false); }
    }, [rideId, navigate]);

    useEffect(() => {
        fetchRideDetails();
        socketService.connect();
        socketService.joinRide(rideId);
        socketService.onLocationUpdate((data) => setDriverLocation([data.latitude, data.longitude]));
        socketService.onStatusUpdate((data) => {
            setRide(prev => ({ ...prev, ...data.ride, status: data.status }));
            if (data.status === 'accepted') { setStatus('DRIVER INCOMING'); toast.success('Driver intercepted!'); }
            else if (data.status === 'on_board') { setStatus('EN ROUTE'); toast.success('Mission active!'); }
            else if (data.status === 'completed') { setStatus('MISSION COMPLETE'); setShowPaymentModal(true); fetchSavedCards(); }
            else if (data.status === 'cancelled') { navigate('/rider'); }
        });
        socketService.onOTPVerified(() => { setRide(prev => ({ ...prev, otpVerified: true })); toast.success('Security Clearance Granted!'); });
        return () => { socketService.leaveRide(rideId); socketService.removeAllListeners(); };
    }, [rideId, fetchRideDetails, navigate]);

    const handleInitiatePayment = async (e) => {
        e.preventDefault();
        setProcessingPayment(true);
        try {
            const token = localStorage.getItem('token'), apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            if (paymentMethod === 'wallet') {
                const res = await fetch(`${apiUrl}/api/payments/confirm-ride-payment/${rideId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ method: 'wallet' }) });
                const data = await res.json();
                if (data.success) { setShowPaymentModal(false); setShowRatingModal(true); } else toast.error(data.message);
            } else if (paymentMethod === 'card') {
                const res = await fetch(`${apiUrl}/api/payments/create-ride-payment-intent/${rideId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ paymentMethodId: selectedCardId || undefined }) });
                const data = await res.json();
                if (data.success) setClientSecret(data.clientSecret); else toast.error(data.message);
            }
        } catch (error) {} finally { setProcessingPayment(false); }
    };

    const handleRatingSubmit = async () => {
        setSubmittingRating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideId}/rate`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ rating }) });
            if ((await res.json()).success) { setShowRatingModal(false); navigate('/rider'); }
        } catch (error) {} finally { setSubmittingRating(false); }
    };

    if (loading) return <div className="h-screen w-screen bg-[var(--bg)] flex items-center justify-center cz-bebas text-3xl text-yellow-500 animate-pulse">INITIATING LINK...</div>;
    if (!ride) return <div className="h-screen w-screen bg-black flex items-center justify-center cz-bebas text-2xl text-red-500">LINK FAILED.</div>;

    const pickup = [ride.pickupLocation.coordinates[1], ride.pickupLocation.coordinates[0]];
    const destination = [ride.dropLocation.coordinates[1], ride.dropLocation.coordinates[0]];

    return (
        <div className="h-screen w-full flex overflow-hidden bg-[var(--bg)] cz-dm">
            <div className="cz-noise" />
            
            {/* ── Mission Control Sidebar ── */}
            <aside className="w-[380px] h-full cz-glass border-r border-[var(--border)] relative z-20 flex flex-col p-8 overflow-y-auto hidden lg:flex">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="cz-bebas text-4xl tracking-widest text-yellow-500 drop-shadow-[0_0_10px_rgba(255,208,0,0.3)]">CABZEE</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--muted)]">OPS TERMINAL MK-IV</p>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className="space-y-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="live-dot w-3 h-3 bg-yellow-500 animate-pulse shadow-[0_0_15px_rgba(255,208,0,0.5)]" />
                        <h2 className="cz-bebas text-3xl tracking-wider text-[var(--text)]">{status}</h2>
                    </div>
                    
                    <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-1000 shadow-[0_0_15px_rgba(255,208,0,0.4)]" style={{
                            width: status === 'MISSION COMPLETE' ? '100%' : status === 'EN ROUTE' ? '66%' : status === 'DRIVER INCOMING' ? '33%' : '5%'
                        }} />
                    </div>
                </div>

                {/* Security Section */}
                {ride.pickupOTP && !ride.otpVerified && !['on_board', 'picked-up', 'completed'].includes(ride.status) && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-3xl p-6 text-center mb-8 relative group overflow-hidden">
                        <div className="absolute inset-0 bg-yellow-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-500/80 uppercase tracking-widest mb-4">SECURITY CLEARANCE REQUIRED</p>
                            <div className="flex justify-center gap-3">
                                {ride.pickupOTP.split('').map((digit, i) => (
                                    <div key={i} className="w-12 h-16 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-3xl cz-bebas text-yellow-500 shadow-2xl">
                                        {digit}
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] font-bold text-[var(--muted)] mt-4 uppercase leading-relaxed tracking-tighter">VERBAL CONFIRMATION TO OPERATOR REQUIRED</p>
                        </div>
                    </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="cz-glass p-5 border border-[var(--border)] rounded-[2rem]">
                        <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">ETA MINS</p>
                        <p className="text-3xl cz-bebas text-[var(--text)]">{routeInfo.duration || ride.estimatedTime || 0}</p>
                    </div>
                    <div className="cz-glass p-5 border border-[var(--border)] rounded-[2rem]">
                        <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">RANGE KM</p>
                        <p className="text-3xl cz-bebas text-[var(--text)]">{routeInfo.distance || ride.distance || 0}</p>
                    </div>
                </div>

                {/* Driver Info */}
                {ride.driver && (
                    <div className="mt-auto cz-glass p-6 border border-yellow-500/20 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
                             <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center cz-bebas text-2xl text-black">
                                    {ride.driver.name[0]}
                                </div>
                                <div className="flex-1">
                                    <h3 className="cz-bebas text-xl text-[var(--text)] tracking-wider leading-none mb-1">{ride.driver.name}</h3>
                                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-tighter">{ride.driver.vehicleInfo?.make} {ride.driver.vehicleInfo?.model}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <div>
                                    <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">MISSION COST</p>
                                    <p className="text-2xl cz-bebas text-yellow-500 tracking-wider">₹{ride.fare}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">SECURITY RATING</p>
                                    <p className="text-sm font-black text-[var(--text)] tracking-widest">{ride.driver.rating || '5.0'}★</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </aside>

            {/* ── Map Surface ── */}
            <main className="flex-1 relative z-10">
                <MapContainer center={pickup} zoom={15} className="h-full w-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" className="grayscale" />
                    <Marker position={pickup} icon={pickupIcon} />
                    <Marker position={destination} icon={destinationIcon} />
                    {driverLocation && <Marker position={driverLocation} icon={carIcon} />}
                    <Routing start={driverLocation || pickup} end={['on_board', 'picked-up'].includes(ride.status) ? destination : pickup} onRouteUpdate={setRouteInfo} />
                </MapContainer>

                {/* Floating Payment Trigger Overlay */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-3xl animate-[fadeIn_0.5s_ease-out]">
                        <div className="cz-glass w-full max-w-lg rounded-[3rem] border border-yellow-500/30 p-10 shadow-[0_0_100px_rgba(255,208,0,0.2)]">
                            <div className="text-center mb-10">
                                <h2 className="cz-bebas text-5xl text-yellow-500 tracking-widest mb-4">MISSION SUMMARY</h2>
                                <p className="text-[11px] font-black text-[var(--muted)] uppercase tracking-[0.4em]">EXPENDITURE CALCULATION COMPLETE</p>
                            </div>
                            
                            {!clientSecret ? (
                                <form onSubmit={handleInitiatePayment} className="space-y-8">
                                    <div className="grid grid-cols-1 gap-4">
                                        <button type="button" onClick={() => setPaymentMethod('wallet')} className={`p-6 rounded-3xl border transition-all text-left group ${paymentMethod === 'wallet' ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-white/5 border-white/10 text-[var(--text)]'}`}>
                                            <p className="cz-bebas text-2xl tracking-widest">DIGITAL WALLET</p>
                                            <p className={`text-[10px] font-bold uppercase ${paymentMethod === 'wallet' ? 'text-black/60' : 'text-[var(--muted)]'}`}>INSTANT CLEARANCE</p>
                                        </button>
                                        <button type="button" onClick={() => setPaymentMethod('card')} className={`p-6 rounded-3xl border transition-all text-left group ${paymentMethod === 'card' ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-white/5 border-white/10 text-[var(--text)]'}`}>
                                            <p className="cz-bebas text-2xl tracking-widest">ENCRYPTED CARD</p>
                                            <p className={`text-[10px] font-bold uppercase ${paymentMethod === 'card' ? 'text-black/60' : 'text-[var(--muted)]'}`}>SECURE GATEWAY</p>
                                        </button>
                                    </div>
                                    <button type="submit" disabled={processingPayment || !paymentMethod} className="w-full py-6 bg-yellow-500 text-black cz-bebas text-3xl tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_15px_40px_rgba(255,208,0,0.3)]">
                                        {processingPayment ? 'AUTHORIZING...' : `COMMIT ₹${ride.fare}`}
                                    </button>
                                </form>
                            ) : (
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <CheckoutForm clientSecret={clientSecret} amount={ride.fare} onSuccess={() => { setShowPaymentModal(false); setShowRatingModal(true); }} onCancel={() => setClientSecret(null)} />
                                </Elements>
                            )}
                        </div>
                    </div>
                )}

                {/* Rating Modal */}
                {showRatingModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 backdrop-blur-3xl animate-[fadeIn_0.5s_ease-out]">
                        <div className="cz-glass w-full max-w-md rounded-[3rem] border border-yellow-500/30 p-10 text-center shadow-[0_0_100px_rgba(255,208,0,0.2)]">
                            <div className="w-20 h-20 bg-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-3 group hover:rotate-6 transition-transform">
                                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h2 className="cz-bebas text-4xl text-yellow-500 tracking-widest mb-4">RATE OPERATOR</h2>
                            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] mb-10">MISSION EVALUATION</p>
                            
                            <div className="flex justify-center gap-3 mb-10">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} className="hover:scale-110 active:scale-95 transition-all">
                                        <svg className={`w-12 h-12 ${(hoveredStar || rating) >= star ? 'text-yellow-500 drop-shadow-[0_0_10px_rgba(255,208,0,0.5)]' : 'text-white/5'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    </button>
                                ))}
                            </div>
                            
                            <button onClick={handleRatingSubmit} disabled={submittingRating} className="w-full py-6 bg-yellow-500 text-black cz-bebas text-2xl tracking-widest rounded-2xl hover:scale-[1.02] shadow-[0_15px_40px_rgba(255,208,0,0.3)] transition-all">
                                {submittingRating ? 'COMMITING...' : 'FINISH MISSION'}
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default LiveRideTracking;
