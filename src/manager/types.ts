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

// ---- Repository（判别联合）----

export interface RootFolderRepository {
	type: "ROOT_FOLDER";
}

export interface FileFolderRepository {
	type: "FILE_FOLDER";
}

export interface FileSubfolderRepository {
	type: "FILE_SUBFOLDER";
	/** 相对当前笔记所在目录的子目录，支持 ${...} 变量 */
	path: string;
}

export interface CustomizeRepository {
	type: "CUSTOMIZE";
	/** 相对仓库根目录的目录，支持 ${...} 变量 */
	path: string;
}

/** 兜底存储：使用 Obsidian 原生「附件默认存放路径」配置（不在设置面板中暴露） */
export interface ObsidianDefaultRepository {
	type: "OBSIDIAN_DEFAULT";
}

export type AttachmentRepositorySetting =
	| RootFolderRepository
	| FileFolderRepository
	| FileSubfolderRepository
	| CustomizeRepository
	| ObsidianDefaultRepository;

export type AttachmentSaveType = AttachmentRepositorySetting["type"];

/** 按类型构造空仓库配置（设置面板切换存储类型时使用） */
export function createRepositorySetting(
	type: AttachmentSaveType
): AttachmentRepositorySetting {
	switch (type) {
		case "FILE_SUBFOLDER":
		case "CUSTOMIZE":
			return { type, path: "" };
		case "ROOT_FOLDER":
		case "FILE_FOLDER":
		case "OBSIDIAN_DEFAULT":
			return { type };
	}
}

// ---- Scope（判别联合）----

/** InputTags 录入的取值项，持久化在 data.json 中 */
export interface ScopeRangeItem {
	id: string;
	value: string;
}

export type TagMatchOperator = "CONTAINS_ALL" | "CONTAINS_ANY";

interface BaseScope {
	id: string;
}

export interface AllScope extends BaseScope {
	type: "ALL";
}

/** 预留的自定义作用域（匹配器尚未实现，设置面板未暴露） */
export interface CustomizeScope extends BaseScope {
	type: "CUSTOMIZE";
}

export interface AttachmentExtensionScope extends BaseScope {
	type: "ATTACHMENT_FILE_EXTENSION";
	ranges: ScopeRangeItem[];
}

export interface SpecificFolderScope extends BaseScope {
	type: "SPECIFIC_FILE_FOLDER";
	ranges: ScopeRangeItem[];
}

export interface FileTagScope extends BaseScope {
	type: "FILE_TAG";
	ranges: ScopeRangeItem[];
	operator: TagMatchOperator;
}

export type AttachmentScope =
	| AllScope
	| CustomizeScope
	| AttachmentExtensionScope
	| SpecificFolderScope
	| FileTagScope;

export type AttachmentScopeType = AttachmentScope["type"];

/** 携带 ranges 取值列表的作用域 */
export type RangedAttachmentScope =
	| AttachmentExtensionScope
	| SpecificFolderScope
	| FileTagScope;

export function isRangedScope(
	scope: AttachmentScope
): scope is RangedAttachmentScope {
	return (
		scope.type === "ATTACHMENT_FILE_EXTENSION" ||
		scope.type === "SPECIFIC_FILE_FOLDER" ||
		scope.type === "FILE_TAG"
	);
}

/** 按类型构造空作用域（设置面板切换作用域类型时使用） */
export function createScope(
	id: string,
	type: AttachmentScopeType
): AttachmentScope {
	switch (type) {
		case "ALL":
		case "CUSTOMIZE":
			return { id, type };
		case "ATTACHMENT_FILE_EXTENSION":
		case "SPECIFIC_FILE_FOLDER":
			return { id, type, ranges: [] };
		case "FILE_TAG":
			// 缺省 CONTAINS_ANY：与历史版本 operator 未持久化时的匹配行为一致
			return { id, type, ranges: [], operator: "CONTAINS_ANY" };
	}
}

// ---- Name format ----

export type AttachmentNameFormatType =
	| "CUSTOMIZE"
	| "ORIGINAL"
	| "DATETIME"
	| "UUID";

export interface AttachmentNameFormat {
	type: AttachmentNameFormatType;
	/**
	 * 仅 DATETIME（luxon 格式串，缺省 DEFAULT_DATETIME_FORMAT）与
	 * CUSTOMIZE（支持 ${...} 变量的模板）使用，其余类型忽略
	 */
	format?: string;
}

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

/** 规则都未命中时的兜底规则：Obsidian 原生附件目录 + 原始文件名（不持久化） */
export function createFallbackRule(): AttachmentRule {
	return {
		id: uuid(),
		sort: 0,
		enabled: true,
		scopes: [{ id: uuid(), type: "ALL" }],
		repository: { type: "OBSIDIAN_DEFAULT" },
		nameFormat: { type: "ORIGINAL" },
	};
}
