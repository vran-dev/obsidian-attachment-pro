import { CanvasView } from "obsidian";
import { AttachmentProConfig } from "src/manager/types";
import AttachmentManager from "src/manager/attachmentManager";
import { isAllStringType } from "src/util/dataTransfers";

export default class CanvasPasteOrDropHandler {
	private attachmentManager = new AttachmentManager();

	private canvasView: CanvasView;

	private originalHandlePasteFn: (e: ClipboardEvent) => Promise<void>;

	constructor(canvasView: CanvasView) {
		this.canvasView = canvasView;
		this.originalHandlePasteFn = this.canvasView.handlePaste;
	}

	reset() {
		this.canvasView.handlePaste = this.originalHandlePasteFn;
	}

	install(config: AttachmentProConfig) {
		this.canvasView.handlePaste = async (evt: ClipboardEvent) => {
			const dataItems = this.getDataTransferItem(evt);
			if (!dataItems) {
				return;
			}

			if (isAllStringType(dataItems)) {
				return;
			}

			const pageFile = this.canvasView.file;
			if (!pageFile) {
				return;
			}
			for (let i = dataItems.length - 1; i >= 0; i--) {
				const index = dataItems.length - i - 1;
				const item = dataItems[i];
				if (item.kind == "file") {
					const attachmentFile = item.getAsFile();
					if (!attachmentFile) {
						continue;
					}
					this.attachmentManager.onAttachmentSave(
						pageFile,
						config,
						this.canvasView.app,
						attachmentFile,
						index,
						(result) => {
							// @ts-ignore
							const canvas = this.canvasView.canvas;
							canvas.createFileNode({
								pos: canvas.posCenter(),
								position: "center",
								file: result.file,
							});
						},
						() => this.originalHandlePasteFn(evt)
					);
				} else {
					this.originalHandlePasteFn(evt);
				}
			}
		};
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
}
