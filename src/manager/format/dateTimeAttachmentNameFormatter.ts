import { TFile, App } from "obsidian";
import {
	AttachmentNameFormatType,
	AttachmentNameFormat,
} from "src/manager/types";
import { AttachmentNameFormatter } from "./attachmentNameFormatter";
import { DateTime } from "luxon";
import { DEFAULT_DATETIME_FORMAT } from "../constants";

export class DateTimeAttachmentNameFormatter
	implements AttachmentNameFormatter
{
	accept(type: AttachmentNameFormatType): boolean {
		return type === "DATETIME";
	}

	format(
		attachmentFile: File,
		pageFile: TFile,
		format: AttachmentNameFormat,
		app: App
	): string {
		const fileExtension = attachmentFile.name.split(".").pop();

		let formatedName;
		if (format.format) {
			formatedName = DateTime.now().toFormat(format.format);
		} else {
			formatedName = DateTime.now().toFormat(DEFAULT_DATETIME_FORMAT);
		}

		if (fileExtension && fileExtension.trim().length > 0) {
			return `${formatedName}.${fileExtension}`;
		} else {
			return `${formatedName}`;
		}
	}
}
