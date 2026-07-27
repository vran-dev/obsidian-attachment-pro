import { describe, expect, it, vi } from "vitest";
import { App, TFile } from "obsidian";
import {
	AttachmentRepositories,
	AttachmentRepositoryContext,
	attachmentRepositories,
} from "src/manager/repository/attachmentSaveRepository";
import CustomizeAttachmentRepository from "src/manager/repository/customizeAttachmentRepository";
import FileFolderAttachmentRepository from "src/manager/repository/fileFolderAttachmentRepository";
import FileSubfolderAttachmentRepository from "src/manager/repository/fileSubfolderAttachmentRepository";
import ObsidianAttachmentRepository from "src/manager/repository/obsidianAttachmentRepository";
import VaultfolderAttachmentRepository from "src/manager/repository/vaultfolderAttachmentRepository";
import {
	AttachmentRepositorySetting,
	AttachmentRule,
	AttachmentSaveType,
} from "src/manager/types";

function mockApp(options?: {
	existing?: string[];
	attachmentFolderPath?: string;
}) {
	const exists = new Set(options?.existing ?? []);
	const created = { folders: [] as string[], binaries: [] as string[] };
	const app = {
		metadataCache: {
			getFileCache: () => null,
		},
		vault: {
			config:
				options?.attachmentFolderPath === undefined
					? undefined
					: { attachmentFolderPath: options.attachmentFolderPath },
			getAbstractFileByPath: (p: string) =>
				exists.has(p) ? { path: p } : null,
			createFolder: async (p: string) => {
				created.folders.push(p);
				exists.add(p);
			},
			createBinary: async (p: string, buffer: ArrayBuffer) => {
				expect(buffer.byteLength).toBeGreaterThan(0);
				created.binaries.push(p);
				exists.add(p);
				const name = p.split("/").pop() ?? p;
				const dot = name.lastIndexOf(".");
				return {
					path: p,
					name,
					basename: dot === -1 ? name : name.substring(0, dot),
					extension: dot === -1 ? "" : name.substring(dot + 1),
				} as TFile;
			},
			adapter: {
				getResourcePath: (p: string) => `app://mock/${p}`,
			},
		},
	} as unknown as App;
	return { app, created };
}

const page = {
	path: "notes/page.md",
	name: "page.md",
	basename: "page",
	extension: "md",
	parent: { path: "notes" },
} as unknown as TFile;

const attachment = {
	name: "pic.png",
	arrayBuffer: async () => new ArrayBuffer(8),
} as unknown as File;

function buildContext(
	app: App,
	repository: AttachmentRepositorySetting,
	formattedAttachmentName = "pic.png"
): AttachmentRepositoryContext {
	const rule: AttachmentRule = {
		id: "rule",
		sort: 0,
		enabled: true,
		scopes: [{ id: "s", type: "ALL" }],
		repository,
		nameFormat: { type: "ORIGINAL" },
	};
	return {
		attachmentFile: attachment,
		formattedAttachmentName,
		pageFile: page,
		rule,
		app,
	};
}

describe("repository 注册表分发", () => {
	it("每种存储类型都被且仅被对应仓库接受（含兜底 OBSIDIAN_DEFAULT）", () => {
		const cases: {
			type: AttachmentSaveType;
			repository: new () => unknown;
		}[] = [
			{ type: "ROOT_FOLDER", repository: VaultfolderAttachmentRepository },
			{ type: "FILE_FOLDER", repository: FileFolderAttachmentRepository },
			{
				type: "FILE_SUBFOLDER",
				repository: FileSubfolderAttachmentRepository,
			},
			{ type: "CUSTOMIZE", repository: CustomizeAttachmentRepository },
			{
				type: "OBSIDIAN_DEFAULT",
				repository: ObsidianAttachmentRepository,
			},
		];
		for (const { type, repository } of cases) {
			const accepted = attachmentRepositories.filter((r) =>
				r.accept(type)
			);
			expect(accepted).toHaveLength(1);
			expect(accepted[0]).toBeInstanceOf(repository);
		}
	});

	it("未知类型抛错且不调用 onSave（不静默丢弃附件）", async () => {
		const { app } = mockApp();
		const onSave = vi.fn();
		const context = buildContext(
			app,
			{ type: "NOPE" } as unknown as AttachmentRepositorySetting
		);
		await expect(
			AttachmentRepositories.handle(context, onSave)
		).rejects.toThrow(/no repository matched/);
		expect(onSave).not.toHaveBeenCalled();
	});

	it("命中仓库后保存并把结果传给 onSave", async () => {
		const { app, created } = mockApp();
		const onSave = vi.fn();
		await AttachmentRepositories.handle(
			buildContext(app, { type: "ROOT_FOLDER" }),
			onSave
		);
		expect(created.binaries).toEqual(["pic.png"]);
		expect(onSave).toHaveBeenCalledWith(
			expect.objectContaining({ link: "![[pic.png]]" })
		);
	});
});

