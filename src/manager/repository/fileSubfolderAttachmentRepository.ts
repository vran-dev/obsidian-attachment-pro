import { AttachmentSaveType } from "src/manager/types";
import PathResolver from "../path/pathResolver";
import { AttachmentRepositoryContext } from "./attachmentSaveRepository";
import { BaseAttachmentRepository } from "./baseAttachmentRepository";

export default class FileSubfolderAttachmentRepository extends BaseAttachmentRepository {
	accept(type: AttachmentSaveType): boolean {
		return type === "FILE_SUBFOLDER";
	}

	protected resolvePath(
		context: AttachmentRepositoryContext
	): Promise<string> {
		const { repository } = context.rule;
		if (repository.type !== "FILE_SUBFOLDER") {
			throw new Error(
				`FileSubfolderAttachmentRepository cannot handle repository type "${repository.type}"`
			);
		}
		return new PathResolver().resolveFullPathFromPageDir(
			context.formattedAttachmentName,
			context.pageFile,
			repository.path,
			context.app
		);
	}
}
