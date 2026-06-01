import { docs } from 'fumadocs-mdx:collections/server';
import { loader, multiple } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { openapiPlugin, openapiSource } from 'fumadocs-openapi/server';

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader(
  {
    // it assigns a URL to your pages
    baseUrl: '/docs',
    source: docs.toFumadocsSource(),
    plugins: [lucideIconsPlugin(), openapiPlugin()],
  },);
