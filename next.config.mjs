import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  ...(process.env.GITHUB_PAGES && {
    basePath: '/case-docs',
    assetPrefix: '/case-docs',
  }),
  images: {
    unoptimized: true,
  },
};

export default withMDX(config);
