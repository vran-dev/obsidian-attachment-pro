import { TFile, App } from "obsidian";
import {
	AttachmentNameFormatType,
	AttachmentNameFormat,
} from "src/manager/types";
import { AttachmentNameFormatter } from "./attachmentNameFormatter";
import DefaultVariableHandler from "../variable/variableHandler";

export class CustomizeAttachmentNameFormatter implements AttachmentNameFormatter {
	accept(type: AttachmentNameFormatType): boolean {
		return type === "CUSTOMIZE";
	}

	format(
		attachmentFile: File,
		pageFile: TFile,
		format: AttachmentNameFormat,
		app: App
	): string {
		const fileExtension = attachmentFile.name.split(".").pop();
		const value = format.format
		const filename = DefaultVariableHandler.handle(value, app, pageFile, attachmentFile);
		if (fileExtension && fileExtension.trim().length > 0) {
			return `${filename}.${fileExtension}`;
		} else {
			return `${filename}`;
		}
	}
}
