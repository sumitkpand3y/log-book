const nextConfig = {
   images: {
    domains: ['images.unsplash.com', 'example.com', 'asterhealthacademy.com', 'f9e9317a.delivery.rocketcdn.me'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // env: {
  //   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api',
  //   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  // },
}

module.exports = nextConfig