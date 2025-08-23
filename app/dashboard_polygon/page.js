'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Map, Navigation, Layers, RotateCcw } from 'lucide-react';

// Sample polygon data
const polygonData = [
  {
    id: 1123,
    name: "SW19",
    description: "SW19 is UK outcode covering Wimbledon area",
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
    description: "NW10 is another UK outcode covering Harlesden and Kensal Green",
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
    description: "SE15 covers Peckham area in South London",
    polygon: [
      [51.460, -0.070],
      [51.470, -0.060],
      [51.475, -0.080],
      [51.465, -0.085],
      [51.460, -0.070]
    ]
  },
  {
    id: 1126,
    name: "E14",
    description: "E14 covers Canary Wharf and surrounding docklands",
    polygon: [
      [51.500, -0.015],
      [51.510, 0.005],
      [51.505, 0.010],
      [51.495, -0.010],
      [51.500, -0.015]
    ]
  }
];

export default function DashboardPolygonPage() {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const polygonsRef = useRef([]);
  const sidebarRef = useRef(null);
  const itemRefs = useRef({});
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    let L;
    
    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet
        L = (await import('leaflet')).default;
        
        // Import Leaflet CSS
        await import('leaflet/dist/leaflet.css');

        if (mapRef.current && !leafletMapRef.current) {
          // Initialize map centered on London
          leafletMapRef.current = L.map(mapRef.current).setView([51.5074, -0.1278], 11);

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(leafletMapRef.current);

          // Add polygons
          polygonData.forEach(area => {
            const polygon = L.polygon(area.polygon, {
              color: '#3b82f6',
              weight: 2,
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              interactive: true
            });
            
            polygon.addTo(leafletMapRef.current);
            polygon.bindPopup(`
              <div style="padding: 12px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${area.name}</h3>
                <p style="margin: 0 0 8px 0; color: #666;">${area.description}</p>
                <p style="margin: 0; font-size: 12px; color: #999;">ID: ${area.id}</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #999;">Points: ${area.polygon.length}</p>
              </div>
            `);
            
            // Add click event to polygon
            polygon.on('click', (e) => {
              e.originalEvent.stopPropagation();
              focusPolygon(area);
              scrollToListItem(area.id);
            });
            
            polygonsRef.current.push({ polygon, area });
          });

          setIsMapLoaded(true);
        }
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    initializeMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      polygonsRef.current = [];
    };
  }, []);

  const focusPolygon = (area) => {
    setSelectedPolygon(area);
    
    if (leafletMapRef.current && isMapLoaded) {
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
          fillOpacity: 0.4
        });

        // Fit bounds to polygon with animation
        const bounds = polygonData.polygon.getBounds();
        leafletMapRef.current.flyToBounds(bounds, { 
          padding: [20, 20],
          duration: 1.0
        });
      }
    }
  };

  const scrollToListItem = (areaId) => {
    const element = itemRefs.current[areaId];
    if (element && sidebarRef.current) {
      const sidebar = sidebarRef.current;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const sidebarHeight = sidebar.clientHeight;
      const sidebarScrollTop = sidebar.scrollTop;
      const headerHeight = 72; // Account for sidebar header
      
      // Calculate if element is visible
      const elementBottom = elementTop + elementHeight;
      const visibleTop = sidebarScrollTop + headerHeight;
      const visibleBottom = sidebarScrollTop + sidebarHeight;
      
      // Scroll to element if not fully visible
      if (elementTop < visibleTop || elementBottom > visibleBottom) {
        const scrollTo = elementTop - headerHeight - 20; // 20px padding
        sidebar.scrollTo({
          top: Math.max(0, scrollTo),
          behavior: 'smooth'
        });
      }
      
      // Add a brief highlight animation
      element.style.transform = 'scale(1.02)';
      element.style.transition = 'transform 0.2s ease-out';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 200);
    }
  };

  const resetView = () => {
    if (leafletMapRef.current && isMapLoaded) {
      leafletMapRef.current.setView([51.5074, -0.1278], 11);
      setSelectedPolygon(null);
      
      // Reset all polygon styles
      polygonsRef.current.forEach(({ polygon }) => {
        polygon.setStyle({
          color: '#3b82f6',
          weight: 2,
          fillColor: '#3b82f6',
          fillOpacity: 0.2
        });
      });
    }
  };

  const calculateArea = (polygon) => {
    // Simplified area calculation for demo (rough approximation)
    return (polygon.length * 0.15 + Math.random() * 0.5).toFixed(2);
  };

  const getPolygonCenter = (polygon) => {
    const lats = polygon.map(point => point[0]);
    const lngs = polygon.map(point => point[1]);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    return [centerLat.toFixed(4), centerLng.toFixed(4)];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-6 h-6 text-green-600" />
                Polygon Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Monitor and manage polygon areas</p>
            </div>
            <button 
              onClick={resetView}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset View
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Areas ({polygonData.length})</h2>
            <p className="text-sm text-gray-600 mt-1">Click to focus and highlight</p>
          </div>
          
          <div ref={sidebarRef} className="flex-1 overflow-y-auto">
            {polygonData.map(area => (
              <div 
                key={area.id}
                ref={el => itemRefs.current[area.id] = el}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-green-50 ${
                  selectedPolygon?.id === area.id ? 'bg-green-100 border-l-4 border-l-green-500 shadow-inner' : ''
                }`}
                onClick={() => {
                  focusPolygon(area);
                  scrollToListItem(area.id);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{area.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{area.description}</p>
                    <div className="grid grid-cols-1 gap-1 text-xs text-gray-500">
                      <span>ID: {area.id}</span>
                      <span>Points: {area.polygon.length}</span>
                      <span>Area: ~{calculateArea(area.polygon)} km²</span>
                      <span>Center: {getPolygonCenter(area.polygon).join(', ')}</span>
                    </div>
                  </div>
                                      <button 
                    className="ml-2 p-2 rounded-full hover:bg-green-100 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      focusPolygon(area);
                      scrollToListItem(area.id);
                    }}
                  >
                    <Map className="w-4 h-4 text-green-600" />
                  </button>
                </div>
                
                {/* Color indicator */}
                <div className="flex items-center gap-2 mt-2">
                  <div 
                    className={`w-4 h-4 rounded border-2 transition-colors ${
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
              {isMapLoaded ? 'Map loaded successfully' : 'Loading map...'}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full">
            {!isMapLoaded && (
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
                  <Layers className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-lg font-semibold mb-2">Loading Map</h3>
                  <p className="text-gray-600">Please wait while the map loads...</p>
                </div>
              </div>
            )}
          </div>

          {/* Map controls */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
            <div className="flex flex-col gap-2">
              <button 
                onClick={resetView}
                className="p-2 hover:bg-gray-100 rounded transition-colors" 
                title="Reset View"
              >
                <Navigation className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded transition-colors" title="Layers">
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Map overlay info */}
          {selectedPolygon && isMapLoaded && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-xs border border-gray-200 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 border border-red-500 rounded animate-pulse" />
                  {selectedPolygon.name}
                </h4>
                <button 
                  onClick={() => {
                    setSelectedPolygon(null);
                    resetView();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">{selectedPolygon.description}</p>
              <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-2 rounded">
                <div className="flex justify-between">
                  <span>ID:</span>
                  <span className="font-mono">{selectedPolygon.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vertices:</span>
                  <span className="font-mono">{selectedPolygon.polygon.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Area:</span>
                  <span className="font-mono">~{calculateArea(selectedPolygon.polygon)} km²</span>
                </div>
                <div className="flex justify-between">
                  <span>Center:</span>
                  <span className="font-mono text-xs">{getPolygonCenter(selectedPolygon.polygon).join(', ')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}