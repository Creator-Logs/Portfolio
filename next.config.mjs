/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // v1 URL may already be shared.
      { source: "/portfolio/3d_printer", destination: "/projects/3d-printer", permanent: true },
    ];
  },
};

export default nextConfig;
