import { openapi } from '@/lib/openapi';
import { generateFiles } from 'fumadocs-openapi';
import path from 'node:path';

void generateFiles({
    index: {
        // for generating `href`
        url: {
            baseUrl: '/docs/api',
            // paths produced by generateFiles are relative to `output`
            contentDir: '.',
        },
        items: [
            {
                // output path
                path: 'index.mdx',
                // optional: set frontmatter
                description: 'All available pages',
            },
        ],
    },
    input: openapi,
    output: 'content/docs/api',
    includeDescription: true,
});
