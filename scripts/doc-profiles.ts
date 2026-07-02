export type DocsProfile = {
    id: string;
    input: string;
    outputDir: string;
    baseUrl: string;
    groupByTag: boolean;
};

export const docsProfiles: DocsProfile[] = [
    {
        id: 'management-api',
        input: './openapi/management-api.yaml',
        outputDir: 'content/tech-docs/management-api/api',
        baseUrl: '/tech-docs/management-api/api',
        groupByTag: true,
    },
    {
        id: 'participant-api',
        input: './openapi/participant-api.yaml',
        outputDir: 'content/tech-docs/participant-api/api',
        baseUrl: '/tech-docs/participant-api/api',
        groupByTag: true,
    },
    {
        id: 'smtp-bridge',
        input: './openapi/smtp-bridge.yaml',
        outputDir: 'content/tech-docs/smtp-bridge/api',
        baseUrl: '/tech-docs/smtp-bridge/api',
        groupByTag: false,
    },
];

export function getDocsProfile(profileId: string): DocsProfile | undefined {
    return docsProfiles.find((profile) => profile.id === profileId);
}

export function getDefaultDocsProfile(): DocsProfile {
    return docsProfiles[0];
}
