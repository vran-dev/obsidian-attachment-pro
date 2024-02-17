import { App, Modal, Plugin } from "obsidian";
import { StrictMode, Suspense, lazy } from "react";
import { Root, createRoot } from "react-dom/client";
import { ObsidianAppContext } from "src/context/obsidianAppContext";

export class AttachmentsModal extends Modal {
	root: Root | null = null;

	onSave?: (content: string) => void;

	originalConfigContent?: string;

	plugin: Plugin;

	constructor(app: App, plugin: Plugin) {
		super(app);
		this.plugin = plugin;
	}

	async onOpen(): Promise<void> {
		const el = this.containerEl;
		this.root = createRoot(el);
		const LazyAttachmentView = lazy(() => import("./AttachmentView"));
		this.root.render(
			<StrictMode>
				<ObsidianAppContext.Provider value={this.app}>
					<Suspense
						fallback={
							<div>
								<h1>loading</h1>
							</div>
						}
					>
						<LazyAttachmentView />
					</Suspense>
				</ObsidianAppContext.Provider>
			</StrictMode>
		);
	}

	async onClose() {
		this.root?.unmount();
		this.root = null;
		this.containerEl.empty();
	}
}
