import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapMarker } from '../types';

// @SECURITY A03 - XSS prevention for InfoWindow HTML injection
const sanitizeHtml = (value: unknown): string => {
  const str = String(value ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

interface GoogleMapProps {
  markers: MapMarker[];
  center?: google.maps.LatLngLiteral;
  zoom?: number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  markers,
  center = { lat: 37.5665, lng: 126.9780 },
  zoom = 3
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'visualization']
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeId: google.maps.MapTypeId.TERRAIN,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });
        setMap(mapInstance);
      }
    });
  }, []);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    markers.forEach(markerData => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: getMarkerIcon(markerData.type)
      });

      const infoWindow = new google.maps.InfoWindow({
        content: createInfoWindowContent(markerData)
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  }, [map, markers]);

  const getMarkerIcon = (type: string): google.maps.Icon => {
    const icons: Record<string, string> = {
      earthquake: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      weather: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      radiation: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    };

    return {
      url: icons[type] || icons.earthquake,
      scaledSize: new google.maps.Size(32, 32)
    };
  };

  const createInfoWindowContent = (markerData: MapMarker): string => {
    const { type, data } = markerData;

    if (type === 'earthquake' && 'magnitude' in data) {
      return `
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="margin: 0 0 10px 0; color: #d32f2f;">지진 정보</h3>
          <p><strong>위치:</strong> ${sanitizeHtml(data.location)}</p>
          <p><strong>규모:</strong> M${sanitizeHtml(data.magnitude)}</p>
          <p><strong>깊이:</strong> ${sanitizeHtml(data.depth.toFixed(1))} km</p>
          <p><strong>시간:</strong> ${sanitizeHtml(new Date(data.timestamp).toLocaleString('ko-KR'))}</p>
        </div>
      `;
    } else if (type === 'weather' && 'temperature' in data) {
      return `
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="margin: 0 0 10px 0; color: #1976d2;">날씨 정보</h3>
          <p><strong>도시:</strong> ${sanitizeHtml(data.city)}</p>
          <p><strong>온도:</strong> ${sanitizeHtml(data.temperature.toFixed(1))}&deg;C</p>
          <p><strong>습도:</strong> ${sanitizeHtml(data.humidity)}%</p>
          <p><strong>기압:</strong> ${sanitizeHtml(data.pressure)} hPa</p>
          <p><strong>풍속:</strong> ${sanitizeHtml(data.windSpeed.toFixed(1))} m/s</p>
          <p><strong>설명:</strong> ${sanitizeHtml(data.description)}</p>
        </div>
      `;
    } else if (type === 'radiation' && 'value' in data) {
      return `
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="margin: 0 0 10px 0; color: #f57c00;">방사능 정보</h3>
          <p><strong>위치:</strong> ${sanitizeHtml(data.location)}</p>
          <p><strong>측정값:</strong> ${sanitizeHtml(data.value)} ${sanitizeHtml(data.unit)}</p>
          <p><strong>출처:</strong> ${sanitizeHtml(data.source)}</p>
          <p><strong>측정 시간:</strong> ${sanitizeHtml(new Date(data.timestamp).toLocaleString('ko-KR'))}</p>
        </div>
      `;
    }

    return '<div>정보 없음</div>';
  };

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '600px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    />
  );
};

export default GoogleMap;
