import { Notice, Plugin, CanvasView } from "obsidian";
import { AttachmentProConfig } from "./manager/types";
import { DEFAULT_SETTINGS } from "./setting/defaultSetting";
import { log } from "./util/log";
import ReactAttachmentSettingTab from "./ui/reactSettingTab";
import CanvasPasteOrDropHandler from "./event/canvasPasteOrDropHandler";
import EditorPasteOrDropHandler from "./event/editorPasteOrDropHandler";
import '../style/styles.css'
import '../style/suggest.css'
import '../style/modal.css'
import { AttachmentsModal } from "./ui/obsidian-modal/AttachmentsModal";
import { getLocal } from "./i18/messages";

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
			this.registerContextMenu();
			this.addSettingTab(new ReactAttachmentSettingTab(this.app, this));
		} catch (e) {
			new Notice('error when load plugin "Attachment Pro"' + e.message);
		}
	}

	onunload() { }

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
		this.registerEvent(this.app.vault.on("rename", (file, oldPath) => { }));
	}

	registerCommands() {
		this.addCommand({
			id: "show-attachments",
			name: "Show Attachments", 
			callback: () => {
				new AttachmentsModal(this.app, this, false).open();
			},
		});
		this.addRibbonIcon('layers-3', 'Show Attachments', () => {
			new AttachmentsModal(this.app, this, false).open();
		});
	}

	registerContextMenu() {
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor) => {
				menu.addItem((item) => {
					item
						.setTitle(getLocal().context_menu_insert)
						.setIcon("layers-3")
						.onClick(() => {
							new AttachmentsModal(this.app, this, true).open();
						});
				});
			})
		);
	}
}
