

export function joinPath(basePath: string, assetPath: string): string {
    if (!assetPath) return '';

    if (/^(https?:)?\/\//.test(assetPath)) {
        return assetPath;
    }

    if (basePath && assetPath.startsWith(basePath.replace(/\/+$/, ''))) {
        return assetPath.replace(/\/+/g, '/');
    }
    return `${basePath}/${assetPath}`.replace(/\/+/g, '/');
}