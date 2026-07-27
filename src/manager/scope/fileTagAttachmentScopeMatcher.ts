import { AttachmentScope } from "src/manager/types";
import { AttachmentScopeMatcher } from "./attachmentScopeMatcher";
import { App, TFile } from "obsidian";

export default class FileTagAttachmentScopeMatcher
	implements AttachmentScopeMatcher
{
	accept(scope: AttachmentScope): boolean {
		return scope.type === "FILE_TAG";
	}

	match(
		attachmentFile: File,
		page: TFile,
		scope: AttachmentScope,
		app: App
	): boolean {
		if (scope.type !== "FILE_TAG") {
			return false;
		}
		const fileCache = app.metadataCache.getFileCache(page);
		if (!fileCache) {
			return false;
		}

		// merge tags from content
		const allTags: string[] = [];
		if (fileCache.tags) {
			const tags = fileCache.tags.map((t) => t.tag.substring(1));
			// obsidian tag starts with #, so we need to remove it
			allTags.push(...tags);
		}

		// merge tags from frontmatter
		if (fileCache.frontmatter) {
			const tags = fileCache.frontmatter["tags"];
			if (Array.isArray(tags)) {
				allTags.push(...tags.map(String));
			} else if (typeof tags === "string") {
				allTags.push(...tags.split(",").map((t) => t.trim()));
			}
		}

		const scopeTags = scope.ranges.map((t) => t.value);
		if (scope.operator === "CONTAINS_ALL") {
			return this.isContainsAll(allTags, scopeTags);
		}
		return this.isContainsAny(allTags, scopeTags);
	}

	isContainsAll(fileTags: string[], scopeTags: string[]): boolean {
		return scopeTags.every((tag) => fileTags.includes(tag));
	}

	isContainsAny(fileTags: string[], scopeTags: string[]): boolean {
		return scopeTags.some((tag) => fileTags.includes(tag));
	}
}
