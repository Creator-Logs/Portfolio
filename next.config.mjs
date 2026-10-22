/** @type {import('next').NextConfig} */
const nextConfig = {
  // 90 for posters/renders: 75 bands the dark gradients and smears fine CAD detail.
  images: { qualities: [75, 90] },
  async redirects() {
    return [
      // v1 URL may already be shared.
      { source: "/portfolio/3d_printer", destination: "/projects/3d-printer", permanent: true },
    ];
  },
};

export default nextConfig;
