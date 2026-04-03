import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapContainer from '../Map/MapContainer';
import UserMarker from '../Map/UserMarker';
import DriverMarker from '../Map/DriverMarker';
import RoutePolyline from '../Map/RoutePolyline';

const RideConfirmation = () => {
  const [user, setUser] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rideDetails, setRideDetails] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Map state
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [driverCoords, setDriverCoords] = useState(null);
  const [routePositions, setRoutePositions] = useState([]);

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

    const driver = localStorage.getItem('selectedDriver');
    const pickup = localStorage.getItem('pickupLocation');
    const drop = localStorage.getItem('dropLocation');
    const fareEstimate = localStorage.getItem('fareEstimate');

    if (!driver || !pickup || !drop) {
      toast.error('Missing ride information');
      navigate('/ride-request');
      return;
    }

    const parsedDriver = JSON.parse(driver);
    const parsedPickup = JSON.parse(pickup);
    const parsedDrop = JSON.parse(drop);

    setSelectedDriver(parsedDriver);
    setRideDetails({
      pickup: parsedPickup,
      drop: parsedDrop,
      fare: fareEstimate ? JSON.parse(fareEstimate) : { fare: 150, distance: '5.0', estimatedTime: 15 }
    });

    // Set map coordinates
    const pCoords = [parseFloat(parsedPickup.lat), parseFloat(parsedPickup.lon)];
    const dCoords = [parseFloat(parsedDrop.lat), parseFloat(parsedDrop.lon)];

    setPickupCoords(pCoords);
    setDropCoords(dCoords);
    setRoutePositions([pCoords, dCoords]);

    // Mock driver location (slightly offset from pickup for demo)
    // In a real app, this would come from the driver object or websocket
    const mockDriverCoords = [
      pCoords[0] + 0.002,
      pCoords[1] + 0.002
    ];
    setDriverCoords(mockDriverCoords);

    // Center map on pickup
    setMapCenter(pCoords);

  }, [navigate]);

  const handleConfirmRide = async () => {
    setConfirming(true);
    try {
      const token = localStorage.getItem('token');
      const rideRequest = localStorage.getItem('rideRequest');
      let rideData;

      if (rideRequest) {
        const savedRide = JSON.parse(rideRequest);
        rideData = {
          pickupLocation: {
            address: savedRide.pickupLocation.address || rideDetails.pickup.address,
            coordinates: savedRide.pickupLocation.coordinates || [parseFloat(rideDetails.pickup.lon), parseFloat(rideDetails.pickup.lat)]
          },
          dropLocation: {
            address: savedRide.dropLocation.address || rideDetails.drop.address,
            coordinates: savedRide.dropLocation.coordinates || [parseFloat(rideDetails.drop.lon), parseFloat(rideDetails.drop.lat)]
          },
          fare: rideDetails.fare.fare,
          distance: parseFloat(rideDetails.fare.distance) || 0,
          estimatedTime: rideDetails.fare.estimatedTime || 0,
          vehicleType: savedRide.vehicleType || 'car',
          paymentMethod: savedRide.paymentMethod || 'cash',
          specialInstructions: savedRide.specialInstructions || ''
        };
      } else {
        rideData = {
          pickupLocation: {
            address: rideDetails.pickup.address,
            coordinates: [parseFloat(rideDetails.pickup.lon), parseFloat(rideDetails.pickup.lat)]
          },
          dropLocation: {
            address: rideDetails.drop.address,
            coordinates: [parseFloat(rideDetails.drop.lon), parseFloat(rideDetails.drop.lat)]
          },
          fare: rideDetails.fare.fare,
          distance: parseFloat(rideDetails.fare.distance) || 0,
          estimatedTime: rideDetails.fare.estimatedTime || 0,
          vehicleType: 'car',
          paymentMethod: 'cash'
        };
      }

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
        toast.success('Ride request created! Redirecting to live tracking...');
        localStorage.removeItem('selectedDriver');
        localStorage.removeItem('pickupLocation');
        localStorage.removeItem('dropLocation');
        localStorage.removeItem('fareEstimate');
        localStorage.removeItem('rideRequest');

        // Navigate to live tracking page
        navigate(`/live-ride/${data.data._id}`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Ride creation failed:', errorData);
        toast.error(errorData.message || 'Failed to create ride request');
      }
    } catch (error) {
      console.error('Error confirming ride:', error);
      toast.error('Failed to create ride request. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  if (!user || !selectedDriver || !rideDetails) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/available-rides')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Confirm Ride</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">

        {/* Map Section */}
        <div className="w-full md:w-1/2 order-1 md:order-2 h-64 md:h-auto min-h-[300px] rounded-lg overflow-hidden shadow-md">
          <MapContainer center={mapCenter} zoom={14} className="h-full w-full">
            {pickupCoords && <UserMarker position={pickupCoords} popupContent="Pickup Point" />}
            {dropCoords && <UserMarker position={dropCoords} popupContent="Drop Point" />}
            {driverCoords && <DriverMarker position={driverCoords} driverName={selectedDriver.name} vehicleInfo={selectedDriver.vehicleInfo} />}
            {routePositions.length > 0 && <RoutePolyline positions={routePositions} />}
          </MapContainer>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 order-2 md:order-1 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Driver Details</h2>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {selectedDriver.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{selectedDriver.name}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="ml-1 text-sm font-medium text-gray-700">{selectedDriver.rating}</span>
                  <span className="ml-2 text-sm text-gray-500">({selectedDriver.totalRides} rides)</span>
                </div>
                {selectedDriver.vehicleInfo && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedDriver.vehicleInfo.make} {selectedDriver.vehicleInfo.model}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Details</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">Pickup</p>
                  <p className="text-sm text-gray-600">{rideDetails.pickup.address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">Drop</p>
                  <p className="text-sm text-gray-600">{rideDetails.drop.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Fare Breakdown</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Distance</span>
                <span className="font-medium">{rideDetails.fare.distance} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Time</span>
                <span className="font-medium">{rideDetails.fare.estimatedTime} min</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total Fare</span>
                  <span className="text-2xl font-bold text-black">₹{rideDetails.fare.fare}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">*Final fare may vary based on traffic</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/available-rides')}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-md text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRide}
              disabled={confirming}
              className="flex-1 bg-black text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {confirming ? 'Confirming...' : 'Confirm Ride'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RideConfirmation;
