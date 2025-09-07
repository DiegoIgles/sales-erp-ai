import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  typescript: {
    // 👇 Permite compilar aunque haya errores de tipo (útil cuando Next genera mal los tipos)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
