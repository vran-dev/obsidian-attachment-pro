import { App, TFile, normalizePath } from "obsidian";
import DefaultVariableHandler from "../variable/variableHandler";
import {
	createFolderIfNotExist,
	getParentFolderFromTFile,
	sanitizePath,
} from "src/util/file";
import { log } from "src/util/log";

export default class PathResolver {

	/** 解析 FILE_SUBFOLDER：目录 = 笔记所在目录 + 子目录模板（支持 ${...} 变量） */
	async resolveFullPathFromPageDir(
		attachmentName: string,
		pageFile: TFile,
		subfolderTemplate: string,
		app: App
	) {
		// normalize path variables
		let subFolder = sanitizePath(subfolderTemplate);
		subFolder = DefaultVariableHandler.handle(subFolder, app, pageFile);

		// create folder if not exist
		const pageParentFolder = getParentFolderFromTFile(pageFile);
		const fullFolderPath = `${pageParentFolder}/${subFolder}`;
		log("[Before Create Folder] " + fullFolderPath);
		await createFolderIfNotExist(fullFolderPath, app);

		const path = `${fullFolderPath}/${attachmentName}`;
		return normalizePath(path);
	}

	/** 解析 CUSTOMIZE：目录 = 仓库根目录 + 目录模板（支持 ${...} 变量） */
	async resolveFullPathFromRoot(
		attachmentName: string,
		pageFile: TFile,
		folderTemplate: string,
		app: App
	) {
		// normalize path variables
		let folder = sanitizePath(folderTemplate);
		folder = DefaultVariableHandler.handle(folder, app, pageFile);
		log(
			"[Before Create Folder] sanitizePath from " +
				folderTemplate +
				" to " +
				folder
		);
		await createFolderIfNotExist(folder, app);

		const path = `${folder}/${attachmentName}`;
		return normalizePath(path);
	}
}
