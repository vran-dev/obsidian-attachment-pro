import { describe, expect, it } from "vitest";
import { App, TFile } from "obsidian";
import { AttachmentNameFormatters } from "src/manager/format/attachmentNameFormatter";
import {
	AttachmentNameFormat,
	AttachmentNameFormatType,
	AttachmentRule,
} from "src/manager/types";

function mockApp(): App {
	return {
		metadataCache: {
			getFileCache: () => null,
		},
	} as unknown as App;
}

const page = {
	name: "my-note.md",
	basename: "my-note",
	path: "notes/my-note.md",
	extension: "md",
} as TFile;

const attachment = { name: "pic.png" } as File;

function ruleWith(nameFormat: AttachmentNameFormat): AttachmentRule {
	return {
		id: "rule",
		sort: 0,
		enabled: true,
		scopes: [{ id: "s", type: "ALL" }],
		repository: { type: "ROOT_FOLDER" },
		nameFormat,
	};
}

describe("name format 注册表分发", () => {
	it("ORIGINAL 保留原始文件名", () => {
		expect(
			AttachmentNameFormatters.format(
				attachment,
				page,
				ruleWith({ type: "ORIGINAL" }),
				mockApp()
			)
		).toBe("pic.png");
	});

	it("UUID 生成 32 位十六进制文件名并保留扩展名", () => {
		const name = AttachmentNameFormatters.format(
			attachment,
			page,
			ruleWith({ type: "UUID" }),
			mockApp()
		);
		expect(name).toMatch(/^[0-9a-f]{32}\.png$/);
	});

	it("DATETIME 使用配置的 luxon 格式", () => {
		const name = AttachmentNameFormatters.format(
			attachment,
			page,
			ruleWith({ type: "DATETIME", format: "yyyy" }),
			mockApp()
		);
		expect(name).toBe(`${new Date().getFullYear()}.png`);
	});

	it("DATETIME 未配置格式时回退到默认 yyyyMMddHHmmss", () => {
		const name = AttachmentNameFormatters.format(
			attachment,
			page,
			ruleWith({ type: "DATETIME" }),
			mockApp()
		);
		expect(name).toMatch(/^\d{14}\.png$/);
	});

	it("CUSTOMIZE 支持变量模板", () => {
		const name = AttachmentNameFormatters.format(
			attachment,
			page,
			ruleWith({ type: "CUSTOMIZE", format: "${notename}-att" }),
			mockApp()
		);
		expect(name).toBe("my-note-att.png");
	});

	it("CUSTOMIZE 支持 ${attachmentName} 变量", () => {
		const name = AttachmentNameFormatters.format(
			attachment,
			page,
			ruleWith({ type: "CUSTOMIZE", format: "${attachmentName}-copy" }),
			mockApp()
		);
		expect(name).toBe("pic-copy.png");
	});

	it("CUSTOMIZE 在 index > 0 时追加序号，避免批量粘贴撞名", () => {
		const name = AttachmentNameFormatters.format(
			attachment,
			page,
			ruleWith({ type: "CUSTOMIZE", format: "${notename}" }),
			mockApp(),
			2
		);
		expect(name).toBe("my-note-02.png");
	});

	it("未知类型无 formatter 命中时回退为原始文件名", () => {
		const name = AttachmentNameFormatters.format(
			attachment,
			page,
			ruleWith({ type: "NOPE" as AttachmentNameFormatType }),
			mockApp()
		);
		expect(name).toBe("pic.png");
	});
});
