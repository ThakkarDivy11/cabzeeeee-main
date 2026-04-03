import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const UserMarker = ({ position, popupContent }) => {
    if (!position) return null;

    return (
        <Marker position={position} icon={userIcon}>
            {popupContent && <Popup>{popupContent}</Popup>}
        </Marker>
    );
};

export default UserMarker;
