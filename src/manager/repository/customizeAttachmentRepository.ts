import { AttachmentSaveType } from "src/manager/types";
import PathResolver from "../path/pathResolver";
import { AttachmentRepositoryContext } from "./attachmentSaveRepository";
import { BaseAttachmentRepository } from "./baseAttachmentRepository";

export default class CustomizeAttachmentRepository extends BaseAttachmentRepository {
	accept(type: AttachmentSaveType): boolean {
		return type === "CUSTOMIZE";
	}

	protected resolvePath(
		context: AttachmentRepositoryContext
	): Promise<string> {
		const { repository } = context.rule;
		if (repository.type !== "CUSTOMIZE") {
			throw new Error(
				`CustomizeAttachmentRepository cannot handle repository type "${repository.type}"`
			);
		}
		return new PathResolver().resolveFullPathFromRoot(
			context.formattedAttachmentName,
			context.pageFile,
			repository.path,
			context.app
		);
	}
}
