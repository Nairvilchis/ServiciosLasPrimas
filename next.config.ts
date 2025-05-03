import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'live.staticflickr.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    'https://9000-idx-studio-1746073676083.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev',
    'https://6000-idx-studio-1746073676083.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev'
  ],
   // Make environment variables available to the client-side build process if needed
   // For server-side code (like middleware, API routes, server actions), process.env works directly.
   // MONGODB_URI is typically server-side, but ADMIN_USERNAME might be needed client-side
   // depending on the auth flow (though Basic Auth is server-side).
   env: {
     // Example: Exposing a public API key (Don't expose secrets like MONGODB_URI here)
     // NEXT_PUBLIC_SOME_KEY: process.env.SOME_KEY,
   },
};

export default nextConfig;
