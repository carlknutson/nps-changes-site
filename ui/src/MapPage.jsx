import React from 'react';
import MapView from './MapView';

export default function MapPage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 0' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>NPS Sites Map</h2>
      <MapView />
    </div>
  );
}
