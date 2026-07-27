import { describe, expect, it } from "vitest";
import { App, TFile } from "obsidian";
import DefaultVariableHandler from "src/manager/variable/variableHandler";

function mockApp(cache: unknown = null): App {
	return {
		metadataCache: {
			getFileCache: () => cache,
		},
	} as unknown as App;
}

const pageFile = {
	name: "my-note.md",
	basename: "my-note",
	path: "notes/my-note.md",
	extension: "md",
} as TFile;

describe("DefaultVariableHandler.handle", () => {
	it("空输入原样返回", () => {
		expect(DefaultVariableHandler.handle("", mockApp(), pageFile)).toBe("");
	});

	it("无占位符的输入原样返回", () => {
		expect(
			DefaultVariableHandler.handle("plain/path", mockApp(), pageFile)
		).toBe("plain/path");
	});

	it("${notename} 解析为笔记名", () => {
		expect(
			DefaultVariableHandler.handle("${notename}", mockApp(), pageFile)
		).toBe("my-note");
	});

	it("${frontmatter.xxx} 解析 frontmatter 字段", () => {
		const app = mockApp({ frontmatter: { created: "2026-01-15" } });
		expect(
			DefaultVariableHandler.handle(
				"${frontmatter.created}",
				app,
				pageFile
			)
		).toBe("2026-01-15");
	});

	it("路径中的方法调用（用户核心用例）", () => {
		const result = DefaultVariableHandler.handle(
			"Resources/Attachments/image/${now.toFormat('yyyy')}/x",
			mockApp(),
			pageFile
		);
		expect(result).toMatch(/^Resources\/Attachments\/image\/\d{4}\/x$/);
	});

	it("解析失败时原样保留占位符", () => {
		expect(
			DefaultVariableHandler.handle(
				"a-${unknown}-b",
				mockApp(),
				pageFile
			)
		).toBe("a-${unknown}-b");
	});

	it("frontmatter 缺失时占位符原样保留", () => {
		expect(
			DefaultVariableHandler.handle(
				"${frontmatter.created}",
				mockApp(null),
				pageFile
			)
		).toBe("${frontmatter.created}");
	});

	it("index > 0 时追加两位序号后缀", () => {
		expect(
			DefaultVariableHandler.handle(
				"${notename}",
				mockApp(),
				pageFile,
				undefined,
				3
			)
		).toBe("my-note-03");
	});

	it("${attachmentName} 解析为附件名（不含扩展名）", () => {
		const attachment = { name: "pic.png" } as File;
		expect(
			DefaultVariableHandler.handle(
				"${attachmentName}",
				mockApp(),
				pageFile,
				attachment
			)
		).toBe("pic");
	});
});
