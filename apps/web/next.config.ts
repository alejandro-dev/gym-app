import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Reescribimos la ruta de /uploads para que apunte al backend de NestJS
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${process.env.NEST_API_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