describe("各仓库路径解析（save 模板流程由基类固化）", () => {
	it("ROOT_FOLDER：直接存到仓库根目录", async () => {
		const { app, created } = mockApp();
		const result = await new VaultfolderAttachmentRepository().save(
			buildContext(app, { type: "ROOT_FOLDER" })
		);
		expect(created.binaries).toEqual(["pic.png"]);
		expect(result.link).toBe("![[pic.png]]");
	});

	it("同名冲突时追加 _N 序号", async () => {
		const { app, created } = mockApp({
			existing: ["pic.png", "pic_1.png"],
		});
		await new VaultfolderAttachmentRepository().save(
			buildContext(app, { type: "ROOT_FOLDER" })
		);
		expect(created.binaries).toEqual(["pic_2.png"]);
	});

	it("FILE_FOLDER：存到笔记所在目录", async () => {
		const { app, created } = mockApp();
		await new FileFolderAttachmentRepository().save(
			buildContext(app, { type: "FILE_FOLDER" })
		);
		expect(created.binaries).toEqual(["notes/pic.png"]);
	});

	it("FILE_SUBFOLDER：存到笔记目录下的子目录并自动建目录", async () => {
		const { app, created } = mockApp();
		await new FileSubfolderAttachmentRepository().save(
			buildContext(app, { type: "FILE_SUBFOLDER", path: "img" })
		);
		expect(created.folders).toEqual(["notes/img"]);
		expect(created.binaries).toEqual(["notes/img/pic.png"]);
	});

	it("FILE_SUBFOLDER：子目录模板支持 ${...} 变量", async () => {
		const { app, created } = mockApp();
		await new FileSubfolderAttachmentRepository().save(
			buildContext(app, {
				type: "FILE_SUBFOLDER",
				path: "img/${notename}",
			})
		);
		expect(created.binaries).toEqual(["notes/img/page/pic.png"]);
	});

	it("FILE_SUBFOLDER：与规则类型不符时抛错（防御 accept 之外的误用）", async () => {
		const { app } = mockApp();
		await expect(
			new FileSubfolderAttachmentRepository().save(
				buildContext(app, { type: "ROOT_FOLDER" })
			)
		).rejects.toThrow(/cannot handle repository type/);
	});

	it("CUSTOMIZE：存到相对仓库根目录的模板路径", async () => {
		const { app, created } = mockApp();
		await new CustomizeAttachmentRepository().save(
			buildContext(app, {
				type: "CUSTOMIZE",
				path: "Resources/${notename}",
			})
		);
		expect(created.folders).toEqual(["Resources/page"]);
		expect(created.binaries).toEqual(["Resources/page/pic.png"]);
	});

	it("OBSIDIAN_DEFAULT：读取 Obsidian 原生附件目录配置", async () => {
		const { app, created } = mockApp({ attachmentFolderPath: "assets" });
		const result = await new ObsidianAttachmentRepository().save(
			buildContext(app, { type: "OBSIDIAN_DEFAULT" })
		);
		expect(created.folders).toEqual(["assets"]);
		expect(created.binaries).toEqual(["assets/pic.png"]);
		expect(result.link).toBe("![[pic.png]]");
	});

	it("OBSIDIAN_DEFAULT：未配置附件目录时落在仓库根目录", async () => {
		const { app, created } = mockApp({ existing: ["/"] });
		await new ObsidianAttachmentRepository().save(
			buildContext(app, { type: "OBSIDIAN_DEFAULT" })
		);
		expect(created.folders).toEqual([]);
		expect(created.binaries).toEqual(["/pic.png"]);
	});
});
