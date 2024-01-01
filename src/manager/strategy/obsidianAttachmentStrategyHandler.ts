import { normalizePath } from "obsidian";
import {
	createFolderIfNotExist,
	joinAndAppendOrderIfConflict,
	getParentFolderFromTFile,
	joinFolder,
} from "src/util/file";
import { log } from "src/util/log";
import { AttachmentSaveStrategyContext } from "./attachmentSaveStrategyHandler";

export default class ObsidianAttachmentStrategyHandler {
	async handle(context: AttachmentSaveStrategyContext) {
		log("[Strategy | Obsidian] use obsidian attachment strategy handler");
		// resolve and create folder
		const obsidianAttachmentFolder = normalizePath(
			//@ts-ignore
			context.app.vault.config["attachmentFolderPath"]
		);
		const joinedFolder = joinFolder(
			obsidianAttachmentFolder,
			context.pageFile
		);
		const normalizedFolderPath = normalizePath(joinedFolder);
		await createFolderIfNotExist(normalizedFolderPath, context.app);

		// resolve file path and create file
		const filePath = joinAndAppendOrderIfConflict(
			normalizedFolderPath,
			context.attachmentFile.name,
			context.app
		);
		const fileBuffer = await context.attachmentFile.arrayBuffer();
		const tFile = await context.app.vault.createBinary(
			filePath,
			fileBuffer
		);

		// generate and append markdown link
		const source = getParentFolderFromTFile(context.pageFile);
		const link = context.app.fileManager.generateMarkdownLink(
			tFile,
			source
		);
		context.editor.replaceSelection(link);
	}
}
