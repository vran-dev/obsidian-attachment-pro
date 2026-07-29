export function safeStringify(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value === null) return "null";
    // 对象/数组等：用 JSON 序列化，避免 [object Object]
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}