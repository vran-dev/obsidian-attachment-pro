import { TFile, App, Editor, Notice } from "obsidian";
import { AttachmentProConfig, createFallbackRule } from "./types";
import { AttachmentScopeMatchers } from "./scope/attachmentScopeMatcher";
import { AttachmentRepositories, AttachmentResult } from "./repository/attachmentSaveRepository";
import { log } from "../util/log";
import { AttachmentNameFormatters } from "./format/attachmentNameFormatter";
import { getLocal } from "../i18/messages";

export default class AttachmentManager {
	onEditorAttachmentSave(
		page: TFile,
		config: AttachmentProConfig,
		editor: Editor,
		app: App,
		attachmentFile: File,
		index: number
	) {
		void this.onAttachmentSave(
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

	async onAttachmentSave(
		page: TFile,
		config: AttachmentProConfig,
		app: App,
		attachmentFile: File,
		index: number,
		onSave: (link: AttachmentResult) => void,
		fallback: () => void | Promise<void>
	): Promise<void> {
		const enabledRules = config.rules
			.filter((r) => r.enabled)
			.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
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
				try {
					const attachmentFileName = AttachmentNameFormatters.format(
						attachmentFile,
						page,
						rule,
						app,
						index
					);
					await AttachmentRepositories.handle(
						{
							attachmentFile,
							formattedAttachmentName: attachmentFileName,
							pageFile: page,
							rule,
							app,
						},
						onSave
					);
				} catch (e) {
					this.notifySaveFailure(attachmentFile.name, e);
				}
				return;
			}
		}
		try {
			await fallback();
		} catch (e) {
			this.notifySaveFailure(attachmentFile.name, e);
		}
	}

	private async fallbackToDefaultRepository(
		page: TFile,
		app: App,
		attachmentFile: File,
		onSave: (link: AttachmentResult) => void
	): Promise<void> {
		// 兜底规则（OBSIDIAN_DEFAULT）与常规规则走同一套仓库注册表
		const rule = createFallbackRule();
		const formattedName = AttachmentNameFormatters.format(
			attachmentFile,
			page,
			rule,
			app
		);
		await AttachmentRepositories.handle(
			{
				attachmentFile,
				formattedAttachmentName: formattedName,
				pageFile: page,
				rule,
				app,
			},
			onSave
		);
	}

	private notifySaveFailure(attachmentName: string, e: unknown) {
		const reason = e instanceof Error ? e.message : String(e);
		log("[Attachment Save Failed] ", attachmentName, e);
		new Notice(
			`${getLocal().ATTACHMENT_SAVE_FAILED_NOTICE}: ${attachmentName} (${reason})`
		);
	}
}
