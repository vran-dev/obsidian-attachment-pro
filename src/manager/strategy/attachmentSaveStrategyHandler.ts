import { App, Editor, TFile } from "obsidian";
import { AttachmentRule, AttachmentSaveStrategyType } from "src/manager/types";
import FileFolderAttachmentSaveStrategyHandler from "./fileFolderAttachmentSaveStrategyHandler";
import FileSubfolderAttachmentSaveStrategyHandler from "./fileSubfolderAttachmentSaveStrategyHandler";
import VaultfolderAttachmentSaveStrategyHandler from "./vaultfolderAttachmentSaveStrategyHandler";
import { log } from "src/util/log";
import CustomizeAttachmentSaveStrategyHandler from "./customizeAttachmentSaveStrategyHandler";

export interface AttachmentSaveStrategyHandler {
	accept(scope: AttachmentSaveStrategyType): boolean;

	handle(context: AttachmentSaveStrategyContext): Promise<string>;
}

export class AttachmentSaveStrategyContext {
	public attachmentFile: File;
	public formatedAttachmentName: string;
	public pageFile: TFile;
	public rule: AttachmentRule;
	public editor: Editor;
	public app: App;
}

export const strategyHandlers: AttachmentSaveStrategyHandler[] = [
	new FileFolderAttachmentSaveStrategyHandler(),
	new FileSubfolderAttachmentSaveStrategyHandler(),
	new VaultfolderAttachmentSaveStrategyHandler(),
	new CustomizeAttachmentSaveStrategyHandler(),
];

export class AttachmentSaveStrategyHandlers {
	static async handle(context: AttachmentSaveStrategyContext): Promise<void> {
		const { rule, attachmentFile, pageFile, editor } = context;
		const handler = strategyHandlers.find((h) =>
			h.accept(context.rule.strategy.type)
		);

		if (!handler) {
			log(
				"[No Strategy Match] no handler found for rule strategy: ",
				rule.strategy
			);
			return;
		}

		log(
			"[Strategy Before Handle] use " +
				rule.strategy.type +
				" to handle attachment: " +
				attachmentFile.name +
				" at target page " +
				pageFile.name
		);
		const link = await handler.handle(context);
		log(
			"[Strategy Post Handle] " +
				pageFile.name +
				", attachment saved and link inserted: ",
			link
		);
		editor.replaceSelection(link);
	}
}
