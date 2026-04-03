import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import carMarkerUrl from '../../assets/car-marker.svg';

// Car icon for driver
const carIcon = new L.Icon({
    iconUrl: carMarkerUrl,
    // A centered icon makes it easier to "feel" like a vehicle on the road.
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -18]
});

const DriverMarker = ({ position, driverName, vehicleInfo }) => {
    if (!position) return null;

    return (
        <Marker position={position} icon={carIcon}>
            <Popup>
                <div className="text-sm">
                    <p className="font-bold">{driverName}</p>
                    <p>{vehicleInfo?.brand} {vehicleInfo?.model}</p>
                    <p className="text-gray-500">{vehicleInfo?.licensePlate}</p>
                </div>
            </Popup>
        </Marker>
    );
};

export default DriverMarker;
