import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AvailableRidesList = () => {
  const [user, setUser] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
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

    fetchAvailableDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchAvailableDrivers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/drivers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDrivers(data.data || []);
        } else {
          setDrivers([]);
          toast.error(data.message || 'Failed to fetch drivers');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch drivers:', errorData);
        setDrivers([]);
        if (response.status === 401) {
          toast.error('Session expired. Please login again.');
          navigate('/login');
        } else {
          toast.error(errorData.message || 'Could not fetch drivers');
        }
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setDrivers([]);
      toast.error('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDriver = (driver) => {
    localStorage.setItem('selectedDriver', JSON.stringify(driver));
    navigate('/ride-confirmation');
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/fare-estimate')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Available Rides</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Finding available drivers...</p>
          </div>
        ) : drivers.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No drivers available</h3>
            <p className="mt-2 text-sm text-gray-500">Please try again in a few moments.</p>
            <button
              onClick={fetchAvailableDrivers}
              className="mt-6 bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Select a Driver</h2>
              <p className="text-sm text-gray-600">{drivers.length} driver{drivers.length !== 1 ? 's' : ''} available nearby</p>
            </div>

            {drivers.map((driver) => (
              <div
                key={driver._id}
                onClick={() => handleSelectDriver(driver)}
                className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {driver.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{driver.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1 text-sm font-medium text-gray-700">{driver.rating}</span>
                        <span className="ml-2 text-sm text-gray-500">({driver.totalRides} rides)</span>
                      </div>
                      {driver.vehicleInfo && (
                        <p className="text-sm text-gray-600 mt-1">
                          {driver.vehicleInfo.make} {driver.vehicleInfo.model} • {driver.vehicleInfo.vehicleType}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {driver.distance && (
                      <p className="text-sm text-gray-600">{driver.distance} away</p>
                    )}
                    {driver.eta && (
                      <p className="text-sm font-medium text-gray-900 mt-1">{driver.eta}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <button className="w-full bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
                    Select Driver
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AvailableRidesList;
