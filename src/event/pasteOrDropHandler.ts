import {
	Editor,
	MarkdownFileInfo,
	MarkdownView,
	Notice,
	TFile,
	htmlToMarkdown,
} from "obsidian";
import { isAllStringType } from "src/util/dataTransfers";
import AttachmentManager from "../manager/attachmentManager";
import AttachmentProPlugin from "src/main";
import { log } from "src/util/log";

export default class PasteOrDropHandler {
	attachmentManager = new AttachmentManager();

	on(
		evt: ClipboardEvent | DragEvent,
		editor: Editor,
		info: MarkdownView | MarkdownFileInfo,
		plugin: AttachmentProPlugin
	) {
		const dataItems = this.getDataTransferItem(evt);
		new Notice('begin handle paste or drop event', dataItems?.length)
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
		for (let i = dataItems.length - 1; i >= 0; i--) {
			const item = dataItems[i];
			if (item.kind == "file") {
				this.handleFile(item, pageFile, editor, plugin);
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
		plugin: AttachmentProPlugin
	) {
		const file = item.getAsFile();
		if (file) {
			log("[Event] prepare to handle " + file.name);
			return this.attachmentManager.onAttachmentSave(
				pageFile,
				plugin.settings,
				editor,
				plugin.app,
				file
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
