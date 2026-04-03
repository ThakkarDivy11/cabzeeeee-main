import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Polyline } from 'react-leaflet';

const RoutePolyline = ({ positions, color = 'blue' }) => {
    const [routePositions, setRoutePositions] = useState(null);
    const lastKeyRef = useRef('');

    const normalized = useMemo(() => {
        if (!Array.isArray(positions)) return [];
        return positions
            .filter((p) => Array.isArray(p) && p.length >= 2)
            .map((p) => [Number(p[0]), Number(p[1])])
            .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
    }, [positions]);

    // If we were given an already-detailed polyline, just render it.
    const shouldFetch = normalized.length === 2;

    useEffect(() => {
        if (!shouldFetch) {
            setRoutePositions(normalized.length >= 2 ? normalized : null);
            return;
        }

        const [from, to] = normalized;
        const key = `${from[0]},${from[1]}|${to[0]},${to[1]}`;
        if (key === lastKeyRef.current) return;
        lastKeyRef.current = key;

        const controller = new AbortController();

        const fetchRoute = async () => {
            try {
                // OSRM expects lon,lat
                const fromLL = `${from[1]},${from[0]}`;
                const toLL = `${to[1]},${to[0]}`;
                const url = `https://router.project-osrm.org/route/v1/driving/${fromLL};${toLL}?overview=full&geometries=geojson`;

                const res = await fetch(url, { signal: controller.signal });
                if (!res.ok) throw new Error(`OSRM ${res.status}`);
                const data = await res.json();

                const coords = data?.routes?.[0]?.geometry?.coordinates;
                if (!Array.isArray(coords) || coords.length < 2) throw new Error('No route geometry');

                // Convert [lon,lat] to [lat,lon] for Leaflet.
                const poly = coords.map((c) => [c[1], c[0]]);
                setRoutePositions(poly);
            } catch (e) {
                // Fallback to a straight line so the UI still shows something.
                if (e?.name !== 'AbortError') {
                    setRoutePositions(normalized);
                }
            }
        };

        fetchRoute();

        return () => controller.abort();
    }, [normalized, shouldFetch]);

    if (!routePositions || routePositions.length < 2) return null;

    return (
        <Polyline
            positions={routePositions}
            color={color}
            weight={5}
            opacity={0.7}
            dashArray="10, 10"
        />
    );
};

export default RoutePolyline;
