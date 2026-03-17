import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { EarthquakeData } from '../types';

interface HeatMapProps {
  earthquakes: EarthquakeData[];
  center?: google.maps.LatLngLiteral;
  zoom?: number;
}

const HeatMap: React.FC<HeatMapProps> = ({
  earthquakes,
  center = { lat: 37.5665, lng: 126.9780 },
  zoom = 3
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [heatmap, setHeatmap] = useState<google.maps.visualization.HeatmapLayer | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['visualization']
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeId: google.maps.MapTypeId.SATELLITE
        });
        setMap(mapInstance);
      }
    });
  }, []);

  useEffect(() => {
    if (!map || !google.maps.visualization) return;

    if (heatmap) {
      heatmap.setMap(null);
    }

    const heatmapData = earthquakes.map(eq => ({
      location: new google.maps.LatLng(eq.latitude, eq.longitude),
      weight: eq.magnitude * eq.magnitude
    }));

    const newHeatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      radius: 20,
      opacity: 0.6,
      gradient: [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
      ]
    });

    newHeatmap.setMap(map);
    setHeatmap(newHeatmap);
  }, [map, earthquakes]);

  return (
    <div>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '600px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      />
      <div style={{ marginTop: '10px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
        <strong>히트맵 설명:</strong> 색상이 진할수록 지진 활동이 활발한 지역입니다.
        가중치는 진도의 제곱으로 계산됩니다.
      </div>
    </div>
  );
};

export default HeatMap;
