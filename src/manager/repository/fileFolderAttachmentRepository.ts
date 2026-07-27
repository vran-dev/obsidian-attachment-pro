import { normalizePath } from "obsidian";
import { AttachmentSaveType } from "src/manager/types";
import { getParentFolderFromTFile } from "src/util/file";
import { AttachmentRepositoryContext } from "./attachmentSaveRepository";
import { BaseAttachmentRepository } from "./baseAttachmentRepository";

export default class FileFolderAttachmentRepository extends BaseAttachmentRepository {
	accept(type: AttachmentSaveType): boolean {
		return type === "FILE_FOLDER";
	}

	protected resolvePath(context: AttachmentRepositoryContext): string {
		const pageParentFolder = getParentFolderFromTFile(context.pageFile);
		return normalizePath(
			`${pageParentFolder}/${context.formattedAttachmentName}`
		);
	}
}
