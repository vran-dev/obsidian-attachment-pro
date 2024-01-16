import { AttachmentSaveType } from "src/manager/types";
import {
	AttachmentRepositoryContext,
	AttachmentRepository,
	AttachmentResult,
} from "./attachmentSaveRepository";
import { normalizePath } from "obsidian";
import { appendOrderIfConflict } from "src/util/file";

export default class VaultfolderAttachmentRepository
	implements AttachmentRepository
{
	accept(scope: AttachmentSaveType): boolean {
		return scope == "ROOT_FOLDER";
	}

	async save(context: AttachmentRepositoryContext): Promise<AttachmentResult> {
		const buffer = await context.attachmentFile.arrayBuffer();
		const fullPath = normalizePath(context.formatedAttachmentName);
		const filePath = appendOrderIfConflict(fullPath, context.app);
		const tFile = await context.app.vault.createBinary(filePath, buffer);
		const link = context.app.fileManager.generateMarkdownLink(
			tFile,
			context.pageFile.path
		);
		return {
			file: tFile,
			link: link,
		};
	}

	async resolePath(attachmentName: string) {
		const path = `${attachmentName}`;
		return normalizePath(path);
	}
}
