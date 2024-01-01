import { TFile, App, Editor } from "obsidian";
import { AttachmentProConfig, DefaultRule } from "./types";
import { AttachmentScopeMatchers } from "./scope/attachmentScopeMatcher";
import { AttachmentSaveStrategyHandlers } from "./strategy/attachmentSaveStrategyHandler";
import { log } from "../util/log";
import ObsidianAttachmentStrategyHandler from "./strategy/obsidianAttachmentStrategyHandler";
import { AttachmentNameFormatters } from "./format/attachmentNameFormatter";

export default class AttachmentManager {
	onAttachmentSave(
		page: TFile,
		config: AttachmentProConfig,
		editor: Editor,
		app: App,
		attachmentFile: File
	) {
		const enabledRules = config.rules.filter((r) => r.enabled);
		log("[Enabled Rules] ", enabledRules);

		for (let i = 0; i < enabledRules.length; i++) {
			const rule = enabledRules[i];
			const isScopeMatched = AttachmentScopeMatchers.isAllMatch(
				attachmentFile,
				page,
				rule.scopes,
				app
			);
			if (isScopeMatched) {
				const attachmentFileName = AttachmentNameFormatters.format(
					attachmentFile,
					page,
					rule,
					app
				);
				AttachmentSaveStrategyHandlers.handle({
					attachmentFile,
					formatedAttachmentName: attachmentFileName,
					pageFile: page,
					rule,
					editor,
					app,
				});
				return;
			}
		}
		this.fallbackToDefaultStrategy(page, editor, app, attachmentFile);
	}

	fallbackToDefaultStrategy(
		page: TFile,
		editor: Editor,
		app: App,
		attachmentFile: File
	) {
		// fallback to default strategy
		const rule = new DefaultRule();
		const formattedName = AttachmentNameFormatters.format(
			attachmentFile,
			page,
			rule,
			app
		);
		new ObsidianAttachmentStrategyHandler().handle({
			attachmentFile,
			formatedAttachmentName: formattedName,
			pageFile: page,
			rule: rule,
			app,
			editor,
		});
	}
}
