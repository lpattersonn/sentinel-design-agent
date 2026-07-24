/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["postgres"],
  async rewrites() {
    // Short alias for the MCP endpoint: /mcp -> /api/mcp
    return [{ source: "/mcp", destination: "/api/mcp" }];
  },
};

export default nextConfig;
