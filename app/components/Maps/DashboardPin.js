import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

// Mock Leaflet for demonstration - in real app, import from 'leaflet'
const mockLeaflet = {
  map: (id, options) => ({
    setView: (coords, zoom) => {},
    on: (event, callback) => {},
    invalidateSize: () => {},
    flyTo: (coords, zoom) => {},
    eachLayer: (callback) => {},
    removeLayer: (layer) => {}
  }),
  tileLayer: (url, options) => ({
    addTo: (map) => {}
  }),
  marker: (coords, options) => ({
    addTo: (map) => {},
    bindPopup: (content) => ({
      openPopup: () => {}
    }),
    openPopup: () => {}
  }),
  icon: (options) => ({}),
  Icon: {
    Default: {
      prototype: {
        options: {}
      }
    }
  }
};

// Sample station data
const stationData = [
  {
    id: 1123,
    name: "Station 1",
    description: "Main monitoring station with weather sensors",
    point: [40.7128, -74.0060] // New York
  },
  {
    id: 1124,
    name: "Station 2",
    description: "Secondary station for data collection",
    point: [34.0522, -118.2437] // Los Angeles
  }
];

export default function DashboardPin() {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      // Initialize map
      leafletMapRef.current = mockLeaflet.map(mapRef.current, {
        center: [39.8283, -98.5795], // Center of US
        zoom: 4
      });

      // Add tile layer
      mockLeaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMapRef.current);

      // Add markers
      stationData.forEach(station => {
        const marker = mockLeaflet.marker([station.point[0], station.point[1]]);
        marker.addTo(leafletMapRef.current);
        marker.bindPopup(`
          <div class="p-3">
            <h3 class="font-bold text-lg mb-2">${station.name}</h3>
            <p class="text-gray-600 mb-2">${station.description}</p>
            <p class="text-sm text-gray-500">ID: ${station.id}</p>
          </div>
        `);
        markersRef.current.push({ marker, station });
      });
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current = null;
      }
    };
  }, []);

  const focusStation = (station) => {
    setSelectedStation(station);
    if (leafletMapRef.current) {
      // Fly to station location
      leafletMapRef.current.flyTo([station.point[0], station.point[1]], 10);
      
      // Find and open popup for this station
      const markerData = markersRef.current.find(m => m.station.id === station.id);
      if (markerData) {
        markerData.marker.openPopup();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Station Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage station locations</p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Stations ({stationData.length})</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {stationData.map(station => (
              <div 
                key={station.id}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-blue-50 ${
                  selectedStation?.id === station.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => focusStation(station)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{station.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{station.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>ID: {station.id}</span>
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {station.point[0].toFixed(4)}, {station.point[1].toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="ml-2 p-2 rounded-full hover:bg-blue-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      focusStation(station);
                    }}
                  >
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer info */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="text-xs text-gray-500">
              Click on any station to focus it on the map
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full">
            {/* Fallback content for demo */}
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
                <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Leaflet Map</h3>
                <p className="text-gray-600 mb-4">
                  In a real implementation, this would show an interactive Leaflet map with station markers.
                </p>
                <div className="text-sm text-gray-500">
                  Current stations: {stationData.length}<br/>
                  Selected: {selectedStation ? selectedStation.name : 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* Map overlay info */}
          {selectedStation && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <h4 className="font-semibold text-gray-900 mb-2">{selectedStation.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedStation.description}</p>
              <div className="text-xs text-gray-500">
                Coordinates: {selectedStation.point[0]}, {selectedStation.point[1]}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}