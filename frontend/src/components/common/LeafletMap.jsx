import React, { useState, useEffect } from 'react';
import { POPULAR_CITIES } from '../../data/mockData';
import { MapPin, Bus, Navigation, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Custom SVG-based Pin Icon generator
const createPinIcon = (color = '#1746C8', label = '') => {
  try {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          background: ${color};
          color: white;
          border: 2px solid white;
          border-radius: 9999px;
          padding: 4px 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          font-weight: 700;
          font-size: 11px;
          white-space: nowrap;
          transform: translate(-50%, -100%);
        ">
          <span>🚌</span>
          <span>${label}</span>
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });
  } catch (e) {
    return null;
  }
};

const LeafletMap = ({ originCity, destinationCity, onSelectCity, height = '450px' }) => {
  const [mounted, setMounted] = useState(false);
  const [hasMapError, setHasMapError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const originCoord = POPULAR_CITIES.find(
    (c) => c.name.toLowerCase() === originCity?.toLowerCase()
  );
  const destCoord = POPULAR_CITIES.find(
    (c) => c.name.toLowerCase() === destinationCity?.toLowerCase()
  );

  const routePolyline =
    originCoord && destCoord
      ? [
          [originCoord.lat, originCoord.lng],
          [destCoord.lat, destCoord.lng]
        ]
      : null;

  const defaultCenter = [22.0, 78.9629]; // Central India

  return (
    <div className="w-full relative rounded-2xl overflow-hidden shadow-elevated border border-blue-100 bg-white">
      <div className="bg-primary-navy text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-accent" />
          <span className="font-semibold text-sm tracking-wide">
            Pan-India Highway Transit Network (OpenStreetMap)
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-blue-200">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span> Origin
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span> Destination
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span> Transit Hub
          </span>
        </div>
      </div>

      <div style={{ height, width: '100%', position: 'relative' }}>
        {!mounted || hasMapError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 text-gray-500 p-6 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-semibold">Loading Pan-India Route Network...</p>
          </div>
        ) : (
          <MapContainer
            center={originCoord ? [originCoord.lat, originCoord.lng] : defaultCenter}
            zoom={5}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {POPULAR_CITIES.map((city) => {
              const isOrigin = city.name.toLowerCase() === originCity?.toLowerCase();
              const isDest = city.name.toLowerCase() === destinationCity?.toLowerCase();

              let color = '#1746C8';
              if (isOrigin) color = '#FF8A32'; // Orange
              if (isDest) color = '#10B981';   // Emerald

              const icon = createPinIcon(color, city.name);

              return (
                <Marker
                  key={city.name}
                  position={[city.lat, city.lng]}
                  {...(icon ? { icon } : {})}
                >
                  <Popup>
                    <div className="p-1 min-w-[200px]">
                      <div className="flex items-center justify-between border-b pb-1 mb-2">
                        <h4 className="font-bold text-gray-900 text-sm">{city.name}</h4>
                        <span className="text-[10px] bg-blue-100 text-primary font-medium px-2 py-0.5 rounded-full">
                          {city.state}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 font-medium">Major Terminals:</p>
                      <ul className="text-xs text-gray-700 list-disc list-inside mb-3 space-y-0.5">
                        {city.terminals.map((t, idx) => (
                          <li key={idx} className="truncate">{t}</li>
                        ))}
                      </ul>
                      {onSelectCity && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => onSelectCity(city.name, 'origin')}
                            className="bg-primary text-white text-[11px] font-semibold py-1 px-2 rounded hover:bg-primary-dark transition text-center"
                          >
                            Set as From
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectCity(city.name, 'destination')}
                            className="bg-accent text-white text-[11px] font-semibold py-1 px-2 rounded hover:bg-accent-hover transition text-center"
                          >
                            Set as To
                          </button>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {routePolyline && (
              <Polyline
                positions={routePolyline}
                pathOptions={{
                  color: '#FF8A32',
                  weight: 4,
                  dashArray: '8, 8',
                  opacity: 0.85
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
