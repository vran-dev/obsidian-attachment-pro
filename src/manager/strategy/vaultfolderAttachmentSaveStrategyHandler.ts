import { AttachmentSaveStrategyType } from "src/manager/types";
import {
	AttachmentSaveStrategyContext,
	AttachmentSaveStrategyHandler,
} from "./attachmentSaveStrategyHandler";
import { normalizePath } from "obsidian";
import { appendOrderIfConflict } from "src/util/file";

export default class VaultfolderAttachmentSaveStrategyHandler
	implements AttachmentSaveStrategyHandler
{
	accept(scope: AttachmentSaveStrategyType): boolean {
		return scope == "ROOT_FOLDER";
	}

	async handle(context: AttachmentSaveStrategyContext): Promise<string> {
		const buffer = await context.attachmentFile.arrayBuffer();
		const fullPath = normalizePath(context.formatedAttachmentName);
		const filePath = appendOrderIfConflict(fullPath, context.app);
		const tFile = await context.app.vault.createBinary(filePath, buffer);
		return app.fileManager.generateMarkdownLink(
			tFile,
			context.pageFile.path
		);
	}

	async resolePath(attachmentName: string) {
		const path = `${attachmentName}`;
		return normalizePath(path);
	}
}
