import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import MapContainer from '../Map/MapContainer';
import UserMarker from '../Map/UserMarker';
import RoutePolyline from '../Map/RoutePolyline';
import socketService from '../../services/socketService';

const AcceptRejectRide = () => {
  const [user, setUser] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]);
  const [routePositions, setRoutePositions] = useState([]);
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
    } else {
      navigate('/login');
    }

    const request = localStorage.getItem('selectedRideRequest');
    if (request) {
      const parsedRequest = JSON.parse(request);
      setRideRequest(parsedRequest);

      // Set map state
      if (parsedRequest.pickupLocation?.coordinates) {
        const [pLon, pLat] = parsedRequest.pickupLocation.coordinates;
        const [dLon, dLat] = parsedRequest.dropLocation.coordinates;
        setMapCenter([pLat, pLon]);
        setRoutePositions([[pLat, pLon], [dLat, dLon]]);
      }
    } else {
      toast.error('No ride request selected');
      navigate('/incoming-ride-request');
    }
  }, [navigate]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideRequest._id}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Ride accepted! Navigate to pickup location.');
          
          // Notify Rider via Socket
          socketService.connect();
          socketService.joinRide(rideRequest._id);
          socketService.notifyRideStatusChange(rideRequest._id, 'accepted');
          
          localStorage.removeItem('selectedRideRequest');
          localStorage.setItem('activeRide', JSON.stringify(data.data));
          navigate('/active-ride');
        }
      } else {
        toast.error('Failed to accept ride. It may have been taken by another driver.');
        navigate('/incoming-ride-request');
      }
    } catch (error) {
      console.error('Error accepting ride:', error);
      toast.error('Connection error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideRequest._id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Ride rejected');
      }
      localStorage.removeItem('selectedRideRequest');
      navigate('/incoming-ride-request');
    } catch (error) {
      console.error('Error rejecting ride:', error);
      localStorage.removeItem('selectedRideRequest');
      navigate('/incoming-ride-request');
    } finally {
      setProcessing(false);
    }
  };

  if (!user || !rideRequest) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const [pLon, pLat] = rideRequest.pickupLocation?.coordinates || [];
  const [dLon, dLat] = rideRequest.dropLocation?.coordinates || [];

  return (
    <div className="min-h-screen bg-soft-white font-sans text-navy flex flex-col">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-navy/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/incoming-ride-request')}
                className="mr-6 p-3 rounded-xl bg-navy/5 text-navy hover:bg-navy hover:text-soft-white transition-all duration-300 transform active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center group cursor-pointer" onClick={() => navigate('/driver')}>
                <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-navy/20">
                  <span className="text-soft-white font-black italic">C</span>
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Mission Briefing</h1>
                  <p className="text-[10px] font-bold text-sky-blue uppercase tracking-widest mt-0.5">Deployment Decision</p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-3 bg-navy/5 px-6 py-2.5 rounded-full border border-navy/5">
              <div className="w-2 h-2 bg-navy animate-pulse rounded-full"></div>
              <span className="text-[10px] font-black text-navy uppercase tracking-widest">Awaiting Command</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full py-8 px-4 sm:px-6 lg:px-8 flex flex-col lg:row gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          {/* Map Section */}
          <div className="lg:col-span-7 h-[400px] lg:h-full min-h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border border-navy/5 relative group">
            <div className="absolute inset-0 bg-navy/5 animate-pulse z-0"></div>
            <MapContainer center={mapCenter} zoom={14} className="h-full w-full relative z-10">
              {pLat && pLon && <UserMarker position={[pLat, pLon]} popupContent="Pickup" />}
              {dLat && dLon && <UserMarker position={[dLat, dLon]} popupContent="Drop" />}
              {routePositions.length > 0 && <RoutePolyline positions={routePositions} />}
            </MapContainer>
            <div className="absolute bottom-8 left-8 right-8 z-20">
              <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-navy/5 shadow-xl inline-flex items-center space-x-3">
                <div className="w-10 h-10 bg-sky-blue/10 rounded-xl flex items-center justify-center text-sky-blue">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 7m0 13V7" />
                  </svg>
                </div>
                <div>
                  <p className="text-[9px] font-black text-navy/30 uppercase tracking-widest">Mission Path</p>
                  <p className="text-xs font-bold text-navy uppercase">{rideRequest.distance || '0'} KM Operational Range</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-white shadow-2xl rounded-[3rem] overflow-hidden border border-navy/5 relative h-full">
              <div className="absolute top-0 left-0 w-full h-2 bg-navy"></div>

              <div className="p-10">
                <div className="flex items-center justify-between mb-10 pb-10 border-b border-navy/5">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-navy rounded-[1.8rem] flex items-center justify-center text-soft-white text-3xl font-black italic shadow-2xl border-4 border-white transform -rotate-3">
                        {rideRequest.rider.name.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-sky-blue rounded-full border-4 border-white shadow-lg z-20"></div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-1">Authenticated Client</p>
                      <h3 className="text-2xl font-black text-navy uppercase tracking-tighter mb-1">{rideRequest.rider.name}</h3>
                      <div className="flex items-center bg-soft-white px-3 py-1.5 rounded-full border border-navy/5 shadow-sm inline-flex">
                        <span className="text-yellow-500 text-sm">★</span>
                        <span className="ml-2 text-xs font-black text-navy">{rideRequest.rider.rating || '5.0'} Grade</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-navy/30 uppercase tracking-[0.3em] mb-1">Merit Bonus</p>
                    <p className="text-4xl font-black text-navy tracking-tighter">₹{rideRequest.fare}</p>
                  </div>
                </div>

                <div className="space-y-10 mb-12">
                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full mt-2 shadow-lg shadow-green-100 ring-4 ring-green-100/50"></div>
                    <div className="ml-8 border-l border-dashed border-navy/10 pl-8 relative">
                      <div className="absolute top-0 -left-[1.5px] w-1 h-20 bg-gradient-to-b from-green-500/20 to-transparent"></div>
                      <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.3em] mb-2">Primary Activation (Pickup)</p>
                      <p className="text-lg font-bold text-navy leading-relaxed">{rideRequest.pickupLocation?.address || 'Designated Area'}</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full mt-2 shadow-lg shadow-red-100 ring-4 ring-red-100/50"></div>
                    <div className="ml-8 border-l border-dashed border-navy/10 pl-8 relative">
                      <p className="text-[9px] font-black text-navy/30 uppercase tracking-[0.3em] mb-2">Final Termination (Drop)</p>
                      <p className="text-lg font-bold text-navy leading-relaxed">{rideRequest.dropLocation?.address || 'Deployment Target'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-auto">
                  <button
                    onClick={handleReject}
                    disabled={processing}
                    className="bg-soft-white border border-navy/10 text-navy/40 py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all transform active:scale-[0.98] disabled:opacity-50"
                  >
                    Abort Mission
                  </button>
                  <button
                    onClick={handleAccept}
                    disabled={processing}
                    className="bg-navy text-soft-white py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-sky-blue shadow-2xl shadow-navy/20 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center group"
                  >
                    {processing ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deploying...
                      </span>
                    ) : (
                      <>
                        Accept Mission
                        <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AcceptRejectRide;
