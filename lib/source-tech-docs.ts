import { techDocs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: '/tech-docs',
  source: techDocs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});
