import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMapEvents } from 'react-leaflet';
import toast from 'react-hot-toast';
import MapContainer from '../Map/MapContainer';
import DriverMarker from '../Map/DriverMarker';
import RoutePolyline from '../Map/RoutePolyline';
import Sidebar from '../Common/Sidebar';

// Helper component to handle map movement
const MapEventsHandler = ({ onMoveEnd }) => {
    useMapEvents({
        moveend: (e) => {
            const map = e.target;
            const center = map.getCenter();
            onMoveEnd([center.lat, center.lng]);
        }
    });
    return null;
};

// Helper component to allow click-to-set location
const MapClickHandler = ({ enabled, onClick }) => {
    useMapEvents({
        click: (e) => {
            if (!enabled) return;
            onClick([e.latlng.lat, e.latlng.lng]);
        }
    });
    return null;
};

const LiveMapBooking = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));
    const [step, setStep] = useState('pickup'); // 'pickup', 'drop', 'confirm'
    const [loading, setLoading] = useState(false);
    const [addressFetching, setAddressFetching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [tapToSet, setTapToSet] = useState(true);

    const [pickup, setPickup] = useState({ address: '', coords: null });
    const [drop, setDrop] = useState({ address: '', coords: null });
    const [drivers, setDrivers] = useState([]);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
    const [routePositions, setRoutePositions] = useState([]);
    const [fareEstimate, setFareEstimate] = useState(null);

    const activeLabel = step === 'pickup' ? 'Pickup' : 'Drop-off';

    const applyLocation = useCallback((coords, address) => {
        if (step === 'pickup') {
            setPickup({ address, coords });
        } else if (step === 'drop') {
            setDrop({ address, coords });
        }
        setMapCenter(coords);
    }, [step]);

    const fetchAddress = useCallback(async (coords) => {
        setAddressFetching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[0]}&lon=${coords[1]}`
            );
            const data = await response.json();
            const address = data?.display_name || '';
            if (address) applyLocation(coords, address);
        } catch (error) {
            console.error('Error fetching address:', error);
        } finally {
            setAddressFetching(false);
        }
    }, [applyLocation]);

    const fetchNearbyDrivers = useCallback(async (coords) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/drivers?lat=${coords[0]}&lon=${coords[1]}&radius=5000`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setDrivers(data.data);
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = [pos.coords.latitude, pos.coords.longitude];
                    setMapCenter(coords);
                    fetchAddress(coords);
                    fetchNearbyDrivers(coords);
                },
                () => {
                    toast.error('Location access denied. Using default location.');
                    const defaultCenter = [28.6139, 77.2090];
                    fetchAddress(defaultCenter);
                    fetchNearbyDrivers(defaultCenter);
                }
            );
        }
    }, [fetchAddress, fetchNearbyDrivers]);

    const handleMapMove = (newCenter) => {
        if (step !== 'confirm') {
            setMapCenter(newCenter);
            fetchAddress(newCenter);
            fetchNearbyDrivers(newCenter);
        }
    };

    const handleMapClick = (coords) => {
        if (step === 'confirm') return;
        setMapCenter(coords);
        fetchAddress(coords);
        fetchNearbyDrivers(coords);
    };

    useEffect(() => {
        if (step === 'pickup') setSearchQuery(pickup.address || '');
        if (step === 'drop') setSearchQuery(drop.address || '');
        if (step === 'confirm') setSearchQuery('');
        setSearchResults([]);
        setSearchLoading(false);
    }, [step, pickup.address, drop.address]);

    const debouncedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

    useEffect(() => {
        if (step === 'confirm') return;
        if (debouncedQuery.length < 3) {
            setSearchResults([]);
            return;
        }

        let cancelled = false;
        const t = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&limit=6`
                );
                const data = await response.json();
                if (cancelled) return;
                setSearchResults(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Location search error:', error);
                if (!cancelled) setSearchResults([]);
            } finally {
                if (!cancelled) setSearchLoading(false);
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [debouncedQuery, step]);

    const handleSelectSearchResult = (item) => {
        const lat = Number(item?.lat);
        const lon = Number(item?.lon);
        const address = item?.display_name || '';
        if (!Number.isFinite(lat) || !Number.isFinite(lon) || !address) {
            toast.error('Could not use that location');
            return;
        }
        const coords = [lat, lon];
        applyLocation(coords, address);
        setSearchQuery(address);
        setSearchResults([]);
        fetchNearbyDrivers(coords);
        toast.success(`${activeLabel} set`);
    };

    const handleConfirmPickup = () => {
        if (!pickup.address) {
            toast.error('Please select a pickup location');
            return;
        }
        setStep('drop');
    };

    const calculateDistance = (coord1, coord2) => {
        const rad = (deg) => deg * (Math.PI / 180);
        const R = 6371;
        const dLat = rad(coord2[0] - coord1[0]);
        const dLon = rad(coord2[1] - coord1[1]);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(coord1[0])) * Math.cos(rad(coord2[0])) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleConfirmDrop = () => {
        if (!drop.address) {
            toast.error('Please select a drop location');
            return;
        }
        setStep('confirm');
        setRoutePositions([pickup.coords, drop.coords]);
        const distance = calculateDistance(pickup.coords, drop.coords);
        const estimatedFare = Math.round(50 + (distance * 12));
        setFareEstimate(estimatedFare);
    };

    const handleRequestRide = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const distance = calculateDistance(pickup.coords, drop.coords);

            const rideData = {
                pickupLocation: { address: pickup.address, coordinates: [pickup.coords[1], pickup.coords[0]] },
                dropLocation: { address: drop.address, coordinates: [drop.coords[1], drop.coords[0]] },
                vehicleType: 'car',
                paymentMethod: 'cash',
                fare: fareEstimate,
                distance: parseFloat(distance.toFixed(2)),
                estimatedTime: Math.round(distance * 3) + 5
            };

            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/rides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(rideData)
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Searching for drivers...');
                navigate(`/live-ride/${data.data._id}`);
            } else {
                toast.error('Failed to request ride');
            }
        } catch (error) { toast.error('Network error'); }
        finally { setLoading(false); }
    };

    return (
        <div className="h-screen w-full overflow-hidden flex bg-[var(--bg)] cz-dm relative">
            <div className="cz-noise" />

            <Sidebar
                isOpen={sidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
                user={user}
            />

            <div className="flex-1 flex flex-col relative lg:ml-[220px] h-screen w-full z-10">
                {/* ── Dashboard Controller Head ── */}
                <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
                    <div className="flex flex-col gap-3 max-w-sm mx-auto sm:ml-0 pointer-events-auto">

                        {/* Header Panel */}
                        <div className="cz-glass rounded-2xl border border-[var(--border)] p-4 flex items-center justify-between shadow-2xl">
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate('/rider')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h1 className="cz-bebas text-2xl tracking-widest text-[var(--text)] translate-y-[1px]">BOOK RIDE</h1>
                            </div>
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl bg-white/5 text-[var(--text)]">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        </div>

                        {/* Location Control Panel */}
                        <div className="cz-glass rounded-[2rem] border border-[var(--border)] p-6 space-y-5 animate-[fadeIn_0.5s_ease-out]">
                            {step !== 'confirm' && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-3 bg-yellow-500" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">
                                            SET {activeLabel.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="relative group">
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={`TARGET ADDRESS...`}
                                            className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-xs font-bold uppercase tracking-widest text-[var(--text)] placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
                                        />
                                        {searchLoading && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent"></div>
                                            </div>
                                        )}
                                    </div>

                                    {searchResults.length > 0 && (
                                        <div className="max-h-60 overflow-y-auto rounded-2xl cz-glass border border-[var(--border)] overflow-hidden shadow-2xl">
                                            {searchResults.map((r, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSelectSearchResult(r)}
                                                    className="w-full px-5 py-4 text-left hover:bg-yellow-500/10 border-b border-white/5 transition-colors group"
                                                >
                                                    <p className="text-[10px] font-black uppercase text-[var(--text)] tracking-wider leading-relaxed group-hover:text-yellow-500">{r?.display_name}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Summary Tracker */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center mt-1">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <div className="w-[1px] h-6 bg-white/10 my-1" />
                                        <div className={`w-3 h-3 rounded-full ${step === 'pickup' ? 'bg-white/10' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-4">
                                        <div>
                                            <p className="text-[9px] font-black text-[var(--muted)] tracking-widest uppercase">PICKUP SOURCE</p>
                                            <p className={`text-[11px] font-bold uppercase truncate tracking-wide ${step === 'pickup' ? 'text-yellow-500' : 'text-[var(--text)]'}`}>{pickup.address || 'LOCATING...'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-[var(--muted)] tracking-widest uppercase">DROP DESTINATION</p>
                                            <p className={`text-[11px] font-bold uppercase truncate tracking-wide ${step === 'drop' ? 'text-yellow-500' : 'text-[var(--text)]'}`}>{drop.address || 'WAITING FOR TARGET...'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Map Surface ── */}
                <div className="flex-1 relative z-0">
                    <MapContainer center={mapCenter} zoom={15} className="h-full w-full">
                        <MapEventsHandler onMoveEnd={tapToSet ? () => { } : handleMapMove} />
                        <MapClickHandler enabled={tapToSet && step !== 'confirm'} onClick={handleMapClick} />
                        {drivers.map(driver => (
                            <DriverMarker
                                key={driver._id}
                                position={[driver.currentLocation.coordinates[1], driver.currentLocation.coordinates[0]]}
                                driverName={driver.name}
                                vehicleInfo={driver.vehicleInfo}
                            />
                        ))}
                        {step === 'confirm' && routePositions.length > 0 && (
                            <RoutePolyline positions={routePositions} />
                        )}
                    </MapContainer>

                    {/* Mission Target HUD */}
                    {step !== 'confirm' && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[999] pointer-events-none mb-8">
                            <div className="flex flex-col items-center">
                                <div className="mb-4 animate-pulse cz-glass border border-yellow-500/30 px-6 py-2 rounded-full shadow-[0_0_30px_rgba(255,208,0,0.2)]">
                                    <span className="text-[10px] cz-bebas tracking-[0.2em] text-yellow-500">
                                        {addressFetching ? 'CALIBRATING...' : `${activeLabel.toUpperCase()} LOCK`}
                                    </span>
                                </div>
                                <div className="relative">
                                    <svg className="w-14 h-14 text-yellow-500 drop-shadow-[0_0_15px_rgba(255,208,0,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <circle cx="12" cy="11" r="3" strokeWidth="2" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Bottom Trigger Section ── */}
                <div className="absolute bottom-0 left-0 right-0 z-[1000] p-6 lg:p-8">
                    <div className="max-w-md mx-auto">

                        {step === 'pickup' && (
                            <button
                                onClick={handleConfirmPickup}
                                className="w-full cz-bebas text-2xl tracking-[0.1em] py-5 bg-yellow-500 text-black rounded-[2rem] shadow-[0_20px_50px_rgba(255,208,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                CONFIRM PICKUP POINT
                            </button>
                        )}
                        {step === 'drop' && (
                            <button
                                onClick={handleConfirmDrop}
                                className="w-full cz-bebas text-2xl tracking-[0.1em] py-5 bg-yellow-500 text-black rounded-[2rem] shadow-[0_20px_50px_rgba(255,208,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                            >
                                LOCK DROP DESTINATION
                            </button>
                        )}
                        {step === 'confirm' && (
                            <div className="animate-[slideUp_0.4s_ease-out] space-y-4">
                                <div className="cz-glass rounded-[2rem] p-6 border border-yellow-500/30 flex justify-between items-center shadow-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                                            <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" /></svg>
                                        </div>
                                        <div>
                                            <p className="cz-bebas text-2xl tracking-widest text-[var(--text)]">STANDARD OPS</p>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--muted)]">SECURE TRANSPORT</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl cz-bebas text-yellow-500 drop-shadow-[0_0_10px_rgba(255,208,0,0.3)]">₹{fareEstimate}</p>
                                        <p className="text-[9px] font-black uppercase text-[var(--muted)]">TOTAL EST</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRequestRide}
                                    disabled={loading}
                                    className="w-full cz-bebas text-3xl tracking-[0.1em] py-6 bg-yellow-500 text-black rounded-[2rem] shadow-[0_25px_60px_rgba(255,208,0,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'DEPLOYING...' : 'INITIATE MISSION'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMapBooking;
