import { AttachmentSaveType } from "src/manager/types";
import {
	AttachmentRepositoryContext,
	AttachmentRepository,
	AttachmentResult,
} from "./attachmentSaveRepository";
import PathResolver from "../path/pathResolver";
import { appendOrderIfConflict } from "src/util/file";

export default class FileSubfolderAttachmentRepository
	implements AttachmentRepository
{
	accept(scope: AttachmentSaveType): boolean {
		return scope == "FILE_SUBFOLDER";
	}

	async save(context: AttachmentRepositoryContext): Promise<AttachmentResult> {
		const buffer = await context.attachmentFile.arrayBuffer();
		const resolver = new PathResolver();
		const fullPath = await resolver.resolveFullPathFromPageDir(
			context.formatedAttachmentName,
			context.pageFile,
			context.rule,
			context.app
		);
		const filePath = appendOrderIfConflict(fullPath, context.app);
		const tFile = await app.vault.createBinary(filePath, buffer);
		const link = context.app.fileManager.generateMarkdownLink(
			tFile,
			context.pageFile.path
		);

		return {
			file: tFile,
			link: link,
		};
	}
}
