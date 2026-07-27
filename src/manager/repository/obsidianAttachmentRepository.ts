import { Vault, normalizePath } from "obsidian";
import { AttachmentSaveType } from "src/manager/types";
import { createFolderIfNotExist, joinFile, joinFolder } from "src/util/file";
import { log } from "src/util/log";
import { AttachmentRepositoryContext } from "./attachmentSaveRepository";
import { BaseAttachmentRepository } from "./baseAttachmentRepository";

/** Obsidian 未在公开 API 中暴露 vault.config，这里只声明用到的字段 */
type VaultWithConfig = Vault & {
	config?: { attachmentFolderPath?: string };
};

/**
 * 兜底仓库：附件存入 Obsidian 原生「附件默认存放位置」配置的目录。
 * 与其他仓库同样注册在 attachmentRepositories 中，type 为 OBSIDIAN_DEFAULT。
 */
export default class ObsidianAttachmentRepository extends BaseAttachmentRepository {
	accept(type: AttachmentSaveType): boolean {
		return type === "OBSIDIAN_DEFAULT";
	}

	protected async resolvePath(
		context: AttachmentRepositoryContext
	): Promise<string> {
		log(
			"[Repository | Obsidian] use obsidian attachment repository to save attachment"
		);
		const vault = context.app.vault as VaultWithConfig;
		const obsidianAttachmentFolder = normalizePath(
			vault.config?.attachmentFolderPath ?? ""
		);
		const joinedFolder = joinFolder(
			obsidianAttachmentFolder,
			context.pageFile
		);
		const normalizedFolderPath = normalizePath(joinedFolder);
		await createFolderIfNotExist(normalizedFolderPath, context.app);

		return joinFile(normalizedFolderPath, context.formattedAttachmentName);
	}
}
