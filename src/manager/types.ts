import { randomUUID } from "crypto";

export interface AttachmentProConfig {
	version: 0;
	debug: boolean;
	rules: AttachmentRule[];
}

export interface AttachmentRule {
	id: string;
	sort: number;
	enabled: boolean;
	scopes: AttachmentScope[];
	strategy: AttachmentSaveStrategy;
	nameFormat: AttachmentNameFormat;
}

export interface AttachmentSaveStrategy {
	type: AttachmentSaveStrategyType;

	[key: string]: string;
}

export interface AttachmentScope {
	id: string;
	type: AttachmentScopeType;
	[key: string]: string | any;
}

export interface AttachmentNameFormat {
	type: AttachmentNameFormatType;
	[key: string]: string;
}

export type AttachmentSaveStrategyType =
	| "CUSTOMIZE"
	| "FILE_FOLDER"
	| "FILE_SUBFOLDER"
	| "ROOT_FOLDER";
export type AttachmentScopeType =
	| "CUSTOMIZE"
	| "ALL"
	| "ATTACHMENT_FILE_EXTENSION"
	| "SPECIFIC_FILE_FOLDER"
	| "FILE_TAG";
export type AttachmentNameFormatType =
	| "CUSTOMIZE"
	| "ORIGINAL"
	| "DATETIME"
	| "UUID";

export class DefaultRule implements AttachmentRule {
	id: string;
	sort: number;
	enabled: boolean;
	scopes: AttachmentScope[];
	strategy: AttachmentSaveStrategy;
	nameFormat: AttachmentNameFormat;

	constructor() {
		this.id = randomUUID();
		this.sort = 0;
		this.enabled = true;
		this.scopes = [
			{
				id: randomUUID(),
				type: "ALL",
			},
		];
		this.strategy = {
			type: "ROOT_FOLDER",
		};
		this.nameFormat = {
			type: "ORIGINAL",
		};
	}
}
