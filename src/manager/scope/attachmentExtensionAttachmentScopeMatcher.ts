import { AttachmentScope } from "src/manager/types";
import { AttachmentScopeMatcher } from "./attachmentScopeMatcher";
import { App, TFile } from "obsidian";

export default class AttachmentExtensionAttachmentScopeHandler
	implements AttachmentScopeMatcher
{
	accept(scope: AttachmentScope): boolean {
		return scope.type === "ATTACHMENT_FILE_EXTENSION";
	}

	match(
		attachmentFile: File,
		page: TFile,
		scope: AttachmentScope,
		app: App
	): boolean {
		if (scope.type !== "ATTACHMENT_FILE_EXTENSION") {
			return false;
		}
		const fileActualExtension = attachmentFile.name.split(".").pop();
		if (fileActualExtension === undefined) {
			return false;
		}
		return scope.ranges.some(
			(extension) => extension.value === fileActualExtension
		);
	}
}
