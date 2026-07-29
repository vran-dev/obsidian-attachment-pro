import { PluginSettingTab, App } from "obsidian";
import AttachmentProPlugin from "src/main";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { SettingForm } from "./form/SettingForm";
import { LL } from "@src/i18n/i18n";
import { ObsidianAppContext } from "src/context/obsidianAppContext";
import {
	AttachmentNameFormatType,
	AttachmentSaveType,
	AttachmentScopeType,
	TagMatchOperator,
} from "src/manager/types";
import { SelectOption } from "./select/Select";

export default class ReactAttachmentSettingTab extends PluginSettingTab {
	plugin: AttachmentProPlugin;

	root: Root;

	constructor(app: App, plugin: AttachmentProPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display() {
		const { containerEl } = this;
		containerEl.empty();
		this.root = createRoot(containerEl);
		this.root.render(
			<StrictMode>
				<ObsidianAppContext.Provider value={this.app}>
					<SettingForm
						title={this.plugin.manifest.name}
						config={this.plugin.settings}
						onChange={(config) => {
							void this.plugin.replaceSettings(config);
						}}
					/>
				</ObsidianAppContext.Provider>
			</StrictMode>
		);
	}

	hide() {
		this.root.unmount();
		this.containerEl.empty();
	}
}

export const repositoryOptions: SelectOption<AttachmentSaveType>[] = [
	{
		value: "ROOT_FOLDER",
		label: LL.FILE_POSITION.TYPE.ROOT(),
	},
	{
		value: "FILE_FOLDER",
		label: LL.FILE_POSITION.TYPE.CURRENT(),
	},
	{
		value: "FILE_SUBFOLDER",
		label: LL.FILE_POSITION.TYPE.SUBFOLDER(),
	},
	{
		value: "CUSTOMIZE",
		label: LL.SCOPE.TYPE.CUSTOM(),
	},
];

export const scopeOptions: SelectOption<AttachmentScopeType>[] = [
	{
		value: "ALL",
		label: LL.SCOPE.TYPE.ALL(),
	},
	{
		value: "ATTACHMENT_FILE_EXTENSION",
		label: LL.SCOPE.TYPE.SPECIFIC_EXTENSION(),
	},
	{
		value: "FILE_TAG",
		label: LL.SCOPE.TYPE.TAG_OPS(),
	},
	{
		value: "SPECIFIC_FILE_FOLDER",
		label: LL.SCOPE.TYPE.SPECIFIC_FOLDER(),
	},
];

export const attachmentNameFormatOptions: SelectOption<AttachmentNameFormatType>[] = [
	{
		value: "ORIGINAL",
		label: LL.FILE_NAME_FORMAT.TYPE.ORIGINAL(),
	},
	{
		value: "DATETIME",
		label: LL.FILE_NAME_FORMAT.TYPE.DATETIME(),
	},
	{
		value: "UUID",
		label: LL.FILE_NAME_FORMAT.TYPE.UUID(),
	},
	{
		value: "CUSTOMIZE",
		label: LL.FILE_NAME_FORMAT.TYPE.CUSTOM(),
	},
];

export const operationOptions: SelectOption<TagMatchOperator>[] = [
	{
		value: "CONTAINS_ALL",
		label: LL.SETTING.OPERATOR_CONTAINS_ALL(),
	},
	{
		value: "CONTAINS_ANY",
		label: LL.SETTING.OPERATOR_CONTAINS_ANY(),
	},
];
