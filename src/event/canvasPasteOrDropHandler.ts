import { CanvasView } from "obsidian";
import AttachmentManager from "src/manager/attachmentManager";
import AttachmentProPlugin from "src/main";
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

	install(plugin: AttachmentProPlugin) {
		// 原始 handlePaste 必须以 canvasView 为 this 调用
		const invokeOriginal = (evt: ClipboardEvent): void => {
			this.originalHandlePasteFn.call(this.canvasView, evt);	
		}
			
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
					void this.attachmentManager.onAttachmentSave(
						pageFile,
						plugin.settings,
						this.canvasView.app,
						attachmentFile,
						index,
						(result) => {
							const canvas = this.canvasView.canvas;
							canvas.createFileNode({
								pos: canvas.posCenter(),
								position: "center",
								file: result.file,
							});
						},
						() => invokeOriginal(evt)
					);
				} else {
					invokeOriginal(evt);
				}
			}
		};
	}

	getDataTransferItem(evt: DragEvent | ClipboardEvent) {
		if (evt instanceof DragEvent) {
			return evt.dataTransfer?.items ?? null;
		} else {
			return evt.clipboardData?.items ?? null;
		}
	}
}
