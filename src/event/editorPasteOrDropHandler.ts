import {
	Editor,
	MarkdownFileInfo,
	MarkdownView,
	TFile,
	htmlToMarkdown,
} from "obsidian";
import { isAllStringType } from "src/util/dataTransfers";
import AttachmentManager from "../manager/attachmentManager";
import AttachmentProPlugin from "src/main";
import { log } from "src/util/log";

export default class EditorPasteOrDropHandler {
	attachmentManager = new AttachmentManager();

	on(
		evt: ClipboardEvent | DragEvent,
		editor: Editor,
		info: MarkdownView | MarkdownFileInfo,
		plugin: AttachmentProPlugin
	) {
		const dataItems = this.getDataTransferItem(evt);
		if (!dataItems) {
			log("[Event] ignoresd no data items");
			return;
		}

		if (isAllStringType(dataItems)) {
			log("[Event] ignoresd all is string type");
			return;
		}

		const pageFile = info.file;
		if (!pageFile) {
			log("[Event] ignoresd no active page file");
			return;
		}

		log("[Event] prepare to handle " + dataItems.length + " items");

		if (dataItems.length == 2 && dataItems[0].type == "text/html" && dataItems[1].kind == "file"){
			log("[Event] found network image with string, only process the file.");
			this.handleFile(dataItems[1], pageFile, editor, plugin, -1);
			evt.preventDefault();
			return;
		}
		
		for (let i = dataItems.length - 1; i >= 0; i--) {
			const item = dataItems[i];

			const index = dataItems.length - i - 1;
			if (item.kind == "file") {
				this.handleFile(item, pageFile, editor, plugin, index);
			} else {
				this.handleString(item, editor);
			}
		}
		evt.preventDefault();
	}

	getDataTransferItem(evt: DragEvent | ClipboardEvent) {
		if (evt instanceof DragEvent) {
			const dataTransfer = evt.dataTransfer;
			if (dataTransfer == null) {
				return null;
			}
			dataTransfer.setData;
			return dataTransfer.items;
		} else {
			const clipBoardData = evt.clipboardData;
			if (clipBoardData == null) {
				return null;
			}
			return clipBoardData.items;
		}
	}

	getDataTransfer(evt: DragEvent | ClipboardEvent) {
		if (evt instanceof DragEvent) {
			return evt.dataTransfer;
		} else {
			return evt.clipboardData;
		}
	}

	handleFile(
		item: DataTransferItem,
		pageFile: TFile,
		editor: Editor,
		plugin: AttachmentProPlugin,
		index: number
	) {
		const file = item.getAsFile();
		if (file) {
			log("[Event] prepare to handle " + file.name);
			return this.attachmentManager.onEditorAttachmentSave(
				pageFile,
				plugin.settings,
				editor,
				plugin.app,
				file,
				index
			);
		} else {
			log("[File Not Exists]", item);
			return true;
		}
	}

	handleString(item: DataTransferItem, editor: Editor) {
		if (item.type != "text/html") {
			item.getAsString((str) => {
				editor.replaceSelection(str);
			});
		} else {
			item.getAsString((html) => {
				const markdown = htmlToMarkdown(html);
				editor.replaceSelection(markdown);
			});
		}
	}
}
