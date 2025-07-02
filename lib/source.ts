import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';

const basePath = process.env.BASE_PATH || '';

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: `${basePath}/docs`,
  source: docs.toFumadocsSource(),
});
