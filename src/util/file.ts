import { App, TFile, normalizePath } from "obsidian";
import { log } from "./log";

export function getParentFolderFromTFile(file: TFile) {
	const pageParent = file.parent;
	let pageParentFolder;
	if (pageParent == null) {
		pageParentFolder = "";
	} else {
		pageParentFolder = pageParent.path;
	}
	return pageParentFolder;
}

export async function createFolderIfNotExist(path: string, app: App) {
	const normalizedPath = normalizePath(path);
	const file = app.vault.getAbstractFileByPath(normalizedPath);
	log("get folder by path: ", normalizedPath, " result: ", file);
	if (file == null) {
		log("folder not exists, create folder: ", path);
		await app.vault.createFolder(path);
	}
}

export function sanitizePath(path: string) {
	if (path == null || path.trim() == "") {
		return path;
	}

	let sanitizedPath = path;
	while (sanitizedPath.endsWith("/")) {
		sanitizedPath = sanitizedPath.substring(0, sanitizedPath.length - 1);
	}

	if (sanitizedPath.startsWith("./")) {
		sanitizedPath = sanitizedPath.substring(1);
	}
	return sanitizedPath;
}

export function relativeToAbsolutePath(path: string, file: TFile) {
	if (path.startsWith("./")) {
		return file.parent?.path + path.substring(1);
	} else if (!path.startsWith("/")) {
		return file.parent?.path + "/" + path;
	} else {
		return path;
	}
}

export function removeLastSlash(path: string) {
	if (path.endsWith("/")) {
		return path.substring(0, path.length - 1);
	} else {
		return path;
	}
}

export function joinFolder(folder: string, file: TFile) {
	// root
	if (folder.trim() == "") {
		return "/";
	}
	// relative by file
	const parentFolder = getParentFolderFromTFile(file);
	if (folder.startsWith("./")) {
		return parentFolder + folder.substring(1);
	}
	// root
	if (folder.startsWith("/")) {
		return folder;
	}
	return folder;
}

export function joinFile(folder: string, fileName: string) {
	if (folder.endsWith("/")) {
		return folder + fileName;
	} else {
		return folder + "/" + fileName;
	}
}

export function joinAndAppendOrderIfConflict(
	folder: string,
	fileName: string,
	app: App
) {
	const filePath = joinFile(folder, fileName);
	const file = app.vault.getAbstractFileByPath(filePath);
	if (file == null) {
		return filePath;
	}

	let baseName;
	let fileExtension;
	if (fileName.lastIndexOf(".") == -1) {
		baseName = fileName;
		fileExtension = "";
	} else {
		baseName = fileName.substring(0, fileName.lastIndexOf("."));
		fileExtension = fileName.substring(fileName.lastIndexOf("."));
	}

	let order = 1;
	let newFileName = baseName + "_" + order + fileExtension;
	let newFilePath = joinFile(folder, newFileName);
	while (app.vault.getAbstractFileByPath(newFilePath)) {
		order++;
		newFileName = baseName + "_" + order + fileExtension;
		newFilePath = joinFile(folder, newFileName);
		if (order > 1000) {
			throw new Error("too many conflict files, please check your vault");
		}
	}
	return newFilePath;
}

export function appendOrderIfConflict(fileName: string, app: App): string {
	let baseName;
	let fileExtension;
	if (fileName.lastIndexOf(".") == -1) {
		baseName = fileName;
		fileExtension = "";
	} else {
		baseName = fileName.substring(0, fileName.lastIndexOf("."));
		fileExtension = fileName.substring(fileName.lastIndexOf("."));
	}

	let order = 0;
	let newFileName = fileName;
	while (app.vault.getAbstractFileByPath(newFileName)) {
		order++;
		newFileName = baseName + "_" + order + fileExtension;
		if (order > 1000) {
			throw new Error("too many conflict files, please check your vault");
		}
	}
	return newFileName;
}
