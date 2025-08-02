/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true
  },
  // Убираем статический экспорт для поддержки API routes
  experimental: {
    serverComponentsExternalPackages: ['fs']
  }
}

export default nextConfig
