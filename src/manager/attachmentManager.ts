import { TFile, App, Editor } from "obsidian";
import { AttachmentProConfig, DefaultRule } from "./types";
import { AttachmentScopeMatchers } from "./scope/attachmentScopeMatcher";
import { AttachmentRepositories, AttachmentResult } from "./repository/attachmentSaveRepository";
import { log } from "../util/log";
import ObsidianAttachmentRepository from "./repository/obsidianAttachmentRepository";
import { AttachmentNameFormatters } from "./format/attachmentNameFormatter";

export default class AttachmentManager {
	onEditorAttachmentSave(
		page: TFile,
		config: AttachmentProConfig,
		editor: Editor,
		app: App,
		attachmentFile: File,
		index: number
	) {
		this.onAttachmentSave(
			page,
			config,
			app,
			attachmentFile,
			index,
			(res) => {
				editor.replaceSelection(res.link);
			},
			() =>
				this.fallbackToDefaultRepository(
					page,
					app,
					attachmentFile,
					(res) => {
						editor.replaceSelection(res.link);
					}
				)
		);
	}

	onAttachmentSave(
		page: TFile,
		config: AttachmentProConfig,
		app: App,
		attachmentFile: File,
		index: number,
		onSave: (link: AttachmentResult) => void,
		fallback: () => void
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
					app,
					index
				);
				AttachmentRepositories.handle(
					{
						attachmentFile,
						formatedAttachmentName: attachmentFileName,
						pageFile: page,
						rule,
						app,
					},
					onSave
				);
				return;
			}
		}
		fallback();
	}

	private fallbackToDefaultRepository(
		page: TFile,
		app: App,
		attachmentFile: File,
		onSave: (link: AttachmentResult) => void
	) {
		// fallback to default repository
		const rule = new DefaultRule();
		const formattedName = AttachmentNameFormatters.format(
			attachmentFile,
			page,
			rule,
			app
		);
		new ObsidianAttachmentRepository()
			.handle({
				attachmentFile,
				formatedAttachmentName: formattedName,
				pageFile: page,
				rule: rule,
				app,
			})
			.then((attachment) => {
				onSave(attachment);
			});
	}
}
