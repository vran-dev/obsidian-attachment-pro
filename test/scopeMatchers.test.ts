import { describe, expect, it } from "vitest";
import { App, TFile } from "obsidian";
import {
	AttachmentScopeMatchers,
	matchers,
} from "src/manager/scope/attachmentScopeMatcher";
import AllAttachmentScopeMatcher from "src/manager/scope/allAttachmentScopeMatcher";
import AttachmentExtensionAttachmentScopeHandler from "src/manager/scope/attachmentExtensionAttachmentScopeMatcher";
import CustomizeAttachmentScopeMatcher from "src/manager/scope/customizeAttachmentScopeMatcher";
import FileTagAttachmentScopeMatcher from "src/manager/scope/fileTagAttachmentScopeMatcher";
import SpecificFileFolderAttachmentScopeMatcher from "src/manager/scope/specificFolderAttachmentScopeMatcher";
import { AttachmentScope, ScopeRangeItem } from "src/manager/types";

function mockApp(cache: unknown = null): App {
	return {
		metadataCache: {
			getFileCache: () => cache,
		},
	} as unknown as App;
}

const page = {
	path: "notes/sub/page.md",
	name: "page.md",
	basename: "page",
	extension: "md",
} as TFile;

const attachment = { name: "img.png" } as File;

function ranges(...values: string[]): ScopeRangeItem[] {
	return values.map((value, i) => ({ id: String(i), value }));
}

describe("scope 注册表分发", () => {
	it("每种作用域类型都被且仅被对应匹配器接受", () => {
		const cases: { scope: AttachmentScope; matcher: new () => unknown }[] = [
			{ scope: { id: "1", type: "ALL" }, matcher: AllAttachmentScopeMatcher },
			{
				scope: { id: "2", type: "CUSTOMIZE" },
				matcher: CustomizeAttachmentScopeMatcher,
			},
			{
				scope: {
					id: "3",
					type: "ATTACHMENT_FILE_EXTENSION",
					ranges: [],
				},
				matcher: AttachmentExtensionAttachmentScopeHandler,
			},
			{
				scope: { id: "4", type: "SPECIFIC_FILE_FOLDER", ranges: [] },
				matcher: SpecificFileFolderAttachmentScopeMatcher,
			},
			{
				scope: {
					id: "5",
					type: "FILE_TAG",
					ranges: [],
					operator: "CONTAINS_ANY",
				},
				matcher: FileTagAttachmentScopeMatcher,
			},
		];
		for (const { scope, matcher } of cases) {
			const accepted = matchers.filter((m) => m.accept(scope));
			expect(accepted).toHaveLength(1);
			expect(accepted[0]).toBeInstanceOf(matcher);
		}
	});
});

describe("AttachmentScopeMatchers.isAllMatch", () => {
	it("无作用域时视为命中", () => {
		expect(
			AttachmentScopeMatchers.isAllMatch(attachment, page, [], mockApp())
		).toBe(true);
	});

	it("ALL 作用域恒命中", () => {
		expect(
			AttachmentScopeMatchers.isAllMatch(
				attachment,
				page,
				[{ id: "1", type: "ALL" }],
				mockApp()
			)
		).toBe(true);
	});

	it("多个作用域是 AND 语义", () => {
		const scopes: AttachmentScope[] = [
			{ id: "1", type: "ALL" },
			{
				id: "2",
				type: "ATTACHMENT_FILE_EXTENSION",
				ranges: ranges("jpg"),
			},
		];
		expect(
			AttachmentScopeMatchers.isAllMatch(
				attachment,
				page,
				scopes,
				mockApp()
			)
		).toBe(false);
	});

	it("CUSTOMIZE 作用域未实现，恒不命中", () => {
		expect(
			AttachmentScopeMatchers.isAllMatch(
				attachment,
				page,
				[{ id: "1", type: "CUSTOMIZE" }],
				mockApp()
			)
		).toBe(false);
	});
});

describe("扩展名作用域", () => {
	const matcher = new AttachmentExtensionAttachmentScopeHandler();

	it("附件扩展名在取值列表内时命中", () => {
		const scope: AttachmentScope = {
			id: "1",
			type: "ATTACHMENT_FILE_EXTENSION",
			ranges: ranges("png", "jpg"),
		};
		expect(matcher.match(attachment, page, scope, mockApp())).toBe(true);
	});

	it("不在取值列表内时不命中", () => {
		const scope: AttachmentScope = {
			id: "1",
			type: "ATTACHMENT_FILE_EXTENSION",
			ranges: ranges("jpg"),
		};
		expect(matcher.match(attachment, page, scope, mockApp())).toBe(false);
	});
});

describe("指定目录作用域", () => {
	const matcher = new SpecificFileFolderAttachmentScopeMatcher();

	it("笔记路径以配置目录开头时命中", () => {
		const scope: AttachmentScope = {
			id: "1",
			type: "SPECIFIC_FILE_FOLDER",
			ranges: ranges("notes"),
		};
		expect(matcher.match(attachment, page, scope, mockApp())).toBe(true);
	});

	it("目录不匹配时不命中", () => {
		const scope: AttachmentScope = {
			id: "1",
			type: "SPECIFIC_FILE_FOLDER",
			ranges: ranges("assets"),
		};
		expect(matcher.match(attachment, page, scope, mockApp())).toBe(false);
	});
});

describe("标签作用域", () => {
	const matcher = new FileTagAttachmentScopeMatcher();

	function tagScope(
		operator: "CONTAINS_ALL" | "CONTAINS_ANY",
		...tags: string[]
	): AttachmentScope {
		return { id: "1", type: "FILE_TAG", operator, ranges: ranges(...tags) };
	}

	it("正文标签参与匹配（去掉 # 前缀）", () => {
		const app = mockApp({ tags: [{ tag: "#work" }] });
		expect(
			matcher.match(attachment, page, tagScope("CONTAINS_ANY", "work"), app)
		).toBe(true);
	});

	it("frontmatter 数组标签参与匹配", () => {
		const app = mockApp({ frontmatter: { tags: ["a", "b"] } });
		expect(
			matcher.match(
				attachment,
				page,
				tagScope("CONTAINS_ALL", "a", "b"),
				app
			)
		).toBe(true);
	});

	it("frontmatter 逗号分隔字符串标签参与匹配", () => {
		const app = mockApp({ frontmatter: { tags: "a, b" } });
		expect(
			matcher.match(
				attachment,
				page,
				tagScope("CONTAINS_ALL", "a", "b"),
				app
			)
		).toBe(true);
	});

	it("CONTAINS_ALL 要求全部包含", () => {
		const app = mockApp({ tags: [{ tag: "#work" }] });
		expect(
			matcher.match(
				attachment,
				page,
				tagScope("CONTAINS_ALL", "work", "life"),
				app
			)
		).toBe(false);
	});

	it("CONTAINS_ANY 命中其一即可", () => {
		const app = mockApp({ tags: [{ tag: "#work" }] });
		expect(
			matcher.match(
				attachment,
				page,
				tagScope("CONTAINS_ANY", "work", "life"),
				app
			)
		).toBe(true);
	});

	it("文件无缓存时不命中", () => {
		expect(
			matcher.match(
				attachment,
				page,
				tagScope("CONTAINS_ANY", "work"),
				mockApp(null)
			)
		).toBe(false);
	});
});
