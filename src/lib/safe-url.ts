export function isSafeHttpUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

export function sanitizeExternalUrl(url: unknown): string {
    if (typeof url !== "string") return "";
    const trimmed = url.trim();
    return isSafeHttpUrl(trimmed) ? trimmed : "";
}

/** Accepts google.com, www.google.com, http(s)://… and returns a full URL, or "" if it is not a web link. */
export function normalizeWebUrl(raw: unknown): string {
    let value = (typeof raw === "string" ? raw : "").trim();
    if (!value) return "";
    if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) return "";
    if (!/^https?:\/\//i.test(value)) value = `https://${value.replace(/^\/+/, "")}`;
    try {
        const url = new URL(value);
        if (url.protocol !== "http:" && url.protocol !== "https:") return "";
        if (!url.hostname.includes(".") || /\s/.test(value)) return "";
        return value;
    } catch {
        return "";
    }
}

export function isValidWebUrl(raw: unknown): boolean {
    return normalizeWebUrl(raw) !== "";
}
