import { DateTime } from "luxon";

export function safeStringify(value: unknown): string | undefined {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    if (DateTime.isDateTime(value)) return value.toString();
    if (Array.isArray(value)) {
        const parts: string[] = [];
        for (const item of value as unknown[]) {
            const part = safeStringify(item);
            if (part === undefined) return undefined;
            parts.push(part);
        }
        return parts.join(",");
    }
    return undefined;
}