import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapContainer from '../Map/MapContainer';
import UserMarker from '../Map/UserMarker';
import RoutePolyline from '../Map/RoutePolyline';

const RideRequestForm = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    dropLocation: '',
    vehicleType: 'car',
    paymentMethod: 'cash',
    specialInstructions: ''
  });
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]); // Default New Delhi
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
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

      const pickup = localStorage.getItem('pickupLocation');
      const drop = localStorage.getItem('dropLocation');

      let pCoords = null;
      let dCoords = null;

      if (pickup) {
        const pickupData = JSON.parse(pickup);
        setFormData(prev => ({ ...prev, pickupLocation: pickupData.address }));
        pCoords = [parseFloat(pickupData.lat), parseFloat(pickupData.lon)];
        setPickupCoords(pCoords);
        setMapCenter(pCoords);
      }
      if (drop) {
        const dropData = JSON.parse(drop);
        setFormData(prev => ({ ...prev, dropLocation: dropData.address }));
        dCoords = [parseFloat(dropData.lat), parseFloat(dropData.lon)];
        setDropCoords(dCoords);
      }

      if (pCoords && dCoords) {
        setRoutePositions([pCoords, dCoords]);
        // Center map between points could be calculated here, currently just using pickup or default
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pickupLocation || !formData.dropLocation) {
      toast.error('Please set pickup and drop locations');
      navigate('/pickup-location');
      return;
    }

    try {
      const pickup = JSON.parse(localStorage.getItem('pickupLocation'));
      const drop = JSON.parse(localStorage.getItem('dropLocation'));

      const rideData = {
        pickupLocation: {
          address: formData.pickupLocation,
          coordinates: [parseFloat(pickup.lon), parseFloat(pickup.lat)]
        },
        dropLocation: {
          address: formData.dropLocation,
          coordinates: [parseFloat(drop.lon), parseFloat(drop.lat)]
        },
        vehicleType: formData.vehicleType,
        paymentMethod: formData.paymentMethod,
        specialInstructions: formData.specialInstructions
      };

      localStorage.setItem('rideRequest', JSON.stringify(rideData));
      toast.success('Ride request prepared!');
      navigate('/available-rides');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to prepare ride request');
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/rider')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Book a Ride</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-6">

        {/* Map Section - Mobile: Order 1 (Top), Desktop: Order 2 (Right) */}
        <div className="w-full md:w-1/2 order-1 md:order-2 h-64 md:h-auto min-h-[300px] rounded-lg overflow-hidden shadow-md">
          <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
            {pickupCoords && <UserMarker position={pickupCoords} popupContent="Pickup Location" />}
            {dropCoords && <UserMarker position={dropCoords} popupContent="Drop Location" />}
            {routePositions.length > 0 && <RoutePolyline positions={routePositions} />}
          </MapContainer>
        </div>

        {/* Form Section - Mobile: Order 2, Desktop: Order 1 */}
        <div className="w-full md:w-1/2 order-2 md:order-1 bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Request a Ride</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                onClick={() => navigate('/pickup-location')}
                readOnly
                className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => navigate('/pickup-location')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Change pickup location
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drop Location
              </label>
              <input
                type="text"
                name="dropLocation"
                value={formData.dropLocation}
                onChange={handleChange}
                onClick={() => navigate('/drop-location')}
                readOnly
                className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => navigate('/drop-location')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Change drop location
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              >
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions (Optional)
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                rows="3"
                placeholder="Any special instructions for the driver..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-black focus:border-black"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/rider')}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
              >
                Find Rides
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RideRequestForm;
