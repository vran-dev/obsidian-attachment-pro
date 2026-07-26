import { App, TFile } from "obsidian";
import { log } from "src/util/log";

export class AttachmentHandler {
	async listUnusedAttachments(app: App): Promise<TFile[]> {
		const startTime = Date.now();

		const attachments: TFile[] = await this.listAttachments(app);
		// resolvedLinks 的内层 key 即被引用文件的路径，直接以路径判重，
		// 避免 getAbstractFileByPath 返回 null 污染集合与 O(n²) 的数组 includes
		const usedAttachmentPaths = new Set<string>();
		const resolvedLinks = app.metadataCache.resolvedLinks;
		if (resolvedLinks) {
			for (const links of Object.values(resolvedLinks)) {
				for (const filePath of Object.keys(links)) {
					usedAttachmentPaths.add(filePath);
				}
			}
		}

		const unusedAttachments: TFile[] = attachments.filter(
			(file) => !usedAttachmentPaths.has(file.path)
		);

		const endTime = Date.now();
		log(
			`[AttachmentHandler] list unused attachments cost ${
				endTime - startTime
			}ms`
		);
		return unusedAttachments;
	}

	async listAttachments(app: App): Promise<TFile[]> {
		const startTime = Date.now();

		const allFiles: TFile[] = app.vault.getFiles();
		const attachments: TFile[] = allFiles.filter(
			(file) => !["md", "canvas"].includes(file.extension)
		);

		const endTime = Date.now();
		log(
			`[AttachmentHandler] list attachments cost ${endTime - startTime}ms`
		);
		return attachments;
	}
}
