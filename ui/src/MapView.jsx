import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
// Accepts a `sites` prop instead of importing directly

// Fix Leaflet marker icon issue with Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Set default icon for all markers
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function parseLatLong(location) {
  if (!location) return null;
  const latMatch = location.match(/lat:([\-0-9.]+)/);
  const longMatch = location.match(/long:([\-0-9.]+)/);
  if (!latMatch || !longMatch) return null;
  return {
    lat: parseFloat(latMatch[1]),
    lng: parseFloat(longMatch[1]),
  };
}


function getValidSites(sites) {
  return sites
    .map(site => ({
      ...site,
      coords: parseLatLong(site.location),
    }))
    .filter(site => site.coords);
}

function getCenter(validSites) {
  return validSites.length > 0 ? validSites[0].coords : { lat: 39.8283, lng: -98.5795 };
}



const MapView = ({ sites }) => {
  const validSites = getValidSites(sites);
  const center = getCenter(validSites);
  if (validSites.length === 0) {
    return <div style={{ color: 'red', padding: 20 }}>No valid site locations found in data.</div>;
  }
  return (
    <div style={{ height: '80vh', width: '100%', border: '2px solid #1976d2', boxSizing: 'border-box', marginBottom: 24 }}>
      <MapContainer center={center} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validSites.map((site, idx) => (
          <Marker key={idx} position={site.coords}>
            <Popup minWidth={260} maxWidth={320}>
              <div style={{ minWidth: 220, maxWidth: 300 }}>
                <a
                  href={site.nps_link || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontWeight: 600,
                    color: '#1976d2',
                    fontSize: 17,
                    textDecoration: 'underline dotted #bcd',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  {site.name || 'Unnamed Site'}
                </a>
                {site.photo_link && (
                  <img
                    src={site.photo_link}
                    alt={site.name}
                    style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 6, marginBottom: 6 }}
                  />
                )}
                {site.description && (
                  <div style={{ fontSize: 13, color: '#333', marginBottom: 4 }}>{site.description}</div>
                )}
                <div style={{ fontSize: 12, color: '#888' }}>
                  {site.coords.lat}, {site.coords.lng}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
