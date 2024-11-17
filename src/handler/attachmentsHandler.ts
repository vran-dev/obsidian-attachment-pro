import { App, TFile } from "obsidian";

export class AttachmentHandler {
	async listUnusedAttachments(app: App): Promise<TFile[]> {
		const startTime = Date.now();
		
		const attachments: TFile[] = await this.listAttachments(app);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const usedAttachments: any = [];
		const resolvedLinks = app.metadataCache.resolvedLinks;
		if (resolvedLinks) {
			for (const [mdFile, links] of Object.entries(resolvedLinks)){
				for (const [filePath, nr] of Object.entries(resolvedLinks[mdFile])){
					const file = app.vault.getAbstractFileByPath(filePath);
					usedAttachments.push(file);
				}
			}
		}

		const unusedAttachments: TFile[] = attachments.filter((file) =>!usedAttachments.includes(file));

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
		
		const allFiles : TFile[] = app.vault.getFiles();
		const attachments: TFile[] = [];
		for(let i = 0; i < allFiles.length; i++){
			if(!['md', 'canvas'].includes(allFiles[i].extension)) {
				attachments.push(allFiles[i]);
			}
		}
		
		const endTime = Date.now();
		console.log(
			`[AttachmentHandler] list attachments cost ${endTime - startTime}ms`
		);
		return attachments;
	}
}
