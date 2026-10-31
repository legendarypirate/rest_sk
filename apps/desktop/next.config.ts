import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'export',
  trailingSlash: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: repoRoot,
  },
  transpilePackages: [
    '@packages/ui',
    '@packages/auth',
    '@packages/i18n',
    '@packages/types',
  ],
};

export default nextConfig;
