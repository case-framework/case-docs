import { createOpenAPI } from 'fumadocs-openapi/server';

export const defaultOpenAPIInput = './openapi/management-api.yaml';

export function createDocsOpenAPI(input: string | string[]) {
    const normalizedInput = Array.isArray(input) ? input : [input];

    return createOpenAPI({
        input: normalizedInput,
    });
}

export const openapi = createDocsOpenAPI(defaultOpenAPIInput);
