'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Map tile layers configuration
const mapLayers = {
  street: {
    name: 'Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
  },
  terrain: {
    name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a>'
  },
  dark: {
    name: 'Dark Mode',
    url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
  }
}

// Custom marker icons
const createCustomIcon = (color = 'blue') => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color === 'red' ? '#ef4444' : '#3b82f6'};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        position: relative;
      "></div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

// Component to handle map events and controls
function MapController({ selectedStation, onMapUpdate }) {
  const map = useMap()
  
  useMapEvents({
    zoomend: () => {
      onMapUpdate({
        zoom: map.getZoom(),
        center: map.getCenter()
      })
    },
    moveend: () => {
      onMapUpdate({
        zoom: map.getZoom(),
        center: map.getCenter()
      })
    }
  })
  
  useEffect(() => {
    if (selectedStation) {
      map.flyTo(selectedStation.point, 12, {
        animate: true,
        duration: 1.5
      })
      
      // Open popup after animation
      setTimeout(() => {
        map.eachLayer((layer) => {
          if (layer instanceof L.Marker) {
            const popup = layer.getPopup()
            if (popup && popup.getContent()?.toString().includes(selectedStation.name)) {
              layer.openPopup()
            }
          }
        })
      }, 1600)
    }
  }, [selectedStation, map])
  
  return null
}

export default function MapComponent({ 
  stations, 
  filteredStations, 
  selectedStation, 
  onStationSelect 
}) {
  const mapRef = useRef(null)
  const [currentLayer, setCurrentLayer] = useState('street')
  const [mapState, setMapState] = useState({
    zoom: 4,
    center: { lat: 39.8283, lng: -98.5795 }
  })
  const [showAllStations, setShowAllStations] = useState(true)
  const [measureMode, setMeasureMode] = useState(false)

  // Initial center and zoom
  const defaultCenter = [39.8283, -98.5795]
  const defaultZoom = 4

  const handleMapUpdate = (newState) => {
    setMapState(newState)
  }

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(defaultCenter, defaultZoom, {
        animate: true,
        duration: 1.5
      })
    }
  }

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut()
    }
  }

  const handleFitBounds = () => {
    if (mapRef.current && stations.length > 0) {
      const bounds = L.latLngBounds(stations.map(station => station.point))
      mapRef.current.fitBounds(bounds, { padding: [20, 20] })
    }
  }

  const handleLayerChange = (layerKey) => {
    setCurrentLayer(layerKey)
  }

  return (
    <div className="h-full relative">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="leaflet-container"
        ref={(mapInstance) => {
          if (mapInstance) {
            mapRef.current = mapInstance
          }
        }}
        zoomControl={false} // We'll add custom zoom controls
      >
        <TileLayer
          attribution={mapLayers[currentLayer].attribution}
          url={mapLayers[currentLayer].url}
        />
        
        {/* Render stations */}
        {(showAllStations ? stations : filteredStations).map((station) => {
          const isFiltered = !filteredStations.find(s => s.id === station.id)
          const isSelected = selectedStation?.id === station.id
          
          return (
            <Marker 
              key={station.id} 
              position={station.point}
              icon={createCustomIcon(isSelected ? 'red' : 'blue')}
              opacity={isFiltered && showAllStations ? 0.4 : 1}
              eventHandlers={{
                click: () => onStationSelect(station)
              }}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{station.name}</h3>
                    <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Active</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">ID: {station.id}</p>
                  <p className="text-sm text-gray-700 mb-3">{station.description}</p>
                  <div className="border-t pt-2 text-xs text-gray-500 space-y-1">
                    <div>📍 Coordinates: {station.point[0].toFixed(4)}, {station.point[1].toFixed(4)}</div>
                    <div>🔧 Status: Operational</div>
                    <div>📡 Last Update: {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
        
        <MapController 
          selectedStation={selectedStation} 
          onMapUpdate={handleMapUpdate}
        />
      </MapContainer>
      
      {/* Enhanced Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        {/* Zoom Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          <button
            onClick={handleZoomIn}
            className="p-3 hover:bg-gray-100 transition-colors border-b border-gray-200 block w-full"
            title="Zoom In"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <button
            onClick={handleZoomOut}
            className="p-3 hover:bg-gray-100 transition-colors block w-full"
            title="Zoom Out"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
        </div>

        {/* Navigation Controls */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleRecenter}
              className="p-2 hover:bg-gray-100 transition-colors rounded text-xs font-medium text-gray-600"
              title="Recenter Map"
            >
              🎯 Center
            </button>
            <button
              onClick={handleFitBounds}
              className="p-2 hover:bg-gray-100 transition-colors rounded text-xs font-medium text-gray-600"
              title="Fit All Stations"
            >
              📐 Fit All
            </button>
          </div>
        </div>

        {/* Layer Switcher */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Map Layers</h4>
          <div className="space-y-1">
            {Object.entries(mapLayers).map(([key, layer]) => (
              <button
                key={key}
                onClick={() => handleLayerChange(key)}
                className={`w-full text-left p-2 rounded text-xs transition-colors ${
                  currentLayer === key 
                    ? 'bg-blue-100 text-blue-800 font-medium' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {layer.name}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}