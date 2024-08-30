import { App, TFile } from "obsidian";
import {
	AttachmentNameFormat,
	AttachmentNameFormatType,
	AttachmentRule,
} from "src/manager/types";
import { DateTimeAttachmentNameFormatter } from "./dateTimeAttachmentNameFormatter";
import { UuidAttachmentNameFormatter } from "./uuidAttachmentNameFormatter";
import { OriginalAttachmentNameFormatter } from "./originalAttachmentNameFormatter copy";
import { log } from "src/util/log";
import { CustomizeAttachmentNameFormatter } from "./customizeAttachmentNameFormatter";

export interface AttachmentNameFormatter {
	accept(type: AttachmentNameFormatType): boolean;

	format(
		attachmentFile: File,
		pageFile: TFile,
		format: AttachmentNameFormat,
		app: App,
		index?: number
	): string;
}

export const attachmentNameFormatters: AttachmentNameFormatter[] = [
	new DateTimeAttachmentNameFormatter(),
	new OriginalAttachmentNameFormatter(),
	new UuidAttachmentNameFormatter(),
	new CustomizeAttachmentNameFormatter(),
];

export class AttachmentNameFormatters {
	static format(
		attachmentFile: File,
		pageFile: TFile,
		rule: AttachmentRule,
		app: App,
		index?: number
	) {
		const formatter = attachmentNameFormatters.find((formatter) =>
			formatter.accept(rule.nameFormat.type)
		);
		if (formatter) {
			const attachmentName = formatter.format(
				attachmentFile,
				pageFile,
				rule.nameFormat,
				app,
				index
			);
			log(
				"[Formatter Match] type: " +
				rule.nameFormat.type +
				", format name from " +
				attachmentFile.name +
				" to " +
				attachmentName
			);
			return attachmentName;
		}
		log("[No Formatter Match] type: " + rule.nameFormat.type);
		return attachmentFile.name;
	}
}
