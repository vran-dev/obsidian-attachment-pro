/**
 * Obsidian API 的最小测试替身：只实现被测代码在运行时真正触碰的部分。
 * vitest.config.ts 通过 resolve.alias 把 "obsidian" 指向本文件；
 * tsc 类型检查仍使用真实的 obsidian 类型声明。
 */

/** 行为对齐 Obsidian 的 normalizePath：统一斜杠、折叠重复、去首尾斜杠 */
export function normalizePath(path: string): string {
	const normalized = path
		.replace(/([\\/])+/g, "/")
		.replace(/(^\/+|\/+$)/g, "");
	return normalized === "" ? "/" : normalized;
}

export class TAbstractFile {
	path: string;
	name: string;
}

export class TFile extends TAbstractFile {
	basename: string;
	extension: string;
}

export class TFolder extends TAbstractFile {}

export class Notice {
	constructor(public message: string) {}
}

export function getLanguage(): string {
	return "en";
}
