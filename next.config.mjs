import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  ...(process.env.BASE_PATH && {
    basePath: process.env.BASE_PATH,
    assetPrefix: process.env.BASE_PATH,
  }),
  images: {
    unoptimized: true,
  },
};

export default withMDX(config);
