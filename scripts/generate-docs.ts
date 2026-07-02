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
    const declaredTags = Array.isArray(primarySchema?.dereferenced.tags)
        ? primarySchema.dereferenced.tags
        : [];
    const tagOrderMap = new Map<string, number>();

    declaredTags.forEach((tag, index) => {
        if (tag && typeof tag === 'object' && 'name' in tag && typeof (tag as { name?: unknown }).name === 'string') {
            tagOrderMap.set((tag as { name: string }).name, index);
        }
    });

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

            const groupedEntries = topEntries
                .filter((entry): entry is GeneratedGroupEntry => entry.type === 'group')
                .sort((left, right) => {
                    const leftTag = left.tag?.name ?? '';
                    const rightTag = right.tag?.name ?? '';
                    const leftOrder = tagOrderMap.get(leftTag);
                    const rightOrder = tagOrderMap.get(rightTag);

                    if (leftOrder !== undefined && rightOrder !== undefined) {
                        return leftOrder - rightOrder;
                    }

                    if (leftOrder !== undefined) return -1;
                    if (rightOrder !== undefined) return 1;

                    const leftTitle = left.info?.title ?? left.tag?.name ?? 'Untagged';
                    const rightTitle = right.info?.title ?? right.tag?.name ?? 'Untagged';
                    return leftTitle.localeCompare(rightTitle);
                });

            const groupSections = groupedEntries.map((entry) => {
                const groupTitle = entry.info?.title ?? entry.tag?.name ?? 'Untagged';
                const groupDescription = entry.info?.description
                    ? `\n\n${entry.info.description}`
                    : '';
                const cards = collectLeafEntries(entry).map(renderCard);

                return `\n### ${groupTitle}${groupDescription}\n\n<Cards>\n${cards.join('\n')}\n</Cards>`;
            }).filter(Boolean);

            const orderedGroupPageIds = groupedEntries
                .map((entry) => entry.path ?? entry.tag?.name)
                .filter((value): value is string => Boolean(value));

            const topLevelMetaFile = files.find((file) => file.path === 'meta.json');
            if (topLevelMetaFile) {
                try {
                    const parsed = JSON.parse(topLevelMetaFile.content) as { pages?: unknown };
                    const existingPages = Array.isArray(parsed.pages)
                        ? parsed.pages.filter((value): value is string => typeof value === 'string')
                        : [];

                    const orderedPages = [
                        ...orderedGroupPageIds.filter((page) => existingPages.includes(page)),
                        ...existingPages.filter((page) => !orderedGroupPageIds.includes(page)),
                    ];

                    parsed.pages = orderedPages;
                    topLevelMetaFile.content = `${JSON.stringify(parsed, null, 2)}\n`;
                } catch {
                    // keep generated meta as-is when unexpected content shape is encountered
                }
            }

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

            indexFile.content = `---\ntitle: ${indexTitle}\ndescription: ${indexDescription}\n---\n\n{/* This file was generated by Fumadocs. Do not edit this file directly. Any changes should be made by running the generation command again. */}\n\n${endpointSection}`;
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
