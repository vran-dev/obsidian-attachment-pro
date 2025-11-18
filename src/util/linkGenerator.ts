import { TFile, App } from "obsidian";

/**
 * Generate appropriate Markdown link based on file type
 * This function reuses the logic from AttachmentView.tsx handleInsertAttachments
 */
export function generateAttachmentLink(attachment: TFile, app: App): string {
	const filePath = app.vault.adapter.getResourcePath(attachment.path);
	const fileExt = attachment.extension;

	const imageExtensions = [
		"png",
		"jpg", 
		"jpeg",
		"gif",
		"svg",
		"webp",
		"bmp"
	];

	if ([...imageExtensions, "components"].includes(fileExt)) {
		return `![[${attachment.name}]]`;
	}
	if (fileExt === "pdf") {
		return `![[${attachment.path}#page=1]]`;
	}
	if (fileExt === "html") {
		return `<iframe 
					src="${filePath.replace(/^app:\/\/[a-z0-9]+\/?/i, "")}" 
					style="width: 100%; height: 600px; border: none;" 
					sandbox="allow-forms allow-presentation allow-same-origin allow-scripts allow-modals">
				</iframe>`;
	}
	return `[[${attachment.path}]]`;
}