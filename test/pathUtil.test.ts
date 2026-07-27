import { describe, expect, it } from "vitest";
import { App, TFile } from "obsidian";
import {
	appendOrderIfConflict,
	getParentFolderFromTFile,
	joinFile,
	joinFolder,
	sanitizePath,
} from "src/util/file";

function appWithFiles(...paths: string[]): App {
	const exists = new Set(paths);
	return {
		vault: {
			getAbstractFileByPath: (p: string) =>
				exists.has(p) ? { path: p } : null,
		},
	} as unknown as App;
}

describe("sanitizePath", () => {
	it("去除末尾斜杠（含多个）", () => {
		expect(sanitizePath("a/b/")).toBe("a/b");
		expect(sanitizePath("a/b///")).toBe("a/b");
	});

	it("去除 ./ 前缀中的点", () => {
		expect(sanitizePath("./img")).toBe("/img");
	});

	it("空值原样返回", () => {
		expect(sanitizePath("")).toBe("");
	});

	it("正常路径原样返回", () => {
		expect(sanitizePath("a/b/c")).toBe("a/b/c");
	});
});

describe("joinFolder / joinFile", () => {
	const page = {
		path: "notes/page.md",
		parent: { path: "notes" },
	} as unknown as TFile;

	it("空目录表示仓库根目录", () => {
		expect(joinFolder("", page)).toBe("/");
		expect(joinFolder("  ", page)).toBe("/");
	});

	it("./ 前缀表示相对笔记所在目录", () => {
		expect(joinFolder("./img", page)).toBe("notes/img");
	});

	it("/ 前缀与普通目录原样返回", () => {
		expect(joinFolder("/abs", page)).toBe("/abs");
		expect(joinFolder("assets", page)).toBe("assets");
	});

	it("joinFile 处理目录是否带尾部斜杠", () => {
		expect(joinFile("a", "b.png")).toBe("a/b.png");
		expect(joinFile("a/", "b.png")).toBe("a/b.png");
	});
});

describe("getParentFolderFromTFile", () => {
	it("有父目录时返回其路径", () => {
		const file = { parent: { path: "notes" } } as unknown as TFile;
		expect(getParentFolderFromTFile(file)).toBe("notes");
	});

	it("无父目录时返回空串", () => {
		const file = { parent: null } as unknown as TFile;
		expect(getParentFolderFromTFile(file)).toBe("");
	});
});

describe("appendOrderIfConflict", () => {
	it("无冲突时保持原路径", () => {
		expect(appendOrderIfConflict("a/pic.png", appWithFiles())).toBe(
			"a/pic.png"
		);
	});

	it("冲突时在扩展名前追加 _N", () => {
		expect(
			appendOrderIfConflict("a/pic.png", appWithFiles("a/pic.png"))
		).toBe("a/pic_1.png");
		expect(
			appendOrderIfConflict(
				"a/pic.png",
				appWithFiles("a/pic.png", "a/pic_1.png")
			)
		).toBe("a/pic_2.png");
	});

	it("无扩展名的文件直接在末尾追加 _N", () => {
		expect(appendOrderIfConflict("pic", appWithFiles("pic"))).toBe(
			"pic_1"
		);
	});
});
