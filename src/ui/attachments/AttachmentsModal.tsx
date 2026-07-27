import { App, Modal, Plugin } from "obsidian";
import { StrictMode, Suspense, lazy } from "react";
import { Root, createRoot } from "react-dom/client";
import { ObsidianAppContext } from "src/context/obsidianAppContext";
import { getLocal } from "src/i18/messages";

export class AttachmentsModal extends Modal {
	root: Root | null = null;

	onSave?: (content: string) => void;

	originalConfigContent?: string;

	plugin: Plugin;

	canInsert: boolean;

	constructor(app: App, plugin: Plugin, canInsert: boolean) {
		super(app);
		this.plugin = plugin;
		this.canInsert = canInsert;
	}

	async onOpen(): Promise<void> {
		// Obsidian 1.13 起设置页可以是独立窗口，此时 Modal 默认挂在
		// activeDocument（可能是设置窗口）上；附件库操作的是主窗口的
		// 工作区与编辑器，这里强制把弹窗挂回主窗口并聚焦
		const workspaceDoc = this.app.workspace.containerEl.doc;
		if (this.containerEl.doc !== workspaceDoc) {
			workspaceDoc.body.appendChild(this.containerEl);
			workspaceDoc.win.focus();
		}
		const el = this.contentEl;
		this.modalEl.addClass("attachmentsPro--modal");
		this.root = createRoot(el);
		const LazyAttachmentView = lazy(() => import("./AttachmentView"));
		this.root.render(
			<StrictMode>
				<ObsidianAppContext.Provider value={this.app}>
					<Suspense
						fallback={
							<div className="attachmentsPro--LoadingState">
								{getLocal().ATTACHMENTS_LOADING}
							</div>
						}
					>
						<LazyAttachmentView 
							canInsert={this.canInsert} 
							onClose={() => this.close()}
						/>
					</Suspense>
				</ObsidianAppContext.Provider>
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
		this.root = null;
	}
}
