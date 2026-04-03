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

    // Fetch address from coordinates
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

    // Fetch nearby drivers
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

    // Initial load: get current location
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    // Keep the search box aligned to the current step
    useEffect(() => {
        if (step === 'pickup') setSearchQuery(pickup.address || '');
        if (step === 'drop') setSearchQuery(drop.address || '');
        if (step === 'confirm') setSearchQuery('');
        setSearchResults([]);
        setSearchLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    const debouncedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

    // Address search (manual typing)
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
        localStorage.setItem('pickupLocation', JSON.stringify({
            address: pickup.address,
            lat: pickup.coords[0],
            lon: pickup.coords[1]
        }));
    };

    // Calculate distance in km
    const calculateDistance = (coord1, coord2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(coord2[0] - coord1[0]);
        const dLon = deg2rad(coord2[1] - coord1[1]);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(coord1[0])) * Math.cos(deg2rad(coord2[0])) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    const handleConfirmDrop = () => {
        if (!drop.address) {
            toast.error('Please select a drop location');
            return;
        }
        setStep('confirm');
        localStorage.setItem('dropLocation', JSON.stringify({
            address: drop.address,
            lat: drop.coords[0],
            lon: drop.coords[1]
        }));

        // Calculate route positions
        setRoutePositions([pickup.coords, drop.coords]);

        // Calculate fare based on distance
        const distance = calculateDistance(pickup.coords, drop.coords);
        const baseFare = 50;
        const ratePerKm = 12;
        const estimatedFare = Math.round(baseFare + (distance * ratePerKm));
        setFareEstimate(estimatedFare);
    };

    const handleRequestRide = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const distance = calculateDistance(pickup.coords, drop.coords); // Recalculate for payload

            const rideData = {
                pickupLocation: {
                    address: pickup.address,
                    coordinates: [pickup.coords[1], pickup.coords[0]]
                },
                dropLocation: {
                    address: drop.address,
                    coordinates: [drop.coords[1], drop.coords[0]]
                },
                vehicleType: 'car',
                paymentMethod: 'cash',
                fare: fareEstimate,
                distance: parseFloat(distance.toFixed(2)),
                estimatedTime: Math.round(distance * 3) + 5 // Rough estimate: 3 mins per km + 5 mins base
            };

            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/rides', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(rideData)
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Searching for nearby drivers...');
                localStorage.removeItem('pickupLocation');
                localStorage.removeItem('dropLocation');
                localStorage.removeItem('rideRequest');
                navigate(`/live-ride/${data.data._id}`);
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Failed to request ride');
            }
        } catch (error) {
            console.error('Error requesting ride:', error);
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full overflow-hidden flex bg-[#020617]">
            <Sidebar
                isOpen={sidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
                user={user}
            />

            <div className="flex-1 flex flex-col relative lg:ml-[220px] h-screen w-full">
                {/* Header */}
                <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none">
                    <div className="flex flex-col gap-2 max-w-md mx-auto">
                        <div className="pointer-events-auto flex items-center justify-between rounded-2xl border border-purple-300/30 bg-[#0ea5e9] p-4 text-white shadow-2xl shadow-purple-500/25">
                            <div className="flex items-center">
                                <button onClick={() => navigate('/rider')} className="mr-2 p-2 text-purple-200/80 transition-colors hover:text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h1 className="whitespace-nowrap text-lg font-bold text-white">Book your ride</h1>
                            </div>
                            <button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-purple-300/25 bg-white/10 p-2 text-purple-100 shadow-sm transition-all duration-300 active:scale-95 hover:bg-purple-400/20 hover:text-white lg:hidden">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>

                    <div className="pointer-events-auto space-y-4 rounded-2xl border border-purple-300/30 bg-[#0891b2] p-6 text-white shadow-2xl shadow-purple-500/30">
                        {/* Manual input */}
                        {step !== 'confirm' && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-100/60">
                                    {step === 'pickup' ? 'Set pickup manually' : 'Set drop-off manually'}
                                </p>
                                <div className="relative">
                                    <input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={`Type ${activeLabel.toLowerCase()} address`}
                                        className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40"
                                    />
                                    {searchLoading && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-purple-300"></div>
                                        </div>
                                    )}
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="max-h-56 overflow-auto rounded-xl border border-purple-300/20 bg-[#160d28] shadow-lg shadow-purple-500/20">
                                        {searchResults.map((r, idx) => (
                                            <button
                                                key={`${r?.place_id || idx}`}
                                                onClick={() => handleSelectSearchResult(r)}
                                                className="w-full border-b border-white/5 px-4 py-3 text-left hover:bg-purple-400/15 last:border-b-0"
                                            >
                                                <p className="line-clamp-2 text-sm font-semibold" style={{color: '#FFFFFF'}}>{r?.display_name}</p>
                                                <p className="mt-1 text-[11px] font-bold tracking-wide" style={{color: '#CCCCCC'}}>
                                                    Tap to use this location
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-1">
                                    <p className="text-[11px] font-semibold text-purple-100/60">
                                        {tapToSet ? 'Tap map to set location' : 'Move map to set (center pin)'}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setTapToSet(v => !v)}
                                        className="text-xs font-bold uppercase tracking-wide text-purple-300 hover:text-white"
                                    >
                                        {tapToSet ? 'Use move' : 'Use tap'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-4">
                            <div className="h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20"></div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-100/60">Pickup</p>
                                <p className={`truncate text-sm ${step === 'pickup' ? 'font-bold text-white' : 'font-medium text-purple-100/70'}`}>
                                    {pickup.address || 'Locating...'}
                                </p>
                            </div>
                            {step !== 'pickup' && (
                                <button onClick={() => setStep('pickup')} className="text-xs font-bold uppercase tracking-wide text-purple-300 hover:text-white">Edit</button>
                            )}
                        </div>

                        {(step === 'drop' || step === 'confirm') && (
                            <div className="flex items-center space-x-4 border-t border-white/10 pt-4">
                                <div className="h-3 w-3 rounded-full bg-rose-400 ring-4 ring-rose-500/20"></div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-purple-100/60">Drop-off</p>
                                    <p className={`truncate text-sm ${step === 'drop' ? 'font-bold text-white' : 'font-medium text-purple-100/70'}`}>
                                        {drop.address || 'Select destination on map'}
                                    </p>
                                </div>
                                {step === 'confirm' && (
                                    <button onClick={() => setStep('drop')} className="text-xs font-bold uppercase tracking-wide text-purple-300 hover:text-white">Edit</button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 relative">
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

                {/* Center Target Pin */}
                {step !== 'confirm' && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full z-[999] pointer-events-none mb-6">
                        <div className="flex flex-col items-center">
                            <div className="mb-3 animate-bounce rounded-full border border-purple-400/30 bg-[#0b1120]/92 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-100 shadow-2xl shadow-purple-500/20 backdrop-blur-md">
                                {addressFetching
                                    ? 'Finding address...'
                                    : tapToSet
                                        ? (step === 'pickup' ? 'Tap to set pickup' : 'Tap to set drop-off')
                                        : (step === 'pickup' ? 'Move to set pickup' : 'Move to set drop-off')}
                            </div>
                            <svg className="w-12 h-12 text-purple-400 drop-shadow-2xl" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="z-[1000] rounded-t-[3rem] border-t border-white/10 bg-[#0b1120]/92 p-8 shadow-[0_-20px_50px_-12px_rgba(14,165,233,0.28)] backdrop-blur-xl">
                {step === 'pickup' && (
                    <button
                        onClick={handleConfirmPickup}
                        className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 py-4 text-lg font-black text-white shadow-xl shadow-purple-500/20 transition-all hover:from-purple-400 hover:to-indigo-400 active:scale-[0.98]"
                    >
                        Confirm Pickup
                    </button>
                )}
                {step === 'drop' && (
                    <button
                        onClick={handleConfirmDrop}
                        className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 py-4 text-lg font-black text-white shadow-xl shadow-purple-500/20 transition-all hover:from-purple-400 hover:to-indigo-400 active:scale-[0.98]"
                    >
                        Confirm Destination
                    </button>
                )}
                {step === 'confirm' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center py-5 border border-navy/5 rounded-2xl px-6 bg-soft-white shadow-inner">
                            <div className="flex items-center space-x-5">
                                <div className="p-3.5 bg-white rounded-xl shadow-md border border-navy/5">
                                    <span className="text-3xl">🚗</span>
                                </div>
                                <div>
                                    <p className="font-black text-navy text-lg">Standard Car</p>
                                    <p className="text-xs text-navy/40 font-bold uppercase tracking-wider">Fast & Reliable</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-navy tracking-tight">₹{fareEstimate}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRequestRide}
                            disabled={loading}
                            className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 py-4 text-lg font-black text-white shadow-2xl shadow-purple-500/30 transition-all hover:from-purple-400 hover:to-indigo-400 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Request Ride'}
                        </button>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default LiveMapBooking;
