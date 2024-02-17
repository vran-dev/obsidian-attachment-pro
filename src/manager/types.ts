import { v4 as uuid } from 'uuid'

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
	repository: AttachmentRepositorySetting;
	nameFormat: AttachmentNameFormat;
}

export interface AttachmentRepositorySetting {
	type: AttachmentSaveType;

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

export type AttachmentSaveType =
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
	repository: AttachmentRepositorySetting;
	nameFormat: AttachmentNameFormat;

	constructor() {
		this.id =  uuid();
		this.sort = 0;
		this.enabled = true;
		this.scopes = [
			{
				id: uuid(),
				type: "ALL",
			},
		];
		this.repository = {
			type: "ROOT_FOLDER",
		};
		this.nameFormat = {
			type: "ORIGINAL",
		};
	}
}
