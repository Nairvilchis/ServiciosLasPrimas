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
    ],
  },
  allowedDevOrigins: [
    'https://9000-idx-studio-1746073676083.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev',
    'https://6000-idx-studio-1746073676083.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev'
  ],
};

export default nextConfig;
