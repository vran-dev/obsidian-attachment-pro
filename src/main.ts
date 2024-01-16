import { Notice, Plugin, CanvasView } from "obsidian";
import { AttachmentProConfig } from "./manager/types";
import { DEFAULT_SETTINGS } from "./setting/defaultSetting";
import { log } from "./util/log";
import ReactAttachmentSettingTab from "./ui/reactSettingTab";
import { ClearUnusedAttachmentsModal } from "./ui/obsidian-modal/clearUnusedAttachmentsModal";
import CanvasPasteOrDropHandler from "./event/canvasPasteOrDropHandler";
import EditorPasteOrDropHandler from "./event/editorPasteOrDropHandler";

declare module "obsidian" {
	interface CanvasView extends TextFileView {
		handlePaste: (e: ClipboardEvent) => Promise<void>;
	}
}

export default class AttachmentProPlugin extends Plugin {
	settings: AttachmentProConfig;

	async onload() {
		try {
			await this.loadSettings();
			this.registerEditorPasteHandler();
			this.registerEditorDropHandler();
			this.registerFileRenameHandler();
			// TODO
			// this.registerCanvasPasteOrDropHandler();
			this.registerCommands();
			this.addSettingTab(new ReactAttachmentSettingTab(this.app, this));
		} catch (e) {
			new Notice('error when load plugin "Attachment Pro"' + e.message);
		}
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
				new EditorPasteOrDropHandler().on(evt, editor, info, this);
			})
		);
	}

	registerEditorDropHandler() {
		this.registerEvent(
			this.app.workspace.on("editor-drop", (evt, editor, info) => {
				new EditorPasteOrDropHandler().on(evt, editor, info, this);
			})
		);
	}

	registerCanvasPasteOrDropHandler() {
		this.app.workspace.on("active-leaf-change", (leaf) => {
			if (!leaf) {
				return;
			}
			const view = leaf.view;
			if (view.getViewType() === "canvas") {
				new CanvasPasteOrDropHandler(view as CanvasView).install(
					this.settings
				);
			}
		});
	}

	registerFileRenameHandler() {
		this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {}));
	}

	registerCommands() {
		this.addCommand({
			id: "clear-unused-attachments",
			name: "Clear Unused Attachments", 
			callback: () => {
				new ClearUnusedAttachmentsModal(this.app, this).open();
			},
		});
	}
}
