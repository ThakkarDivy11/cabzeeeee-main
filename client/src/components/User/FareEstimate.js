import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const FareEstimate = () => {
  const [user, setUser] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [vehicleType, setVehicleType] = useState('car');
  const [fareEstimate, setFareEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const vehicleTypes = [
    { id: 'car', name: 'Car', icon: '🚗', baseFare: 50, perKm: 8 },
    { id: 'bike', name: 'Bike', icon: '🏍️', baseFare: 30, perKm: 5 },
    { id: 'auto', name: 'Auto', icon: '🛺', baseFare: 40, perKm: 6 }
  ];

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

    const pickup = localStorage.getItem('pickupLocation');
    const drop = localStorage.getItem('dropLocation');
    
    if (pickup) setPickupLocation(JSON.parse(pickup));
    if (drop) setDropLocation(JSON.parse(drop));

    if (!pickup || !drop) {
      toast.error('Please set pickup and drop locations first');
      navigate('/pickup-location');
    }
  }, [navigate]);

  useEffect(() => {
    if (pickupLocation && dropLocation) {
      calculateFare();
    }
  }, [pickupLocation, dropLocation, vehicleType]);

  const calculateFare = async () => {
    if (!pickupLocation || !dropLocation) return;

    setLoading(true);
    try {
      const distance = await calculateDistance(
        pickupLocation.lat,
        pickupLocation.lon,
        dropLocation.lat,
        dropLocation.lon
      );

      const selectedVehicle = vehicleTypes.find(v => v.id === vehicleType);
      const baseFare = selectedVehicle.baseFare;
      const perKm = selectedVehicle.perKm;
      const distanceKm = distance / 1000;
      const fare = baseFare + (distanceKm * perKm);
      const estimatedTime = Math.round(distanceKm * 2);

      setFareEstimate({
        distance: distanceKm.toFixed(2),
        fare: Math.round(fare),
        estimatedTime,
        vehicleType: selectedVehicle.name
      });
    } catch (error) {
      console.error('Fare calculation error:', error);
      toast.error('Failed to calculate fare');
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = async (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleBookRide = () => {
    if (!fareEstimate) {
      toast.error('Please wait for fare calculation');
      return;
    }
    navigate('/available-rides');
  };

  if (!user || !pickupLocation || !dropLocation) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/drop-location')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Fare Estimate</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">Pickup</p>
                  <p className="text-sm text-gray-600">{pickupLocation.address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">Drop</p>
                  <p className="text-sm text-gray-600">{dropLocation.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Vehicle Type</h3>
            <div className="grid grid-cols-3 gap-4">
              {vehicleTypes.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setVehicleType(vehicle.id)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    vehicleType === vehicle.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{vehicle.icon}</div>
                  <div className="font-medium">{vehicle.name}</div>
                  <div className="text-xs mt-1">₹{vehicle.baseFare} base</div>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="mt-4 text-gray-600">Calculating fare...</p>
            </div>
          ) : fareEstimate ? (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Fare Estimate</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-medium">{fareEstimate.distance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Time</span>
                  <span className="font-medium">{fareEstimate.estimatedTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle Type</span>
                  <span className="font-medium">{fareEstimate.vehicleType}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">Estimated Fare</span>
                    <span className="text-2xl font-bold text-black">₹{fareEstimate.fare}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">*Final fare may vary based on traffic</p>
                </div>
              </div>
            </div>
          ) : null}

          <button
            onClick={handleBookRide}
            disabled={!fareEstimate || loading}
            className="w-full bg-black text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Find Available Rides
          </button>
        </div>
      </main>
    </div>
  );
};

export default FareEstimate;
