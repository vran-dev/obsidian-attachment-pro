import { TFile, App } from "obsidian";
import {
	AttachmentNameFormatType,
	AttachmentNameFormat,
} from "src/manager/types";
import { AttachmentNameFormatter } from "./attachmentNameFormatter";
import { randomUUID } from "crypto";

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
			randomUUID().replace(/-/g, "") +
			"." +
			attachmentFile.name.split(".").pop()
		);
	}
}
