import { AttachmentSaveStrategyType } from "src/manager/types";
import {
	AttachmentSaveStrategyContext,
	AttachmentSaveStrategyHandler,
} from "./attachmentSaveStrategyHandler";
import PathResolver from "../path/pathResolver";
import { appendOrderIfConflict } from "src/util/file";

export default class CustomizeAttachmentSaveStrategyHandler
	implements AttachmentSaveStrategyHandler
{
	accept(scope: AttachmentSaveStrategyType): boolean {
		return scope == "CUSTOMIZE";
	}

	async handle(context: AttachmentSaveStrategyContext): Promise<string> {
		const buffer = await context.attachmentFile.arrayBuffer();
		const resolver = new PathResolver();
		const fullPath = await resolver.resolveFullPathFromRoot(
			context.formatedAttachmentName,
			context.pageFile,
			context.rule,
			context.app
		);
		const filePath = appendOrderIfConflict(fullPath, context.app);
		const tFile = await app.vault.createBinary(filePath, buffer);
		return context.app.fileManager.generateMarkdownLink(
			tFile,
			context.pageFile.path
		);
	}
}
