export const env = {
	mode: "dev",
}

export function log(content: string, ...args: unknown[]): void {
    if (env.mode !== "production") {
        // 受控日志门面：仅开发模式输出，受 env.mode 统一开关
        console.log(content, ...args);
    }
}
