import { TFile, App } from "obsidian";
import {
	AttachmentNameFormatType,
	AttachmentNameFormat,
} from "src/manager/types";
import { AttachmentNameFormatter } from "./attachmentNameFormatter";
import { v4 as uuidv4 } from 'uuid';

export class UuidAttachmentNameFormatter implements AttachmentNameFormatter {
	accept(type: AttachmentNameFormatType): boolean {
		return type === "UUID";
	}

	format(
		attachmentFile: File,
		pageFile: TFile,
		format: AttachmentNameFormat,
		app: App
	): string {
		return (
			uuidv4().replace(/-/g, "") +
			"." +
			attachmentFile.name.split(".").pop()
		);
	}
}
