import { AttachmentScope } from "src/manager/types";
import { AttachmentScopeMatcher } from "./attachmentScopeMatcher";
import { App, TFile } from "obsidian";
import { log } from "src/util/log";

export default class SpecificFileFolderAttachmentScopeMatcher
	implements AttachmentScopeMatcher
{
	accept(scope: AttachmentScope): boolean {
		return scope.type === "SPECIFIC_FILE_FOLDER";
	}

	match(
		attachmentFile: File,
		page: TFile,
		scope: AttachmentScope,
		app: App
	): boolean {
		const filePath = page.path;
		// @ts-ignore
		const folders = scope.ranges.map((f) => f.value);
		log(
			"[Scope | Specific Folder] folders: " + folders.join(","),
			" filePath: " + filePath
		);
		return this.containsPath(folders, filePath);
	}

	containsPath(folders: string[], filePath: string): boolean {
		return folders.some((folder) => filePath.startsWith(folder));
	}
}
