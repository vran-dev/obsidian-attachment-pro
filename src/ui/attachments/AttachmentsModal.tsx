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
