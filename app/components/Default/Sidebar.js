export default function Sidebar({ 
  stations, 
  allStations,
  onPinHandler, 
  searchTerm, 
  onSearch, 
  onClearSearch 
}) {
  return (
    <div className="p-6">
      
      {/* Stations List */}
      <div className="space-y-4">
        {stations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>No stations found</p>
            <p className="text-sm">Try adjusting your search terms</p>
          </div>
        ) : (
          stations.map((station) => (
            <div 
              key={station.id} 
              className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-blue-300"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-800">{station.name}</h3>
                  <p className="text-sm text-gray-600">ID: {station.id}</p>
                </div>
                <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Active</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3">
                {station.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                  {station.point[0].toFixed(4)}, {station.point[1].toFixed(4)}
                </span>
                <button
                  onClick={() => onPinHandler(station)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md transform hover:scale-105"
                >
                  📍 Focus Pin
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
    </div>
  )
}