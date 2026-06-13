import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Scope output-file tracing to this app (it lives in a monorepo subdirectory).
  outputFileTracingRoot: here,
  // Linting is run separately (and the workspace uses Biome); keep it out of the build.
  eslint: { ignoreDuringBuilds: true },
  // Type errors SHOULD fail the build — we want them caught.
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
