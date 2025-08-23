import React, { useEffect, useRef, useState } from 'react';
import { Map, Navigation, Layers } from 'lucide-react';

// Mock Leaflet for demonstration - in real app, import from 'leaflet'
const mockLeaflet = {
  map: (id, options) => ({
    setView: (coords, zoom) => {},
    on: (event, callback) => {},
    invalidateSize: () => {},
    flyTo: (coords, zoom) => {},
    fitBounds: (bounds) => {},
    eachLayer: (callback) => {},
    removeLayer: (layer) => {}
  }),
  tileLayer: (url, options) => ({
    addTo: (map) => {}
  }),
  polygon: (coords, options) => ({
    addTo: (map) => {},
    bindPopup: (content) => {},
    setStyle: (style) => {},
    getBounds: () => ({
      getCenter: () => [51.5, -0.1]
    })
  }),
  latLngBounds: (coords) => ({
    getCenter: () => [51.5, -0.1]
  })
};

// Sample polygon data
const polygonData = [
  {
    id: 1123,
    name: "SW19",
    description: "SW19 is UK outcode",
    polygon: [
      [51.421, -0.221],
      [51.430, -0.200],
      [51.440, -0.210],
      [51.435, -0.230],
      [51.421, -0.221]
    ]
  },
  {
    id: 1124,
    name: "NW10",
    description: "NW10 is another UK outcode",
    polygon: [
      [51.540, -0.260],
      [51.550, -0.240],
      [51.560, -0.250],
      [51.555, -0.270],
      [51.540, -0.260]
    ]
  },
  {
    id: 1125,
    name: "SE15",
    description: "SE15 is in South London",
    polygon: [
      [51.460, -0.070],
      [51.470, -0.060],
      [51.475, -0.080],
      [51.465, -0.085],
      [51.460, -0.070]
    ]
  }
];

export default function DashboardPolygon() {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const polygonsRef = useRef([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);

  useEffect(() => {
    if (mapRef.current && !leafletMapRef.current) {
      // Initialize map centered on London
      leafletMapRef.current = mockLeaflet.map(mapRef.current, {
        center: [51.5074, -0.1278],
        zoom: 11
      });

      // Add tile layer
      mockLeaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMapRef.current);

      // Add polygons
      polygonData.forEach(area => {
        const polygon = mockLeaflet.polygon(area.polygon, {
          color: '#3b82f6',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: 0.2
        });
        
        polygon.addTo(leafletMapRef.current);
        polygon.bindPopup(`
          <div class="p-3">
            <h3 class="font-bold text-lg mb-2">${area.name}</h3>
            <p class="text-gray-600 mb-2">${area.description}</p>
            <p class="text-sm text-gray-500">ID: ${area.id}</p>
            <p class="text-sm text-gray-500">Points: ${area.polygon.length}</p>
          </div>
        `);
        
        polygonsRef.current.push({ polygon, area });
      });
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current = null;
      }
    };
  }, []);

  const focusPolygon = (area) => {
    setSelectedPolygon(area);
    
    if (leafletMapRef.current) {
      // Reset all polygon styles
      polygonsRef.current.forEach(({ polygon }) => {
        polygon.setStyle({
          color: '#3b82f6',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: 0.2
        });
      });

      // Find and highlight the selected polygon
      const polygonData = polygonsRef.current.find(p => p.area.id === area.id);
      if (polygonData) {
        polygonData.polygon.setStyle({
          color: '#ef4444',
          weight: 3,
          fillColor: '#ef4444',
          fillOpacity: 0.3
        });

        // Fit bounds to polygon
        const bounds = mockLeaflet.latLngBounds(area.polygon);
        leafletMapRef.current.fitBounds(bounds);
      }
    }
  };

  const calculateArea = (polygon) => {
    // Simplified area calculation for demo
    return (polygon.length * 0.25).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-green-600" />
            Polygon Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage polygon areas</p>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Areas ({polygonData.length})</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {polygonData.map(area => (
              <div 
                key={area.id}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-green-50 ${
                  selectedPolygon?.id === area.id ? 'bg-green-100 border-l-4 border-l-green-500' : ''
                }`}
                onClick={() => focusPolygon(area)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{area.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{area.description}</p>
                    <div className="grid grid-cols-1 gap-1 text-xs text-gray-500">
                      <span>ID: {area.id}</span>
                      <span>Points: {area.polygon.length}</span>
                      <span>Area: ~{calculateArea(area.polygon)} km²</span>
                    </div>
                  </div>
                  <button 
                    className="ml-2 p-2 rounded-full hover:bg-green-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      focusPolygon(area);
                    }}
                  >
                    <Map className="w-4 h-4 text-green-600" />
                  </button>
                </div>
                
                {/* Color indicator */}
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className={`w-4 h-4 rounded border-2 ${
                      selectedPolygon?.id === area.id 
                        ? 'bg-red-400 border-red-500' 
                        : 'bg-blue-400 border-blue-500'
                    }`}
                  />
                  <span className="text-xs text-gray-500">
                    {selectedPolygon?.id === area.id ? 'Selected' : 'Default'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer info */}
          <div className="p-4 bg-gray-50 border-t">
            <div className="text-xs text-gray-500">
              Click on any area to focus and highlight it on the map
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full">
            {/* Fallback content for demo */}
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
              <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
                <Layers className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Leaflet Map</h3>
                <p className="text-gray-600 mb-4">
                  In a real implementation, this would show an interactive Leaflet map with polygon areas.
                </p>
                <div className="text-sm text-gray-500">
                  Current areas: {polygonData.length}<br/>
                  Selected: {selectedPolygon ? selectedPolygon.name : 'None'}
                </div>
              </div>
            </div>
          </div>

          {/* Map controls */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
            <div className="flex flex-col gap-2">
              <button className="p-2 hover:bg-gray-100 rounded">
                <Navigation className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Map overlay info */}
          {selectedPolygon && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 border border-red-500 rounded" />
                {selectedPolygon.name}
              </h4>
              <p className="text-sm text-gray-600 mb-2">{selectedPolygon.description}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <div>ID: {selectedPolygon.id}</div>
                <div>Vertices: {selectedPolygon.polygon.length}</div>
                <div>Area: ~{calculateArea(selectedPolygon.polygon)} km²</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}