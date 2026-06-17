import { createDocsOpenAPI } from '@/lib/openapi';
import { generateFiles } from 'fumadocs-openapi';
import fs from 'node:fs/promises';
import { docsProfiles, DocsProfile, getDefaultDocsProfile, getDocsProfile } from './doc-profiles';

const requestedProfileId = process.argv[2] ?? process.env.DOCS_PROFILE;

if (requestedProfileId === '--list') {
    console.log(docsProfiles.map((profile) => profile.id).join('\n'));
    process.exit(0);
}

const runAllProfiles = requestedProfileId === '--all';

const selectedProfile = requestedProfileId
    ? (runAllProfiles ? getDefaultDocsProfile() : getDocsProfile(requestedProfileId))
    : getDefaultDocsProfile();

if (!selectedProfile) {
    console.error(`Unknown docs profile: ${requestedProfileId}`);
    console.error(`Available profiles: ${docsProfiles.map((profile) => profile.id).join(', ')}`);
    process.exit(1);
}

type GeneratedLeafEntry = {
    type: 'operation' | 'webhook';
    path: string;
    info: {
        title: string;
        description?: string;
    };
    item: {
        method: string;
        tags?: string[];
    };
    schemaId?: string;
};

type GeneratedGroupEntry = {
    type: 'group';
    info?: {
        title?: string;
        description?: string;
    };
    tag?: {
        name?: string;
        description?: string;
    };
    path?: string;
    schemaId?: string;
    entries: GeneratedEntry[];
};

type GeneratedEntry = GeneratedLeafEntry | GeneratedGroupEntry;

