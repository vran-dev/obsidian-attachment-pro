import { AttachmentScope } from "src/manager/types";
import { AttachmentScopeMatcher } from "./attachmentScopeMatcher";
import { TFile, App } from "obsidian";

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
		const fileActualExtension = attachmentFile.name.split(".").pop();
		if (fileActualExtension === undefined) {
			return false;
		}
		const ranges: { id: string; value: string }[] = scope.ranges || [];
		return ranges.some(
			(extension) => extension.value === fileActualExtension
		);
	}
}
