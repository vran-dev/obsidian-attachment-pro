import { App, TFile } from "obsidian";

export class AttachmentHandler {
	async listUnusedAttachments(app: App): Promise<TFile[]> {
		const startTime = Date.now();
		const unusedAttachments: TFile[] = app.vault
			.getFiles()
			.filter((file) => {
				return !["md", "canvas"].includes(file.extension);
			})
			.filter((file) => {
				// @ts-ignore
				const backlinks = app.metadataCache.getBacklinksForFile(file);
				return Object.keys(backlinks.data).length === 0;
			});

		const endTime = Date.now();
		console.log(
			`[AttachmentHandler] list unused attachments cost ${
				endTime - startTime
			}ms`
		);
		return unusedAttachments;
	}

	async listAttachments(app: App): Promise<TFile[]> {
		const startTime = Date.now();
		const attachments: TFile[] = app.vault.getFiles();
		const endTime = Date.now();
		console.log(
			`[AttachmentHandler] list attachments cost ${endTime - startTime}ms`
		);
		return attachments;
	}
}