type OpenAPISchema = {
    type?: string;
    format?: string;
    description?: string;
    required?: string[];
    properties?: Record<string, unknown>;
    additionalProperties?: boolean | Record<string, unknown>;
    enum?: unknown[];
    items?: unknown;
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderAdditionalProperties(additionalProperties: OpenAPISchema['additionalProperties']): string {
    if (additionalProperties === true) return 'yes';
    if (additionalProperties === false) return 'no';
    if (typeof additionalProperties === 'object') return 'schema-defined';
    return '-';
}

function renderPropertyRows(schema: OpenAPISchema): string {
    const properties = schema.properties ?? {};
    const propertyEntries = Object.entries(properties);

    if (propertyEntries.length === 0) {
        return '<li><strong>Properties:</strong> -</li>';
    }

    const rows = propertyEntries.map(([name, value]) => {
        const property = value as { type?: string; description?: string; format?: string };
        const type = property.type ?? 'object';
        const format = property.format ? ` (${property.format})` : '';
        const description = property.description ? ` - ${property.description}` : '';
        return `<li><code>${escapeHtml(name)}</code>: ${escapeHtml(type + format + description)}</li>`;
    });

    return `<li><strong>Properties:</strong><ul>${rows.join('')}</ul></li>`;
}

const methodBadgeClass: Record<string, string> = {
    GET: 'text-emerald-600',
    POST: 'text-blue-600',
    PUT: 'text-amber-600',
    PATCH: 'text-orange-600',
    DELETE: 'text-red-600',
};

async function generateForProfile(profile: DocsProfile) {
    const outputDir = profile.outputDir;
    const baseUrl = profile.baseUrl;
    const openapi = createDocsOpenAPI(profile.input);
    const groupByTag = profile.groupByTag;

    console.log(`Generating docs for profile: ${profile.id}`);

    // Remove stale files from previous generation modes (flat vs grouped).
    await fs.rm(outputDir, { recursive: true, force: true });

    const schemas = await openapi.getSchemas();
    const primarySchema = Object.values(schemas)[0];
    const indexTitle = primarySchema?.dereferenced.info?.title ?? 'API';
    const indexDescription = primarySchema?.dereferenced.info?.description ?? 'All available pages';
    const schemaMap = (primarySchema?.dereferenced.components?.schemas ?? {}) as Record<string, OpenAPISchema>;

    await generateFiles({
        per: 'operation',
        groupBy: groupByTag ? 'tag' : undefined,
        meta: true,
        index: {
            // for generating `href`
            url: {
                baseUrl,
                // paths produced by generateFiles are relative to `output`
                contentDir: '.',
            },
            items: (ctx) => {
                const only = Object.values(ctx.generated)
                    .flat()
                    .map((file) => file.path);

                return [
                    {
                        // output path
                        path: 'index.mdx',
                        // optional: set frontmatter
                        description: indexDescription,
                        only,
                    },
                ];
            },
        },
        input: openapi,
        output: outputDir,
        includeDescription: true,
        beforeWrite(files) {
            const indexFile = files.find((file) => file.path === 'index.mdx');
            if (!indexFile) return;

            const topEntries = Object.values(this.generatedEntries)
                .flat() as GeneratedEntry[];

            const collectLeafEntries = (entry: GeneratedEntry): GeneratedLeafEntry[] => {
                if (entry.type === 'group') {
                    return entry.entries.flatMap((child) => collectLeafEntries(child));
                }

                return [entry];
            };

            const renderCard = (entry: GeneratedLeafEntry): string => {
                const method = entry.item.method.toUpperCase();
                const methodClass = methodBadgeClass[method] ?? 'text-fd-muted-foreground';
                const href = `${baseUrl}/${entry.path.replace(/\.mdx$/, '')}`;
                const description = entry.info.description
                    ? `description={${JSON.stringify(entry.info.description)}}`
                    : '';

                return `<Card href="${href}" title={<span>${entry.info.title} <span className=\"${methodClass}\">${method}</span></span>} ${description} />`;
            };

            const groupSections = topEntries.map((entry) => {
                if (entry.type !== 'group') {
                    return '';
                }

                const groupTitle = entry.info?.title ?? entry.tag?.name ?? 'Untagged';
                const groupDescription = entry.info?.description
                    ? `\n\n${entry.info.description}`
                    : '';
                const cards = collectLeafEntries(entry).map(renderCard);

                return `\n### ${groupTitle}${groupDescription}\n\n<Cards>\n${cards.join('\n')}\n</Cards>`;
            }).filter(Boolean);

            const ungroupedCards = topEntries
                .filter((entry): entry is GeneratedLeafEntry => entry.type !== 'group')
                .map(renderCard);

            const endpointSection = [
                groupByTag && groupSections.length > 0 ? `${groupSections.join('\n')}` : '',
                !groupByTag && ungroupedCards.length > 0
                    ? `<Cards>\n${ungroupedCards.join('\n')}\n</Cards>`
                    : '',
                ungroupedCards.length > 0
                    && groupByTag
                    ? `## Other Endpoints\n\n<Cards>\n${ungroupedCards.join('\n')}\n</Cards>`
                    : '',
            ].filter(Boolean).join('\n\n');

            const schemaBlocks = Object.entries(schemaMap).map(([name, schema]) => {
                const description = (schema.description ?? '-')
                    .replace(/\r?\n/g, ' ')
                    .trim();
                const required = schema.required?.length ? schema.required.join(', ') : '-';
                const enumValues = schema.enum?.length ? schema.enum.map((item) => JSON.stringify(item)).join(', ') : '-';
                const type = schema.type ?? 'object';
                const format = schema.format ?? '-';
                const additionalProperties = renderAdditionalProperties(schema.additionalProperties);
                const itemType = schema.items && typeof schema.items === 'object'
                    ? ((schema.items as { type?: string }).type ?? 'object')
                    : '-';

                const summaryText = description !== '-'
                    ? `<code>${escapeHtml(name)}</code> - ${escapeHtml(description)}`
                    : `<code>${escapeHtml(name)}</code>`;

                return `<details>\n<summary>${summaryText}</summary>\n<ul>\n<li><strong>Type:</strong> ${escapeHtml(type)}</li>\n<li><strong>Format:</strong> ${escapeHtml(format)}</li>\n<li><strong>Required:</strong> ${escapeHtml(required)}</li>\n<li><strong>Enum:</strong> ${escapeHtml(enumValues)}</li>\n<li><strong>Array item type:</strong> ${escapeHtml(itemType)}</li>\n<li><strong>Additional properties:</strong> ${escapeHtml(additionalProperties)}</li>\n${renderPropertyRows(schema)}\n</ul>\n</details>`;
            });

            const schemaSection = schemaBlocks.length > 0
                ? `\n## Schemas\n\nClick a schema to expand details.\n\n${schemaBlocks.join('\n\n')}\n`
                : '';

            indexFile.content = `---\ntitle: ${indexTitle}\ndescription: ${indexDescription}\n---\n\n{/* This file was generated by Fumadocs. Do not edit this file directly. Any changes should be made by running the generation command again. */}\n\n${endpointSection}\n${schemaSection}`;
        },
    });
}

void (async () => {
    if (runAllProfiles) {
        for (const profile of docsProfiles) {
            await generateForProfile(profile);
        }
        return;
    }

    await generateForProfile(selectedProfile);
})();
