import { normalizePath } from "obsidian";
import { AttachmentSaveType } from "src/manager/types";
import { AttachmentRepositoryContext } from "./attachmentSaveRepository";
import { BaseAttachmentRepository } from "./baseAttachmentRepository";

export default class VaultfolderAttachmentRepository extends BaseAttachmentRepository {
	accept(type: AttachmentSaveType): boolean {
		return type === "ROOT_FOLDER";
	}

	protected resolvePath(context: AttachmentRepositoryContext): string {
		return normalizePath(context.formattedAttachmentName);
	}
}
