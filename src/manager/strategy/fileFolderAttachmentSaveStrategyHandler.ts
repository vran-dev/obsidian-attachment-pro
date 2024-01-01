import { AttachmentSaveStrategyType } from "src/manager/types";
import {
	AttachmentSaveStrategyContext,
	AttachmentSaveStrategyHandler,
} from "./attachmentSaveStrategyHandler";
import { TFile, normalizePath } from "obsidian";
import { appendOrderIfConflict, getParentFolderFromTFile } from "src/util/file";

export default class FileFolderAttachmentSaveStrategyHandler
	implements AttachmentSaveStrategyHandler
{
	accept(scope: AttachmentSaveStrategyType): boolean {
		return scope == "FILE_FOLDER";
	}

	async handle(context: AttachmentSaveStrategyContext): Promise<string> {
		const buffer = await context.attachmentFile.arrayBuffer();
		const fullPath = this.resolePath(
			context.formatedAttachmentName,
			context.pageFile
		);
		const filePath = appendOrderIfConflict(fullPath, context.app);
		const tFile = await context.app.vault.createBinary(filePath, buffer);
		return context.app.fileManager.generateMarkdownLink(
			tFile,
			context.pageFile.path
		);
	}

	resolePath(attachmentName: string, pageFile: TFile) {
		const pageParentFolder = getParentFolderFromTFile(pageFile);
		const path = `${pageParentFolder}/${attachmentName}`;
		return normalizePath(path);
	}
}
