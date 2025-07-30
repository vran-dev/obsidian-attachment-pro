import { App, Modal as ObsidianModal, Plugin } from "obsidian";
import { StrictMode, Suspense, lazy } from "react";
import { Root, createRoot } from "react-dom/client";
import { ObsidianAppContext } from "src/context/obsidianAppContext";
import Modal from "../modal/Modal";

export class AttachmentsModal extends ObsidianModal {
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
		const el = this.modalEl;
		el.empty();
		this.root = createRoot(el);
		const LazyAttachmentView = lazy(() => import("./AttachmentView"));
		this.root.render(
			<StrictMode>
				<ObsidianAppContext.Provider value={this.app}>
					<Modal
						onClose={() => this.close()}
						title="Attachments"
						closeOnClickOutside={true}
						modalContentSize="max">
						<Suspense
							fallback={
								<div>
									<h1>loading</h1>
								</div>
							}
						>
							<LazyAttachmentView 
								canInsert={this.canInsert} 
								onClose={() => this.close()}
							/>
						</Suspense>
					</Modal>
				</ObsidianAppContext.Provider>
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
		this.root = null;
	}
}
