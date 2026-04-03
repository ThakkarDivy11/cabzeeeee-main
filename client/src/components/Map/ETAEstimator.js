import React, { useEffect, useState } from 'react';

const ETAEstimator = ({ origin, destination, averageSpeedKmph = 30 }) => {
    const [eta, setEta] = useState(null);
    const [distance, setDistance] = useState(null);

    useEffect(() => {
        if (!origin || !destination) return;

        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; // Radius of the earth in km
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c; // Distance in km
            return d;
        };

        const deg2rad = (deg) => {
            return deg * (Math.PI / 180);
        };

        const dist = calculateDistance(origin[0], origin[1], destination[0], destination[1]);
        setDistance(dist.toFixed(1));

        // Calculate time in minutes
        // Time = Distance / Speed
        const timeHours = dist / averageSpeedKmph;
        const timeMinutes = Math.ceil(timeHours * 60);

        // Add some buffer for traffic (e.g., 20%)
        setEta(Math.ceil(timeMinutes * 1.2));

    }, [origin, destination, averageSpeedKmph]);

    if (!eta || !distance) return null;

    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-around text-center">
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Distance</p>
                <p className="text-lg font-bold">{distance} km</p>
            </div>
            <div className="border-l border-gray-200 mx-2"></div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Est. Time</p>
                <p className="text-lg font-bold text-black">{eta} min</p>
            </div>
        </div>
    );
};

export default ETAEstimator;
