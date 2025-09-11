
export function joinPath(basePath: string, assetPath?: string): string {
    if (!assetPath) return "";

    const asset = String(assetPath);

    if (/^(?:https?:)?\/\//i.test(asset) || /^(?:data|blob):/i.test(asset)) {
        return asset;
    }

    const base = (basePath || "").replace(/\/+$/, "");
    const baseNoLead = base.replace(/^\/+/, "");
    const assetNorm = asset.replace(/\/+/g, "/").replace(/^\/+/, "");

    if (!baseNoLead) {
        return `/${assetNorm}`;
    }

    if (assetNorm === baseNoLead || assetNorm.startsWith(`${baseNoLead}/`)) {
        return `/${assetNorm}`;
    }

    return `/${baseNoLead}/${assetNorm}`.replace(/\/+/g, "/");
}