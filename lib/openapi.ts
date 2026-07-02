import { createOpenAPI } from 'fumadocs-openapi/server';

export const defaultOpenAPIInputs = [
    './openapi/management-api.yaml',
    './openapi/participant-api.yaml',
    './openapi/smtp-bridge.yaml',
];

export function createDocsOpenAPI(input: string | string[]) {
    const normalizedInput = Array.isArray(input) ? input : [input];

    return createOpenAPI({
        input: normalizedInput,
    });
}

export const openapi = createDocsOpenAPI(defaultOpenAPIInputs);
