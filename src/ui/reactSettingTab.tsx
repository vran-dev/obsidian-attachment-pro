import { PluginSettingTab, App } from "obsidian";
import AttachmentProPlugin from "src/main";
import { Root, createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { SettingForm } from "./form/SettingForm";
import { getLocal } from "src/i18/messages";
import { ObsidianAppContext } from "src/context/obsidianAppContext";

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
							this.plugin.replaceSettings(config);
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

export const repositoryOptions = [
	{
		value: "VAULT_SUBFOLDER",
		label: getLocal().FILE_POSITION_TYPE_ROOT,
	},
	{
		value: "FILE_FOLDER",
		label: getLocal().FILE_POSITION_TYPE_CURRENT,
	},
	{
		value: "FILE_SUBFOLDER",
		label: getLocal().FILE_POSITION_TYPE_SUBFOLDER,
	},
	{
		value: "CUSTOMIZE",
		label: getLocal().SCOPE_TYPE_CUSTOM,
	},
];

export const scopeOptions = [
	{
		value: "ALL",
		label: getLocal().SCOPE_TYPE_ALL,
	},
	{
		value: "ATTACHMENT_FILE_EXTENSION",
		label: getLocal().SCOPE_TYPE_SPECIFIC_EXTENSION,
	},
	{
		value: "FILE_TAG",
		label: getLocal().SCOPE_TYPE_TAG_OPS,
	},
	{
		value: "SPECIFIC_FILE_FOLDER",
		label: getLocal().SCOPE_TYPE_SPECIFIC_FOLDER,
	},
];

export const attachmentNameFormatOptions = [
	{
		value: "ORIGINAL",
		label: getLocal().FILE_NAME_FORMAT_TYPE_ORIGINAL,
	},
	{
		value: "DATETIME",
		label: getLocal().FILE_NAME_FORMAT_TYPE_DATETIME,
	},
	{
		value: "UUID",
		label: getLocal().FILE_NAME_FORMAT_TYPE_UUID,
	},
	{
		value: "CUSTOMIZE",
		label: getLocal().FILE_NAME_FORMAT_TYPE_CUSTOM,
	},
];

export const operationOptions = [
	{
		value: "CONTAINS_ALL",
		label: getLocal().OPERATOR_CONTAINS_ALL,
	},
	{
		value: "CONTAINS_ANY",
		label: getLocal().OPERATOR_CONTAINS_ANY,
	},
];
