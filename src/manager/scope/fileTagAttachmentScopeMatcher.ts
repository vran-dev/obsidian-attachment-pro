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
		const fileCache = app.metadataCache.getFileCache(page);
		if (!fileCache) {
			return false;
		}

		// merge tags from content
		const allTags = [];
		if (fileCache.tags) {
			const tags = fileCache.tags.map((t) => t.tag.substring(1));
			// obsidian tag starts with #, so we need to remove it
			allTags.push(...tags);
		}

		// merge tags from frontmatter
		if (fileCache.frontmatter) {
			const tags = fileCache.frontmatter["tags"];
			allTags.push(...tags);
		}

		if (scope.operator === "CONTAINS_ALL") {
			// @ts-ignore
			return this.isContainsAll(allTags, scope.ranges.map((t) => t.value));
		} else {
			// @ts-ignore
			return this.isContainsAny(allTags, scope.ranges.map((t) => t.value));
		}
	}

	isContainsAll(fileTags: string[], scopeTags: string[]): boolean {
		return scopeTags.every((tag) => fileTags.contains(tag));
	}

	isContainsAny(fileTags: string[], scopeTags: string[]): boolean {
		return scopeTags.some((tag) => fileTags.contains(tag));
	}
}
