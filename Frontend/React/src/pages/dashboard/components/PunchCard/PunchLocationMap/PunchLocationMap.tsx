import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PunchLocationMap.css';

// Fix Leaflet default icon issue with Vite
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom employee location marker (blue circle)
const employeeIcon = new Icon({
  iconUrl:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxMiIgZmlsbD0iIzI5QkVGRiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI2IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Component to update map view when location changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

export interface PunchLocationMapProps {
  employeeLocation: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  address: string | null;
  locationStatus: 'loading' | 'success' | 'error' | 'denied' | 'unavailable';
  errorMessage?: string;
  onRetry?: () => void;
}

export const PunchLocationMap: React.FC<PunchLocationMapProps> = ({
  employeeLocation,
  // address,
  locationStatus,
  errorMessage,
  onRetry,
}) => {
  const employeeLatLng: [number, number] | null = employeeLocation
    ? [employeeLocation.latitude, employeeLocation.longitude]
    : null;

  // Render status message if location not available
  if (locationStatus === 'loading') {
    return (
      <div className="punch-map-placeholder">
        <span className="punch-map-loading">Detecting your location...</span>
      </div>
    );
  }

  if (locationStatus === 'denied') {
    return (
      <div className="punch-map-placeholder">
        <span className="punch-map-error">Location permission is required</span>
        <span className="punch-map-hint">
          Allow location access in your browser settings to verify your current
          location.
        </span>
        {onRetry && (
          <button className="punch-map-retry" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (locationStatus === 'error' || locationStatus === 'unavailable') {
    return (
      <div className="punch-map-placeholder">
        <span className="punch-map-error">
          {errorMessage || 'Unable to detect your location'}
        </span>
        {onRetry && (
          <button className="punch-map-retry" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    );
  }

  // If no employee location yet but not in error state
  if (!employeeLocation || !employeeLatLng) {
    return (
      <div className="punch-map-placeholder">
        <span className="punch-map-loading">Waiting for location...</span>
      </div>
    );
  }

  return (
    <div className="punch-map-container">
      <MapContainer
        center={employeeLatLng}
        zoom={18}
        zoomControl={false}
        attributionControl={false}
        className="punch-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright"></a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Employee marker only */}
        <Marker position={employeeLatLng} icon={employeeIcon}>
          <Popup>Your Location</Popup>
        </Marker>

        {/* Automatically re-center when employee location updates */}
        <ChangeView center={employeeLatLng} />
      </MapContainer>

      {/* Location info overlay (No office/geofence status) */}
      {/* <div className="punch-map-info">
        <div className="punch-map-location">
          <span className="punch-map-location-label">Your Location</span>
          <span className="punch-map-location-address">
            {address || 'Resolving address...'}
          </span>
        </div>
        {employeeLocation && (
          <div className="punch-map-distance">
            <span className="punch-map-accuracy">
              Accuracy: {Math.round(employeeLocation.accuracy)} m
            </span>
          </div>
        )}
      </div> */}
    </div>
  );
};