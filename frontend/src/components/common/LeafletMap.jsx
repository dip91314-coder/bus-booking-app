import React, { useState, useEffect } from 'react';
import { POPULAR_CITIES } from '../../data/mockData';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Create clean, accessible pin marker
const createCleanIcon = (color = '#5B21B6', label = '') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${color};
        color: #ffffff;
        border: 2px solid #ffffff;
        border-radius: 20px;
        padding: 4px 10px;
        display: flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
        font-weight: 600;
        font-size: 12px;
        white-space: nowrap;
        transform: translate(-50%, -100%);
      ">
        <span>📍</span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28]
  });
};

const LeafletMap = ({
  originCity = 'Mumbai',
  destinationCity = 'Pune',
  onCitySelect,
  height = '420px'
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState(originCity);
  const [selectedDest, setSelectedDest] = useState(destinationCity);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (originCity) setSelectedOrigin(originCity);
    if (destinationCity) setSelectedDest(destinationCity);
  }, [originCity, destinationCity]);

  const originCoord = POPULAR_CITIES.find(
    (c) => c.name.toLowerCase() === selectedOrigin?.toLowerCase()
  );
  const destCoord = POPULAR_CITIES.find(
    (c) => c.name.toLowerCase() === selectedDest?.toLowerCase()
  );

  const routePolyline =
    originCoord && destCoord
      ? [
          [originCoord.lat, originCoord.lng],
          [destCoord.lat, destCoord.lng]
        ]
      : null;

  const defaultCenter = [20.5937, 78.9629]; // India Center

  const handleOriginChange = (e) => {
    const val = e.target.value;
    setSelectedOrigin(val);
    if (onCitySelect) onCitySelect(val, 'origin');
  };

  const handleDestChange = (e) => {
    const val = e.target.value;
    setSelectedDest(val);
    if (onCitySelect) onCitySelect(val, 'destination');
  };

  return (
    <div className="w-full bg-white rounded-card overflow-hidden border border-[#E2E8F0] shadow-soft">
      {/* Route Selector Toolbar */}
      <div className="p-4 bg-[#F8F7FC] border-b border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label htmlFor="map-origin-select" className="text-xs font-semibold text-[#475569]">
              Origin:
            </label>
            <select
              id="map-origin-select"
              value={selectedOrigin}
              onChange={handleOriginChange}
              className="text-xs font-semibold bg-white border border-[#E2E8F0] rounded-interactive px-2.5 py-1.5 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
            >
              {POPULAR_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[#64748B] text-xs">➔</span>

          <div className="flex items-center gap-2">
            <label htmlFor="map-dest-select" className="text-xs font-semibold text-[#475569]">
              Destination:
            </label>
            <select
              id="map-dest-select"
              value={selectedDest}
              onChange={handleDestChange}
              className="text-xs font-semibold bg-white border border-[#E2E8F0] rounded-interactive px-2.5 py-1.5 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#5B21B6]"
            >
              {POPULAR_CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-[#475569]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#5B21B6]"></span>
            <span>Origin</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#059669]"></span>
            <span>Destination</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-[#5B21B6] rounded-full"></span>
            <span>Transit Corridor</span>
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ height, width: '100%', position: 'relative' }}>
        {!mounted ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#F8F7FC] text-[#64748B]">
            <Loader2 className="w-6 h-6 animate-spin text-[#5B21B6] mb-2" />
            <p className="text-xs font-medium">Loading Map...</p>
          </div>
        ) : (
          <MapContainer
            center={originCoord ? [originCoord.lat, originCoord.lng] : defaultCenter}
            zoom={6}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            {/* CartoDB Positron - Clean Light Vector Tiles with English Labels */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {/* Display only the selected route markers to eliminate cluster clutter */}
            {originCoord && (
              <Marker
                position={[originCoord.lat, originCoord.lng]}
                icon={createCleanIcon('#5B21B6', originCoord.name)}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-semibold text-xs text-[#0F172A]">{originCoord.name}</p>
                    <p className="text-[11px] text-[#64748B]">Boarding Point / Origin</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {destCoord && (
              <Marker
                position={[destCoord.lat, destCoord.lng]}
                icon={createCleanIcon('#059669', destCoord.name)}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-semibold text-xs text-[#0F172A]">{destCoord.name}</p>
                    <p className="text-[11px] text-[#64748B]">Dropping Point / Destination</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {routePolyline && (
              <Polyline
                positions={routePolyline}
                pathOptions={{
                  color: '#5B21B6',
                  weight: 4,
                  opacity: 0.85,
                  dashArray: '8, 8'
                }}
              />
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default LeafletMap;
