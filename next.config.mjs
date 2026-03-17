/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['mesonet.agron.iastate.edu', 'gibs.earthdata.nasa.gov', 'tile.openweathermap.org'],
  },
}

export default nextConfig
