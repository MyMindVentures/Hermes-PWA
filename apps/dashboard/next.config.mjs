/** @type {import('next').NextConfig} */
const nextConfig = { output: 'standalone', transpilePackages: ['@refinedev/antd', '@hermes/auth', '@hermes/ai', '@hermes/github'] };
export default nextConfig;
