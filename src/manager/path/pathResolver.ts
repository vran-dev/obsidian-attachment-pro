import { App, TFile, normalizePath } from "obsidian";
import { AttachmentRule } from "../types";
import DefaultVariableHandler from "../variable/variableHandler";
import {
	createFolderIfNotExist,
	getParentFolderFromTFile,
	sanitizePath,
} from "src/util/file";
import { log } from "src/util/log";

export default class PathResolver {

	async resolveFullPathFromPageDir(
		attachmentName: string,
		pageFile: TFile,
		rule: AttachmentRule,
		app: App
	) {
		// normalize path variables
		let subFolder = sanitizePath(rule.strategy.path);
		subFolder = DefaultVariableHandler.handle(subFolder, app, pageFile);

		// create folder if not exist
		const pageParentFolder = getParentFolderFromTFile(pageFile);
		const fullFolderPath = `${pageParentFolder}/${subFolder}`;
		log("[Before Create Folder] " + fullFolderPath);
		await createFolderIfNotExist(fullFolderPath, app);

		const path = `${fullFolderPath}/${attachmentName}`;
		return normalizePath(path);
	}

	async resolveFullPathFromRoot(
		attachmentName: string,
		pageFile: TFile,
		rule: AttachmentRule,
		app: App
	) {
		// normalize path variables
		let folder = sanitizePath(rule.strategy.path);
		folder = DefaultVariableHandler.handle(folder, app, pageFile);
		log(
			"[Before Create Folder] saniziPath from " +
				rule.strategy.path +
				" to " +
				folder
		);
		await createFolderIfNotExist(folder, app);

		const path = `${folder}/${attachmentName}`;
		return normalizePath(path);
	}
}
