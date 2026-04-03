import React, { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Loader from '../Common/Loader';

// Fix for default Leaflet marker icons not displaying correctly in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const RecenterCenter = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(position);
    }, [map, position]);
    return null;
};

const MapContainer = ({
    center = [28.6139, 77.2090], // Default: New Delhi
    zoom = 13,
    children,
    className = "h-64 sm:h-80 md:h-[400px] w-full rounded-lg shadow-md z-0 min-h-[200px]"
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <Loader size="small" />;

    return (
        <div className={className}>
            <LeafletMap
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterCenter position={center} />
                {children}
            </LeafletMap>
        </div>
    );
};

export default MapContainer;
