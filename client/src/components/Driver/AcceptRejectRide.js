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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Ride accepted!');
          socketService.connect();
          socketService.joinRide(rideRequest._id);
          socketService.notifyRideStatusChange(rideRequest._id, 'accepted');
          localStorage.removeItem('selectedRideRequest');
          localStorage.setItem('activeRide', JSON.stringify(data.data));
          navigate('/active-ride');
        }
      } else {
        toast.error('Failed to accept ride.');
        navigate('/incoming-ride-request');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/rides/${rideRequest._id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      toast.success('Ride rejected');
      localStorage.removeItem('selectedRideRequest');
      navigate('/incoming-ride-request');
    } catch (error) {
      localStorage.removeItem('selectedRideRequest');
      navigate('/incoming-ride-request');
    } finally {
      setProcessing(false);
    }
  };

  if (!user || !rideRequest) return <div className="p-20 text-center font-bold text-gray-500">Loading details...</div>;

  const [pLon, pLat] = rideRequest.pickupLocation?.coordinates || [];
  const [dLon, dLat] = rideRequest.dropLocation?.coordinates || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 h-[calc(100vh-100px)] flex flex-col">
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => navigate('/incoming-ride-request')}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Ride Overview</h2>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FFD000]">Acceptance Protocol Active</p>
                </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 rounded-full bg-emerald-500/10 px-6 py-2 border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live request</span>
            </div>
        </header>

        <div className="grid flex-1 grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
            {/* Map Container */}
            <div className="lg:col-span-7 h-[400px] lg:h-full rounded-[3rem] overflow-hidden border border-gray-200 shadow-xl dark:border-white/5 relative group">
                <MapContainer center={mapCenter} zoom={14} className="h-full w-full">
                  {pLat && pLon && <UserMarker position={[pLat, pLon]} popupContent="Pickup" />}
                  {dLat && dLon && <UserMarker position={[dLat, dLon]} popupContent="Drop" />}
                  {routePositions.length > 0 && <RoutePolyline positions={routePositions} />}
                </MapContainer>
                <div className="absolute bottom-8 left-8 right-8 pointer-events-none">
                    <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-100 shadow-2xl dark:bg-[#06060a]/80 dark:border-white/5 inline-flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD000]/10 text-[#FFD000]">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 7m0 13V7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Route analysis</p>
                            <p className="text-xs font-black text-gray-900 dark:text-white">{rideRequest.distance || '0'} KM TOTAL DISTANCE</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="lg:col-span-5 flex flex-col gap-8 h-full overflow-y-auto">
                <div className="rounded-[3rem] border border-gray-200 bg-white p-10 shadow-sm dark:border-white/5 dark:bg-neutral-900/40 dark:backdrop-blur-xl h-full flex flex-col">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-10 dark:border-white/5">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-[1.8rem] bg-[#FFD000] flex items-center justify-center text-3xl font-black text-black shadow-xl ring-4 ring-white dark:ring-neutral-800">
                                {rideRequest.rider.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Rider Information</p>
                                <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{rideRequest.rider.name}</h3>
                                <div className="mt-2 flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                    <span className="text-yellow-500">★</span>
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{rideRequest.rider.rating || '5.0'} Merit</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Fare bonus</p>
                             <p className="text-4xl font-black tracking-tighter text-[#FFD000]">₹{rideRequest.fare}</p>
                        </div>
                    </div>

                    <div className="flex-1 py-10 space-y-10">
                        <div className="flex gap-8 group">
                            <div className="mt-2 h-4 w-4 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                            <div className="relative border-l border-dashed border-gray-200 pl-8 dark:border-white/10">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Pickup Location</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed">{rideRequest.pickupLocation?.address || 'Restricted Area'}</p>
                            </div>
                        </div>
                        <div className="flex gap-8 group">
                            <div className="mt-2 h-4 w-4 shrink-0 rounded-full bg-red-500 ring-4 ring-red-500/10" />
                            <div className="relative border-l border-dashed border-gray-200 pl-8 dark:border-white/10">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Drop Destination</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white leading-relaxed">{rideRequest.dropLocation?.address || 'Target Area'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-10 border-t border-gray-100 dark:border-white/5">
                         <button
                            onClick={handleReject}
                            disabled={processing}
                            className="rounded-2xl border border-gray-200 bg-white py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:border-white/10 dark:bg-white/5 disabled:opacity-50"
                         >
                            Reject Ride
                         </button>
                         <button
                            onClick={handleAccept}
                            disabled={processing}
                            className="rounded-2xl bg-[#FFD000] py-5 text-[10px] font-black uppercase tracking-widest text-black shadow-xl shadow-[#FFD000]/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                         >
                            {processing ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-black border-t-transparent animate-spin rounded-full" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Accept Request &rarr;
                                </>
                            )}
                         </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AcceptRejectRide;
