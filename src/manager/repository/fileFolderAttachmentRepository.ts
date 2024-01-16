import { AttachmentSaveType } from "src/manager/types";
import {
	AttachmentRepositoryContext,
	AttachmentRepository,
	AttachmentResult,
} from "./attachmentSaveRepository";
import { TFile, normalizePath } from "obsidian";
import { appendOrderIfConflict, getParentFolderFromTFile } from "src/util/file";

export default class FileFolderAttachmentRepository
	implements AttachmentRepository
{
	accept(scope: AttachmentSaveType): boolean {
		return scope == "FILE_FOLDER";
	}

	async save(context: AttachmentRepositoryContext): Promise<AttachmentResult> {
		const buffer = await context.attachmentFile.arrayBuffer();
		const fullPath = this.resolePath(
			context.formatedAttachmentName,
			context.pageFile
		);
		const filePath = appendOrderIfConflict(fullPath, context.app);
		const tFile = await context.app.vault.createBinary(filePath, buffer);
		const link =  context.app.fileManager.generateMarkdownLink(
			tFile,
			context.pageFile.path
		);
		return {
			file: tFile,
			link: link
		}
	}

	resolePath(attachmentName: string, pageFile: TFile) {
		const pageParentFolder = getParentFolderFromTFile(pageFile);
		const path = `${pageParentFolder}/${attachmentName}`;
		return normalizePath(path);
	}
}
