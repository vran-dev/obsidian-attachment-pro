import { Plugin } from "obsidian";
import { AttachmentProConfig } from "./manager/types";
import { DEFAULT_SETTINGS } from "./setting/defaultSetting";
import { log } from "./util/log";
import PasteOrDropHandler from "./event/pasteOrDropHandler";
import ReactAttachmentSettingTab from "./ui/reactSettingTab";

export default class AttachmentProPlugin extends Plugin {
	settings: AttachmentProConfig;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ReactAttachmentSettingTab(this.app, this));
		this.registerEditorPasteHandler();
		this.registerEditorDropHandler();
		this.registerFileRenameHandler();
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
		log("[Config] loading plugins", this.settings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async replaceSettings(value: Partial<AttachmentProConfig>) {
		this.settings = Object.assign({}, this.settings, value);
		log("[Config] replace setting from", value, "to", this.settings);
		await this.saveSettings();
	}

	registerEditorPasteHandler() {
		this.registerEvent(
			this.app.workspace.on("editor-paste", (evt, editor, info) => {
				new PasteOrDropHandler().on(evt, editor, info, this);
			})
		);
	}

	registerEditorDropHandler() {
		this.registerEvent(
			this.app.workspace.on("editor-drop", (evt, editor, info) => {
				new PasteOrDropHandler().on(evt, editor, info, this);
			})
		);
	}

	registerFileRenameHandler() {
		this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {}));
	}
}
