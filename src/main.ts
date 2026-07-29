import { Notice, Plugin, CanvasView } from "obsidian";
import { AttachmentProConfig } from "./manager/types";
import { migrateConfig } from "./manager/migrate";
import { DEFAULT_SETTINGS } from "./setting/defaultSetting";
import { log } from "./util/log";
import ReactAttachmentSettingTab from "./ui/reactSettingTab";
import CanvasPasteOrDropHandler from "./event/canvasPasteOrDropHandler";
import EditorPasteOrDropHandler from "./event/editorPasteOrDropHandler";
import '../style/styles.css'
import '../style/suggest.css'
import { AttachmentsModal } from "./ui/attachments/AttachmentsModal";
import { LL } from "@src/i18n/i18n";

export default class AttachmentProPlugin extends Plugin {
	settings: AttachmentProConfig;

	private canvasPasteOrDropHandler: CanvasPasteOrDropHandler | null = null;

	async onload() {
		try {
			await this.loadSettings();
			this.registerEditorPasteHandler();
			this.registerEditorDropHandler();
			this.registerFileRenameHandler();
			this.registerCanvasPasteOrDropHandler();
			this.registerCommands();
			this.registerContextMenu();
			this.addSettingTab(new ReactAttachmentSettingTab(this.app, this));
		} catch (e) {
			const reason = e instanceof Error ? e.message : String(e);
			new Notice('error when load plugin "Attachment Pro": ' + reason);
		}
	}

	onunload() {
		this.resetCanvasPasteOrDropHandler();
	}

	async loadSettings() {
    const loaded = (await this.loadData()) as Partial<AttachmentProConfig> | null;
    const merged: AttachmentProConfig = {
        ...DEFAULT_SETTINGS,
        ...(loaded ?? {}),
    };
    this.settings = migrateConfig(merged);
    if (JSON.stringify(this.settings) !== JSON.stringify(merged)) {
        await this.saveData(this.settings);
    }
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
				if (evt.defaultPrevented) {
					return;
				}
				if (new EditorPasteOrDropHandler().on(evt, editor, info, this)) {
					evt.preventDefault();
				}
			})
		);
	}

	registerEditorDropHandler() {
		this.registerEvent(
			this.app.workspace.on("editor-drop", (evt, editor, info) => {
				if (evt.defaultPrevented) {
					return;
				}
				if (new EditorPasteOrDropHandler().on(evt, editor, info, this)) {
					evt.preventDefault();
				}
			})
		);
	}

	registerCanvasPasteOrDropHandler() {
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				// 离开 Canvas（或切到另一个 Canvas）时先恢复上一个视图的原始 handlePaste，
				// 避免补丁重复安装与监听器泄漏
				this.resetCanvasPasteOrDropHandler();
				if (!leaf) {
					return;
				}
				const view = leaf.view;
				if (view.getViewType() === "canvas") {
					this.canvasPasteOrDropHandler =
						new CanvasPasteOrDropHandler(view as CanvasView);
					this.canvasPasteOrDropHandler.install(this);
				}
			})
		);
	}

	private resetCanvasPasteOrDropHandler() {
		this.canvasPasteOrDropHandler?.reset();
		this.canvasPasteOrDropHandler = null;
	}

	registerFileRenameHandler() {
		this.registerEvent(this.app.vault.on("rename", (file, oldPath) => { }));
	}

	registerCommands() {
		this.addCommand({
			id: "show-attachments",
			name: LL.COMMAND.SHOW_ATTACHMENTS(),
			callback: () => {
				new AttachmentsModal(this.app, this, false).open();
			},
		});
		this.addRibbonIcon('layers-3', LL.COMMAND.SHOW_ATTACHMENTS(), () => {
			new AttachmentsModal(this.app, this, false).open();
		});
	}

	registerContextMenu() {
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor) => {
				menu.addItem((item) => {
					item
						.setTitle(LL.COMMAND.CONTEXT_MENU_INSERT_ATTACHMENTS())
						.setIcon("layers-3")
						.onClick(() => {
							new AttachmentsModal(this.app, this, true).open();
						});
				});
			})
		);
	}
}
