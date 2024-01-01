import { AttachmentScope } from "src/manager/types";
import { AttachmentScopeMatcher as AttachmentScopeMatcher } from "./attachmentScopeMatcher";
import { TFile, App } from "obsidian";

export default class AllAttachmentScopeMatcher
	implements AttachmentScopeMatcher
{
	accept(scope: AttachmentScope): boolean {
		return scope.type === "ALL";
	}

	match(
		attachmentFile: File,
		page: TFile,
		scope: AttachmentScope,
		app: App
	): boolean {
		return true;
	}
}
