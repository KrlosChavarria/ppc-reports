/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // El driver de Postgres se carga tal cual en el servidor (no se empaqueta)
    serverComponentsExternalPackages: ["pg"],
  },
};
export default nextConfig;
