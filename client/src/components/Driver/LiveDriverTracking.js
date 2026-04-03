import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapContainer from '../Map/MapContainer';
import UserMarker from '../Map/UserMarker';
import DriverMarker from '../Map/DriverMarker';
import RoutePolyline from '../Map/RoutePolyline';
import socketService from '../../services/socketService';

const LiveDriverTracking = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [ride, setRide] = useState(null);
    const [loading, setLoading] = useState(true);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [locationSharing, setLocationSharing] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
    const [routePositions, setRoutePositions] = useState([]);

    const locationIntervalRef = useRef(null);

    // Fetch active ride
    const fetchActiveRide = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/rides/my-rides', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const activeRide = data.data.find(r =>
                    ['accepted', 'started', 'picked-up'].includes(r.status)
                );

                if (activeRide) {
                    setRide(activeRide);

                    // Set map center
                    if (activeRide.pickupLocation?.coordinates) {
                        const [lon, lat] = activeRide.pickupLocation.coordinates;
                        setMapCenter([lat, lon]);
                    }
                } else {
                    toast.error('No active ride found');
                    navigate('/driver');
                }
            }
        } catch (error) {
            console.error('Error fetching ride:', error);
            toast.error('Failed to load ride details');
        } finally {
            setLoading(false);
        }
    }, [navigate]);



    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            if (parsed.role !== 'driver') {
                navigate('/login');
                return;
            }
            setUser(parsed);
        } else {
            navigate('/login');
            return;
        }

        fetchActiveRide();

        // Connect to socket
        socketService.connect();

        return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
            socketService.removeAllListeners();
        };
    }, [navigate, fetchActiveRide]);

    useEffect(() => {
        if (ride) {
            socketService.joinRide(ride._id);
        }
    }, [ride]);

    // Real location tracking with Geolocation API
    useEffect(() => {
        if (locationSharing && ride) {
            if (!navigator.geolocation) {
                toast.error('Geolocation is not supported by your browser');
                setLocationSharing(false);
                return;
            }

            const success = (position) => {
                const { latitude, longitude } = position.coords;

                setCurrentLocation({
                    lat: latitude,
                    lon: longitude
                });

                // Update via socket
                socketService.updateDriverLocation(ride._id, latitude, longitude);

                // Update via API (optional: you might want to throttle this if it's too frequent)
                const token = localStorage.getItem('token');
                fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${ride._id}/location`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ latitude, longitude })
                }).catch(err => console.error('Location update error:', err));
            };

            const error = (err) => {
                console.warn(`ERROR(${err.code}): ${err.message}`);
                // Don't stop sharing immediately on minor errors, but notify
                if (err.code === 1) {
                    toast.error('Location permission denied');
                    setLocationSharing(false);
                }
            };

            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };

            locationIntervalRef.current = navigator.geolocation.watchPosition(success, error, options);
            toast.success('Location sharing active');

        } else {
            if (locationIntervalRef.current !== null) {
                navigator.geolocation.clearWatch(locationIntervalRef.current);
                locationIntervalRef.current = null;
            }
        }

        return () => {
            if (locationIntervalRef.current !== null) {
                navigator.geolocation.clearWatch(locationIntervalRef.current);
                locationIntervalRef.current = null;
            }
        };
    }, [locationSharing, ride]);

    // Update route
    useEffect(() => {
        if (!ride) return;

        const positions = [];
        const [pLon, pLat] = ride.pickupLocation?.coordinates || [];
        const [dLon, dLat] = ride.dropLocation?.coordinates || [];

        if (currentLocation) {
            positions.push([currentLocation.lat, currentLocation.lon]);
        }

        if (ride.status === 'accepted' || ride.status === 'started') {
            if (pLat && pLon) positions.push([pLat, pLon]);
        } else if (ride.status === 'picked-up') {
            if (dLat && dLon) positions.push([dLat, dLon]);
        }

        setRoutePositions(positions);
    }, [ride, currentLocation]);

    const handleVerifyOTP = async () => {
        if (otp.length !== 4) {
            toast.error('Please enter 4-digit OTP');
            return;
        }

        setVerifying(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${ride._id}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ otp })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('OTP verified successfully!');
                setRide(prev => ({ ...prev, otpVerified: true }));
                socketService.notifyOTPVerified(ride._id);
            } else {
                toast.error(data.message || 'Invalid OTP');
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            toast.error('Failed to verify OTP');
        } finally {
            setVerifying(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${ride._id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                const data = await response.json();
                setRide(data.data);
                socketService.notifyRideStatusChange(ride._id, newStatus);
                toast.success(`Ride ${newStatus}`);

                if (newStatus === 'completed') {
                    navigate('/driver');
                }
            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Status update error:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!ride) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">No active ride</div>
            </div>
        );
    }

    const [pLon, pLat] = ride.pickupLocation?.coordinates || [];
    const [dLon, dLat] = ride.dropLocation?.coordinates || [];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-black text-white shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-bold">Active Ride</h1>
                        <button
                            onClick={() => navigate('/driver')}
                            className="text-sm hover:text-gray-300"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">
                {/* Map */}
                <div className="w-full md:w-3/5 h-96 md:h-auto min-h-[400px] rounded-lg overflow-hidden shadow-md">
                    <MapContainer center={mapCenter} zoom={14} className="h-full w-full">
                        {pLat && pLon && <UserMarker position={[pLat, pLon]} popupContent="Pickup" />}
                        {dLat && dLon && <UserMarker position={[dLat, dLon]} popupContent="Drop" />}
                        {currentLocation && (
                            <DriverMarker
                                position={[currentLocation.lat, currentLocation.lon]}
                                driverName="You"
                                vehicleInfo={user?.vehicleInfo}
                            />
                        )}
                        {routePositions.length > 0 && <RoutePolyline positions={routePositions} />}
                    </MapContainer>
                </div>

                {/* Controls */}
                <div className="w-full md:w-2/5 space-y-4">
                    {/* OTP Verification */}
                    {!ride.otpVerified && (
                        <div className="bg-white rounded-lg p-4 shadow">
                            <h3 className="font-medium text-gray-900 mb-3">Verify Pickup OTP</h3>
                            <p className="text-sm text-gray-600 mb-4">Ask the rider for their 4-digit verification code</p>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    maxLength="4"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter OTP"
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-bold"
                                />
                                <button
                                    onClick={handleVerifyOTP}
                                    disabled={verifying || otp.length !== 4}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {verifying ? 'Verifying...' : 'Verify'}
                                </button>
                            </div>
                        </div>
                    )}

                    {ride.otpVerified && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                            <p className="text-green-700 font-medium">✓ OTP Verified</p>
                        </div>
                    )}

                    {/* Location Sharing */}
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h3 className="font-medium text-gray-900 mb-3">Location Sharing</h3>
                        <button
                            onClick={() => setLocationSharing(!locationSharing)}
                            className={`w-full px-4 py-3 rounded-lg font-medium ${locationSharing
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                        >
                            {locationSharing ? '📍 Stop Sharing Location' : '📍 Start Sharing Location'}
                        </button>
                        {locationSharing && (
                            <p className="text-xs text-gray-500 mt-2 text-center">Location updates every 5 seconds</p>
                        )}
                    </div>

                    {/* Rider Info */}
                    {ride.rider && (
                        <div className="bg-white rounded-lg p-4 shadow">
                            <h3 className="text-sm font-medium text-gray-500 mb-3">Rider Details</h3>
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                                    {ride.rider.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{ride.rider.name}</p>
                                    <p className="text-sm text-gray-500">{ride.rider.phone}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trip Info */}
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Trip Details</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Status</span>
                                <span className="font-medium capitalize">{ride.status.replace('-', ' ')}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Fare</span>
                                <span className="font-medium">₹{ride.fare}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Controls */}
                    <div className="bg-white rounded-lg p-4 shadow space-y-2">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Update Status</h3>

                        {ride.status === 'accepted' && ride.otpVerified && (
                            <button
                                onClick={() => handleStatusChange('started')}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Start Ride
                            </button>
                        )}

                        {ride.status === 'started' && (
                            <button
                                onClick={() => handleStatusChange('picked-up')}
                                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                            >
                                Passenger Picked Up
                            </button>
                        )}

                        {ride.status === 'picked-up' && (
                            <button
                                onClick={() => handleStatusChange('completed')}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            >
                                Complete Ride
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveDriverTracking;
