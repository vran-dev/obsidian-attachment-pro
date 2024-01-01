import { App, TFile } from "obsidian";
import { AttachmentScope } from "src/manager/types";
import AllAttachmentScopeMatcher from "./allAttachmentScopeMatcher";
import FileTagAttachmentScopeMatcher from "./fileTagAttachmentScopeMatcher";
import AttachmentExtensionAttachmentScopeHandler from "./attachmentExtensionAttachmentScopeMatcher";
import CustomizeAttachmentScopeMatcher from "./customizeAttachmentScopeMatcher";
import { log } from "src/util/log";
import SpecificFileFolderAttachmentScopeMatcher from "./spcificFolderAttachmentScopeMatcher";

export interface AttachmentScopeMatcher {
	accept(scope: AttachmentScope): boolean;

	match(
		attachmentFile: File,
		page: TFile,
		scope: AttachmentScope,
		app: App
	): boolean;
}

export const matchers: AttachmentScopeMatcher[] = [
	new AllAttachmentScopeMatcher(),
	new FileTagAttachmentScopeMatcher(),
	new AttachmentExtensionAttachmentScopeHandler(),
	new CustomizeAttachmentScopeMatcher(),
	new SpecificFileFolderAttachmentScopeMatcher(),
];

export class AttachmentScopeMatchers {
	static isAllMatch(
		attachmentFile: File,
		page: TFile,
		scopes: AttachmentScope[],
		app: App
	): boolean {
		if (scopes.length === 0) {
			log("[No Scope] attachmentFile=" + attachmentFile.name, page.name);
			return true;
		}

		const allMatch = scopes.every((scope) => {
			const matcher = matchers.find((h) => h.accept(scope));
			if (matcher) {
				const r = matcher.match(attachmentFile, page, scope, app);
				log(
					"[Scope Matcher] match result is " +
						r +
						", attachment=" +
						attachmentFile.name,
					scope
				);
				return r;
			} else {
				log(
					"[No Scope Matcher] attachmentFile=" + attachmentFile.name,
					scope,
					page.name
				);
				return false;
			}
		});
		return allMatch;
	}
}
