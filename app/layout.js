import 'leaflet/dist/leaflet.css'   // ✅ Import here
import './globals.css'

export const metadata = {
  title: 'Leaflet Dashboard',
  description: 'Dashboard with interactive map',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  )
}