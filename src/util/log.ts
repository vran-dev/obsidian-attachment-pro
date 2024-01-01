import { env } from "process";

export function log(content: string, ...args: any) {
	if (env.mode != "production") {
		console.log(content, args);
	}
}
