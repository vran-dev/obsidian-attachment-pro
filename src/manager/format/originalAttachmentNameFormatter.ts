import { TFile, App } from "obsidian";
import {
	AttachmentNameFormatType,
	AttachmentNameFormat,
} from "src/manager/types";
import { AttachmentNameFormatter } from "./attachmentNameFormatter";

export class OriginalAttachmentNameFormatter
	implements AttachmentNameFormatter
{
	accept(type: AttachmentNameFormatType): boolean {
		return type === "ORIGINAL";
	}

	format(
		attachmentFile: File,
		pageFile: TFile,
		format: AttachmentNameFormat,
		app: App
	): string {
		return attachmentFile.name;
	}
}
