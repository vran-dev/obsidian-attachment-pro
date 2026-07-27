import { App, TFile } from "obsidian";
import { AttachmentRule, AttachmentSaveType } from "src/manager/types";
import FileFolderAttachmentRepository from "./fileFolderAttachmentRepository";
import FileSubfolderAttachmentRepository from "./fileSubfolderAttachmentRepository";
import VaultfolderAttachmentRepository from "./vaultfolderAttachmentRepository";
import ObsidianAttachmentRepository from "./obsidianAttachmentRepository";
import CustomizeAttachmentRepository from "./customizeAttachmentRepository";
import { log } from "src/util/log";

export interface AttachmentRepository {
	accept(type: AttachmentSaveType): boolean;

	save(context: AttachmentRepositoryContext): Promise<AttachmentResult>;
}

export interface AttachmentResult {
	file: TFile;
	link: string;
}

export interface AttachmentRepositoryContext {
	attachmentFile: File;
	formattedAttachmentName: string;
	pageFile: TFile;
	rule: AttachmentRule;
	app: App;
}

export const attachmentRepositories: AttachmentRepository[] = [
	new FileFolderAttachmentRepository(),
	new FileSubfolderAttachmentRepository(),
	new VaultfolderAttachmentRepository(),
	new CustomizeAttachmentRepository(),
	new ObsidianAttachmentRepository(),
];

export class AttachmentRepositories {
	static async handle(context: AttachmentRepositoryContext, onSave: (link: AttachmentResult) => void): Promise<void> {
		const { rule, attachmentFile, pageFile } = context;
		const handler = attachmentRepositories.find((h) =>
			h.accept(context.rule.repository.type)
		);

		if (!handler) {
			log(
				"[No Repository Match] no repository found for rule: ",
				rule.repository
			);
			// 抛错交由上层统一 Notice，避免附件被静默丢弃
			throw new Error(
				`no repository matched type "${rule.repository.type}"`
			);
		}

		log(
			"[Repository Before Handle] use " +
				rule.repository.type +
				" to handle attachment: " +
				attachmentFile.name +
				" at target page " +
				pageFile.name
		);
		const result = await handler.save(context);
		log(
			"[Repository Post Handle] " +
				pageFile.name +
				", attachment saved and link inserted: ",
			result.link
		);
		onSave(result)
	}
}
