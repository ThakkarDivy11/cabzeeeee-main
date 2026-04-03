import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import Loader from '../Common/Loader';
import toast from 'react-hot-toast';

const LiveLocationTracker = ({ onLocationUpdate, track = false }) => {
    const [position, setPosition] = useState(null);
    const [error, setError] = useState(null);
    const map = useMap();

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        const handleSuccess = (pos) => {
            const { latitude, longitude } = pos.coords;
            const newPos = [latitude, longitude];
            setPosition(newPos);
            if (onLocationUpdate) onLocationUpdate(newPos);
        };

        const handleError = (err) => {
            console.warn(`ERROR(${err.code}): ${err.message}`);
            if (err.code === 1) toast.error('Location permission denied');
            setError(err.message);
        };

        // Get initial position
        navigator.geolocation.getCurrentPosition(handleSuccess, handleError);

        let watchId;
        if (track) {
            watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [track, onLocationUpdate]);

    useEffect(() => {
        if (position && track && map) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, track, map]);

    return null;
};

export default LiveLocationTracker;
