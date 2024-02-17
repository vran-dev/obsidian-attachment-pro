import { normalizePath } from "obsidian";
import {
	createFolderIfNotExist,
	joinAndAppendOrderIfConflict,
	joinFolder,
} from "src/util/file";
import { log } from "src/util/log";
import { AttachmentRepositoryContext, AttachmentResult } from "./attachmentSaveRepository";

export default class ObsidianAttachmentRepository {
	async handle(context: AttachmentRepositoryContext): Promise<AttachmentResult> {
		log("[Repository | Obsidian] use obsidian attachment repository to save attachment");
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
