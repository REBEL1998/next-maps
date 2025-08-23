'use client'

import { useState } from 'react'
import Sidebar from '../components/Default/Sidebar'
import MapComponent from '../components/Default/MapComponent'

// Sample data
const stationsData = [
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
]

export default function Dashboard() {
  const [selectedStation, setSelectedStation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredStations, setFilteredStations] = useState(stationsData)

  const handlePinFocus = (station) => {
    console.log("Pin clicked:", station)
    setSelectedStation(station)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    const filtered = stationsData.filter(station => 
      station.name.toLowerCase().includes(term.toLowerCase()) ||
      station.description.toLowerCase().includes(term.toLowerCase()) ||
      station.id.toString().includes(term)
    )
    setFilteredStations(filtered)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredStations(stationsData)
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
        <Sidebar 
          stations={filteredStations}
          allStations={stationsData}
          onPinHandler={handlePinFocus}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onClearSearch={handleClearSearch}
        />
      </div>
      
      {/* Map */}
      <div className="flex-1">
        <MapComponent 
          stations={stationsData}
          filteredStations={filteredStations}
          selectedStation={selectedStation}
          onStationSelect={setSelectedStation}
        />
      </div>
    </div>
  )
}
