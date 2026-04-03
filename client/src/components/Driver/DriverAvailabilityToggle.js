import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DriverAvailabilityToggle = () => {
  const [user, setUser] = useState(null);
  const [driverStatus, setDriverStatus] = useState('offline');
  const [updating, setUpdating] = useState(false);
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
      setDriverStatus(parsedUser.driverStatus || 'offline');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setDriverStatus(newStatus);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ driverStatus: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.data));
        toast.success(newStatus === 'online' ? 'You are now online!' : 'You are now offline');
      } else {
        toast.error(data.message || 'Failed to update status');
        setDriverStatus(user.driverStatus || 'offline');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Network error');
      setDriverStatus(user.driverStatus || 'offline');
    } finally {
      setUpdating(false);
    }
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
                onClick={() => navigate('/driver')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Availability Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Driver Availability</h2>
          
          <div className="space-y-6">
            <div className="border-2 border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Current Status</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {driverStatus === 'online' 
                      ? 'You are currently online and can receive ride requests'
                      : driverStatus === 'busy'
                      ? 'You are marked as busy and will not receive new requests'
                      : 'You are offline and will not receive ride requests'}
                  </p>
                </div>
                <div className={`w-4 h-4 rounded-full ${
                  driverStatus === 'online' ? 'bg-green-500' :
                  driverStatus === 'busy' ? 'bg-yellow-500' :
                  'bg-gray-400'
                }`}></div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  driverStatus === 'online' ? 'bg-green-100 text-green-800' :
                  driverStatus === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {driverStatus.charAt(0).toUpperCase() + driverStatus.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleStatusChange('online')}
                disabled={driverStatus === 'online' || updating}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  driverStatus === 'online'
                    ? 'bg-green-50 border-2 border-green-500'
                    : 'bg-white border-2 border-gray-200 hover:border-green-300'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Go Online</p>
                      <p className="text-sm text-gray-500">Start accepting ride requests</p>
                    </div>
                  </div>
                  {driverStatus === 'online' && (
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleStatusChange('busy')}
                disabled={driverStatus === 'busy' || updating}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  driverStatus === 'busy'
                    ? 'bg-yellow-50 border-2 border-yellow-500'
                    : 'bg-white border-2 border-gray-200 hover:border-yellow-300'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Mark as Busy</p>
                      <p className="text-sm text-gray-500">Temporarily stop receiving requests</p>
                    </div>
                  </div>
                  {driverStatus === 'busy' && (
                    <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleStatusChange('offline')}
                disabled={driverStatus === 'offline' || updating}
                className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                  driverStatus === 'offline'
                    ? 'bg-gray-50 border-2 border-gray-500'
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Go Offline</p>
                      <p className="text-sm text-gray-500">Stop accepting all ride requests</p>
                    </div>
                  </div>
                  {driverStatus === 'offline' && (
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            </div>

            {updating && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Updating status...</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverAvailabilityToggle;
